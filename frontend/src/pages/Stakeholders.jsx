import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, Phone, Mail, Calendar, AlertTriangle, CheckCircle, Clock, MessageSquare, Users, Trophy, DollarSign, Camera, Truck } from 'lucide-react';
import { stakeholderAPI } from '../api';
import StakeholderForm from '../components/stakeholders/StakeholderForm';
import TouchpointForm from '../components/stakeholders/TouchpointForm';

const typeIcons = {
  state_association: Building2,
  srfi: Trophy,
  club_partner: Building2,
  coach: Users,
  sponsor: DollarSign,
  media: Camera,
  vendor: Truck,
  other: HelpCircle,
};

const mouStatusColors = {
  active: 'bg-green-100 text-green-700',
  expiring: 'bg-amber-100 text-amber-700',
  expired: 'bg-red-100 text-red-700',
  renewing: 'bg-blue-100 text-blue-700',
};

export default function Stakeholders() {
  const [stakeholders, setStakeholders] = useState([]);
  const [touchpoints, setTouchpoints] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTouchpointForm, setShowTouchpointForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const loadData = async () => {
    try {
      const [sRes, tRes, fRes] = await Promise.all([
        stakeholderAPI.getAll({ stakeholder_type: typeFilter }),
        stakeholderAPI.getRecentTouchpoints(),
        stakeholderAPI.getPendingFollowups(),
      ]);
      setStakeholders(sRes.data.items || []);
      setTouchpoints(tRes.data || []);
      setFollowups(fRes.data || []);
    } catch (err) {
      console.error('Failed to load stakeholders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this stakeholder?')) return;
    try {
      await stakeholderAPI.delete(id);
      loadData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const filtered = stakeholders.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.organization?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Stakeholders & Associations</h2>
          <p className="text-sm text-gray-500 mt-1">State association, club partners, coaches, and sponsors</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTouchpointForm(true)} className="btn-secondary flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Log Touchpoint
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Stakeholder
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Stakeholders', count: stakeholders.length },
          { id: 'followups', label: 'Pending Follow-ups', count: followups.length },
          { id: 'recent', label: 'Recent Activity', count: touchpoints.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Follow-ups Tab */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          {followups.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending follow-ups</p>
            </div>
          ) : followups.map(fp => (
            <div key={fp.id} className="card border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{fp.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">{fp.stakeholder_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{fp.details}</p>
                </div>
                <span className="status-badge status-amber flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {fp.follow_up_date ? `Due ${new Date(fp.follow_up_date).toLocaleDateString()}` : 'Awaiting'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity Tab */}
      {activeTab === 'recent' && (
        <div className="space-y-4">
          {touchpoints.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No recent touchpoints</div>
          ) : touchpoints.map(tp => (
            <div key={tp.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{tp.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">{tp.stakeholder_name} • {tp.interaction_type}</p>
                  <p className="text-sm text-gray-500 mt-1">{tp.details}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(tp.interaction_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Stakeholders Tab */}
      {activeTab === 'all' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stakeholders..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-full sm:w-48">
              <option value="">All Types</option>
              <option value="state_association">State Association</option>
              <option value="srfi">SRFI</option>
              <option value="club_partner">Club Partner</option>
              <option value="coach">Coach</option>
              <option value="sponsor">Sponsor</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No stakeholders found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(s => {
                const Icon = typeIcons[s.stakeholder_type] || Building2;
                return (
                  <div key={s.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{s.name}</h3>
                          <p className="text-xs text-gray-500 capitalize">{s.stakeholder_type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <span className={`status-badge ${mouStatusColors[s.mou_status] || 'bg-gray-100'}`}>
                        {s.mou_status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      {s.organization && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {s.organization}
                        </div>
                      )}
                      {s.primary_contact && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {s.primary_contact}
                        </div>
                      )}
                      {s.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {s.email}
                        </div>
                      )}
                      {s.mou_end_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          MOU expires: {new Date(s.mou_end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {s.revenue_share_percent && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                        Revenue share: {s.revenue_share_percent}% 
                        {s.fixed_cost_monthly && ` • Fixed cost: ₹${s.fixed_cost_monthly.toLocaleString()}/mo`}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{s.touchpoint_count || 0} touchpoints</span>
                      <span className="text-xs text-gray-500">
                        {s.last_touchpoint_date ? `Last: ${new Date(s.last_touchpoint_date).toLocaleDateString()}` : 'No activity'}
                      </span>
                    </div>

                    <button onClick={() => handleDelete(s.id)} className="mt-3 w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showForm && <StakeholderForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); loadData(); }} />}
      {showTouchpointForm && <TouchpointForm stakeholders={stakeholders} onClose={() => setShowTouchpointForm(false)} onSuccess={() => { setShowTouchpointForm(false); loadData(); }} />}
    </div>
  );
}
