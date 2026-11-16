import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, LogOut, Menu, Ticket, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../AuthContext';

function Brand() {
  return <Link to="/" className="brand" aria-label="EventPass home"><span className="brand-mark">e<span>.</span></span><span>event<span className="brand-light">pass</span></span></Link>;
}

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const signOut = () => { logout(); close(); navigate('/'); };
  return <div className="app-shell">
    <header className="site-header"><div className="container header-inner">
      <Brand />
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X size={22}/> : <Menu size={22}/>}</button>
      <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Main navigation">
        <NavLink to="/" end onClick={close}>Explore events</NavLink>
        {user && <NavLink to="/tickets" onClick={close}>My tickets</NavLink>}
        {user?.role === 'organizer' && <NavLink to="/organizer" onClick={close}>Organizer studio</NavLink>}
      </nav>
      <div className="header-actions">
        {loading ? <span className="muted small">Loading...</span> : user ? <>
          <div className="user-chip"><span className="avatar">{user.name.charAt(0).toUpperCase()}</span><span className="user-chip-copy"><strong>{user.name.split(' ')[0]}</strong><small>{user.role}</small></span></div>
          <button title="Sign out" className="icon-button" onClick={signOut}><LogOut size={18}/></button>
        </> : <><Link className="btn btn-text" to="/login">Log in</Link><Link className="btn btn-primary btn-small" to="/register">Get started <ArrowUpRight size={16}/></Link></>}
      </div>
    </div></header>
    <main id="main"><Outlet /></main>
    <footer className="site-footer"><div className="container footer-inner"><Brand/><p>Good things happen when we show up.</p><div className="footer-links"><Link to="/">Discover</Link><Link to={user ? '/tickets' : '/register'}><Ticket size={15}/> My tickets</Link><span><CalendarDays size={15}/> Made for real events</span></div></div></footer>
  </div>;
}
