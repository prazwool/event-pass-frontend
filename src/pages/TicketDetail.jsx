import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Copy, Download, MapPin, ShieldCheck, Ticket, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, readableDate, readableTime } from '../api';
import { useAuth } from '../AuthContext';

export default function TicketDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    api(`/tickets/${id}`, { token }).then(data => setTicket(data.ticket)).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [id, token]);
  const cancel = async () => {
    if (!confirm('Cancel your registration? Your QR ticket will no longer work.')) return;
    setBusy(true);
    try { await api(`/tickets/${id}`, { method: 'DELETE', token }); toast.success('Registration cancelled.'); navigate('/tickets'); }
    catch (err) { toast.error(err.message); setBusy(false); }
  };
  const download = () => {
    const svg = document.querySelector('#ticket-qr svg');
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `eventpass-${ticket._id}.svg`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(`EVENTPASS:${ticket.qrToken}`); toast.success('Ticket code copied!'); }
    catch { toast.error('Unable to copy. Select the code below manually.'); }
  };
  if (loading) return <div className="container loading-state">Loading ticket... <span className="spinner"/></div>;
  if (error || !ticket) return <div className="container empty-state"><h2>Ticket not found</h2><p>{error}</p><Link to="/tickets" className="btn btn-primary">My tickets</Link></div>;
  const event = ticket.event;
  return <div className="container ticket-page"><Link to="/tickets" className="back-link"><ArrowLeft size={17}/> My tickets</Link><div className="ticket-page-header"><span className="eyebrow eyebrow-dark"><Ticket size={15}/> ADMIT ONE · GOOD TIMES AHEAD</span><h1>Your ticket is ready<span className="orange-dot">.</span></h1><p>Show this QR code at the event entrance.</p></div>
    <div className="ticket-page-layout"><div className="digital-ticket"><div className={`digital-ticket-header art-${event?.tone || 'violet'}`}><div className="digital-ticket-brand">eventpass<span>●</span></div><span className="ticket-star">✳</span><span className="ticket-type">GENERAL ADMISSION</span></div><div className="digital-ticket-main"><span className={`status-pill ${ticket.status === 'checked_in' ? 'status-good' : ''}`}>{event?.status === 'cancelled' ? 'Event cancelled' : ticket.status === 'checked_in' ? '✓ Checked in' : '● Confirmed'}</span><h2>{event?.title}</h2><div className="ticket-meta"><div><small>DATE & TIME</small><strong>{readableDate(event.startsAt)}</strong><span>{readableTime(event.startsAt)}</span></div><div><small>LOCATION</small><strong>{event.venue}</strong><span>{event.city}</span></div></div></div><div className="ticket-tear"><span/><span/></div><div className="qr-panel" id="ticket-qr"><div className="qr-frame"><QRCodeSVG value={`EVENTPASS:${ticket.qrToken}`} size={194} bgColor="#ffffff" fgColor="#101624" marginSize={0} level="H"/></div><span className="qr-instruction">SCAN AT THE DOOR</span><code className="ticket-full-code">EVENTPASS:{ticket.qrToken}</code></div><div className="digital-ticket-footer">ONE TICKET · ONE GREAT EXPERIENCE <span>↗</span></div></div>
    <div className="ticket-side"><div className="info-card"><h3>You're on the list, {user?.name.split(' ')[0]}!</h3><p>Keep your QR code ready for a smooth check-in.</p><div className="step-row"><span><CheckCircle2 size={21}/></span><div><strong>Registration complete</strong><p>Your seat is reserved.</p></div></div><div className="step-row"><span>{ticket.status === 'checked_in' ? <CheckCircle2 size={21}/> : <Clock size={21}/>}</span><div><strong>{ticket.status === 'checked_in' ? 'Checked in successfully' : 'Check in at the venue'}</strong><p>{ticket.status === 'checked_in' ? 'Enjoy the event!' : 'Show your QR ticket at the entrance.'}</p></div></div><p className="security-line"><ShieldCheck size={16}/> Each QR ticket is unique and can be checked in once.</p></div><button onClick={download} className="btn btn-outline btn-block"><Download size={18}/> Download QR code</button><button onClick={copyCode} className="btn btn-outline btn-block"><Copy size={18}/> Copy ticket code</button>{ticket.status !== 'checked_in' && event.status === 'published' && new Date(event.startsAt) > new Date() && <button disabled={busy} onClick={cancel} className="btn btn-danger-text btn-block"><Trash2 size={17}/> Cancel my registration</button>}<Link className="subtle-link" to={`/events/${event._id}`}><CalendarDays size={15}/> View event details <MapPin size={15}/></Link></div></div>
  </div>;
}
