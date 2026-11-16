import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Compass, MapPin, Ticket } from 'lucide-react';
import { api, readableDate, readableTime } from '../api';
import { useAuth } from '../AuthContext';

export default function MyTickets() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/tickets/mine', { token }).then(result => setTickets(result.tickets)).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [token]);
  return <div className="container dashboard-page"><div className="page-heading"><div><span className="eyebrow eyebrow-dark"><Ticket size={15}/> YOUR EVENT ADVENTURES</span><h1>My tickets<span className="orange-dot">.</span></h1><p>All your plans, one happy place.</p></div><Link to="/" className="btn btn-outline">Discover more <ArrowRight size={17}/></Link></div>
    {loading ? <div className="loading-state">Loading your tickets... <span className="spinner"/></div> : error ? <div className="empty-state">{error}</div> : !tickets.length ? <div className="empty-state big-empty"><Compass size={45}/><h2>Nothing on your calendar yet</h2><p>Find something that makes you want to get out and go.</p><Link to="/" className="btn btn-primary">Explore events <ArrowRight size={16}/></Link></div> : <div className="ticket-list">{tickets.map(ticket => <Link key={ticket._id} to={`/tickets/${ticket._id}`} className="ticket-list-card"><div className={`ticket-list-art art-${ticket.event?.tone || 'violet'}`}>✳</div><div className="ticket-list-body"><div className="ticket-list-top"><span className="pill pill-soft">{ticket.event?.category || 'Event'}</span><span className={`status-pill ${ticket.status === 'checked_in' ? 'status-good' : ''}`}>{ticket.event?.status === 'cancelled' ? 'Event cancelled' : ticket.status === 'checked_in' ? 'Checked in' : 'Confirmed'}</span></div><h3>{ticket.event?.title || 'Event unavailable'}</h3><p><CalendarDays size={15}/>{ticket.event ? `${readableDate(ticket.event.startsAt)} · ${readableTime(ticket.event.startsAt)}` : '—'}</p><p><MapPin size={15}/>{ticket.event ? `${ticket.event.venue}, ${ticket.event.city}` : '—'}</p></div><span className="list-arrow"><ArrowRight size={20}/></span></Link>)}</div>}
  </div>;
}
