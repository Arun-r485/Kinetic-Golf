import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Trophy,
  Heart,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Zap,
  LayoutDashboard,
  ClipboardList,
  Settings,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Download,
  Calendar,
  Play,
  Eye,
  Check,
  Loader2,
  DollarSign,
  Clock,
  Bell,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { api } from "../services/api";

import {
  getAdminWithdrawals
} from "../services/walletService";
import {
  getAdminSettings,
  bulkUpdateSettings
} from "../services/settingsService";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

type AdminTab = "overview" | "users" | "scores" | "draws" | "charities" | "winners" | "reports" | "withdrawals" | "settings";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getAdminWithdrawals(token).then(data => {
        if (data.success) {
          const pending = data.withdrawals.filter((w: any) => w.status === 'pending').length;
          setPendingWithdrawalsCount(pending);
        }
      }).catch(err => console.error("Failed to fetch pending withdrawals count:", err));
    }
  }, []);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "withdrawals", label: "Withdrawals", icon: <DollarSign size={18} />, badge: pendingWithdrawalsCount },
    { id: "scores", label: "Scores", icon: <ClipboardList size={18} /> },
    { id: "draws", label: "Draws", icon: <Trophy size={18} /> },
    { id: "charities", label: "Charities", icon: <Heart size={18} /> },
    { id: "winners", label: "Winners", icon: <ShieldCheck size={18} /> },
    { id: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline font-black text-4xl uppercase italic tracking-tight mb-2 pr-2">
            Admin <span className="text-gradient-red">Command</span>
          </h1>
          <p className="text-on-surface-variant font-medium">Platform-wide control and system management.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:scale-105 transition-all glow-primary flex items-center gap-2">
            <Download size={14} />
            Export Data
          </button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-headline font-bold uppercase tracking-widest text-[10px] transition-all whitespace-nowrap relative ${activeTab === tab.id
                ? "bg-on-surface text-surface shadow-lg"
                : "bg-surface-variant/30 text-on-surface-variant hover:bg-surface-variant/50"
              }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && <OverviewSection />}
          {activeTab === "users" && <UserManagementSection />}
          {activeTab === "withdrawals" && <AdminWithdrawalsSection />}
          {activeTab === "scores" && <ScoreManagementSection />}
          {activeTab === "draws" && <DrawManagementSection />}
          {activeTab === "charities" && <CharityManagementSection />}
          {activeTab === "winners" && <WinnerVerificationSection />}
          {activeTab === "reports" && <ReportsSection />}
          {activeTab === "settings" && <PlatformSettingsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AdminWithdrawalsSection() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/admin/withdrawals');
  }, []);
  return null;
}

function OverviewSection() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, charts] = await Promise.all([
          api.getAdminStats(),
          api.getAdminChartData()
        ]);
        setStats(statsData);
        setChartData(charts);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const adminStats = [
    { label: "Total Users", value: stats?.totalUsers || "0", trend: "+12%", icon: <Users className="text-primary" /> },
    { label: "Active Subs", value: stats?.activeSubs || "0", trend: "+8%", icon: <Zap className="text-secondary" /> },
    { label: "Prize Pool", value: `$${(stats?.totalRevenue * 0.4 || 0).toLocaleString()}`, trend: "+15%", icon: <Trophy className="text-primary" /> },
    { label: "Charity Total", value: `$${(stats?.totalRevenue * 0.1 || 0).toLocaleString()}`, trend: "+20%", icon: <Heart className="text-secondary" /> },
  ];

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, i) => (
          <div key={i} className="glass-card p-8 rounded-3xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-surface-variant/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-secondary' : 'text-primary'}`}>
                {stat.trend}
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{stat.label}</div>
            <div className="text-3xl font-headline font-black uppercase italic">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-black uppercase italic text-xl">User Growth</h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Last 6 Months</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData?.userGrowth || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#FF4444', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="users" stroke="#FF4444" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trends Chart */}
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-black uppercase italic text-xl">Revenue Trends</h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Monthly Revenue</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData?.revenueTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00FF00', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" fill="#00FF00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charity Contributions Chart */}
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline font-black uppercase italic text-xl">Charity Contributions</h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Top Partners</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData?.charityData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(chartData?.charityData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FF4444' : '#00FF00'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserManagementSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getAdminUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-3xl border border-outline-variant/10 overflow-hidden">
      <div className="p-8 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h3 className="font-headline font-black uppercase italic text-xl">User Management</h3>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-full py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-3 rounded-full bg-surface-variant/30 border border-outline-variant/10 text-on-surface-variant hover:text-on-surface transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-variant/30">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">User</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Role</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Joined</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {users.map((user, i) => (
              <tr key={i} className="hover:bg-surface-variant/20 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-headline font-black text-xs">
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{user.name}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.subscriptionStatus === 'active' ? 'bg-secondary' : 'bg-on-surface-variant/40'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{user.subscriptionStatus}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-on-surface-variant">
                  {user.joined || "N/A"}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    <button className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreManagementSection() {
  const [scores, setScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const data = await api.getScores(); // In a real app, this would be an admin endpoint for ALL scores
        setScores(data);
      } catch (error) {
        console.error("Failed to fetch scores:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();
  }, []);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-3xl border border-outline-variant/10 overflow-hidden">
      <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-headline font-black uppercase italic text-xl">Score Management</h3>
        <button className="bg-primary text-white px-6 py-2 rounded-full font-headline font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
          <Plus size={14} /> Add Score
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-variant/30">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">User</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Course</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Score</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Date</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {scores.map((score, i) => (
              <tr key={i} className="hover:bg-surface-variant/20 transition-colors">
                <td className="px-8 py-6 text-sm font-bold">{score.userName || "User"}</td>
                <td className="px-8 py-6 text-sm text-on-surface-variant">{score.course}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-headline font-black text-primary italic">{score.score}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">Points: {score.points}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-on-surface-variant">{new Date(score.date).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    <button className="p-2 text-on-surface-variant hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DrawManagementSection() {
  const [currentDraw, setCurrentDraw] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualNumbers, setManualNumbers] = useState("");
  const [nextDrawDate, setNextDrawDate] = useState("");
  const [prizePoolEstimate, setPrizePoolEstimate] = useState("");

  const fetchDraws = async () => {
    try {
      const [curr, hist, settings] = await Promise.all([
        api.getCurrentDraw(),
        api.getDrawHistory(),
        api.getSettings()
      ]);
      setCurrentDraw(curr?.draw || curr);
      setHistory(hist);
      if (settings) {
        setNextDrawDate(new Date(settings.nextDrawDate).toISOString().slice(0, 16));
        setPrizePoolEstimate(settings.prizePoolEstimate.toString());
      }
    } catch (error) {
      console.error("Failed to fetch draws:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws();
  }, []);

  const handleRunDraw = async () => {
    const confirmMsg = manualNumbers
      ? `Are you sure you want to run the draw with numbers: ${manualNumbers}?`
      : "Are you sure you want to run the draw now? This will publish results immediately.";

    if (!confirm(confirmMsg)) return;
    try {
      setIsProcessing(true);
      await api.runDraw({
        numbers: manualNumbers ? manualNumbers.split(',').map(n => n.trim()) : undefined
      });
      await fetchDraws();
      setManualNumbers("");
      alert("Draw completed and published successfully!");
    } catch (error) {
      console.error("Failed to run draw:", error);
      alert("Failed to run draw.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setIsProcessing(true);
      const result = await api.simulateDraw();
      alert(`Simulation Result: ${result.numbers.join(", ")}`);
    } catch (error) {
      console.error("Failed to simulate draw:", error);
      alert("Failed to simulate draw.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!currentDraw || currentDraw.status === "published") {
      alert("No draft draw to publish.");
      return;
    }
    try {
      setIsProcessing(true);
      await api.publishDraw(currentDraw.id);
      await fetchDraws();
      alert("Draw published successfully!");
    } catch (error) {
      console.error("Failed to publish draw:", error);
      alert("Failed to publish draw.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      setIsProcessing(true);
      await api.sendDrawReminders();
      alert("Draw reminders sent to all active subscribers!");
    } catch (error) {
      console.error("Failed to send reminders:", error);
      alert("Failed to send reminders.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setIsProcessing(true);
      await api.updateSettings({
        nextDrawDate,
        prizePoolEstimate: parseFloat(prizePoolEstimate)
      });
      alert("Draw settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
      alert("Failed to update settings.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
          <h3 className="font-headline font-black uppercase italic text-xl mb-8">Draw Controls</h3>
          <div className="space-y-4">
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Manual Numbers (Optional, comma separated)</label>
              <input
                type="text"
                value={manualNumbers}
                onChange={(e) => setManualNumbers(e.target.value)}
                placeholder="e.g. 12, 45, 67, 89, 23"
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={handleRunDraw}
              disabled={isProcessing}
              className="w-full bg-primary text-white py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />} Run Draw Manually
            </button>
            <button
              onClick={handleSimulate}
              disabled={isProcessing}
              className="w-full bg-surface-variant text-on-surface py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-on-surface hover:text-surface transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Eye size={14} />} Run Simulation
            </button>
            <button
              onClick={handlePublish}
              disabled={isProcessing || currentDraw?.status === "published"}
              className="w-full border border-outline-variant/20 text-on-surface-variant py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Publish Results
            </button>
            <button
              onClick={handleSendReminders}
              disabled={isProcessing}
              className="w-full bg-secondary/10 text-secondary py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Bell size={14} />} Send Draw Reminders
            </button>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
          <h3 className="font-headline font-black uppercase italic text-xl mb-8">Next Draw Schedule</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Next Draw Date & Time</label>
              <input
                type="datetime-local"
                value={nextDrawDate}
                onChange={(e) => setNextDrawDate(e.target.value)}
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <div className="flex gap-2 mt-2">
                {[1, 24, 168].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setHours(d.getHours() + hours);
                      setNextDrawDate(d.toISOString().slice(0, 16));
                    }}
                    className="flex-1 bg-surface-variant/50 hover:bg-primary/20 text-[8px] font-black uppercase py-2 rounded-lg transition-all border border-outline-variant/5"
                  >
                    +{hours === 168 ? '1 Week' : hours + 'h'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Prize Pool Estimate (₹)</label>
              <input
                type="number"
                value={prizePoolEstimate}
                onChange={(e) => setPrizePoolEstimate(e.target.value)}
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              onClick={handleUpdateSettings}
              disabled={isProcessing}
              className="w-full bg-on-surface text-surface py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primary transition-all disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Clock size={14} />} Set Next Draw Timer
            </button>
          </div>
        </div>
        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
          <h3 className="font-headline font-black uppercase italic text-xl mb-6">Current Draw Info</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Draw Number</label>
              <div className="text-2xl font-headline font-black text-primary italic">{currentDraw?.number || "N/A"}</div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Draw Date</label>
              <div className="text-lg font-headline font-black">{currentDraw ? new Date(currentDraw.date).toLocaleDateString() : "N/A"}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-8 glass-card rounded-3xl border border-outline-variant/10 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/10">
          <h3 className="font-headline font-black uppercase italic text-xl">Draw History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/30">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Draw Date</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Type</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {history.map((draw, i) => (
                <tr key={i} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold">{new Date(draw.date).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                      {draw.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-on-surface">{draw.number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CharityManagementSection() {
  const [charities, setCharities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    totalDonations: 0
  });

  const fetchCharities = async () => {
    try {
      const data = await api.getCharities();
      setCharities(data);
    } catch (error) {
      console.error("Failed to fetch charities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleOpenModal = (charity: any = null) => {
    if (charity) {
      setEditingCharity(charity);
      setFormData({
        name: charity.name,
        description: charity.description || "",
        image: charity.image || "",
        totalDonations: charity.totalDonations || 0
      });
    } else {
      setEditingCharity(null);
      setFormData({ name: "", description: "", image: "", totalDonations: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      if (editingCharity) {
        await api.updateCharity(editingCharity.id, formData);
      } else {
        await api.addCharity(formData);
      }
      await fetchCharities();
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save charity:", error);
      alert("Failed to save charity.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this charity?")) return;
    try {
      setIsProcessing(true);
      await api.deleteCharity(id);
      await fetchCharities();
    } catch (error) {
      console.error("Failed to delete charity:", error);
      alert("Failed to delete charity.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-headline font-black uppercase italic text-2xl">Charity Partners</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all glow-primary"
        >
          <Plus size={14} /> Add New Charity
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((charity) => (
          <motion.div
            key={charity.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl border border-outline-variant/10 overflow-hidden group"
          >
            <div className="h-48 relative overflow-hidden">
              <img
                src={charity.image || "https://picsum.photos/seed/charity/800/600"}
                alt={charity.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h3 className="font-headline font-black uppercase italic text-white text-xl">{charity.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(charity)}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-primary transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(charity.id)}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-on-surface-variant text-xs line-clamp-3 leading-relaxed">{charity.description}</p>
              <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Total Impact</div>
                <div className="text-sm font-headline font-black text-primary italic">₹{charity.totalDonations?.toLocaleString() || 0}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charity Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-[2.5rem] border border-outline-variant/10 bg-surface overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-variant/10">
                <h3 className="font-headline font-black uppercase italic text-xl">
                  {editingCharity ? "Edit Charity" : "Add New Charity"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-variant/50 rounded-full transition-all">
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Charity Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="e.g. Green Fairways Foundation"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="Tell us about their mission..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all glow-primary disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {editingCharity ? "Update Charity" : "Save Charity"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WinnerVerificationSection() {
  const [winners, setWinners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWinners = async () => {
    try {
      const data = await api.getWinners();
      setWinners(data);
    } catch (error) {
      console.error("Failed to fetch winners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setIsProcessing(true);
      await api.updateWinnerStatus(id, status);
      await fetchWinners();
    } catch (error) {
      console.error("Failed to update winner status:", error);
      alert("Failed to update status.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="glass-card rounded-3xl border border-outline-variant/10 overflow-hidden">
      <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-headline font-black uppercase italic text-xl">Winner Verification Queue</h3>
        <div className="flex gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
            {winners.filter(w => w.status === 'pending').length} Pending
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-variant/30">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Winner</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Prize</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Draw Date</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {winners.map((winner, i) => (
              <tr key={i} className="hover:bg-surface-variant/20 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                      {winner.userId?.name?.substring(0, 2) || "UN"}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{winner.userId?.name || "Unknown User"}</div>
                      <div className="text-[10px] text-on-surface-variant">{winner.userId?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-headline font-black text-primary italic">
                  ₹{winner.prizeAmount?.toLocaleString()}
                </td>
                <td className="px-8 py-6 text-sm text-on-surface-variant">
                  {winner.drawId?.date ? new Date(winner.drawId.date).toLocaleDateString() : "N/A"}
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${winner.status === 'paid' ? 'bg-secondary/10 text-secondary' :
                      winner.status === 'approved' ? 'bg-primary/10 text-primary' :
                        'bg-surface-variant text-on-surface-variant'
                    }`}>
                    {winner.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    {winner.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(winner.id, 'approved')}
                        disabled={isProcessing}
                        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {winner.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(winner.id, 'paid')}
                        disabled={isProcessing}
                        className="p-2 text-secondary hover:bg-secondary/10 rounded-xl transition-all"
                      >
                        <DollarSign size={16} />
                      </button>
                    )}
                    <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-xl transition-all">
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {winners.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant italic text-sm">
                  No winners found in the verification queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsSection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-20 glass-card rounded-[2.5rem] border border-outline-variant/10 text-center space-y-8">
      <div className="w-20 h-20 rounded-[2rem] bg-surface-variant/50 flex items-center justify-center text-primary">
          <BarChart3 size={40} />
      </div>
      <div className="space-y-2">
        <h3 className="font-headline font-black uppercase italic text-3xl">Reports & Auditing</h3>
        <p className="text-on-surface-variant font-medium">Comprehensive analytics and auditing are now live.</p>
      </div>
      <button 
        onClick={() => navigate('/admin/reports')}
        className="bg-primary text-white px-10 py-4 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:scale-105 transition-all glow-primary flex items-center gap-3"
      >
        Open Full Reports
        <ArrowUpRight size={18} />
      </button>
    </div>
  );
}

function PlatformSettingsSection() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await getAdminSettings(token);
        setSettings(data);
        setFormData(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      await bulkUpdateSettings(token, formData);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings:", error);
      alert("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="glass-card p-10 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-outline-variant/10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Settings size={24} />
          </div>
          <div>
            <h3 className="font-headline font-black uppercase italic text-2xl">Platform Configuration</h3>
            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest">Global system parameters and draw settings</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Platform Name</label>
              <input
                type="text"
                value={formData.platformName || ""}
                onChange={(e) => handleChange("platformName", e.target.value)}
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Draw Cadence</label>
              <select
                value={formData.drawCadence || "weekly"}
                onChange={(e) => handleChange("drawCadence", e.target.value)}
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Next Draw Date & Time</label>
              <input
                type="datetime-local"
                value={formData.nextDrawDate ? new Date(formData.nextDrawDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => handleChange("nextDrawDate", new Date(e.target.value).toISOString())}
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Prize Pool Estimate (₹)</label>
              <input
                type="number"
                value={formData.prizePoolEstimate || 0}
                onChange={(e) => handleChange("prizePoolEstimate", parseFloat(e.target.value))}
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3 lg:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Current Jackpot (₹)</label>
              <input
                type="number"
                value={formData.jackpotAmount || 0}
                onChange={(e) => handleChange("jackpotAmount", parseFloat(e.target.value))}
                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-6 text-lg font-black text-primary italic focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setFormData(settings)}
              className="px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] text-on-surface-variant hover:bg-surface-variant/30 transition-all"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-white px-12 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all glow-primary flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-10 rounded-[2.5rem] border border-outline-variant/10 bg-secondary/5">
        <div className="flex items-center gap-4 mb-6">
          <Zap className="text-secondary" size={24} />
          <h4 className="font-headline font-black uppercase italic text-xl">System Status</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-outline-variant/5">
            <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">API Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-xs font-bold font-headline uppercase italic">Operational</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-outline-variant/5">
            <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Last Draw</div>
            <div className="text-xs font-bold font-headline uppercase italic">Mar 25, 2024</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-outline-variant/5">
            <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Active Users</div>
            <div className="text-xs font-bold font-headline uppercase italic">4,281</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-outline-variant/5">
            <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">System Load</div>
            <div className="text-xs font-bold font-headline uppercase italic">12%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
