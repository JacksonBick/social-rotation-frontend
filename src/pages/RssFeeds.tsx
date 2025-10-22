import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import './RssFeeds.css';

interface RssFeed {
  id: number;
  url: string;
  name: string;
  description: string;
  is_active: boolean;
  status: string;
  last_fetched_at: string | null;
  posts_count: number;
  unprocessed_posts_count: number;
  created_at: string;
  updated_at: string;
  account: {
    id: number;
    name: string;
  };
  created_by: {
    id: number;
    name: string;
    email: string;
  };
}

const RssFeeds: React.FC = () => {
  const { user } = useAuthStore();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rss_feeds');
      setFeeds(response.data.rss_feeds);
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rss_feeds', formData);
      setShowCreateModal(false);
      setFormData({ url: '', name: '', description: '', is_active: true });
      fetchFeeds();
    } catch (error) {
      console.error('Error creating RSS feed:', error);
    }
  };

  const handleUpdateFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeed) return;
    
    try {
      await api.put(`/rss_feeds/${editingFeed.id}`, formData);
      setEditingFeed(null);
      setFormData({ url: '', name: '', description: '', is_active: true });
      fetchFeeds();
    } catch (error) {
      console.error('Error updating RSS feed:', error);
    }
  };

  const handleDeleteFeed = async (id: number) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) return;
    
    try {
      await api.delete(`/rss_feeds/${id}`);
      fetchFeeds();
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
    }
  };

  const handleFetchPosts = async (id: number) => {
    try {
      await api.post(`/rss_feeds/${id}/fetch_posts`);
      fetchFeeds();
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const openEditModal = (feed: RssFeed) => {
    setEditingFeed(feed);
    setFormData({
      url: feed.url,
      name: feed.name,
      description: feed.description,
      is_active: feed.is_active
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingFeed(null);
    setFormData({ url: '', name: '', description: '', is_active: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'needs_fetch': return '#f59e0b';
      case 'never_fetched': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="rss-feeds-container">
        <div className="loading">Loading RSS feeds...</div>
      </div>
    );
  }

  return (
    <div className="rss-feeds-container">
      <div className="rss-feeds-header">
        <h1>RSS Feeds</h1>
        <p>Manage RSS feeds for automated content posting</p>
        {user?.can_manage_rss_feeds && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Add RSS Feed
          </button>
        )}
      </div>

      {feeds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📰</div>
          <h3>No RSS Feeds</h3>
          <p>Create your first RSS feed to start automating content posting</p>
          {user?.can_manage_rss_feeds && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Add RSS Feed
            </button>
          )}
        </div>
      ) : (
        <div className="feeds-grid">
          {feeds.map((feed) => (
            <div key={feed.id} className="feed-card">
              <div className="feed-header">
                <h3>{feed.name}</h3>
                <div className="feed-status">
                  <span 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(feed.status) }}
                  ></span>
                  <span className="status-text">{feed.status}</span>
                </div>
              </div>
              
              <div className="feed-info">
                <p className="feed-url">{feed.url}</p>
                {feed.description && (
                  <p className="feed-description">{feed.description}</p>
                )}
              </div>

              <div className="feed-stats">
                <div className="stat">
                  <span className="stat-label">Posts:</span>
                  <span className="stat-value">{feed.posts_count}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Unprocessed:</span>
                  <span className="stat-value">{feed.unprocessed_posts_count}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Last Fetched:</span>
                  <span className="stat-value">{formatDate(feed.last_fetched_at)}</span>
                </div>
              </div>

              <div className="feed-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleFetchPosts(feed.id)}
                >
                  Fetch Posts
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.location.href = `/rss-feeds/${feed.id}/posts`}
                >
                  View Posts
                </button>
                {user?.can_manage_rss_feeds && (
                  <>
                    <button 
                      className="btn btn-outline"
                      onClick={() => openEditModal(feed)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteFeed(feed.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFeed) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingFeed ? 'Edit RSS Feed' : 'Add RSS Feed'}</h2>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>
            
            <form onSubmit={editingFeed ? handleUpdateFeed : handleCreateFeed}>
              <div className="form-group">
                <label htmlFor="url">RSS Feed URL *</label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/feed.xml"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Feed Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Blog Feed"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of this RSS feed"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="checkmark"></span>
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFeed ? 'Update Feed' : 'Create Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RssFeeds;
