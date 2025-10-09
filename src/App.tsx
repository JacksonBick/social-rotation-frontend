// Main App component - handles routing and layout
// Routes:
//   / - Dashboard (protected)
//   /login - Login page
//   /register - Register page
//   /buckets - Bucket management (protected)
//   /schedule - Scheduling interface (protected)
//   /marketplace - Marketplace browsing (protected)
//   /profile - User profile (protected)
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Buckets from './pages/Buckets'
import Schedule from './pages/Schedule'
import Profile from './pages/Profile'

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes with layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="buckets" element={<Buckets />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
