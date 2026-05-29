import { useState } from 'react';
import { financeAPI } from '../../api';

export default function BudgetForm({ budget, onClose, onSuccess }) {
  const [form, setForm] = useState(budget || {
    fiscal_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2),
    total_annual_budget: 0,
    tournaments_budget: 0,
    clinics_budget: 0,
    athlete_program_budget: 0,
    marketing_budget: 0,
    operations_budget: 0,
    coach_salary_monthly: 0,
    club_revenue_split: 20,
    akash_retainer: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (budget) {
        await financeAPI.updateBudget(budget.id, form);
      } else {
        await financeAPI.createBudget(form);
      }
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{budget ? 'Edit Budget' : 'Set Annual Budget'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
              <input name="fiscal_year" value={form.fiscal_year} onChange={(e) => setForm({...form, fiscal_year: e.target.value})} className="input-field" placeholder="2025-26" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Annual Budget (₹)</label>
              <input type="number" name="total_annual_budget" value={form.total_annual_budget} onChange={handleChange} className="input-field" min="0" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tournaments (₹)</label>
                <input type="number" name="tournaments_budget" value={form.tournaments_budget} onChange={handleChange} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinics (₹)</label>
                <input type="number" name="clinics_budget" value={form.clinics_budget} onChange={handleChange} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Athlete Program (₹)</label>
                <input type="number" name="athlete_program_budget" value={form.athlete_program_budget} onChange={handleChange} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marketing (₹)</label>
                <input type="number" name="marketing_budget" value={form.marketing_budget} onChange={handleChange} className="input-field" min="0" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operations (₹)</label>
              <input type="number" name="operations_budget" value={form.operations_budget} onChange={handleChange} className="input-field" min="0" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coach Salary/Month (₹)</label>
                <input type="number" name="coach_salary_monthly" value={form.coach_salary_monthly} onChange={handleChange} className="input-field" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Revenue Split (%)</label>
                <input type="number" name="club_revenue_split" value={form.club_revenue_split} onChange={handleChange} className="input-field" min="0" max="100" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Akash Retainer (₹)</label>
              <input type="number" name="akash_retainer" value={form.akash_retainer} onChange={handleChange} className="input-field" min="0" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                {saving ? 'Saving...' : budget ? 'Update Budget' : 'Set Budget'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
