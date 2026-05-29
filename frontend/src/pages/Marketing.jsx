import { useState, useEffect } from 'react';
import { Plus, Search, Camera, Instagram, Facebook, Twitter, Youtube, Globe, Calendar, CheckCircle, Clock, AlertTriangle, Image, Video, FileText } from 'lucide-react';
import { marketingAPI } from '../api';
import ContentAssetForm from '../components/marketing/ContentAssetForm';
import SocialPostForm from '../components/marketing/SocialPostForm';

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
  linkedin: Linkedin,
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  in_production: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  published: 'bg-primary-100 text-primary-700',
  archived: 'bg-gray-100 text-gray-500',
};

const contentTypeIcons = {
  photo: Image,
  video: Video,
  reel: Film,
  story: Layers,
  poster: FileText,
  banner: Layout,
  press_release: Newspaper,
};

export default function Marketing() {
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [postFilter, setPostFilter] = useState({ status: '', platform: '' });

  useEffect(() => {
    loadData();
  }, [postFilter]);

  const loadData = async () => {
    try {
      const [sRes, aRes, pRes] = await Promise.all([
        marketingAPI.getStats().catch(() => ({ data: null })),
        marketingAPI.getAssets(),
        marketingAPI.getPosts({ status: postFilter.status, platform: postFilter.platform }),
      ]);
      setStats(sRes.data);
      setAssets(aRes.data.items || []);
      setPosts(pRes.data.items || []);
    } catch (err) {
      console.error('Failed to load marketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await marketingAPI.deletePost(id);
      loadData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Marketing & Content</h2>
          <p className="text-sm text-gray-500 mt-1">Content pipeline, social media calendar, and asset management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAssetForm(true)} className="btn-secondary flex items-center gap-2">
            <Camera className="w-4 h-4" /> Add Asset
          </button>
          <button onClick={() => setShowPostForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Post
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">Total Assets</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_assets}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Total Posts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_posts}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Upcoming Posts</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">{stats.upcoming_posts}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending_approvals}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'posts', label: 'Social Posts' },
          { id: 'assets', label: 'Content Assets' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={postFilter.status} 
              onChange={(e) => setPostFilter({...postFilter, status: e.target.value})}
              className="input-field w-full sm:w-40"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_production">In Production</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
            </select>
            <select 
              value={postFilter.platform} 
              onChange={(e) => setPostFilter({...postFilter, platform: e.target.value})}
              className="input-field w-full sm:w-40"
            >
              <option value="">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {posts.length === 0 ? (
              <div className="card text-center py-12 col-span-2">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No posts scheduled</p>
              </div>
            ) : posts.map(post => {
              const PlatformIcon = platformIcons[post.platform] || Globe;
              return (
                <div key={post.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PlatformIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900 capitalize">{post.platform}</span>
                    </div>
                    <span className={`status-badge ${statusColors[post.status]}`}>
                      {post.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                    </span>
                    <span>Assigned: {post.assigned_to}</span>
                  </div>

                  {post.reach && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm">
                      <span className="text-gray-600">Reach: <strong>{post.reach?.toLocaleString()}</strong></span>
                      <span className="text-gray-600">Engagement: <strong>{post.engagement?.toLocaleString()}</strong></span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <select 
                      value={post.status}
                      onChange={async (e) => {
                        try {
                          await marketingAPI.updatePost(post.id, { status: e.target.value });
                          loadData();
                        } catch (err) {
                          alert('Update failed');
                        }
                      }}
                      className="input-field text-sm py-1.5 flex-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_production">In Production</option>
                      <option value="review">Review</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button onClick={() => handleDeletePost(post.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.length === 0 ? (
            <div className="card text-center py-12 col-span-3">
              <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No content assets uploaded</p>
            </div>
          ) : assets.map(asset => {
            const TypeIcon = contentTypeIcons[asset.content_type] || Image;
            return (
              <div key={asset.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{asset.title}</h3>
                    <p className="text-xs text-gray-500 capitalize">{asset.content_type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                {asset.event_name && (
                  <p className="text-sm text-gray-600 mb-2">{asset.event_name}</p>
                )}
                {asset.capture_date && (
                  <p className="text-xs text-gray-500">Captured: {new Date(asset.capture_date).toLocaleDateString()}</p>
                )}
                {asset.tags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {asset.tags.split(',').map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAssetForm && <ContentAssetForm onClose={() => setShowAssetForm(false)} onSuccess={() => { setShowAssetForm(false); loadData(); }} />}
      {showPostForm && <SocialPostForm onClose={() => setShowPostForm(false)} onSuccess={() => { setShowPostForm(false); loadData(); }} />}
    </div>
  );
}
