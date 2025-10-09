// Buckets page - manage content collections
// Features: 
//   - List all user's buckets in a grid
//   - Create new bucket with modal form
//   - View bucket details (click card)
//   - Delete bucket
//   - Shows image count and schedule count for each bucket
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bucketsAPI } from '../services/api'
import './Buckets.css'

// TypeScript interface for Bucket data
interface Bucket {
  id: number
  name: string
  description: string
  user_id: number
  use_watermark: boolean
  post_once_bucket: boolean
  images_count: number
  schedules_count: number
  created_at: string
}

function Buckets() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBucketName, setNewBucketName] = useState('')
  const [newBucketDescription, setNewBucketDescription] = useState('')
  const [error, setError] = useState('')
  
  const queryClient = useQueryClient()

  // Fetch all buckets from API
  // GET /api/v1/buckets
  const { data: bucketsData, isLoading } = useQuery({
    queryKey: ['buckets'],
    queryFn: async () => {
      const response = await bucketsAPI.getAll()
      return response.data.buckets as Bucket[]
    },
  })

  // Create new bucket mutation
  // POST /api/v1/buckets
  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      bucketsAPI.create(data),
    onSuccess: () => {
      // Refresh buckets list
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      // Close modal and reset form
      setShowCreateModal(false)
      setNewBucketName('')
      setNewBucketDescription('')
      setError('')
    },
    onError: (err: any) => {
      setError(err.response?.data?.errors?.join(', ') || 'Failed to create bucket')
    },
  })

  // Delete bucket mutation
  // DELETE /api/v1/buckets/:id
  const deleteMutation = useMutation({
    mutationFn: (id: number) => bucketsAPI.delete(id),
    onSuccess: () => {
      // Refresh buckets list
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!newBucketName.trim()) {
      setError('Bucket name is required')
      return
    }
    
    createMutation.mutate({
      name: newBucketName,
      description: newBucketDescription,
    })
  }

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will delete all images and schedules.`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="loading">Loading buckets...</div>
  }

  const buckets = bucketsData || []

  return (
    <div className="buckets-page">
      <div className="page-header">
        <h1>📁 Buckets</h1>
        <button onClick={() => setShowCreateModal(true)} className="create-btn">
          + Create New Bucket
        </button>
      </div>

      {buckets.length === 0 ? (
        <div className="empty-state">
          <p>No buckets yet. Create your first bucket to get started!</p>
        </div>
      ) : (
        <div className="buckets-grid">
          {buckets.map((bucket) => (
            <div key={bucket.id} className="bucket-card">
              <div className="bucket-header">
                <h3>{bucket.name}</h3>
                <button
                  onClick={() => handleDelete(bucket.id, bucket.name)}
                  className="delete-btn"
                  title="Delete bucket"
                >
                  🗑️
                </button>
              </div>
              
              {bucket.description && (
                <p className="bucket-description">{bucket.description}</p>
              )}
              
              <div className="bucket-stats">
                <div className="stat">
                  <span className="stat-icon">🖼️</span>
                  <span className="stat-value">{bucket.images_count}</span>
                  <span className="stat-label">Images</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⏰</span>
                  <span className="stat-value">{bucket.schedules_count}</span>
                  <span className="stat-label">Schedules</span>
                </div>
              </div>
              
              <div className="bucket-footer">
                <button className="view-btn">View Details →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Bucket Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Bucket</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">
                ✕
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="bucketName">Bucket Name *</label>
                <input
                  id="bucketName"
                  type="text"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="e.g., Summer Promotions"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bucketDescription">Description (optional)</label>
                <textarea
                  id="bucketDescription"
                  value={newBucketDescription}
                  onChange={(e) => setNewBucketDescription(e.target.value)}
                  placeholder="Describe this content collection..."
                  rows={3}
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="submit-btn"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Bucket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Buckets