import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { studentLoginEmail, studentValidateCode } from '../api';
import AuthCard from '../components/AuthCard';
import AuthMethodLinks from '../components/AuthMethodLinks';
import { useAuth } from '../hooks/useAuth';

export default function EmailVerification() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!email) {
    navigate('/student-login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await studentValidateCode(email, code);
      login({ ...data.student, role: data.role, token: data.token });
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError('');
    try {
      await studentLoginEmail(email);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend');
    }
  };

  return (
    <AuthCard backTo="/student-login">
      <h1 className="auth-title">Email verification</h1>
      <p className="auth-desc">Please enter the code sent to your email address</p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Your code"
          maxLength={6}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'Submit'}
        </button>
      </form>

      <p className="auth-footer-link">
        Code not receive?{' '}
        <button type="button" className="link-btn" onClick={resend}>
          Send again
        </button>
      </p>

      <AuthMethodLinks current="email" />
    </AuthCard>
  );
}
