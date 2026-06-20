import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAccessCode } from '../api'
import AuthCard from '../components/AuthCard'
import AuthMethodLinks from '../components/AuthMethodLinks'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await createAccessCode(phone)
      navigate('/verify-phone', { state: { phone, devCode: data.devCode } })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard centered>
      <h1 className="auth-title">Sign In</h1>
      <p className="auth-desc">Please enter your phone to sign in</p>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your Phone Number"
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Next'}
        </button>
      </form>

      <p className="auth-note">Instructor &amp; student — SMS code login</p>

      <AuthMethodLinks current="phone" />

      <p className="auth-footer-link">
        Student first time? <Link to="/setup">Set up account from email link</Link>
      </p>
    </AuthCard>
  )
}
