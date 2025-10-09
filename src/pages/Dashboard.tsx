// Dashboard page - overview of user's content and activity
// Shows: clickable stat cards that navigate to their respective pages
// Cards: Buckets → /buckets, Schedules → /schedule, Marketplace → /marketplace
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { bucketsAPI, schedulesAPI } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  // Fetch buckets count
  const { data: bucketsData } = useQuery({
    queryKey: ['buckets'],
    queryFn: async () => {
      const response = await bucketsAPI.getAll()
      return response.data.buckets
    },
  })

  // Fetch schedules count
  const { data: schedulesData } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const response = await schedulesAPI.getAll()
      return response.data.bucket_schedules
    },
  })

  const bucketsCount = bucketsData?.length || 0
  const schedulesCount = schedulesData?.length || 0

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}! 👋</h1>
      <p style={{ color: '#666', marginTop: '0.5rem' }}>Here's an overview of your content</p>
      
      <div className="stats-grid">
        {/* Buckets Card - Click to go to Buckets page */}
        <div 
          className="stat-card clickable"
          onClick={() => navigate('/buckets')}
          role="button"
          tabIndex={0}
        >
          <h3>📁 Buckets</h3>
          <p className="stat-number">{bucketsCount}</p>
          <p className="stat-label">Content collections</p>
          <div className="card-arrow">→</div>
        </div>
        
        {/* Schedules Card - Click to go to Schedule page */}
        <div 
          className="stat-card clickable"
          onClick={() => navigate('/schedule')}
          role="button"
          tabIndex={0}
        >
          <h3>⏰ Schedules</h3>
          <p className="stat-number">{schedulesCount}</p>
          <p className="stat-label">Active schedules</p>
          <div className="card-arrow">→</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
