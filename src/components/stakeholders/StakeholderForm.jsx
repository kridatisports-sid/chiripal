import { useState } from 'react';
import { stakeholderAPI } from '../../api';

const TYPES = [
  { value: 'state_association', label: 'State Association' },
  { value: 'srfi', label: 'SRFI' },
  { value: 'club_partner', label: 'Club Partner' },
  { value: 'coach', label: 'Coach' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'media', label: 'Media' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'other', label: 'Other' },
];

export default function StakeholderForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    stakeholder_type: 'club_partner',
    organization: '',
    primary_contact: '',
    email: '',
    phone: '',
    is_active_partner: true,
    mou_start_date: '',
    mou_end_date: '',
    mou_status: 'active',
    revenue_share_percent: '',
    fixed_cost_monthly: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        mou_start_date: form.mou_start_date ? new Date(form.mou_start_date).toISOString() : null,
        mou_end_date: form.mou_end_date ? new Date(form.mou_end_date).toISOString() : null,
      };
      await stakeholderAPI.create(payload);
      onSuccess();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Stakeholder</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select name="stakeholder_type" value={form.stakeholder_type} onChange={handleChange} className="input-field">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input name="organization" value={form.organization} onChange={handleChange} className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
                <input name="primary_contact" value={form.primary_contact} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MOU Start</label>
                <input type="date" name="mou_start_date" value={form.mou_start_date} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MOU End</label>
                <input type="date" name="mou_end_date" value={form.mou_end_date} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Share (%)</label>
                <input type="number" name="revenue_share_percent" value={form.revenue_share_percent} onChange={handleChange} className="input-field" min="0" max="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Cost/Month (₹)</label>
                <input type="number" name="fixed_cost_monthly" value={form.fixed_cost_monthly} onChange={handleChange} className="input-field" min="0" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="2" className="input-field" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_active_partner" checked={form.is_active_partner} onChange={handleChange} className="w-4 h-4" />
              <label className="text-sm text-gray-700">Active Partner</label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Stakeholder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
