import { useState, useEffect } from 'react';
import { stakeholderAPI } from '../../api';

export default function TouchpointForm({ stakeholders, onClose, onSuccess }) {
  const [form, setForm] = useState({
    stakeholder_id: '',
    interaction_date: new Date().toISOString().slice(0, 16),
    interaction_type: 'email',
    subject: '',
    details: '',
    response_required: false,
    response_received: false,
    follow_up_date: '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        stakeholder_id: Number(form.stakeholder_id),
        interaction_date: new Date(form.interaction_date).toISOString(),
        follow_up_date: form.follow_up_date ? new Date(form.follow_up_date).toISOString() : null,
      };
      await stakeholderAPI.createTouchpoint(payload);
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Touchpoint</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholder *</label>
              <select name="stakeholder_id" value={form.stakeholder_id} onChange={handleChange} className="input-field" required>
                <option value="">Select stakeholder</option>
                {stakeholders.map(s => <option key={s.id} value={s.id}>{s.name} ({s.stakeholder_type.replace(/_/g, ' ')})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interaction Type</label>
                <select name="interaction_type" value={form.interaction_type} onChange={handleChange} className="input-field">
                  <option value="email">Email</option>
                  <option value="call">Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="approval_request">Approval Request</option>
                  <option value="update">Update</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="datetime-local" name="interaction_date" value={form.interaction_date} onChange={handleChange} className="input-field" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input name="subject" value={form.subject} onChange={handleChange} className="input-field" required placeholder="e.g., SRFI Logo Approval Request" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea name="details" value={form.details} onChange={handleChange} rows="3" className="input-field" placeholder="Conversation details, outcomes, next steps..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="response_required" checked={form.response_required} onChange={handleChange} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Response Required</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="response_received" checked={form.response_received} onChange={handleChange} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Response Received</label>
              </div>
            </div>

            {form.response_required && !form.response_received && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input type="date" name="follow_up_date" value={form.follow_up_date} onChange={handleChange} className="input-field" />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Log Touchpoint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
