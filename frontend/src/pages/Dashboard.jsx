import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Users, DollarSign, Users, Camera,
  TrendingUp, TrendingDown, AlertTriangle, Calendar,
  ArrowRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { tournamentAPI, athleteAPI, financeAPI, stakeholderAPI, marketingAPI } from '../api';

const COLORS = ['#16a34a', '#ca8a04', '#dc2626', '#2563eb', '#9333ea', '#ea580c'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    tournaments: null,
    athletes: null,
    finance: null,
    marketing: null,
  });
  const [loading, setLoading] = useState(true);
  const [calendar, setCalendar] = useState([]);
  const [followups, setFollowups] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [tStats, aStats, fStats, mStats, cal, follow] = await Promise.all([
        tournamentAPI.getStats().catch(() => ({ data: {} })),
        athleteAPI.getStats().catch(() => ({ data: {} })),
        financeAPI.getStats().catch(() => ({ data: {} })),
        marketingAPI.getStats().catch(() => ({ data: {} })),
        tournamentAPI.getCalendar().catch(() => ({ data: [] })),
        stakeholderAPI.getPendingFollowups().catch(() => ({ data: [] })),
      ]);

      setStats({
        tournaments: tStats.data,
        athletes: aStats.data,
        finance: fStats.data,
        marketing: mStats.data,
      });
      setCalendar(cal.data.slice(0, 5));
      setFollowups(follow.data.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const t = stats.tournaments || {};
  const a = stats.athletes || {};
  const f = stats.finance || {};
  const m = stats.marketing || {};

  const budgetUtilization = f.total_budget > 0 ? (f.total_spent / f.total_budget * 100).toFixed(1) : 0;

  const statusData = t.events_by_status ? Object.entries(t.events_by_status).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })) : [];

  const tierData = a.athletes_by_tier ? Object.entries(a.athletes_by_tier).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })) : [];

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Tournaments"
          value={t.total_events || 0}
          subtitle={`${t.upcoming_events || 0} upcoming`}
          icon={Trophy}
          color="bg-blue-50 text-blue-600"
          link="/tournaments"
        />
        <SummaryCard
          title="Athletes"
          value={a.total_athletes || 0}
          subtitle={`${a.active_athletes || 0} active sponsored`}
          icon={Users}
          color="bg-green-50 text-green-600"
          link="/athletes"
        />
        <SummaryCard
          title="Budget Burn"
          value={`₹${((f.total_spent || 0) / 100000).toFixed(1)}L`}
          subtitle={`${budgetUtilization}% of ₹${((f.total_budget || 0) / 100000).toFixed(1)}L`}
          icon={DollarSign}
          color="bg-amber-50 text-amber-600"
          link="/finance"
          alert={budgetUtilization > 80}
        />
        <SummaryCard
          title="Content Pipeline"
          value={m.total_posts || 0}
          subtitle={`${m.upcoming_posts || 0} upcoming posts`}
          icon={Camera}
          color="bg-purple-50 text-purple-600"
          link="/marketing"
        />
      </div>

      {/* Risk Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Health */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Financial Health</h3>
            <Link to="/finance" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-gray-900">₹{((f.total_budget || 0) / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-red-700">₹{((f.total_spent || 0) / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-xl font-bold text-blue-700">₹{((f.total_remaining || 0) / 100000).toFixed(1)}L</p>
            </div>
          </div>
          <div className="h-48">
            {f.spending_by_category && f.spending_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={f.spending_by_category}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No spending data yet</div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Burn Rate</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">₹{((f.burn_rate_monthly || 0) / 1000).toFixed(0)}K</span>
              <span className="text-sm text-gray-500 mb-1">/month</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {f.months_remaining > 900 ? 'Sufficient' : `${f.months_remaining} months remaining`}
              </span>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Pending Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SRFI Approvals</span>
                <span className="status-badge status-amber">{t.pending_approvals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contract Renewals</span>
                <span className="status-badge status-blue">{a.upcoming_contract_renewals || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Review</span>
                <span className="status-badge status-amber">{m.pending_approvals || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tournament Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Tournament Status Distribution</h3>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No tournament data</div>
            )}
          </div>
        </div>

        {/* Athlete Tiers */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Athletes by Tier</h3>
          <div className="h-64">
            {tierData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No athlete data</div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Calendar & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Upcoming Events (6 Months)
            </h3>
            <Link to="/tournaments" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {calendar.length > 0 ? calendar.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex flex-col items-center justify-center text-primary-700">
                  <span className="text-xs font-medium">{new Date(event.start_date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg font-bold">{new Date(event.start_date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{event.name}</p>
                  <p className="text-sm text-gray-500">{event.venue}, {event.city}</p>
                </div>
                <span className={`status-badge ${
                  event.risk_level === 'red' ? 'status-red' : 
                  event.risk_level === 'amber' ? 'status-amber' : 'status-green'
                }`}>
                  {event.status.replace(/_/g, ' ')}
                </span>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-8">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Pending Stakeholder Follow-ups
            </h3>
            <Link to="/stakeholders" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {followups.length > 0 ? followups.map((fp) => (
              <div key={fp.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{fp.subject}</p>
                  <p className="text-sm text-gray-600">{fp.stakeholder_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fp.follow_up_date ? `Follow up by ${new Date(fp.follow_up_date).toLocaleDateString()}` : 'Awaiting response'}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-8">No pending follow-ups</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, color, link, alert }) {
  return (
    <Link to={link} className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {alert && <AlertTriangle className="w-5 h-5 text-red-500" />}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </Link>
  );
}
