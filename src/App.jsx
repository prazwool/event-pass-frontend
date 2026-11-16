import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Explore from './pages/Explore';
import Auth from './pages/Auth';
import EventDetail from './pages/EventDetail';
import MyTickets from './pages/MyTickets';
import TicketDetail from './pages/TicketDetail';
import Organizer from './pages/Organizer';
import EventForm from './pages/EventForm';
import CheckIn from './pages/CheckIn';

function Protected({ children, organizer = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container loading-state">Checking your session...</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace/>;
  if (organizer && user.role !== 'organizer') return <Navigate to="/" replace/>;
  return children;
}

export default function App() {
  return <Routes><Route element={<Layout/>}>
    <Route index element={<Explore/>}/>
    <Route path="login" element={<Auth mode="login"/>}/>
    <Route path="register" element={<Auth mode="register"/>}/>
    <Route path="events/:id" element={<EventDetail/>}/>
    <Route path="tickets" element={<Protected><MyTickets/></Protected>}/>
    <Route path="tickets/:id" element={<Protected><TicketDetail/></Protected>}/>
    <Route path="organizer" element={<Protected organizer><Organizer/></Protected>}/>
    <Route path="organizer/new" element={<Protected organizer><EventForm/></Protected>}/>
    <Route path="organizer/events/:id/edit" element={<Protected organizer><EventForm/></Protected>}/>
    <Route path="organizer/events/:id/checkin" element={<Protected organizer><CheckIn/></Protected>}/>
    <Route path="*" element={<div className="container empty-state"><h2>That page doesn't exist.</h2><a href="/">Back to EventPass</a></div>}/>
  </Route></Routes>;
}
