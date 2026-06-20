import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getSetupInfo, setupAccount } from '../api';
import AuthCard from '../components/AuthCard';

export default function SetupAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getSetupInfo(token)
      .then((res) => setInfo(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Invalid link'));
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await setupAccount({ token, password });
      navigate('/student-login');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthCard backTo="/student-login">
        <div className="alert error">Invalid setup link</div>
      </AuthCard>
    );
  }

  return (
    <AuthCard backTo="/student-login">
      <h1 className="auth-title">Set Up Account</h1>
      {info && <p className="auth-desc">Welcome, {info.name} ({info.email})</p>}

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={submit} className="auth-form">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={6} required />
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm Password" required />
        <button type="submit" className="btn-primary" disabled={loading || !info}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </AuthCard>
  );
}
