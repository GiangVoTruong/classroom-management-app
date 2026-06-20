import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import PhoneVerification from './pages/PhoneVerification';
import StudentLogin from './pages/StudentLogin';
import EmailVerification from './pages/EmailVerification';
import SetupAccount from './pages/SetupAccount';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/verify-phone" element={<PhoneVerification />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/setup-account" element={<SetupAccount />} />
          <Route path="/setup" element={<Navigate to="/setup-account" replace />} />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute role="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
