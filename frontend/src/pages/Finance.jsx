import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus, Download, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { financeAPI } from '../api';
import TransactionForm from '../components/finance/TransactionForm';
import BudgetForm from '../components/finance/BudgetForm';

const COLORS = ['#16a34a', '#ca8a04', '#dc2626', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#4f46e5'];

export default function Finance() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTxForm, setShowTxForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [txFilter, setTxFilter] = useState({ type: '', category: '' });

  useEffect(() => {
    loadData();
  }, [txFilter]);

  const loadData = async () => {
    try {
      const [sRes, tRes, bRes] = await Promise.all([
        financeAPI.getStats().catch(() => ({ data: null })),
        financeAPI.getTransactions({ transaction_type: txFilter.type, category: txFilter.category }).catch(() => ({ data: { items: [] } })),
        financeAPI.getBudget().catch(() => ({ data: null })),
      ]);
      setStats(sRes.data);
      setTransactions(tRes.data.items || []);
      setBudget(bRes.data);
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  const f = stats || {};
  const budgetUtil = budget?.total_annual_budget > 0 ? ((budget.total_spent || 0) / budget.total_annual_budget * 100).toFixed(1) : 0;

  const varianceData = f.budget_variance_by_category || [];
  const spendingData = f.spending_by_category || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Budget tracking, burn rate, and transaction management</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBudgetForm(true)} className="btn-secondary flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> {budget ? 'Edit Budget' : 'Set Budget'}
          </button>
          <button onClick={() => setShowTxForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      {budget && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Annual Budget: {budget.fiscal_year}</h3>
              <p className="text-sm text-gray-500">Coach Salary: ₹{budget.coach_salary_monthly?.toLocaleString()}/mo • Club Split: {budget.club_revenue_split}% • Akash Retainer: ₹{budget.akash_retainer?.toLocaleString()}</p>
            </div>
            <span className={`status-badge ${budgetUtil > 90 ? 'status-red' : budgetUtil > 75 ? 'status-amber' : 'status-green'}`}>
              {budgetUtil}% utilized
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all ${budgetUtil > 90 ? 'bg-red-500' : budgetUtil > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(budgetUtil, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Budget</p>
              <p className="text-lg font-bold text-green-700">₹{(budget.total_annual_budget / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Spent</p>
              <p className="text-lg font-bold text-red-700">₹{(budget.total_spent / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Remaining</p>
              <p className="text-lg font-bold text-blue-700">₹{(budget.total_remaining / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-gray-600">Monthly Burn</p>
              <p className="text-lg font-bold text-amber-700">₹{(f.burn_rate_monthly / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Budget vs Actual by Category</h3>
          <div className="h-64">
            {varianceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  <Bar dataKey="budgeted" fill="#16a34a" name="Budgeted" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" fill="#dc2626" name="Spent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No budget data</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Spending Distribution</h3>
          <div className="h-64">
            {spendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No spending data</div>
            )}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <select 
              value={txFilter.type} 
              onChange={(e) => setTxFilter({...txFilter, type: e.target.value})}
              className="input-field text-sm py-1.5"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select 
              value={txFilter.category} 
              onChange={(e) => setTxFilter({...txFilter, category: e.target.value})}
              className="input-field text-sm py-1.5"
            >
              <option value="">All Categories</option>
              <option value="venue">Venue</option>
              <option value="coach_fees">Coach Fees</option>
              <option value="travel">Travel</option>
              <option value="athlete_sponsorship">Athlete Sponsorship</option>
              <option value="marketing">Marketing</option>
              <option value="registration">Registration</option>
              <option value="sponsorship">Sponsorship</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No transactions found</td></tr>
              ) : transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{new Date(tx.transaction_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{tx.description}</td>
                  <td className="px-4 py-3">
                    <span className="status-badge bg-gray-100 text-gray-700 capitalize">{tx.category.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${tx.transaction_type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.transaction_type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showTxForm && (
        <TransactionForm onClose={() => setShowTxForm(false)} onSuccess={() => { setShowTxForm(false); loadData(); }} />
      )}
      {showBudgetForm && (
        <BudgetForm budget={budget} onClose={() => setShowBudgetForm(false)} onSuccess={() => { setShowBudgetForm(false); loadData(); }} />
      )}
    </div>
  );
}
