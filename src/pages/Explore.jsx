import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Compass, Search, Sparkles, Ticket, Zap } from 'lucide-react';
import { api, CATEGORIES } from '../api';
import EventCard from '../components/EventCard';

export default function Explore() {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const params = new URLSearchParams({ page: String(page), limit: '9' });
    if (category !== 'All') params.set('category', category);
    if (term) params.set('search', term);
    api(`/events?${params}`).then(data => {
      if (!active) return;
      setEvents(data.events); setPages(data.pages);
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category, term, page]);
  const onSearch = e => { e.preventDefault(); setPage(1); setTerm(search.trim()); };
  return <>
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={15}/> YOUR NEXT GOOD STORY STARTS HERE</span>
        <h1>Find your people.<br/><em>Be there.</em></h1>
        <p>Discover workshops, meetups, and memorable moments happening around you. One click, one ticket, endless possibilities.</p>
        <form className="hero-search" onSubmit={onSearch}><Search size={19}/><input aria-label="Search events" placeholder="Try ‘design’, ‘music’, ‘Pokhara’..." value={search} onChange={e => setSearch(e.target.value)}/><button type="submit">Explore <ArrowRight size={17}/></button></form>
        <div className="hero-social"><span className="avatar-stack"><i>A</i><i>M</i><i>S</i><i>J</i></span><span>Made for the moments that matter</span></div>
      </div>
      <div className="hero-visual" aria-hidden="true"><div className="visual-grid"/><div className="hero-loop loop-outer"/><div className="hero-loop loop-inner"/><div className="hero-spark spark-one">✳</div><div className="hero-spark spark-two">✦</div><div className="hero-pass"><span className="pass-mini-brand">eventpass<span>●</span></span><span className="pass-label">YOUR PASS TO<br/>SOMETHING GREAT</span><span className="pass-big">GO<br/>PLACES<span>↗</span></span><span className="pass-small">MORE THAN JUST AN EVENT.</span></div><div className="floating-note"><span className="note-icon"><Check size={17}/></span><div><strong>You're on the list!</strong><small>See you there ✨</small></div></div></div>
    </div></section>
    <section className="discovery-section container" id="events"><div className="section-heading"><div><span className="eyebrow eyebrow-dark"><Compass size={15}/> MAKE PLANS WORTH KEEPING</span><h2>Explore what’s happening<span className="orange-dot">.</span></h2><p>Something interesting is always around the corner.</p></div><div className="section-side">Curated for the curious <Zap size={17}/></div></div>
      <div className="category-bar" role="group" aria-label="Filter events by category">{CATEGORIES.map(item => <button key={item} className={`category-chip ${category === item ? 'selected' : ''}`} onClick={() => { setCategory(item); setPage(1); }}>{item}</button>)}</div>
      {term && <p className="filter-note">Search results for <strong>“{term}”</strong> <button className="link-button" onClick={() => { setTerm(''); setSearch(''); }}>Clear search</button></p>}
      {loading ? <div className="loading-state">Finding great events... <span className="spinner"/></div> : error ? <div className="empty-state">{error}<p>Make sure the backend is running.</p></div> : events.length ? <div className="events-grid">{events.map(event => <EventCard key={event._id} event={event}/>)}</div> : <div className="empty-state"><Compass size={36}/><h3>No matching events yet</h3><p>Try a different search or category.</p></div>}
      {pages > 1 && <div className="pagination"><button className="btn btn-outline btn-small" disabled={page === 1} onClick={() => setPage(n => n - 1)}><ChevronLeft size={16}/> Previous</button><span>Page {page} of {pages}</span><button className="btn btn-outline btn-small" disabled={page >= pages} onClick={() => setPage(n => n + 1)}>Next <ChevronRight size={16}/></button></div>}
    </section>
    <section className="cta-strip"><div className="container cta-inner"><div><span className="eyebrow">HOST SOMETHING AMAZING</span><h2>Have an idea worth gathering for?</h2><p>Bring your community together. We'll handle the tickets.</p></div><Link className="btn btn-white" to="/register?role=organizer">Start hosting <ArrowRight size={18}/></Link></div></section>
  </>;
}
