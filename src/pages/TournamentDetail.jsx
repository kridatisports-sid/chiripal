import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Trophy, DollarSign, Users, AlertTriangle, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { tournamentAPI, financeAPI } from '../api';
import { format } from 'date-fns';

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [tRes, txRes] = await Promise.all([
        tournamentAPI.getById(id),
        financeAPI.getTransactions({ tournament_id: id }),
      ]);
      setTournament(tRes.data);
      setForm(tRes.data);
      setTransactions(txRes.data.items || []);
    } catch (err) {
      console.error('Failed to load tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await tournamentAPI.update(id, form);
      setTournament(form);
      setEditing(false);
      loadData();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (!tournament) return <div className="card text-center py-12 text-gray-500">Tournament not found</div>;

  const t = tournament;
  const budgetUsed = t.budget_allocated > 0 ? (t.budget_spent / t.budget_allocated * 100).toFixed(1) : 0;
  const registrationRate = t.expected_players > 0 ? (t.registered_players / t.expected_players * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tournaments')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{t.name}</h1>
            {!editing && (
              <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 capitalize">{t.event_type.replace(/_/g, ' ')} • {t.status.replace(/_/g, ' ')}</p>
        </div>
        <span className={`status-badge ${
          t.risk_level === 'red' ? 'status-red' : t.risk_level === 'amber' ? 'status-amber' : 'status-green'
        }`}>
          {t.risk_level} risk
        </span>
      </div>

      {editing ? (
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-field">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select value={form.risk_level} onChange={(e) => setForm({...form, risk_level: e.target.value})} className="input-field">
                <option value="green">Green</option>
                <option value="amber">Amber</option>
                <option value="red">Red</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Spent (₹)</label>
              <input type="number" value={form.budget_spent} onChange={(e) => setForm({...form, budget_spent: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registered Players</label>
              <input type="number" value={form.registered_players} onChange={(e) => setForm({...form, registered_players: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Revenue (₹)</label>
              <input type="number" value={form.registration_revenue} onChange={(e) => setForm({...form, registration_revenue: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sponsorship Revenue (₹)</label>
              <input type="number" value={form.sponsorship_revenue} onChange={(e) => setForm({...form, sponsorship_revenue: Number(e.target.value)})} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes || ''} onChange={(e) => setForm({...form, notes: e.target.value})} rows="3" className="input-field" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => { setEditing(false); setForm(tournament); }} className="btn-secondary flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleUpdate} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard icon={Calendar} label="Dates" value={`${format(new Date(t.start_date), 'MMM d')} - ${format(new Date(t.end_date), 'MMM d, yyyy')}`} />
            <MetricCard icon={MapPin} label="Venue" value={`${t.venue}, ${t.city}`} />
            <MetricCard icon={Users} label="Registration" value={`${t.registered_players}/${t.expected_players} (${registrationRate}%)`} />
            <MetricCard icon={DollarSign} label="Budget Used" value={`${budgetUsed}%`} alert={budgetUsed > 90} />
          </div>

          {/* Financial Summary */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              Financial Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">₹{((t.registration_revenue + t.sponsorship_revenue) || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Budget Spent</p>
                <p className="text-2xl font-bold text-red-700">₹{(t.budget_spent || 0).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Budget Remaining</p>
                <p className="text-2xl font-bold text-blue-700">₹{((t.budget_allocated - t.budget_spent) || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Budget Utilization</span>
                <span className="font-medium">{budgetUsed}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all ${budgetUsed > 90 ? 'bg-red-500' : budgetUsed > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* SRFI & Coach Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">SRFI & Tournament Details</h3>
              <div className="space-y-3">
                <DetailRow label="Star Rating" value={t.srfi_star_rating ? `${'⭐'.repeat(t.srfi_star_rating)}` : 'N/A'} />
                <DetailRow label="Approval Status" value={
                  <span className={`status-badge ${t.srfi_approval_status === 'approved' ? 'status-green' : 'status-amber'}`}>
                    {t.srfi_approval_status}
                  </span>
                } />
                <DetailRow label="Event Code" value={t.srfi_event_code || 'Pending'} />
                <DetailRow label="Courts Booked" value={t.courts_booked || 0} />
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Coach & Clinic</h3>
              <div className="space-y-3">
                <DetailRow label="Guest Coach" value={t.guest_coach_name || 'Not assigned'} />
                <DetailRow label="Origin" value={t.guest_coach_origin || '-'} />
                <DetailRow label="Clinic" value={t.clinic_pre_event ? `${t.clinic_days}-day pre-event clinic` : 'No clinic scheduled'} />
                <DetailRow label="Clinic Status" value={t.clinic_days > 0 ? <span className="status-badge status-green">Confirmed</span> : <span className="status-badge status-gray">Not scheduled</span>} />
              </div>
            </div>
          </div>

          {/* Notes */}
          {t.notes && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Notes & Dependencies</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{t.notes}</p>
            </div>
          )}

          {/* Transactions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Related Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No transactions recorded for this event</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">{format(new Date(tx.transaction_date), 'MMM d, yyyy')}</td>
                        <td className="px-4 py-2 text-gray-900">{tx.description}</td>
                        <td className="px-4 py-2">
                          <span className="status-badge bg-gray-100 text-gray-700 capitalize">{tx.category.replace(/_/g, ' ')}</span>
                        </td>
                        <td className={`px-4 py-2 text-right font-medium ${tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.transaction_type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, alert }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${alert ? 'text-red-500' : 'text-gray-400'}`} />
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`font-medium ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
