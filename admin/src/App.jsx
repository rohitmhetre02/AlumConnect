import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import DashboardRoutes from './pages/DashboardRoutes'
import './App.css'
import { ToastProvider } from './context/ToastContext'

const PrivateRoute = ({ children }) => {
  // For now, we'll simulate authentication - replace with actual auth logic later
  const isAuthenticated = localStorage.getItem('adminToken') // Simple check for demo
  
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

const RedirectIfAuthenticated = ({ children }) => {
  // For now, we'll simulate authentication - replace with actual auth logic later
  const isAuthenticated = localStorage.getItem('adminToken') // Simple check for demo
  
  const location = useLocation()
  if (isAuthenticated) {
    // Get user role from localStorage or wherever it's stored
    const userRole = localStorage.getItem('userRole') || 'admin'
    const basePath = userRole === 'admin' ? '/admin' : '/coordinator'
    return <Navigate to={`${basePath}/dashboard`} replace state={{ from: location }} />
  }
  return children
}

function App() {
  return (
    <ToastProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            index
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="login"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="signup"
            element={
              <RedirectIfAuthenticated>
                <Signup />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <DashboardRoutes />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
