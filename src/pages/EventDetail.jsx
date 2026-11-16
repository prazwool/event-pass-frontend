import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, ShieldCheck, Ticket as TicketIcon, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, readableDate, readableTime } from '../api';
import { useAuth } from '../AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api(`/events/${id}`, { token }).then(data => { if (active) setDetail(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, token]);
  const register = async () => {
    if (!user) return navigate(`/login?next=${encodeURIComponent(`/events/${id}`)}`);
    setBusy(true);
    try {
      const { ticket } = await api(`/tickets/event/${id}`, { method: 'POST', token });
      toast.success('Your ticket is ready!');
      navigate(`/tickets/${ticket._id}`);
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };
  if (loading) return <div className="container loading-state">Loading event details... <span className="spinner"/></div>;
  if (error || !detail) return <div className="container empty-state"><h2>Event not found</h2><p>{error}</p><Link to="/" className="btn btn-primary">Browse events</Link></div>;
  const { event, myTicket } = detail;
  const seats = Math.max(0, event.capacity - event.registeredCount);
  const closed = event.status === 'cancelled' || new Date(event.startsAt) <= new Date();
  return <div className="container detail-page"><Link to="/" className="back-link"><ArrowLeft size={17}/> All events</Link>
    <div className={`detail-banner art-${event.tone}`}><span className="detail-ring ring-a"/><span className="detail-ring ring-b"/><span className="detail-symbol">✳</span><span className="detail-banner-caption">MAKE MEMORIES<br/>IN REAL LIFE <span>↗</span></span><span className="detail-banner-category">{event.category}</span></div>
    <div className="detail-layout"><div className="detail-main"><div className="detail-kicker"><span className="pill pill-orange">{event.category}</span><span className="muted small">Hosted by {event.organizer?.name || 'EventPass organizer'}</span></div><h1>{event.title}</h1><div className="detail-intro"><span><CalendarDays size={18}/>{readableDate(event.startsAt)}</span><span><MapPin size={18}/>{event.city}</span></div>
      <div className="divider"/><h2>About this event</h2><p className="event-description">{event.description}</p>
      <div className="what-to-expect"><h3>What to expect</h3><div><span><Check size={16}/></span>Connect with people who share your interests</div><div><span><Check size={16}/></span>Easy entry with your digital QR ticket</div><div><span><Check size={16}/></span>Good conversations and new experiences</div></div>
    </div><aside className="booking-panel"><span className="panel-label">YOUR EVENT DETAILS</span><div className="booking-date"><div className="big-date"><strong>{new Date(event.startsAt).getDate()}</strong><span>{new Intl.DateTimeFormat('en-US', {month:'short'}).format(new Date(event.startsAt))}</span></div><div><strong>{readableDate(event.startsAt, {weekday:'long'})}</strong><p>{readableTime(event.startsAt)} – {readableTime(event.endsAt)}</p></div></div><div className="booking-divider"/><div className="booking-info"><MapPin size={20}/><div><strong>{event.venue}</strong><span>{event.city}</span></div></div><div className="booking-info"><Users size={20}/><div><strong>{seats} of {event.capacity} spots left</strong><span>Limited capacity</span></div></div><div className="booking-divider"/><div className="price-line"><span>Ticket price</span><strong>FREE</strong></div>
      {myTicket ? <Link to={`/tickets/${myTicket._id}`} className="btn btn-primary btn-block"><TicketIcon size={18}/> View my ticket <ArrowRight size={18}/></Link> : <button className="btn btn-primary btn-block" onClick={register} disabled={busy || closed || seats === 0}>{busy ? 'Registering...' : closed ? 'Registration closed' : seats === 0 ? 'Sold out' : 'Reserve my free spot'} <ArrowRight size={18}/></button>}
      <p className="secure-note"><ShieldCheck size={15}/> Free registration · Instant QR ticket</p></aside></div>
  </div>;
}
