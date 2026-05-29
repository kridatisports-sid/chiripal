import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Trophy, TrendingUp, Calendar, MapPin, Award } from 'lucide-react';
import { athleteAPI } from '../api';
import AthleteForm from '../components/athletes/AthleteForm';

const statusColors = {
  prospect: 'bg-gray-100 text-gray-700',
  trial: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  graduated: 'bg-purple-100 text-purple-700',
};

const tierColors = {
  emerging: 'bg-gray-100 text-gray-600',
  development: 'bg-blue-100 text-blue-600',
  elite: 'bg-amber-100 text-amber-700',
  premier: 'bg-purple-100 text-purple-700',
};

export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, tierFilter]);

  const loadData = async () => {
    try {
      const [aRes, sRes] = await Promise.all([
        athleteAPI.getAll({ status: statusFilter, tier: tierFilter }),
        athleteAPI.getStats(),
      ]);
      setAthletes(aRes.data.items || []);
      setStats(sRes.data);
    } catch (err) {
      console.error('Failed to load athletes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this athlete record?')) return;
    try {
      await athleteAPI.delete(id);
      loadData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const filtered = athletes.filter(a => 
    a.full_name.toLowerCase().includes(filter.toLowerCase()) ||
    a.hometown?.toLowerCase().includes(filter.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add New Athlete</h2>
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
        </div>
        <AthleteForm onSuccess={() => { setShowForm(false); loadData(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Champions Program</h2>
          <p className="text-sm text-gray-500 mt-1">Sponsored athletes representing the program globally</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Athlete
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">Total Athletes</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_athletes}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Active Sponsored</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active_athletes}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Monthly Commitment</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">₹{(stats.total_monthly_commitment / 1000).toFixed(0)}K</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Contract Renewals (90d)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.upcoming_contract_renewals}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search athletes..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-full sm:w-40">
          <option value="">All Statuses</option>
          <option value="prospect">Prospect</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="input-field w-full sm:w-40">
          <option value="">All Tiers</option>
          <option value="emerging">Emerging</option>
          <option value="development">Development</option>
          <option value="elite">Elite</option>
          <option value="premier">Premier</option>
        </select>
      </div>

      {/* Athletes Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No athletes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(athlete => (
            <div key={athlete.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                    {athlete.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{athlete.full_name}</h3>
                    <p className="text-xs text-gray-500">{athlete.hometown}{athlete.state ? `, ${athlete.state}` : ''}</p>
                  </div>
                </div>
                <span className={`status-badge ${tierColors[athlete.tier] || 'bg-gray-100'}`}>
                  {athlete.tier}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`status-badge ${statusColors[athlete.status] || 'bg-gray-100'}`}>
                  {athlete.status}
                </span>
                {athlete.jersey_compliance && (
                  <span className="status-badge bg-green-100 text-green-700 text-xs">Jersey ✓</span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {athlete.psa_ranking && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    PSA Ranking: #{athlete.psa_ranking}
                  </div>
                )}
                {athlete.srfi_ranking && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    SRFI Ranking: #{athlete.srfi_ranking}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {athlete.tournaments_played} tournaments played
                  {athlete.tournaments_won > 0 && ` • ${athlete.tournaments_won} wins`}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Monthly Stipend</span>
                  <span className="font-medium text-gray-900">₹{athlete.monthly_stipend?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500">Total Funded</span>
                  <span className="font-medium text-green-600">₹{athlete.total_funded?.toLocaleString() || 0}</span>
                </div>
              </div>

              {athlete.contract_expiry && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                  Contract expires: {new Date(athlete.contract_expiry).toLocaleDateString('en-IN')}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <Link to={`/athletes/${athlete.id}`} className="flex-1 text-center py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                  View Profile
                </Link>
                <button onClick={() => handleDelete(athlete.id)} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
