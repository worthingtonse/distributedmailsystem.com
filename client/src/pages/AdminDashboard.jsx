import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Users, TrendingUp, Activity,
  BarChart3, RefreshCw, Lock, ShieldCheck, ArrowRight,
  Server, Package, Wallet, KeyRound, AlertTriangle,
  Trash2, Bug, ExternalLink, Clock, Mail
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
  // Username is cosmetic for the server (auth is a single shared key), but a
  // real username field is what makes browser password managers offer to save
  // and autofill the login. Defaults to "billy".
  const [username, setUsername] = useState('billy');
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

  const deleteWaitlistEntry = async (id) => {
    if (!window.confirm('Remove this waitlist entry?')) return;
    await fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/admin/waitlist-delete`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: adminKey, id }),
    });
    fetchStats(adminKey);
  };

  const dismissBug = async (id) => {
    if (!window.confirm('Dismiss this bug report?')) return;
    await fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/admin/bug-dismiss`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: adminKey, id }),
    });
    fetchStats(adminKey);
  };

  const clearFunnel = async () => {
    if (!window.confirm('Permanently delete ALL conversion funnel data? This cannot be undone.')) return;
    await fetch(`${import.meta.env.VITE_BASE_URL || ''}/api/admin/clear-funnel`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: adminKey }),
    });
    fetchStats(adminKey);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4">
        <div className="max-w-sm w-full bg-gray-900 border border-gray-700/50 rounded-3xl p-8 text-center">
          <Lock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 outline-none"
            />
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Password"
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

  const { overview, revenueByInfluencer, eventCounts, recentEvents, recentSales, influencers, operations } = data;
  const waitlist = data.waitlist || [];
  const bugs = data.bugs || [];

  // Pre-minted key pool classes, in display order
  const poolClasses = [
    { key: 'bit', label: '.Bit' },
    { key: 'byte', label: '.Byte' },
    { key: 'kilo', label: '.Kilo' },
    { key: 'mega', label: '.Mega' },
    { key: 'giga', label: '.Giga' },
    { key: 'bonus', label: 'Bonus' },
  ];

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

        {/* Operations */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              Operations
            </h2>
            {operations && (
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${operations.paymentsEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  Payments: {operations.paymentsEnabled ? 'On' : 'Off'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${operations.sandboxMode ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  Mode: {operations.sandboxMode ? 'Sandbox' : 'Live'}
                </span>
              </div>
            )}
          </div>

          {!operations ? (
            <p className="text-gray-500 text-sm text-center py-8">Operations data unavailable.</p>
          ) : (
            <div className="space-y-6">

              {/* Pool stock */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Pre-Minted Key Pools
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {poolClasses.map(({ key, label }) => {
                    const count = operations.pools ? operations.pools[key] : null;
                    const isZero = count === 0;
                    const isLow = typeof count === 'number' && count > 0 && count <= 3;
                    return (
                      <div key={key} className="bg-black/40 border border-gray-800 rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                        <p className={`text-xl font-black ${isZero ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'}`}>
                          {(count === null || count === undefined) ? '—' : count.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Funding wallet */}
                <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-gray-400 font-medium">Funding Wallet</span>
                  </div>
                  {operations.walletBalance ? (
                    <>
                      <p className={`text-2xl font-black ${operations.walletBalance.balance < operations.lowBalanceThreshold ? 'text-red-400' : 'text-white'}`}>
                        {(operations.walletBalance.balance ?? 0).toLocaleString()} CC
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {(operations.walletBalance.notes ?? 0).toLocaleString()} notes
                      </p>
                      {operations.walletBalance.balance < operations.lowBalanceThreshold && (
                        <p className="text-red-400 text-xs mt-1">below {operations.lowBalanceThreshold.toLocaleString()} CC threshold</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">unavailable</p>
                  )}
                </div>

                {/* Subscriptions */}
                <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-400 font-medium">Subscriptions</span>
                  </div>
                  <p className="text-2xl font-black text-white">{(operations.subscriptions?.active ?? 0).toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-1">active &middot; ${(operations.subscriptions?.monthlyUSD ?? 0).toLocaleString()}/mo</p>
                </div>

                {/* Subscriber addresses */}
                <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-gray-400 font-medium">Subscriber Addresses</span>
                  </div>
                  <p className="text-2xl font-black text-white">{(operations.subscriptions?.addresses ?? 0).toLocaleString()}</p>
                </div>

                {/* Pending deliveries */}
                <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-gray-400 font-medium">Pending Deliveries</span>
                  </div>
                  <p className={`text-2xl font-black ${(operations.subscriptions?.pendingDeliveries ?? 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {(operations.subscriptions?.pendingDeliveries ?? 0).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Last delivery: {operations.subscriptions?.lastDeliveryAt ? new Date(operations.subscriptions.lastDeliveryAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              {/* Issued keys */}
              <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400 font-medium">Issued Address Keys</span>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-2xl font-black text-white">{(operations.issued?.total ?? 0).toLocaleString()}</p>
                    <p className="text-gray-500 text-xs mt-1">total issued</p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Last issued: {operations.issued?.lastIssuedAt ? new Date(operations.issued.lastIssuedAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Influencer Waitlist */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Influencer Waitlist
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
              {waitlist.length}
            </span>
          </h2>
          {waitlist.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left py-3 px-3">Name</th>
                    <th className="text-left py-3 px-3">Email</th>
                    <th className="text-left py-3 px-3">Social / Audience</th>
                    <th className="text-left py-3 px-3">Date</th>
                    <th className="text-right py-3 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {waitlist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-800/30">
                      <td className="py-3 px-3 text-white whitespace-nowrap">{entry.name || '—'}</td>
                      <td className="py-3 px-3 text-gray-300 font-mono select-all">{entry.email || '—'}</td>
                      <td className="py-3 px-3 text-gray-400 max-w-xs truncate">{entry.social || '—'}</td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => deleteWaitlistEntry(entry.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No waitlist signups yet.</p>
          )}
        </div>

        {/* Bug Reports */}
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-400" />
              Bug Reports
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400">
                {bugs.length}
              </span>
            </h2>
            <a
              href="https://cloudcoin.org/bugs.php"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors text-xs font-medium"
            >
              Report a Bug <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          {bugs.length > 0 ? (
            <div className="space-y-3">
              {bugs.map((bug) => {
                const severity = (bug.severity || '').toLowerCase();
                const severityClasses = severity === 'high'
                  ? 'bg-red-500/20 text-red-400'
                  : severity === 'medium'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-gray-700/50 text-gray-400';
                return (
                  <div key={bug.id} className="bg-black/40 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${severityClasses}`}>
                        {bug.severity || 'Unknown'}
                      </span>
                      <button
                        onClick={() => dismissBug(bug.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-colors text-xs font-medium shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Dismiss
                      </button>
                    </div>
                    <p className="text-white text-sm whitespace-pre-wrap break-words">{bug.description || 'No description provided.'}</p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-gray-500">
                      <span>{bug.name || bug.email ? `${bug.name || 'anonymous'}${bug.email ? ` <${bug.email}>` : ''}` : 'anonymous'}</span>
                      {bug.appVersion && <span>v{bug.appVersion}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {bug.ts ? new Date(bug.ts).toLocaleString() : '—'}
                      </span>
                      {bug.hasScreenshot && <span>📎 screenshot</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No open bug reports.</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Conversion Funnel */}
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Conversion Funnel
              </h2>
              <button
                onClick={clearFunnel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Data
              </button>
            </div>
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
