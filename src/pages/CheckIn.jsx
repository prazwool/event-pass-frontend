import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import { ArrowLeft, Camera, CameraOff, CheckCircle2, ClipboardPaste, ScanLine, Search, Users, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, readableDate } from '../api';
import { useAuth } from '../AuthContext';

export default function CheckIn() {
  const { id } = useParams();
  const { token } = useAuth();
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const scannerBusy = useRef(false);
  const refresh = useCallback(async () => {
    const data = await api(`/events/${id}/attendees`, { token });
    setAttendees(data.attendees); setEvent(data.event);
  }, [id, token]);
  useEffect(() => { refresh().catch(err => setError(err.message)).finally(() => setLoading(false)); }, [refresh]);
  const stopCamera = useCallback(() => { controlsRef.current?.stop(); controlsRef.current = null; setCameraOn(false); }, []);
  useEffect(() => () => { controlsRef.current?.stop(); }, []);
  const doCheckin = useCallback(async (code) => {
    if (scannerBusy.current) return;
    scannerBusy.current = true; setBusy(true);
    try {
      const data = await api(`/events/${id}/checkin`, { method: 'POST', token, body: { qrCode: code } });
      toast.success(data.message);
      setManualCode('');
      await refresh();
      stopCamera();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); scannerBusy.current = false; }
  }, [id, token, refresh, stopCamera]);
  const startCamera = async () => {
    setCameraError(''); setCameraOn(true);
    try {
      // Wait until React has rendered the video element.
      await new Promise(resolve => requestAnimationFrame(resolve));
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result && !scannerBusy.current) void doCheckin(result.getText());
      });
      controlsRef.current = controls;
    } catch (err) { setCameraError(err.message || 'Could not open the camera.'); setCameraOn(false); }
  };
  const totalChecked = attendees.filter(item => item.status === 'checked_in').length;
  const shown = attendees.filter(ticket => `${ticket.attendee?.name} ${ticket.attendee?.email}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="container dashboard-page"><Link to="/organizer" className="back-link"><ArrowLeft size={17}/> Organizer studio</Link><div className="page-heading"><div><span className="eyebrow eyebrow-dark"><ScanLine size={15}/> LIVE EVENT CHECK-IN</span><h1>Welcome your guests<span className="orange-dot">.</span></h1><p>{event ? `${event.title} · ${readableDate(event.startsAt)}` : 'Scan a ticket to check in an attendee.'}</p></div></div>
    {loading ? <div className="loading-state">Loading check-in dashboard... <span className="spinner"/></div> : error ? <div className="empty-state">{error}</div> : <><div className="checkin-overview"><div><span className="stat-icon stat-purple"><Users size={22}/></span><strong>{attendees.length}</strong><span>Registered guests</span></div><div><span className="stat-icon stat-green"><CheckCircle2 size={22}/></span><strong>{totalChecked}</strong><span>Checked in</span></div><div><span className="stat-icon stat-orange"><ScanLine size={22}/></span><strong>{attendees.length - totalChecked}</strong><span>Still expected</span></div></div>
    <div className="checkin-layout"><section className="checkin-tools"><div className="section-card"><div className="card-heading"><span className="scan-icon"><ScanLine size={20}/></span><div><h2>Scan QR ticket</h2><p>Point your camera at a guest's ticket.</p></div></div><div className={`scanner-window ${cameraOn ? 'scanner-active' : ''}`}>{cameraOn ? <video ref={videoRef} muted playsInline/> : <><div className="scanner-frame"><ScanLine size={58}/></div><span>Camera preview appears here</span></>}</div>{cameraError && <p className="form-error">{cameraError}</p>}{cameraOn ? <button className="btn btn-outline btn-block" onClick={stopCamera}><CameraOff size={18}/> Stop camera</button> : <button className="btn btn-primary btn-block" onClick={startCamera} disabled={event?.status === 'cancelled'}><Camera size={18}/> Start QR scanner</button>}<p className="small muted camera-tip">Camera access requires localhost or HTTPS and browser permission.</p></div>
    <div className="section-card"><div className="card-heading"><span className="scan-icon"><ClipboardPaste size={19}/></span><div><h2>Enter code manually</h2><p>Use this if the camera isn't available.</p></div></div><form onSubmit={e => { e.preventDefault(); void doCheckin(manualCode); }} className="form-stack"><label className="field"><span>Ticket QR code</span><input value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Paste EVENTPASS:..." required/></label><button className="btn btn-secondary btn-block" disabled={busy || event?.status === 'cancelled'}>{busy ? 'Validating...' : 'Validate & check in'}</button></form></div></section>
    <section className="guest-panel"><div className="guest-panel-head"><div><h2>Guest list</h2><p>{attendees.length} total registrations</p></div><span className="pill pill-soft">{totalChecked}/{attendees.length} arrived</span></div><div className="guest-search"><Search size={17}/><input placeholder="Search guest name or email" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search guests"/></div><div className="guest-list">{shown.length ? shown.map(ticket => <div className="guest-row" key={ticket._id}><span className="avatar guest-avatar">{ticket.attendee?.name?.charAt(0) || '?'}</span><div><strong>{ticket.attendee?.name || 'Unknown'}</strong><small>{ticket.attendee?.email || '—'}</small></div>{ticket.status === 'checked_in' ? <span className="status-pill status-good"><CheckCircle2 size={13}/> Arrived</span> : <button className="mini-checkin" disabled={busy || event?.status === 'cancelled'} onClick={() => doCheckin(ticket.qrToken)}><CheckCircle2 size={15}/> Check in</button>}</div>) : <div className="guest-empty"><XCircle size={30}/><p>{attendees.length ? 'No guests match your search.' : 'No registrations yet.'}</p></div>}</div></section></div></>}
  </div>;
}
