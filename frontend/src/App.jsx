import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RecoveryPage from './pages/RecoveryPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/recovery" element={<RecoveryPage />} />
      </Routes>
    </Router>
  );
}
