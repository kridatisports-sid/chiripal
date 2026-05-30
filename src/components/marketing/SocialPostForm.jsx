import { useState } from 'react';
import { marketingAPI } from '../../api';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'Website' },
];

export default function SocialPostForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    caption: '',
    platform: 'instagram',
    scheduled_date: '',
    status: 'pending',
    assigned_to: 'Akash',
    event_reference: '',
    asset_ids: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : null,
      };
      await marketingAPI.createPost(payload);
      onSuccess();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Social Post</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" required placeholder="e.g., Gujarat Open Finals Highlights" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <textarea name="caption" value={form.caption} onChange={handleChange} rows="3" className="input-field" placeholder="Post caption, hashtags..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select name="platform" value={form.platform} onChange={handleChange} className="input-field">
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="input-field">
                  <option value="pending">Pending</option>
                  <option value="in_production">In Production</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input type="datetime-local" name="scheduled_date" value={form.scheduled_date} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input name="assigned_to" value={form.assigned_to} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Reference</label>
              <input name="event_reference" value={form.event_reference} onChange={handleChange} className="input-field" placeholder="e.g., Gujarat State Championship" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset IDs</label>
              <input name="asset_ids" value={form.asset_ids} onChange={handleChange} className="input-field" placeholder="Comma-separated asset IDs" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Schedule Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
