// Main layout component - sidebar navigation + content area
// Shows: Logo, navigation links, user info, logout button
// Content area renders child routes (Dashboard, Buckets, etc.)
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './Layout.css'

function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Social Rotation</h1>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className="nav-link">
            📊 Dashboard
          </Link>
          <Link to="/buckets" className="nav-link">
            📁 Buckets
          </Link>
          <Link to="/schedule" className="nav-link">
            ⏰ Schedule
          </Link>
          <Link to="/profile" className="nav-link">
            ⚙️ Profile
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main content area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
