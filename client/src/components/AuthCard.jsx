import { useNavigate } from 'react-router-dom';

export default function AuthCard({ backTo, centered, children }) {
  const navigate = useNavigate();

  return (
    <div className="auth-shell">
      <div className={`auth-card-figma ${centered ? 'auth-centered' : ''}`}>
        {backTo && (
          <button type="button" className="auth-back" onClick={() => navigate(backTo)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
