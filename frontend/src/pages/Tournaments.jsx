import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, MapPin, Trophy, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { tournamentAPI } from '../api';
import TournamentForm from '../components/tournaments/TournamentForm';

const statusConfig = {
  planning: { color: 'bg-gray-100 text-gray-700', icon: Clock },
  srfi_approval_pending: { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  coach_booking: { color: 'bg-purple-100 text-purple-700', icon: Calendar },
  registration_open: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { color: 'bg-primary-100 text-primary-700', icon: Trophy },
  completed: { color: 'bg-gray-100 text-gray-500', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const riskConfig = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTournaments();
  }, [statusFilter]);

  const loadTournaments = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await tournamentAPI.getAll(params);
      setTournaments(res.data.items || []);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tournament?')) return;
    try {
      await tournamentAPI.delete(id);
      loadTournaments();
    } catch (err) {
      alert('Failed to delete tournament');
    }
  };

  const filtered = tournaments.filter(t => 
    t.name.toLowerCase().includes(filter.toLowerCase()) ||
    t.city.toLowerCase().includes(filter.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add New Tournament</h2>
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
        </div>
        <TournamentForm onSuccess={() => { setShowForm(false); loadTournaments(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tournaments & Events</h2>
          <p className="text-sm text-gray-500 mt-1">Manage SRFI tournaments, camps, and clinics</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="srfi_approval_pending">SRFI Approval Pending</option>
          <option value="approved">Approved</option>
          <option value="registration_open">Registration Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Tournament Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tournaments found</p>
          <button onClick={() => setShowForm(true)} className="text-primary-600 text-sm mt-2 hover:underline">Create your first event</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(t => {
            const status = statusConfig[t.status] || statusConfig.planning;
            const StatusIcon = status.icon;
            const daysUntil = Math.ceil((new Date(t.start_date) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div key={t.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${status.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {t.status.replace(/_/g, ' ')}
                    </span>
                    {t.srfi_star_rating && (
                      <span className="status-badge bg-yellow-100 text-yellow-800">
                        {'⭐'.repeat(t.srfi_star_rating)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${riskConfig[t.risk_level] || 'bg-green-500'}`} />
                    <span className="text-xs text-gray-500 capitalize">{t.risk_level}</span>
                  </div>
                </div>

                <Link to={`/tournaments/${t.id}`} className="block">
                  <h3 className="font-semibold text-gray-900 text-lg hover:text-primary-600 transition-colors">{t.name}</h3>
                </Link>

                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(t.start_date).toLocaleDateString('en-IN')} - {new Date(t.end_date).toLocaleDateString('en-IN')}
                    {daysUntil > 0 && daysUntil < 60 && (
                      <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                        {daysUntil} days left
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {t.venue}, {t.city}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-medium text-gray-900">₹{t.budget_allocated?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Players</p>
                    <p className="text-sm font-medium text-gray-900">{t.registered_players}/{t.expected_players}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-medium text-green-600">₹{(t.registration_revenue + t.sponsorship_revenue)?.toLocaleString() || 0}</p>
                  </div>
                </div>

                {t.guest_coach_name && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                    Coach: {t.guest_coach_name} ({t.guest_coach_origin})
                    {t.clinic_pre_event && ` • ${t.clinic_days}-day clinic`}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Link to={`/tournaments/${t.id}`} className="flex-1 text-center py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                    View Details
                  </Link>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
