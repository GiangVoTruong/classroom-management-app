import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addStudent, assignLesson, deleteStudent, editStudent, getStudents } from '../api'
import Chat from '../components/Chat'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('students')
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [chatStudent, setChatStudent] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'student', address: '' })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', studentPhones: [] })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const instructorPhone = user?.phone || localStorage.getItem('phoneNumber')

  const loadStudents = useCallback(async () => {
    try {
      const { data } = await getStudents()
      setStudents(data.students)
    } catch {
      setError('Failed to load students')
    }
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      navigate('/')
      return
    }
    let active = true
    getStudents()
      .then(({ data }) => active && setStudents(data.students))
      .catch(() => active && setError('Failed to load students'))
    return () => {
      active = false
    }
  }, [user, navigate])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: '', phone: '', email: '', role: 'student', address: '' })
    setShowModal(true)
  }

  const openEdit = (s) => {
    setEditTarget(s)
    setForm({
      name: s.name,
      phone: s.phone,
      email: s.email,
      role: s.role || 'student',
      address: s.address || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (editTarget) {
        await editStudent(editTarget.phone, {
          name: form.name,
          email: form.email,
          role: form.role,
          address: form.address,
        })
        setMessage('Student updated')
      } else {
        await addStudent({
          name: form.name,
          phone: form.phone,
          email: form.email,
          role: form.role,
          address: form.address,
        })
        setMessage('Student created! Welcome email sent.')
      }
      setShowModal(false)
      loadStudents()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (phone) => {
    if (!confirm('Delete this student?')) return
    try {
      await deleteStudent(phone)
      setMessage('Student deleted')
      loadStudents()
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed')
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!lessonForm.studentPhones.length) {
      setError('Select at least one student')
      return
    }
    setLoading(true)
    try {
      await assignLesson(lessonForm)
      setLessonForm({ title: '', description: '', studentPhones: [] })
      setMessage('Lesson assigned!')
    } catch (err) {
      setError(err.response?.data?.error || 'Assign failed')
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const chatContacts = students.map((s) => ({ phone: s.phone, name: s.name }))

  return (
    <DashboardLayout role="instructor" activeNav={tab} onNav={setTab}>
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

      {tab === 'students' && (
        <>
          <h1 className="page-title">Manage Students</h1>
          <div className="toolbar">
            <span className="count-label">{students.length} Students</span>
            <button type="button" className="btn-outline" onClick={openCreate}>
              + Add Student
            </button>
            <input
              className="filter-input toolbar-filter"
              placeholder="Filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table className="figma-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.phone}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>
                      <span className={`badge-status ${s.accountSetup ? 'active' : 'pending'}`}>
                        {s.accountSetup ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button type="button" className="btn-edit" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleDelete(s.phone)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'lessons' && (
        <>
          <h1 className="page-title">Manage Lessons</h1>
          <div className="panel-form">
            <form onSubmit={handleAssign} className="lesson-form">
              <div className="form-row">
                <div className="field">
                  <label>Title</label>
                  <input
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>Assign to Students</label>
                <div className="student-checkboxes">
                  {students.map((s) => (
                    <label key={s.phone} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={lessonForm.studentPhones.includes(s.phone)}
                        onChange={() =>
                          setLessonForm((prev) => ({
                            ...prev,
                            studentPhones: prev.studentPhones.includes(s.phone)
                              ? prev.studentPhones.filter((p) => p !== s.phone)
                              : [...prev.studentPhones, s.phone],
                          }))
                        }
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Lesson'}
              </button>
            </form>
          </div>
        </>
      )}

      {tab === 'messages' && (
        <Chat
          myPhone={instructorPhone}
          otherPhone={chatStudent}
          contacts={chatContacts}
          selectedContact={chatStudent}
          onSelectContact={setChatStudent}
        />
      )}

      {showModal && (
        <Modal
          title={editTarget ? 'Edit Student' : 'Create Student'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-row">
              <div className="field">
                <label>Student Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Student Name"
                  required
                />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone Number"
                  disabled={!!editTarget}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="field">
                <label>Role</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Role"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Address"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editTarget ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
