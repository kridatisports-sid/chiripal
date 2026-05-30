import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Mail, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit3,
  Copy,
  Send
} from 'lucide-react';

// Mock data for demonstration
const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Membership Drive',
    type: 'email',
    status: 'active',
    audience: 'All Members',
    sent: 1250,
    opened: 890,
    clicked: 340,
    created: '2024-06-01',
    scheduled: '2024-06-15'
  },
  {
    id: 2,
    name: 'New Court Booking Promo',
    type: 'push',
    status: 'draft',
    audience: 'Active Players',
    sent: 0,
    opened: 0,
    clicked: 0,
    created: '2024-06-10',
    scheduled: null
  },
  {
    id: 3,
    name: 'Junior Tournament Announcement',
    type: 'email',
    status: 'completed',
    audience: 'Junior Parents',
    sent: 450,
    opened: 380,
    clicked: 120,
    created: '2024-05-20',
    scheduled: '2024-05-25'
  }
];

const mockTemplates = [
  { id: 1, name: 'Welcome Email', category: 'Onboarding', lastUsed: '2 days ago' },
  { id: 2, name: 'Event Reminder', category: 'Events', lastUsed: '1 week ago' },
  { id: 3, name: 'Monthly Newsletter', category: 'Newsletter', lastUsed: '3 days ago' },
  { id: 4, name: 'Payment Receipt', category: 'Transactional', lastUsed: 'Today' }
];

const Marketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [templates] = useState(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'draft': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-slate-100 text-slate-700';
      case 'paused': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'push': return <Megaphone className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  const stats = [
    { 
      label: 'Total Campaigns', 
      value: campaigns.length, 
      change: '+2', 
      trend: 'up',
      icon: Megaphone 
    },
    { 
      label: 'Avg Open Rate', 
      value: '68%', 
      change: '+5.2%', 
      trend: 'up',
      icon: Eye 
    },
    { 
      label: 'Avg Click Rate', 
      value: '24%', 
      change: '-1.2%', 
      trend: 'down',
      icon: MousePointerClick 
    },
    { 
      label: 'Audience Reach', 
      value: '2,450', 
      change: '+12%', 
      trend: 'up',
      icon: Users 
    }
  ];

  const handleDeleteCampaign = (id) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    setSelectedCampaign(null);
  };

  const handleDuplicateCampaign = (campaign) => {
    const newCampaign = {
      ...campaign,
      id: Date.now(),
      name: `${campaign.name} (Copy)`,
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      created: new Date().toISOString().split('T')[0]
    };
    setCampaigns([...campaigns, newCampaign]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing</h1>
            <p className="text-gray-500 mt-1">Manage campaigns, templates, and audience engagement</p>
          </div>
          <button
            onClick={() => setShowNewCampaign(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <stat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'campaigns' && (
            <div>
              {/* Search and Filter */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Campaigns Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Audience</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Performance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map((campaign) => (
                      <tr 
                        key={campaign.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            {getTypeIcon(campaign.type)}
                            <span className="capitalize">{campaign.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{campaign.audience}</td>
                        <td className="py-4 px-4">
                          {campaign.status !== 'draft' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Eye className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{campaign.opened} opens</span>
                                <span className="text-gray-400">
                                  ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MousePointerClick className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">{campaign.clicked} clicks</span>
                                <span className="text-gray-400">
                                  ({((campaign.clicked / campaign.sent) * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not sent yet</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {campaign.scheduled || campaign.created}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedCampaign(campaign)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => handleDuplicateCampaign(campaign)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCampaigns.length === 0 && (
                <div className="text-center py-12">
                  <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
                  <p className="text-gray-500">Create your first campaign to get started</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  New Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div 
                    key={template.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{template.category}</span>
                      <span>Used {template.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance</h3>
                  <div className="space-y-4">
                    {campaigns.filter(c => c.status === 'completed' || c.status === 'active').map((campaign) => (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">{campaign.name}</span>
                          <span className="text-gray-500">{campaign.sent} sent</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${((campaign.opened / campaign.sent) * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Open rate: {((campaign.opened / campaign.sent) * 100).toFixed(1)}%</span>
                          <span>Click rate: {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Audience Growth</h3>
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                      <p>Analytics integration coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
              <button 
                onClick={() => setShowNewCampaign(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Summer Tournament Announcement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="email">Email Campaign</option>
                  <option value="push">Push Notification</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="all">All Members</option>
                  <option value="active">Active Players</option>
                  <option value="junior">Junior Members</option>
                  <option value="inactive">Inactive Members</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <input 
                  type="datetime-local" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowNewCampaign(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowNewCampaign(false)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;