import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin, Users } from 'lucide-react';
import { readableDate, readableTime } from '../api';

const CATEGORY_ICON = { Technology: '⌘', Business: '↗', Music: '♫', Arts: '✳', Community: '✦', Sports: '◉' };
export default function EventCard({ event }) {
  const seats = Math.max(0, event.capacity - event.registeredCount);
  return <Link className="event-card" to={`/events/${event._id}`}>
    <div className={`event-art art-${event.tone || 'violet'}`}>
      <span className="art-orbit orbit-one"/><span className="art-orbit orbit-two"/>
      <span className="event-art-icon">{CATEGORY_ICON[event.category] || '✦'}</span>
      <span className="art-category">{event.category}</span>
      <span className="card-arrow"><ArrowUpRight size={20}/></span>
    </div>
    <div className="event-card-content">
      <p className="event-date"><CalendarDays size={14}/>{readableDate(event.startsAt)} · {readableTime(event.startsAt)}</p>
      <h3>{event.title}</h3>
      <p className="event-location"><MapPin size={14}/>{event.venue}, {event.city}</p>
      <div className="event-card-bottom"><span><Users size={14}/>{seats} seats left</span><span className="pill pill-soft">Free entry</span></div>
    </div>
  </Link>;
}
