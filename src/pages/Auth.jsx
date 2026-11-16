import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, UserRound, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function Auth({ mode }) {
  const isSignup = mode === 'register';
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') === 'organizer' ? 'organizer' : 'attendee' });
  const [busy, setBusy] = useState(false);
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const next = params.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  if (user) return <Navigate to={safeNext || (user.role === 'organizer' ? '/organizer' : '/tickets')} replace/>;
  const update = event => setForm(old => ({ ...old, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault(); setBusy(true);
    try {
      const session = await api(`/auth/${isSignup ? 'register' : 'login'}`, { method: 'POST', body: isSignup ? form : { email: form.email, password: form.password } });
      saveSession(session);
      toast.success(isSignup ? 'Welcome to EventPass!' : 'Welcome back!');
      navigate(safeNext || (session.user.role === 'organizer' ? '/organizer' : '/tickets'), { replace: true });
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };
  return <section className="auth-section"><div className="auth-illustration"><span className="eyebrow">YOU BELONG IN THE ROOM</span><h2>People make<br/><em>events magical.</em></h2><div className="auth-art-circle">✳</div><p>One pass. So many ways to connect.</p></div><div className="auth-panel"><div className="auth-box"><span className="eyebrow eyebrow-dark">YOUR EVENTPASS ACCOUNT</span><h1>{isSignup ? 'Join the good stuff.' : 'Welcome back.'}</h1><p className="subheading">{isSignup ? 'Discover experiences or create your own.' : 'Your next memorable moment is waiting.'}</p>
    <form className="form-stack" onSubmit={submit}>
      {isSignup && <label className="field"><span>Full name</span><div className="input-icon"><UserRound size={18}/><input name="name" value={form.name} onChange={update} placeholder="Your name" required minLength={2}/></div></label>}
      <label className="field"><span>Email address</span><div className="input-icon"><Mail size={18}/><input type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required/></div></label>
      <label className="field"><span>Password</span><div className="input-icon"><LockKeyhole size={18}/><input type="password" name="password" value={form.password} onChange={update} placeholder="Minimum 8 characters" required minLength={8}/></div></label>
      {isSignup && <div className="field"><span>I want to...</span><div className="role-options"><label className={form.role === 'attendee' ? 'active' : ''}><input type="radio" name="role" value="attendee" checked={form.role === 'attendee'} onChange={update}/><Users size={17}/> Attend events</label><label className={form.role === 'organizer' ? 'active' : ''}><input type="radio" name="role" value="organizer" checked={form.role === 'organizer'} onChange={update}/><span className="simple-icon">✦</span> Host events</label></div></div>}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'One moment...' : isSignup ? 'Create your account' : 'Log in'} <ArrowRight size={18}/></button>
    </form><p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to EventPass?'} <Link to={isSignup ? '/login' : '/register'}>{isSignup ? 'Log in' : 'Sign up for free'}</Link></p>
    <div className="demo-hint"><strong>Try the demo</strong><p>Organizer: organizer@eventpass.dev<br/>Attendee: attendee@eventpass.dev<br/>Password: Demo12345! (after seeding)</p></div>
  </div></div></section>;
}
