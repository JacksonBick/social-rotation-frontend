import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import './Schedule.css';

interface Bucket {
  id: number;
  name: string;
}

interface BucketSchedule {
  id: number;
  bucket_id: number;
  bucket_image_id: number | null;
  schedule: string;
  schedule_type: number;
  post_to: number;
  description: string;
  twitter_description: string;
  times_sent: number;
  skip_image: number;
  created_at: string;
  updated_at: string;
  bucket_name?: string;
}

// Schedule types
const SCHEDULE_TYPE_ROTATION = 1;
const SCHEDULE_TYPE_ONCE = 2;
const SCHEDULE_TYPE_ANNUALLY = 3;

// Social media platforms
const PLATFORMS = {
  FACEBOOK: 1,
  TWITTER: 2,
  INSTAGRAM: 4,
  LINKEDIN: 8,
  GMB: 16,
  PINTEREST: 32,
};

export default function Schedule() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [scheduleType, setScheduleType] = useState<number>(SCHEDULE_TYPE_ROTATION);
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [twitterDescription, setTwitterDescription] = useState('');
  
  // Social media platform checkboxes
  const [facebook, setFacebook] = useState(true);
  const [twitter, setTwitter] = useState(true);
  const [instagram, setInstagram] = useState(false);
  const [linkedin, setLinkedin] = useState(false);
  const [gmb, setGmb] = useState(false);
  const [pinterest, setPinterest] = useState(false);
  
  const [error, setError] = useState('');

  // Fetch all schedules
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['bucket_schedules'],
    queryFn: async () => {
      const response = await api.get('/bucket_schedules');
      return response.data.bucket_schedules as BucketSchedule[];
    },
  });

  // Fetch buckets for dropdown
  const { data: bucketsData } = useQuery({
    queryKey: ['buckets'],
    queryFn: async () => {
      const response = await api.get('/buckets');
      return response.data.buckets as Bucket[];
    },
  });

  // Create schedule mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/bucket_schedules', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket_schedules'] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.errors?.join(', ') || 'Failed to create schedule');
    },
  });

  // Delete schedule mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/bucket_schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket_schedules'] });
    },
  });

  // Post now mutation
  const postNowMutation = useMutation({
    mutationFn: (id: number) => api.post(`/scheduler/post_now/${id}`),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bucket_schedules'] });
      alert(`Post sent successfully!\n\nResults:\n${JSON.stringify(response.data.results, null, 2)}`);
    },
    onError: (err: any) => {
      alert(`Failed to post: ${err.response?.data?.details || err.response?.data?.error || 'Unknown error'}`);
    },
  });

  const resetForm = () => {
    setSelectedBucket(null);
    setScheduleType(SCHEDULE_TYPE_ROTATION);
    setTime('12:00');
    setDescription('');
    setTwitterDescription('');
    setFacebook(true);
    setTwitter(true);
    setInstagram(false);
    setLinkedin(false);
    setGmb(false);
    setPinterest(false);
    setError('');
  };

  const calculatePostTo = () => {
    let postTo = 0;
    if (facebook) postTo |= PLATFORMS.FACEBOOK;
    if (twitter) postTo |= PLATFORMS.TWITTER;
    if (instagram) postTo |= PLATFORMS.INSTAGRAM;
    if (linkedin) postTo |= PLATFORMS.LINKEDIN;
    if (gmb) postTo |= PLATFORMS.GMB;
    if (pinterest) postTo |= PLATFORMS.PINTEREST;
    return postTo;
  };

  const generateCronString = () => {
    const [hour, minute] = time.split(':');
    
    if (scheduleType === SCHEDULE_TYPE_ROTATION) {
      // Daily at specified time
      return `${minute} ${hour} * * *`;
    } else if (scheduleType === SCHEDULE_TYPE_ONCE) {
      // Once at specified time (today)
      const now = new Date();
      return `${minute} ${hour} ${now.getDate()} ${now.getMonth() + 1} *`;
    } else {
      // Annually (every year on today's date)
      const now = new Date();
      return `${minute} ${hour} ${now.getDate()} ${now.getMonth() + 1} *`;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedBucket) {
      setError('Please select a bucket');
      return;
    }

    const postTo = calculatePostTo();
    if (postTo === 0) {
      setError('Please select at least one social media platform');
      return;
    }

    const cronString = generateCronString();

    createMutation.mutate({
      bucket_id: selectedBucket,
      schedule: cronString,
      schedule_type: scheduleType,
      post_to: postTo,
      description: description,
      twitter_description: twitterDescription || description,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePostNow = (id: number) => {
    if (window.confirm('Post this content now to all selected social media platforms?')) {
      postNowMutation.mutate(id);
    }
  };

  const getScheduleTypeName = (type: number) => {
    switch (type) {
      case SCHEDULE_TYPE_ROTATION:
        return 'Rotation';
      case SCHEDULE_TYPE_ONCE:
        return 'Once';
      case SCHEDULE_TYPE_ANNUALLY:
        return 'Annually';
      default:
        return 'Unknown';
    }
  };

  const getPlatformNames = (postTo: number) => {
    const platforms = [];
    if (postTo & PLATFORMS.FACEBOOK) platforms.push('Facebook');
    if (postTo & PLATFORMS.TWITTER) platforms.push('X');
    if (postTo & PLATFORMS.INSTAGRAM) platforms.push('Instagram');
    if (postTo & PLATFORMS.LINKEDIN) platforms.push('LinkedIn');
    if (postTo & PLATFORMS.GMB) platforms.push('GMB');
    if (postTo & PLATFORMS.PINTEREST) platforms.push('Pinterest');
    return platforms.join(', ');
  };

  if (schedulesLoading) {
    return <div className="loading">Loading schedules...</div>;
  }

  const schedules = schedulesData || [];
  const buckets = bucketsData || [];

  return (
    <div className="schedule-page">
      <div className="page-header">
        <h1>Schedules</h1>
        <button onClick={() => setShowCreateModal(true)} className="create-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Schedule
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="empty-state">
          <p>No schedules yet. Create your first schedule to start automating posts!</p>
        </div>
      ) : (
        <div className="schedules-list">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="schedule-card">
              <div className="schedule-header">
                <div className="schedule-type-badge" data-type={schedule.schedule_type}>
                  {getScheduleTypeName(schedule.schedule_type)}
                </div>
                <div className="schedule-actions">
                  <button
                    onClick={() => handlePostNow(schedule.id)}
                    className="post-now-btn"
                    title="Post now"
                    disabled={postNowMutation.isPending}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="delete-btn"
                    title="Delete schedule"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="schedule-info">
                <div className="info-row">
                  <span className="label">Bucket:</span>
                  <span className="value">{schedule.bucket_name || `Bucket #${schedule.bucket_id}`}</span>
                </div>
                <div className="info-row">
                  <span className="label">Schedule:</span>
                  <span className="value">{schedule.schedule}</span>
                </div>
                <div className="info-row">
                  <span className="label">Platforms:</span>
                  <span className="value">{getPlatformNames(schedule.post_to)}</span>
                </div>
                {schedule.description && (
                  <div className="info-row">
                    <span className="label">Description:</span>
                    <span className="value">{schedule.description}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Times Sent:</span>
                  <span className="value">{schedule.times_sent}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Schedule</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="bucket">Bucket *</label>
                <select
                  id="bucket"
                  value={selectedBucket || ''}
                  onChange={(e) => setSelectedBucket(Number(e.target.value))}
                  required
                >
                  <option value="">Select a bucket</option>
                  {buckets.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="scheduleType">Schedule Type *</label>
                <select
                  id="scheduleType"
                  value={scheduleType}
                  onChange={(e) => setScheduleType(Number(e.target.value))}
                  required
                >
                  <option value={SCHEDULE_TYPE_ROTATION}>Rotation (Daily)</option>
                  <option value={SCHEDULE_TYPE_ONCE}>Once</option>
                  <option value={SCHEDULE_TYPE_ANNUALLY}>Annually</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="time">Time *</label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Post To Platforms *</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={facebook} onChange={(e) => setFacebook(e.target.checked)} />
                    <span>Facebook</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={twitter} onChange={(e) => setTwitter(e.target.checked)} />
                    <span>X</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={instagram} onChange={(e) => setInstagram(e.target.checked)} />
                    <span>Instagram</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={linkedin} onChange={(e) => setLinkedin(e.target.checked)} />
                    <span>LinkedIn</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={gmb} onChange={(e) => setGmb(e.target.checked)} />
                    <span>Google My Business</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={pinterest} onChange={(e) => setPinterest(e.target.checked)} />
                    <span>Pinterest</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Post description for Facebook, LinkedIn, etc."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="twitterDescription">X Description (optional)</label>
                <textarea
                  id="twitterDescription"
                  value={twitterDescription}
                  onChange={(e) => setTwitterDescription(e.target.value)}
                  placeholder="X-specific description (280 characters max)"
                  rows={2}
                  maxLength={280}
                />
                <small>{twitterDescription.length}/280 characters</small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="submit-btn">
                  {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
