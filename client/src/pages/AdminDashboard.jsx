import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Users, TrendingUp, Activity,
  BarChart3, RefreshCw, Lock, ShieldCheck, ArrowRight
} from 'lucide-react';

const ADMIN_KEY_STORAGE = 'qmail_admin_key';

const StatCard = ({ label, value, icon: Icon, color = 'blue', prefix = '' }) => (
  <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <span className="text-sm text-gray-400 font-medium">{label}</span>
    </div>
    <p className="text-3xl font-black text-white">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
  </div>
);

const FunnelBar = ({ label, count, max }) => {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-bold">{count}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || '');
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async (key) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/admin/stats?key=${encodeURIComponent(key)}`);
      if (res.status === 401) {
        setAuthed(false);
        localStorage.removeItem(ADMIN_KEY_STORAGE);
        setError('Invalid admin key.');
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthed(true);
      localStorage.setItem(ADMIN_KEY_STORAGE, key);
    } catch {
      setError('Failed to fetch stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-login if key is stored
  useEffect(() => {
    if (adminKey) fetchStats(adminKey);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setAdminKey(keyInput);
    fetchStats(keyInput);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4">
        <div className="max-w-sm w-full bg-gray-900 border border-gray-700/50 rounded-3xl p-8 text-center">
          <Lock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mb-6">Enter your admin key to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Admin key"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Checking...' : <><ArrowRight className="w-4 h-4" /> Enter</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, revenueByInfluencer, eventCounts, recentEvents, recentSales, influencers } = data;

  // Funnel events in order
  const funnelSteps = [
    { key: 'influencer_cta_click', label: 'Influencer CTA Clicks' },
    { key: 'influencer_signup_start', label: 'Signup Started' },
    { key: 'influencer_signup_complete', label: 'Signup Completed' },
    { key: 'influencer_link_copy', label: 'Link Copied' },
    { key: 'verified_access_load', label: 'Payment Page Views' },
    { key: 'package_select', label: 'Package Selected' },
    { key: 'payment_complete', label: 'Payment Complete' },
    { key: 'payment_error', label: 'Payment Errors' },
  ];

  const maxFunnel = Math.max(...funnelSteps.map(s => eventCounts[s.key] || 0), 1);

  // Sort influencers by revenue
  const influencerRanking = Object.entries(revenueByInfluencer)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">QMail / Distributed Mail System</p>
          </div>
          <button
            onClick={() => fetchStats(adminKey)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:border-gray-600 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Total Revenue" value={overview.totalRevenue} icon={DollarSign} color="green" prefix="$" />
          <StatCard label="Affiliate Sales" value={overview.totalSales} icon={TrendingUp} color="blue" />
          <StatCard label="Avg Order" value={overview.avgOrderValue} icon={BarChart3} color="purple" prefix="$" />
          <StatCard label="Registered Users" value={overview.totalUsers} icon={Users} color="cyan" />
          <StatCard label="Influencers" value={overview.totalInfluencers} icon={ShieldCheck} color="yellow" />
          <StatCard label="Total Registrations" value={overview.totalRegistrations} icon={Activity} color="pink" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Conversion Funnel */}
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Conversion Funnel
            </h2>
            <div className="space-y-4">
              {funnelSteps.map(step => (
                <FunnelBar
                  key={step.key}
                  label={step.label}
                  count={eventCounts[step.key] || 0}
                  max={maxFunnel}
                />
              ))}
            </div>
            {Object.keys(eventCounts).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No funnel events recorded yet. Events will appear here as users interact with the site.</p>
            )}
          </div>

          {/* Top Influencers */}
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Revenue by Influencer
            </h2>
            {influencerRanking.length > 0 ? (
              <div className="space-y-3">
                {influencerRanking.map((inf, i) => (
                  <div key={inf.name} className="flex items-center justify-between py-3 px-4 bg-black/40 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">{i + 1}</span>
                      <span className="text-white font-medium text-sm">{inf.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-bold">${inf.revenue.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs ml-2">({inf.sales} sales)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No affiliate sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Recent Affiliate Sales
          </h2>
          {recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left py-3 px-3">Time</th>
                    <th className="text-left py-3 px-3">Buyer</th>
                    <th className="text-left py-3 px-3">Influencer</th>
                    <th className="text-right py-3 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {recentSales.map((sale, i) => (
                    <tr key={i} className="hover:bg-gray-800/30">
                      <td className="py-3 px-3 text-gray-400 whitespace-nowrap">{new Date(sale.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-3 text-white">{sale.buyerFirstName} {sale.buyerLastName}</td>
                      <td className="py-3 px-3 text-gray-300">{sale.influencerName}</td>
                      <td className="py-3 px-3 text-green-400 font-bold text-right">${sale.paymentAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No affiliate sales yet.</p>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Recent Events
          </h2>
          {recentEvents.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentEvents.map((evt, i) => (
                <div key={i} className="flex items-center gap-4 py-2 px-4 bg-black/30 rounded-xl text-sm">
                  <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(evt.timestamp).toLocaleString()}</span>
                  <span className="text-blue-400 font-mono font-medium">{evt.event}</span>
                  <span className="text-gray-500 text-xs truncate">{evt.props}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No events recorded yet.</p>
          )}
        </div>

        {/* Registered Influencers */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            Registered Influencers ({influencers.length})
          </h2>
          {influencers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {influencers.map((inf, i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-4 bg-black/40 rounded-xl border border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                    {inf.fullName?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{inf.fullName}</p>
                    <p className="text-gray-500 text-xs font-mono truncate">{inf.qmailAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No influencers registered yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
