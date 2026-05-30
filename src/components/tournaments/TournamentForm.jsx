import { useState } from 'react';
import { tournamentAPI } from '../../api';

const EVENT_TYPES = [
  { value: 'international_camp', label: 'International Camp' },
  { value: 'state_championship', label: 'State Championship' },
  { value: 'psa_satellite', label: 'PSA Satellite' },
  { value: 'open_tournament', label: 'Open Tournament' },
  { value: 'regional_event', label: 'Regional Event' },
  { value: 'training_clinic', label: 'Training Clinic' },
];

export default function TournamentForm({ onSuccess, initialData }) {
  const [form, setForm] = useState(initialData || {
    name: '',
    event_type: 'open_tournament',
    status: 'planning',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    venue: '',
    city: '',
    state: 'Gujarat',
    srfi_star_rating: null,
    srfi_approval_status: 'pending',
    guest_coach_name: '',
    guest_coach_origin: '',
    clinic_days: 0,
    clinic_pre_event: false,
    budget_allocated: 0,
    expected_players: 0,
    courts_booked: 0,
    risk_level: 'green',
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
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null,
      };

      if (initialData) {
        await tournamentAPI.update(initialData.id, payload);
      } else {
        await tournamentAPI.create(payload);
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
          <select name="event_type" value={form.event_type} onChange={handleChange} className="input-field">
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="planning">Planning</option>
            <option value="srfi_approval_pending">SRFI Approval Pending</option>
            <option value="approved">Approved</option>
            <option value="coach_booking">Coach Booking</option>
            <option value="registration_open">Registration Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
          <input type="datetime-local" name="start_date" value={form.start_date} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
          <input type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
          <input type="datetime-local" name="registration_deadline" value={form.registration_deadline} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
          <input name="venue" value={form.venue} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input name="city" value={form.city} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SRFI Star Rating</label>
          <select name="srfi_star_rating" value={form.srfi_star_rating || ''} onChange={handleChange} className="input-field">
            <option value="">None</option>
            <option value={1}>1 Star</option>
            <option value={2}>2 Star</option>
            <option value={3}>3 Star</option>
            <option value={4}>4 Star</option>
            <option value={5}>5 Star</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SRFI Approval Status</label>
          <select name="srfi_approval_status" value={form.srfi_approval_status} onChange={handleChange} className="input-field">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Guest Coach</label>
          <input name="guest_coach_name" value={form.guest_coach_name} onChange={handleChange} className="input-field" placeholder="e.g., Andrew Shoukry" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coach Origin</label>
          <input name="guest_coach_origin" value={form.guest_coach_origin} onChange={handleChange} className="input-field" placeholder="e.g., Mumbai, Delhi" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Days</label>
            <input type="number" name="clinic_days" value={form.clinic_days} onChange={handleChange} className="input-field" min="0" />
          </div>
          <div className="pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="clinic_pre_event" checked={form.clinic_pre_event} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-gray-700">Pre-event clinic</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget Allocated (₹)</label>
          <input type="number" name="budget_allocated" value={form.budget_allocated} onChange={handleChange} className="input-field" min="0" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Players</label>
          <input type="number" name="expected_players" value={form.expected_players} onChange={handleChange} className="input-field" min="0" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <select name="risk_level" value={form.risk_level} onChange={handleChange} className="input-field">
            <option value="green">Green - On Track</option>
            <option value="amber">Amber - At Risk</option>
            <option value="red">Red - Critical</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" className="input-field" placeholder="Internal notes, dependencies with Kunwar Pal, etc." />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onSuccess} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
