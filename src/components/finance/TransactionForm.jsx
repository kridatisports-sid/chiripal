import { useState, useEffect } from 'react';
import { financeAPI, tournamentAPI } from '../../api';

const CATEGORIES = [
  { value: 'venue', label: 'Venue' },
  { value: 'coach_fees', label: 'Coach Fees' },
  { value: 'travel', label: 'Travel' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'athlete_sponsorship', label: 'Athlete Sponsorship' },
  { value: 'registration', label: 'Registration Revenue' },
  { value: 'sponsorship', label: 'Sponsorship Revenue' },
  { value: 'club_partnership', label: 'Club Partnership' },
  { value: 'srfi_fees', label: 'SRFI Fees' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
];

export default function TransactionForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    description: '',
    amount: 0,
    transaction_type: 'expense',
    category: 'venue',
    tournament_id: '',
    athlete_id: '',
    payment_method: '',
    vendor_payee: '',
    approved_by: '',
    transaction_date: new Date().toISOString().slice(0, 16),
  });
  const [tournaments, setTournaments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tournamentAPI.getAll({ limit: 100 }).then(res => setTournaments(res.data.items || []));
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tournament_id: form.tournament_id ? Number(form.tournament_id) : null,
        transaction_date: new Date(form.transaction_date).toISOString(),
      };
      await financeAPI.createTransaction(payload);
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input name="description" value={form.description} onChange={handleChange} className="input-field" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="transaction_type" value={form.transaction_type} onChange={handleChange} className="input-field">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} className="input-field" min="0" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Tournament</label>
              <select name="tournament_id" value={form.tournament_id} onChange={handleChange} className="input-field">
                <option value="">None</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <input name="payment_method" value={form.payment_method} onChange={handleChange} className="input-field" placeholder="e.g., Bank Transfer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Payee</label>
                <input name="vendor_payee" value={form.vendor_payee} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
              <input name="approved_by" value={form.approved_by} onChange={handleChange} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
              <input type="datetime-local" name="transaction_date" value={form.transaction_date} onChange={handleChange} className="input-field" required />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
