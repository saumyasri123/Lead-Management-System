import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import LeadsList from './pages/LeadsList.jsx';
import LeadForm from './pages/LeadForm.jsx';
import './styles/nav.css';

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error(e);
      alert('Logout failed');
    }
  };

  const isAuthed = !!user;
  const initial = (user?.email?.[0] || '?').toUpperCase();

  return (
    <div>
      <nav className="site-nav" aria-label="Main">
        <div className="nav-inner">
          <Link className="brand" to="/">Lead Manager</Link>

          {isAuthed && (
            <>
              <NavLink className="nav-link" to="/">Leads</NavLink>
              <NavLink className="nav-link nav-cta" to="/leads/new">New Lead</NavLink>
            </>
          )}

          <span className="nav-sep" />

          {isAuthed ? (
            <>
              <span className="user-pill" title={user.email}>
                <span className="avatar" aria-hidden="true">{initial}</span>
                <span className="user-email">{user.email}</span>
              </span>
              <button type="button" className="nav-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-link" to="/login">Login</NavLink>
              <NavLink className="nav-link" to="/register">Register</NavLink>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LeadsList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leads/new" element={<LeadForm />} />
        <Route path="/leads/:id" element={<LeadForm />} />
        <Route path="*" element={<div style={{ padding: '1rem' }}>Not Found</div>} />
      </Routes>
    </div>
  );
}
