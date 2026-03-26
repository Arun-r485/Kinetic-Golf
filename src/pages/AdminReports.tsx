import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity, 
  Download, 
  Filter, 
  Calendar, 
  Search, 
  ArrowUpRight, 
  Loader2, 
  RefreshCcw,
  CheckCircle2,
  Clock,
  Heart,
  PieChart,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminReport, getAdminScores, getAuditLog } from '../services/adminReportService';
import { generateReport } from '../lib/generateReport';
import { AdminReport, AdminScoreEntry, AuditEvent } from '../types';

type TabType = 'overview' | 'scores' | 'activity';

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [reportData, setReportData] = useState<AdminReport | null>(null);
  const [scoresData, setScoresData] = useState<AdminScoreEntry[]>([]);
  const [auditData, setAuditData] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Score Filters
  const [scoreFilters, setScoreFilters] = useState({
    userId: '',
    from: '',
    to: '',
    limit: 20
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      setError(null);
      if (activeTab === 'overview') {
        const data = await getAdminReport(token);
        if (data.success && data.report) {
          setReportData(data.report);
        } else {
          setError(data.message || 'Failed to load platform overview');
        }
      } else if (activeTab === 'scores') {
        const data = await getAdminScores(token, scoreFilters);
        if (data.success && data.scores) {
          setScoresData(data.scores);
        } else {
          setError(data.message || 'Failed to load score audit');
        }
      } else if (activeTab === 'activity') {
        const data = await getAuditLog(token);
        if (data.success && data.events) {
          setAuditData(data.events);
        } else {
          setError(data.message || 'Failed to load activity log');
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError(error.message || 'An unexpected error occurred while fetching data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, scoreFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh Activity Log every 60 seconds
  useEffect(() => {
    if (activeTab === 'activity') {
      const interval = setInterval(() => fetchData(true), 60000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchData]);

  const handleDownloadReport = (allTabs = false) => {
    generateReport({
      activeTab,
      reportData,
      scoresData,
      auditData,
      scoreFilters,
      generatedBy: user?.name,
      allTabs
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffInSecs = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSecs < 60) return 'Just now';
    if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)} min ago`;
    if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline font-black uppercase italic text-4xl tracking-tight text-white glow-text">
            Reports & Analytics
          </h1>
          <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <Activity size={12} className="text-secondary animate-pulse" />
            Live platform data • Auto-refreshes every 60s
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => handleDownloadReport(false)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all glow-primary"
          >
            <Download size={14} /> Download Current View
          </button>
          <button
            onClick={() => handleDownloadReport(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50 border border-outline-variant/10 px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] transition-all"
          >
            Full Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-variant/20 p-1 rounded-2xl backdrop-blur-md border border-outline-variant/10 w-fit">
        {[
          { id: 'overview', label: 'Platform Overview', icon: <PieChart size={16} /> },
          { id: 'scores', label: 'Score Audit', icon: <ShieldAlert size={16} /> },
          { id: 'activity', label: 'Activity Log', icon: <Activity size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-headline font-black uppercase tracking-[0.15em] text-[10px] ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 space-y-4"
          >
            <Loader2 size={40} className="animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Gathering Intelligence...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 glass-card rounded-[2rem] border border-outline-variant/10 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldAlert size={32} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline font-black uppercase italic text-xl text-black">Access Denied or Error</h3>
              <p className="text-on-surface-variant text-xs max-w-sm">{error}</p>
            </div>
            <button 
              onClick={() => fetchData()}
              className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all glow-primary"
            >
              <RefreshCcw size={14} /> Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && reportData && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* User Stats */}
                  <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <Users size={80} />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">User Statistics</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-headline font-black italic">{reportData.users.total}</span>
                        <span className="text-xs text-on-surface-variant">Total</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-secondary">{reportData.users.active}</span>
                          <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">Active</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-surface-variant">{reportData.users.total - reportData.users.active}</span>
                          <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">Inactive</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <TrendingUp size={80} />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Financial Pulse</div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary italic">Est. Prize Pool</div>
                        <div className="text-2xl font-headline font-black italic">₹{(Number(reportData.financials.prizePoolEstimate) / 100).toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">₹{reportData.financials.totalWithdrawnPaid.toLocaleString()}</span>
                          <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">Paid Out</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary">₹{reportData.financials.totalWithdrawnPending.toLocaleString()}</span>
                          <span className="text-[8px] uppercase tracking-tighter text-on-surface-variant">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform Stats */}
                  <div className="glass-card p-8 rounded-[2rem] border border-outline-variant/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <ShieldAlert size={80} />
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Verification Queue</div>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-headline font-black italic">{reportData.winners.pending}</div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Pending Winners</span>
                          <span className="text-[8px] text-on-surface-variant">Needs Approval</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="text-[8px] uppercase tracking-widest text-on-surface-variant mb-1">Next Draw Scheduled</div>
                        <div className="text-xs font-bold">{reportData.nextDrawDate ? new Date(reportData.nextDrawDate).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charity Distribution Table */}
                <div className="glass-card rounded-[2.5rem] border border-outline-variant/10 overflow-hidden">
                  <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="text-primary" size={20} />
                      <h3 className="font-headline font-black uppercase italic text-xl">Charity Distribution</h3>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Subscribed Members per Cause</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-variant/30">
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Charity Partner</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Supporters</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Market Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {reportData?.charityDistribution && Object.entries(reportData.charityDistribution)
                          .sort((a, b) => b[1] - a[1])
                          .map(([name, count], i) => {
                            const total = Object.values(reportData.charityDistribution || {}).reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? (count / total * 100).toFixed(1) : 0;
                            return (
                              <tr key={i} className="hover:bg-surface-variant/20 transition-colors">
                                <td className="px-8 py-6 font-bold text-sm">{name}</td>
                                <td className="px-8 py-6 text-sm font-headline italic">{count}</td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <div className="w-32 h-1.5 bg-surface-variant/30 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black font-headline italic text-primary">{percent}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SCORE AUDIT TAB */}
            {activeTab === 'scores' && (
              <div className="space-y-6">
                {/* Filter Bar */}
                <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/10 flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Search User ID</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
                      <input
                        type="text"
                        placeholder="UUID or Name..."
                        value={scoreFilters.userId}
                        onChange={(e) => setScoreFilters({ ...scoreFilters, userId: e.target.value })}
                        className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="w-40 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Limit</label>
                    <select
                      value={scoreFilters.limit}
                      onChange={(e) => setScoreFilters({ ...scoreFilters, limit: Number(e.target.value) })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      <option value={20}>20 Records</option>
                      <option value={50}>50 Records</option>
                      <option value={100}>100 Records</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => fetchData()}
                    className="bg-primary text-white p-3 rounded-xl hover:scale-105 transition-all glow-primary"
                  >
                    <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Score Table */}
                <div className="glass-card rounded-[2.5rem] border border-outline-variant/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-variant/30">
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Player</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Score</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Date Played</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Submitted</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {scoresData.map((entry, i) => (
                          <tr key={i} className="hover:bg-surface-variant/20 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                  {entry.users?.name?.substring(0, 2) || "U"}
                                </div>
                                <div>
                                  <div className="text-sm font-bold">{entry.users?.name || "Unknown"}</div>
                                  <div className="text-[10px] text-on-surface-variant tracking-tight">{entry.users?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`text-lg font-headline font-black italic ${entry.score <= 72 ? 'text-secondary' : 'text-primary'}`}>
                                {entry.score}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-xs text-on-surface-variant font-medium">
                              {new Date(entry.datePlayed).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6 text-xs text-on-surface-variant font-medium">
                              {new Date(entry.createdAt).toLocaleString()}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="text-[8px] font-black uppercase tracking-widest bg-secondary/10 text-secondary px-2 py-1 rounded-md border border-secondary/20">
                                Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                        {scoresData.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-20 text-center">
                              <BarChart3 size={40} className="mx-auto text-on-surface-variant/20 mb-4" />
                              <p className="text-on-surface-variant italic text-sm">No scores found matching criteria.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY LOG TAB */}
            {activeTab === 'activity' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Recent System Events</h3>
                  <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Live Monitoring Active
                  </div>
                </div>
                
                <div className="space-y-4">
                  {auditData.map((event, i) => (
                    <motion.div
                      key={event.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-6 rounded-2xl border border-outline-variant/10 flex items-center gap-6 hover:border-primary/20 transition-all hover:translate-x-1"
                    >
                      <div className={`p-3 rounded-xl ${
                        event.type === 'registration' ? 'bg-blue-500/10 text-blue-400' :
                        event.type === 'subscription' ? 'bg-secondary/10 text-secondary' :
                        event.type === 'withdrawal' ? 'bg-primary/10 text-primary' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {event.type === 'registration' ? <Users size={20} /> :
                         event.type === 'subscription' ? <CheckCircle2 size={20} /> :
                         event.type === 'withdrawal' ? <TrendingUp size={20} /> :
                         <Clock size={20} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-xs font-black uppercase tracking-widest mb-1 text-on-surface">
                          {event.type}
                        </div>
                        <div className="text-sm text-on-surface-variant font-medium">
                          {event.type === 'registration' && (
                            <><span className="text-white font-bold">{event.name}</span> joined the platform.</>
                          )}
                          {event.type === 'subscription' && (
                            <><span className="text-white font-bold">{event.name}</span> activated <span className="text-secondary font-black italic">{event.plan}</span> subscription.</>
                          )}
                          {event.type === 'withdrawal' && (
                            <><span className="text-white font-bold">{event.name}</span> requested a withdrawal of <span className="text-primary font-black italic">₹{event.amount}</span>.</>
                          )}
                          {event.type === 'draw' && (
                            <><span className="text-secondary font-black italic">{event.month} {event.year}</span> Draw results published.</>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                          {formatRelativeTime(event.createdAt)}
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-on-surface-variant/50">
                          <Search size={8} /> {event.id?.substring(0, 8)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {auditData.length === 0 && (
                    <div className="text-center py-20 glass-card rounded-2xl border border-dashed border-outline-variant/20">
                      <p className="text-on-surface-variant italic text-sm">Waiting for system events...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReports;
