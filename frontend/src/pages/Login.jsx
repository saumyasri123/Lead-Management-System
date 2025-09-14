import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/auth.css';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ mode: 'onBlur' });
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (e) {
      setServerError(e?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" role="region" aria-labelledby="login-title">
        <h1 className="auth-title" id="login-title">Lead Manager</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        {serverError && <div className="auth-error" role="alert">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className={`input ${errors.email ? 'error' : ''}`}
              type="email"
              autoComplete="email"
              autoFocus
              aria-invalid={!!errors.email}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email like name@example.com'
                }
              })}
            />
            {errors.email && <p className="hint">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="field password">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className={`input ${errors.password ? 'error' : ''}`}
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShow(s => !s)}
              aria-pressed={show}
              aria-label={show ? 'Hide password' : 'Show password'}
              title={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff /> : <Eye />}
            </button>
            {errors.password && <p className="hint">{errors.password.message}</p>}
          </div>

          <div className="auth-actions">
            <button className="auth-btn" disabled={isSubmitting}>
              {isSubmitting ? (<><span className="spinner" /> Logging in…</>) : 'Login'}
            </button>
          </div>
        </form>

        <p className="auth-subtle" style={{ marginTop: '.75rem' }}>
          No account? <Link to="/register">Register</Link>
        </p>
        <p className="auth-seed">
          Seed creds: <code>test@erino.dev / Test@1234</code>
        </p>
      </div>

      <div className="auth-footer">© {new Date().getFullYear()} Lead Manager</div>
    </div>
  );
}
