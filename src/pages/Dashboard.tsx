// Dashboard page - overview of user's content and activity
// Shows: clickable stat cards that navigate to their respective pages
// Cards: Buckets → /buckets, Schedules → /schedule, Marketplace → /marketplace
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useQuery } from '@tanstack/react-query'
import { bucketsAPI, schedulesAPI } from '../services/api'
import api from '../services/api'
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

  // Fetch sub-accounts count (for resellers)
  const { data: subAccountsData } = useQuery({
    queryKey: ['sub_accounts'],
    queryFn: async () => {
      const response = await api.get('/sub_accounts')
      return response.data
    },
    enabled: !!user?.reseller,
  })

  const bucketsCount = bucketsData?.length || 0
  const schedulesCount = schedulesData?.length || 0
  const subAccountsCount = subAccountsData?.sub_accounts?.length || 0

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.name}!</h1>
      <p style={{ color: '#666', marginTop: '0.5rem' }}>
        {user?.reseller ? 'Manage your agency and sub-accounts' : "Here's an overview of your content"}
      </p>
      
      <div className="stats-grid">
        {/* Buckets Card - Click to go to Buckets page */}
        <div 
          className="stat-card clickable"
          onClick={() => navigate('/buckets')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <h3>Buckets</h3>
          </div>
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
          <div className="stat-card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h3>Schedules</h3>
          </div>
          <p className="stat-number">{schedulesCount}</p>
          <p className="stat-label">Active schedules</p>
          <div className="card-arrow">→</div>
        </div>
        
        {/* Sub-Accounts Card - Only for resellers */}
        {user?.reseller && (
          <div 
            className="stat-card clickable"
            onClick={() => navigate('/sub-accounts')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h3>Sub-Accounts</h3>
            </div>
            <p className="stat-number">{subAccountsCount}</p>
            <p className="stat-label">Client accounts</p>
            <div className="card-arrow">→</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
