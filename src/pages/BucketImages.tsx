import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ImageEditor from '../components/ImageEditor';
import './BucketImages.css';

interface Image {
  id: number;
  file_path: string;
  source_url: string;
}

interface BucketImage {
  id: number;
  friendly_name: string;
  description: string;
  twitter_description: string;
  force_send_date: string | null;
  repeat: boolean;
  post_to: number;
  use_watermark: boolean;
  image: Image;
  created_at: string;
  updated_at: string;
}

interface Bucket {
  id: number;
  name: string;
  description: string;
  use_watermark: boolean;
  post_once_bucket: boolean;
  images_count: number;
  schedules_count: number;
}

export default function BucketImages() {
  const { bucketId } = useParams<{ bucketId: string }>();
  const navigate = useNavigate();
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [images, setImages] = useState<BucketImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);

  useEffect(() => {
    fetchBucketAndImages();
  }, [bucketId]);

  const fetchBucketAndImages = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch bucket details
      const bucketResponse = await api.get(`/buckets/${bucketId}`);
      setBucket(bucketResponse.data.bucket);
      setImages(bucketResponse.data.bucket_images || []);
    } catch (err: any) {
      console.error('Error fetching bucket:', err);
      setError(err.response?.data?.error || 'Failed to load bucket');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post(
        `/buckets/${bucketId}/images/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess('Image uploaded successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Refresh the images list
      await fetchBucketAndImages();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await api.delete(`/buckets/${bucketId}/images/${imageId}`);
      setSuccess('Image deleted successfully!');
      
      // Refresh the images list
      await fetchBucketAndImages();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting image:', err);
      setError(err.response?.data?.error || 'Failed to delete image');
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  const handleEditImage = (bucketImage: BucketImage) => {
    const imageUrl = `http://localhost:3000/${bucketImage.image.file_path}`;
    setEditingImageUrl(imageUrl);
    setEditingImageId(bucketImage.id);
  };

  const handleSaveEditedImage = async (editedImageBlob: Blob) => {
    if (!editingImageId) return;

    try {
      const formData = new FormData();
      formData.append('file', editedImageBlob, 'edited-image.jpg');

      // Upload the edited image as a new version
      await api.patch(
        `/buckets/${bucketId}/images/${editingImageId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess('Image edited successfully!');
      setEditingImageUrl(null);
      setEditingImageId(null);
      
      // Refresh the images list
      await fetchBucketAndImages();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving edited image:', err);
      throw err; // Let the editor handle the error
    }
  };

  if (loading) {
    return (
      <div className="bucket-images-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!bucket) {
    return (
      <div className="bucket-images-page">
        <div className="error">Bucket not found</div>
      </div>
    );
  }

  return (
    <div className="bucket-images-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/buckets')}>
          ← Back to Buckets
        </button>
        <h1>{bucket.name}</h1>
        {bucket.description && <p className="bucket-description">{bucket.description}</p>}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Upload Image</h2>
        <div className="upload-container">
          {!selectedFile ? (
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Choose Image
              </label>
            </div>
          ) : (
            <div className="upload-preview">
              <img src={previewUrl || ''} alt="Preview" className="preview-image" />
              <div className="upload-actions">
                <p className="file-name">{selectedFile.name}</p>
                <div className="button-group">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn-upload"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={cancelUpload}
                    disabled={uploading}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Images Grid */}
      <div className="images-section">
        <h2>Images ({images.length})</h2>
        {images.length === 0 ? (
          <div className="no-images">
            <p>No images in this bucket yet. Upload your first image above!</p>
          </div>
        ) : (
          <div className="images-grid">
            {images.map((bucketImage) => (
              <div key={bucketImage.id} className="image-card">
                <div className="image-wrapper">
                  <img
                    src={`http://localhost:3000/${bucketImage.image.file_path}`}
                    alt={bucketImage.friendly_name}
                    className="image-thumbnail"
                  />
                </div>
                <div className="image-info">
                  <h3 className="image-name">{bucketImage.friendly_name}</h3>
                  {bucketImage.description && (
                    <p className="image-description">{bucketImage.description}</p>
                  )}
                  <div className="image-actions">
                    <button
                      onClick={() => handleEditImage(bucketImage)}
                      className="btn-edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bucketImage.id)}
                      className="btn-delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Editor Modal */}
      {editingImageUrl && (
        <ImageEditor
          imageUrl={editingImageUrl}
          onSave={handleSaveEditedImage}
          onClose={() => {
            setEditingImageUrl(null);
            setEditingImageId(null);
          }}
        />
      )}
    </div>
  );
}

