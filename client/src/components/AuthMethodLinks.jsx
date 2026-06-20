import { Link } from 'react-router-dom';

export default function AuthMethodLinks({ current }) {
  return (
    <div className="auth-method-switch">
      <p className="auth-method-label">Or sign in with</p>
      {current !== 'phone' && (
        <p className="auth-footer-link">
          <Link to="/">Phone number (SMS code)</Link>
        </p>
      )}
      {current !== 'email' && (
        <p className="auth-footer-link">
          <Link to="/student-login">Email (student)</Link>
        </p>
      )}
    </div>
  );
}
