import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/auth.css';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' });

  const { register: registerUser, user } = useAuth();
  const [serverError, setServerError] = useState('');
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    try {
      await registerUser(email.trim(), password);
      navigate('/');
    } catch (e) {
      setServerError(e?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" role="region" aria-labelledby="register-title">
        <h1 className="auth-title" id="register-title">Create account</h1>
        <p className="auth-subtitle">Join to manage your leads</p>

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
              aria-invalid={!!errors.email}
              {...field('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email like name@example.com',
                },
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
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...field('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Use at least 8 characters' },
              })}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShow((s) => !s)}
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
              {isSubmitting ? (<><span className="spinner" /> Creating…</>) : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="auth-subtle" style={{ marginTop: '.75rem' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      <div className="auth-footer">© {new Date().getFullYear()} Lead Manager</div>
    </div>
  );
}
