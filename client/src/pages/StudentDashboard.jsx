import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { editProfile, getInstructor, getMyLessons, markLessonDone } from '../api'
import Chat from '../components/Chat'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../hooks/useAuth'

export default function StudentDashboard() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('lessons')
  const [lessons, setLessons] = useState([])
  const [instructorPhone, setInstructorPhone] = useState('')
  const [profileEdits, setProfileEdits] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const phone = user?.phone || localStorage.getItem('phoneNumber') || ''

  const baseProfile = {
    name: user?.name || '',
    email: user?.email || '',
    phone,
  }
  const profile = profileEdits ?? baseProfile

  useEffect(() => {
    getInstructor()
      .then((res) => setInstructorPhone(res.data.phone))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/student-login')
    }
  }, [user, navigate])

  const loadLessons = useCallback(async () => {
    try {
      const { data } = await getMyLessons(phone)
      setLessons(data.lessons)
    } catch {
      setError('Failed to load lessons')
    }
  }, [phone])

  useEffect(() => {
    if (user?.role !== 'student' || !phone) return
    let active = true
    getMyLessons(phone)
      .then(({ data }) => active && setLessons(data.lessons))
      .catch(() => active && setError('Failed to load lessons'))
    return () => {
      active = false
    }
  }, [user, phone])

  const handleDone = async (lessonId) => {
    try {
      await markLessonDone(phone, lessonId)
      setMessage('Lesson marked as done!')
      loadLessons()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update')
    }
  }

  const handleProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        phone,
        name: profile.name,
        email: profile.email,
      }
      if (profile.phone !== phone) {
        payload.newPhone = profile.phone
      }
      const { data } = await editProfile(payload)
      setMessage('Profile updated!')
      login({ ...user, ...data.profile, role: 'student' })
      setProfileEdits(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = (field, value) => {
    setProfileEdits({ ...profile, [field]: value })
  }

  const instructorContact = instructorPhone ? [{ phone: instructorPhone, name: 'Instructor' }] : []

  return (
    <DashboardLayout role="student" activeNav={tab} onNav={setTab}>
      {message && (
        <div className="alert success" onClick={() => setMessage('')}>
          {message}
        </div>
      )}
      {error && (
        <div className="alert error" onClick={() => setError('')}>
          {error}
        </div>
      )}

      {tab === 'lessons' && (
        <>
          <h1 className="page-title">Manage Lessons</h1>
          {lessons.length === 0 ? (
            <p className="empty-state">No lessons assigned yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="figma-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((l) => (
                    <tr key={l.id}>
                      <td>{l.title}</td>
                      <td>{l.description}</td>
                      <td>
                        <span className={`badge-status ${l.completed ? 'active' : 'pending'}`}>
                          {l.completed ? 'Done' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {!l.completed && (
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => handleDone(l.id)}
                          >
                            Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'profile' && (
        <>
          <h1 className="page-title">Edit Profile</h1>
          <div className="panel-form">
            <form onSubmit={handleProfile} className="lesson-form">
              <div className="form-row">
                <div className="field">
                  <label>Name</label>
                  <input
                    value={profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => updateProfile('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile('email', e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary btn-inline" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </>
      )}

      {tab === 'messages' && (
        <Chat
          myPhone={phone}
          otherPhone={instructorPhone}
          contacts={instructorContact}
          selectedContact={instructorPhone}
        />
      )}
    </DashboardLayout>
  )
}
