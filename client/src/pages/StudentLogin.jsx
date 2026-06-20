import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentLogin, studentLoginEmail } from '../api'
import AuthCard from '../components/AuthCard'
import AuthMethodLinks from '../components/AuthMethodLinks'
import { useAuth } from '../hooks/useAuth'

export default function StudentLogin() {
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await studentLoginEmail(email)
      navigate('/verify-email', { state: { email } })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await studentLogin(username, password)
      login({ ...data.student, role: data.role, token: data.token })
      navigate('/student')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'password') {
    return (
      <AuthCard backTo="/" centered>
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-desc">Enter your username and password</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handlePasswordSubmit} className="auth-form">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Next'}
          </button>
        </form>

        <p className="auth-footer-link">
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode('email')
              setError('')
            }}
          >
            Login with email code
          </button>
        </p>

        <AuthMethodLinks current="email" />
      </AuthCard>
    )
  }

  return (
    <AuthCard backTo="/" centered>
      <h1 className="auth-title">Sign In</h1>
      <p className="auth-desc">Please enter your email to sign in</p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleEmailSubmit} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email Address"
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Next'}
        </button>
      </form>

      <p className="auth-note">passwordless authentication methods.</p>
      <p className="auth-footer-link">
        First time? Check your email for the setup link from your instructor
      </p>
      <p className="auth-footer-link">
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setMode('password')
            setError('')
          }}
        >
          Login with username &amp; password
        </button>
      </p>

      <AuthMethodLinks current="email" />
    </AuthCard>
  )
}
