import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Info, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, CATEGORIES, formatDateInput } from '../api';
import { useAuth } from '../AuthContext';

const getDefaultForm = () => {
  const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  start.setHours(17, 0, 0, 0);
  return { title: '', description: '', category: 'Technology', venue: '', city: '', startsAt: formatDateInput(start), endsAt: formatDateInput(new Date(start.getTime() + 2 * 60 * 60 * 1000)), capacity: '50', tone: 'violet' };
};
const tones = ['violet', 'coral', 'emerald', 'blue', 'amber', 'rose'];
export default function EventForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(getDefaultForm);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!editing) return;
    api(`/events/${id}`, { token }).then(({ event }) => {
      setForm({ title: event.title, description: event.description, category: event.category, venue: event.venue, city: event.city, startsAt: formatDateInput(event.startsAt), endsAt: formatDateInput(event.endsAt), capacity: String(event.capacity), tone: event.tone });
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [editing, id, token]);
  const update = event => setForm(old => ({ ...old, [event.target.name]: event.target.value }));
  const save = async event => {
    event.preventDefault(); setBusy(true);
    try {
      const body = { ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(), capacity: Number(form.capacity) };
      const { event: saved } = await api(editing ? `/events/${id}` : '/events', { token, method: editing ? 'PATCH' : 'POST', body });
      toast.success(editing ? 'Event updated!' : 'Your event is live!');
      navigate(editing ? '/organizer' : `/events/${saved._id}`);
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };
  const cancel = async () => {
    if (!confirm('Cancel this event? Attendees will see the cancelled status, and ticket check-ins will be disabled.')) return;
    setBusy(true);
    try { await api(`/events/${id}`, { method: 'DELETE', token }); toast.success('Event cancelled.'); navigate('/organizer'); }
    catch (err) { toast.error(err.message); setBusy(false); }
  };
  return <div className="container editor-page"><Link className="back-link" to="/organizer"><ArrowLeft size={16}/> Organizer studio</Link><div className="page-heading"><div><span className="eyebrow eyebrow-dark"><CalendarDays size={15}/> EVENT CREATOR</span><h1>{editing ? 'Edit your event' : 'Create something great'}<span className="orange-dot">.</span></h1><p>Everything you need to bring people together.</p></div></div>
    {loading ? <div className="loading-state">Loading event... <span className="spinner"/></div> : error ? <div className="empty-state">{error}</div> : <form className="editor-grid" onSubmit={save}><div className="editor-fields"><div className="editor-section"><div className="editor-section-heading"><span>01</span><div><h2>The essentials</h2><p>Give your event a personality.</p></div></div><div className="form-stack"><label className="field"><span>Event title</span><input name="title" placeholder="e.g. Saturday Creators Meetup" minLength={4} maxLength={110} required value={form.title} onChange={update}/></label><div className="form-two"><label className="field"><span>Category</span><select name="category" value={form.category} onChange={update}>{CATEGORIES.slice(1).map(category => <option key={category}>{category}</option>)}</select></label><label className="field"><span>Max attendees</span><input type="number" name="capacity" min="1" max="100000" required value={form.capacity} onChange={update}/></label></div><label className="field"><span>About the event</span><textarea rows="5" name="description" placeholder="Tell people what makes this gathering special..." required minLength={15} maxLength={4000} value={form.description} onChange={update}/></label></div></div>
    <div className="editor-section"><div className="editor-section-heading"><span>02</span><div><h2>When & where</h2><p>Set the stage for your gathering.</p></div></div><div className="form-stack"><div className="form-two"><label className="field"><span>Start date & time</span><input type="datetime-local" name="startsAt" required value={form.startsAt} onChange={update}/></label><label className="field"><span>End date & time</span><input type="datetime-local" name="endsAt" required value={form.endsAt} onChange={update}/></label></div><div className="form-two"><label className="field"><span>Venue</span><input name="venue" placeholder="e.g. Innovation Hall" required minLength={2} value={form.venue} onChange={update}/></label><label className="field"><span>City</span><input name="city" placeholder="e.g. Pokhara" required minLength={2} value={form.city} onChange={update}/></label></div></div></div>
    <div className="editor-section"><div className="editor-section-heading"><span>03</span><div><h2>Event artwork</h2><p>Choose a color identity for your listing.</p></div></div><div className="tone-options">{tones.map(tone => <label key={tone} className={`tone-option art-${tone} ${form.tone === tone ? 'selected' : ''}`} title={tone}><input name="tone" type="radio" value={tone} checked={form.tone === tone} onChange={update}/>{form.tone === tone && <Check size={18}/>}</label>)}</div></div>
    <div className="editor-actions"><button disabled={busy} className="btn btn-primary" type="submit">{busy ? 'Saving...' : editing ? 'Save changes' : 'Publish event'} <ArrowRight size={17}/></button><Link className="btn btn-outline" to="/organizer">Discard</Link>{editing && <button type="button" className="btn btn-danger-text" disabled={busy} onClick={cancel}><Trash2 size={16}/> Cancel event</button>}</div></div><aside className="editor-aside"><div className={`preview-card art-${form.tone}`}><span>YOUR EVENT PREVIEW</span><span className="preview-symbol">✳</span><strong>{form.title || 'Your event title'}</strong><small>{form.category} · {form.city || 'Your city'}</small></div><div className="hint-card"><Info size={19}/><div><strong>A few things to know</strong><p>Events are free to attend in this demo. Guests get a unique QR ticket, and you can scan it at the door with your check-in dashboard.</p></div></div></aside></form>}
  </div>;
}
