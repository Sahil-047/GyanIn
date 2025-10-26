import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { isAuthenticated, isSessionValid } from '../utils/auth'

const ProtectedRoute = () => {
  const location = useLocation()

  // Check if user is authenticated and session is valid
  if (!isAuthenticated() || !isSessionValid()) {
    // Redirect to login page with the attempted location
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // If authenticated, render the child routes
  return <Outlet />
}

export default ProtectedRoute

