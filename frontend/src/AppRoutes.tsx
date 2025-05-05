import { Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import UnauthorizedPage from './components/UnauthorizedPage';
import Dashboard from './components/Dashboard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="*" element={<UnauthorizedPage />} />
    </Routes>
  );
}

export default AppRoutes;