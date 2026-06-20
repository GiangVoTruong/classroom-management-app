import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createAccessCode, validateAccessCode } from '../api'
import AuthCard from '../components/AuthCard'
import AuthMethodLinks from '../components/AuthMethodLinks'
import { useAuth } from '../hooks/useAuth'

export default function PhoneVerification() {
  const location = useLocation()
  const phone = location.state?.phone || ''
  const [devCode, setDevCode] = useState(location.state?.devCode || '')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  if (!phone) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await validateAccessCode(phone, code)
      const userData = { phone, role: data.userType }
      login(userData)
      localStorage.setItem('phoneNumber', phone)
      navigate(data.userType === 'instructor' ? '/instructor' : '/student')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setError('')
    try {
      const { data } = await createAccessCode(phone)
      if (data.devCode) setDevCode(data.devCode)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend')
    }
  }

  return (
    <AuthCard backTo="/">
      <h1 className="auth-title">Phone verification</h1>
      <p className="auth-desc">Please enter your code that send to your phone</p>

      {error && <div className="alert error">{error}</div>}

      {devCode && (
        <div className="alert success">
          Dev mode — access code: <strong>{devCode}</strong>
        </div>
      )}

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

      <AuthMethodLinks current="phone" />
    </AuthCard>
  )
}
