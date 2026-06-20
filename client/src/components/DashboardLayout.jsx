import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function DashboardLayout({ role, activeNav, onNav, children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const instructorNav = [
    { id: 'students', label: 'Manage Students' },
    { id: 'lessons', label: 'Manage Lessons' },
    { id: 'messages', label: 'Message' },
  ]

  const studentNav = [
    { id: 'lessons', label: 'Manage Lessons' },
    { id: 'profile', label: 'Edit Profile' },
    { id: 'messages', label: 'Message' },
  ]

  const navItems = role === 'instructor' ? instructorNav : studentNav

  const handleLogout = () => {
    logout()
    navigate(role === 'instructor' ? '/' : '/student-login')
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="logo-placeholder" />
        <nav className="app-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => onNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div />
          <div className="topbar-actions">
            <button type="button" className="icon-btn bell-btn" aria-label="Notifications">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="bell-dot" />
            </button>
            <button type="button" className="avatar-btn" onClick={handleLogout} title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </button>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  )
}
