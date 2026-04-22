import { Navigate } from 'react-router-dom';
import { getAuthToken, parseJwt } from '../services/api';

export default function ProtectedRoute({ children, allowedRole }) {
  const token = getAuthToken();
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRole) {
    const payload = parseJwt(token);
    if (!payload || !payload.roles.split(',').includes(allowedRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
