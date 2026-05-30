import { useState, useEffect } from 'react';
import { marketingAPI, tournamentAPI } from '../../api';

const CONTENT_TYPES = [
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Video' },
  { value: 'reel', label: 'Reel' },
  { value: 'story', label: 'Story' },
  { value: 'poster', label: 'Poster' },
  { value: 'banner', label: 'Banner' },
  { value: 'press_release', label: 'Press Release' },
];

export default function ContentAssetForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    content_type: 'photo',
    tournament_id: '',
    event_name: '',
    captured_by: '',
    capture_date: '',
    usage_rights: 'internal',
    tags: '',
  });
  const [tournaments, setTournaments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tournamentAPI.getAll({ limit: 100 }).then(res => setTournaments(res.data.items || []));
  }, []);

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
        tournament_id: form.tournament_id ? Number(form.tournament_id) : null,
        capture_date: form.capture_date ? new Date(form.capture_date).toISOString() : null,
      };
      await marketingAPI.createAsset(payload);
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Content Asset</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select name="content_type" value={form.content_type} onChange={handleChange} className="input-field">
                {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Tournament</label>
              <select name="tournament_id" value={form.tournament_id} onChange={handleChange} className="input-field">
                <option value="">None</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input name="event_name" value={form.event_name} onChange={handleChange} className="input-field" placeholder="e.g., Gujarat State Championship 2026" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Captured By</label>
                <input name="captured_by" value={form.captured_by} onChange={handleChange} className="input-field" placeholder="Photographer name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capture Date</label>
                <input type="date" name="capture_date" value={form.capture_date} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Rights</label>
              <select name="usage_rights" value={form.usage_rights} onChange={handleChange} className="input-field">
                <option value="internal">Internal Only</option>
                <option value="social_media">Social Media</option>
                <option value="commercial">Commercial</option>
                <option value="public_domain">Public Domain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input name="tags" value={form.tags} onChange={handleChange} className="input-field" placeholder="finals, action, portrait, team" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
