import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Plus, ScanLine, Ticket, Users } from 'lucide-react';
import { api, readableDate, readableTime } from '../api';
import { useAuth } from '../AuthContext';

export default function Organizer() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api('/events/mine', { token }).then(result => setEvents(result.events)).catch(err => setError(err.message)).finally(() => setLoading(false)); }, [token]);
  const registrations = events.reduce((sum, event) => sum + event.registeredCount, 0);
  const checkIns = events.reduce((sum, event) => sum + event.checkIns, 0);
  return <div className="container dashboard-page"><div className="page-heading"><div><span className="eyebrow eyebrow-dark"><BarChart3 size={15}/> YOUR ORGANIZER STUDIO</span><h1>Make things happen<span className="orange-dot">.</span></h1><p>Welcome back, {user?.name.split(' ')[0]}. Your community starts here.</p></div><Link to="/organizer/new" className="btn btn-primary"><Plus size={18}/> Create an event</Link></div>
    <div className="stats-grid"><div className="stat-card"><span className="stat-icon stat-purple"><CalendarDays size={22}/></span><p>Total events</p><strong>{events.length}</strong><span>Things you've brought to life</span></div><div className="stat-card"><span className="stat-icon stat-orange"><Ticket size={22}/></span><p>Registrations</p><strong>{registrations}</strong><span>People excited to show up</span></div><div className="stat-card"><span className="stat-icon stat-green"><CheckCircle2 size={22}/></span><p>Checked in</p><strong>{checkIns}</strong><span>Real connections made</span></div></div>
    <div className="dashboard-section-title"><div><h2>Manage your events</h2><p>Keep your registrations and check-ins flowing.</p></div></div>
    {loading ? <div className="loading-state">Loading your studio... <span className="spinner"/></div> : error ? <div className="empty-state">{error}</div> : events.length === 0 ? <div className="empty-state big-empty"><CalendarDays size={44}/><h3>Your first event starts here</h3><p>Launch your event, share the link and welcome your guests.</p><Link className="btn btn-primary" to="/organizer/new">Create an event <ArrowRight size={16}/></Link></div> : <div className="organizer-list">{events.map(event => <div key={event._id} className="organizer-event"><div className={`organizer-event-art art-${event.tone}`}>✳</div><div className="organizer-event-body"><span className="pill pill-soft">{event.category}</span>{event.status === 'cancelled' && <span className="status-pill status-cancelled">Cancelled</span>}<h3>{event.title}</h3><p><CalendarDays size={15}/>{readableDate(event.startsAt)} · {readableTime(event.startsAt)}</p><div className="organizer-metrics"><span><Users size={14}/> {event.registeredCount}/{event.capacity} registered</span><span><CheckCircle2 size={14}/> {event.checkIns} checked in</span></div></div><div className="organizer-actions"><Link className="btn btn-outline btn-small" to={`/organizer/events/${event._id}/edit`}>Edit</Link><Link className="btn btn-secondary btn-small" to={`/organizer/events/${event._id}/checkin`}><ScanLine size={17}/> Check-in <ArrowRight size={16}/></Link></div></div>)}</div>}
    <div className="organizer-tip"><span>✳</span><div><strong>Pro tip</strong><p>Open your check-in screen on a laptop or phone and scan an attendee's ticket at the door. Manual codes work too.</p></div></div>
  </div>;
}
