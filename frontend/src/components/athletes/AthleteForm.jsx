import { useState } from 'react';
import { athleteAPI } from '../../api';

const TIERS = [
  { value: 'emerging', label: 'Emerging' },
  { value: 'development', label: 'Development' },
  { value: 'elite', label: 'Elite' },
  { value: 'premier', label: 'Premier' },
];

const STATUSES = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
];

export default function AthleteForm({ onSuccess, initialData }) {
  const [form, setForm] = useState(initialData || {
    full_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    hometown: '',
    state: '',
    status: 'prospect',
    tier: 'emerging',
    jersey_number: '',
    monthly_stipend: 0,
    equipment_budget: 0,
    travel_budget: 0,
    psa_ranking: '',
    srfi_ranking: '',
    national_ranking: '',
    bio: '',
    jersey_compliance: true,
    social_media_tags: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        date_of_birth: form.date_of_birth ? new Date(form.date_of_birth).toISOString() : null,
      };
      if (initialData) {
        await athleteAPI.update(initialData.id, payload);
      } else {
        await athleteAPI.create(payload);
      }
      onSuccess();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hometown</label>
          <input name="hometown" value={form.hometown} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input name="state" value={form.state} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
          <select name="tier" value={form.tier} onChange={handleChange} className="input-field">
            {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Number</label>
          <input name="jersey_number" value={form.jersey_number} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Stipend (₹)</label>
          <input type="number" name="monthly_stipend" value={form.monthly_stipend} onChange={handleChange} className="input-field" min="0" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Budget (₹)</label>
          <input type="number" name="equipment_budget" value={form.equipment_budget} onChange={handleChange} className="input-field" min="0" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Travel Budget (₹)</label>
          <input type="number" name="travel_budget" value={form.travel_budget} onChange={handleChange} className="input-field" min="0" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PSA Ranking</label>
          <input type="number" name="psa_ranking" value={form.psa_ranking} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SRFI Ranking</label>
          <input type="number" name="srfi_ranking" value={form.srfi_ranking} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">National Ranking</label>
          <input type="number" name="national_ranking" value={form.national_ranking} onChange={handleChange} className="input-field" />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" name="jersey_compliance" checked={form.jersey_compliance} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
          <label className="text-sm text-gray-700">Jersey Compliance</label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Social Media Tags</label>
          <input name="social_media_tags" value={form.social_media_tags} onChange={handleChange} className="input-field" placeholder="@handle1, @handle2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows="3" className="input-field" placeholder="Athlete background, achievements..." />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onSuccess} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : initialData ? 'Update Athlete' : 'Add Athlete'}
        </button>
      </div>
    </form>
  );
}
