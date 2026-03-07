import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import '../Auth/Auth.css';

import backendApi from '../../api/backend';

// Forgot Password Page — enter email to get reset link
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await backendApi.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Something went wrong');
      } else {
        setError('Could not connect to the server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Forgot Password</h1>
            <p>Enter your email and we'll send you a reset link</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          {message && (
            <div className="success-message">
              <FiCheck /> {message}
            </div>
          )}
          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    className="form-control icon-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <p className="auth-footer">
            <Link to="/login"><FiArrowLeft /> Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reset Password Page — enter new password with token from URL
export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setIsLoading(true);

    try {
      const res = await backendApi.post(`/auth/reset-password/${token}`, { password });
      
      setMessage(res.data.message || 'Password reset successful!');
      // Auto-redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Reset failed');
      } else {
        setError('Could not connect to the server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
          </div>
          {error && <div className="error-message">{error}</div>}
          {message && (
            <div className="success-message">
              <FiCheck /> {message}
            </div>
          )}
          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control icon-input"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control icon-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          <p className="auth-footer">
            <Link to="/login"><FiArrowLeft /> Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
