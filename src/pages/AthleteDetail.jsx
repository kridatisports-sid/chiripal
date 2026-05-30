import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, Calendar, MapPin, Award, DollarSign, Shirt, Edit2, Save, X } from 'lucide-react';
import { athleteAPI } from '../api';

export default function AthleteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    loadAthlete();
  }, [id]);

  const loadAthlete = async () => {
    try {
      const res = await athleteAPI.getById(id);
      setAthlete(res.data);
      setForm(res.data);
    } catch (err) {
      console.error('Failed to load athlete:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await athleteAPI.update(id, form);
      setAthlete(form);
      setEditing(false);
      loadAthlete();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (!athlete) return <div className="card text-center py-12 text-gray-500">Athlete not found</div>;

  const a = athlete;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/athletes')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl">
              {a.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{a.full_name}</h1>
              <p className="text-sm text-gray-500 capitalize">{a.tier} Tier • {a.status}</p>
            </div>
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-field">
                <option value="prospect">Prospect</option>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
              <select value={form.tier} onChange={(e) => setForm({...form, tier: e.target.value})} className="input-field">
                <option value="emerging">Emerging</option>
                <option value="development">Development</option>
                <option value="elite">Elite</option>
                <option value="premier">Premier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PSA Ranking</label>
              <input type="number" value={form.psa_ranking || ''} onChange={(e) => setForm({...form, psa_ranking: e.target.value ? Number(e.target.value) : null})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SRFI Ranking</label>
              <input type="number" value={form.srfi_ranking || ''} onChange={(e) => setForm({...form, srfi_ranking: e.target.value ? Number(e.target.value) : null})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Stipend (₹)</label>
              <input type="number" value={form.monthly_stipend} onChange={(e) => setForm({...form, monthly_stipend: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Budget (₹)</label>
              <input type="number" value={form.equipment_budget} onChange={(e) => setForm({...form, equipment_budget: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Budget (₹)</label>
              <input type="number" value={form.travel_budget} onChange={(e) => setForm({...form, travel_budget: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tournaments Played</label>
              <input type="number" value={form.tournaments_played} onChange={(e) => setForm({...form, tournaments_played: Number(e.target.value)})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tournaments Won</label>
              <input type="number" value={form.tournaments_won} onChange={(e) => setForm({...form, tournaments_won: Number(e.target.value)})} className="input-field" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.jersey_compliance} onChange={(e) => setForm({...form, jersey_compliance: e.target.checked})} className="w-4 h-4" />
              <label className="text-sm text-gray-700">Jersey Compliance</label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => { setEditing(false); setForm(athlete); }} className="btn-secondary flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleUpdate} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Performance</h3>
              </div>
              <div className="space-y-2">
                <DetailItem label="PSA Ranking" value={a.psa_ranking ? `#${a.psa_ranking}` : 'Unranked'} />
                <DetailItem label="SRFI Ranking" value={a.srfi_ranking ? `#${a.srfi_ranking}` : 'Unranked'} />
                <DetailItem label="National Ranking" value={a.national_ranking ? `#${a.national_ranking}` : 'Unranked'} />
                <DetailItem label="Tournaments" value={`${a.tournaments_played} played • ${a.tournaments_won} won`} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Sponsorship</h3>
              </div>
              <div className="space-y-2">
                <DetailItem label="Monthly Stipend" value={`₹${a.monthly_stipend?.toLocaleString() || 0}`} />
                <DetailItem label="Equipment Budget" value={`₹${a.equipment_budget?.toLocaleString() || 0}`} />
                <DetailItem label="Travel Budget" value={`₹${a.travel_budget?.toLocaleString() || 0}`} />
                <DetailItem label="Total Funded" value={`₹${a.total_funded?.toLocaleString() || 0}`} highlight />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Shirt className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Program Details</h3>
              </div>
              <div className="space-y-2">
                <DetailItem label="Jersey Number" value={a.jersey_number || 'Not assigned'} />
                <DetailItem label="Jersey Compliance" value={a.jersey_compliance ? '✓ Compliant' : '✗ Non-compliant'} alert={!a.jersey_compliance} />
                <DetailItem label="Onboarded" value={a.onboarding_date ? new Date(a.onboarding_date).toLocaleDateString('en-IN') : 'Not onboarded'} />
                <DetailItem label="Contract Expires" value={a.contract_expiry ? new Date(a.contract_expiry).toLocaleDateString('en-IN') : 'No expiry set'} alert={a.contract_expiry && new Date(a.contract_expiry) < new Date(Date.now() + 90*24*60*60*1000)} />
              </div>
            </div>
          </div>

          {/* Contact & Bio */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Email" value={a.email || 'Not provided'} />
              <DetailItem label="Phone" value={a.phone || 'Not provided'} />
              <DetailItem label="Hometown" value={a.hometown || 'Not provided'} />
              <DetailItem label="State" value={a.state || 'Not provided'} />
            </div>
            {a.bio && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                <p className="text-gray-600 text-sm">{a.bio}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DetailItem({ label, value, highlight, alert }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-green-600' : alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}
