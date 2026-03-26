import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  TrendingUp,
  Heart,
  CreditCard,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Award,
  ShieldCheck,
  Zap,
  Lock,
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

import { getWallet } from "../services/walletService";
import { getPublicSettings } from "../services/settingsService";
import RoleGuard from "../components/RoleGuard";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Dashboard() {
  const { user, isSubscribed, isLoading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextDrawDate, setNextDrawDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00:00");
  const [prizePool, setPrizePool] = useState<string>("₹10,50,000");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    if (status === 'active') return '#00FF00';
    if (status === 'lapsed') return '#FFA500';
    return '#FF0000';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    const refreshUserData = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          login(token, data.user);
        }
      } catch (error) {
        console.error("Failed to refresh user on dashboard load:", error);
      }
    };

    const fetchWallet = async () => {
      try {
        const data = await getWallet(token);
        if (data.success) setWalletBalance(data.wallet?.balance ?? 0);
      } catch (err) {
        console.error("Failed to fetch wallet balance:", err);
      }
    };

    refreshUserData();
    fetchWallet();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedScores = await api.getScores();
        setScores(Array.isArray(fetchedScores) ? fetchedScores : []);

        const settings = await getPublicSettings();
        if (settings) {
          if (settings.nextDrawDate) {
            setNextDrawDate(new Date(settings.nextDrawDate));
          }
          if (settings.prizePoolEstimate) {
            setPrizePool(`₹${settings.prizePoolEstimate.toLocaleString()}`);
          }
        }

        // Real stats where possible
        setStats([
          { label: "Current Jackpot", value: settings?.jackpotAmount ? `₹${settings.jackpotAmount.toLocaleString()}` : "₹0", trend: "+8.4%", icon: <Zap className="text-primary" />, color: "bg-primary/10" },
          { label: "Monthly Winnings", value: "₹1,02,400", trend: "+₹16,500", icon: <Award className="text-secondary" />, color: "bg-secondary/10" },
          { label: "Charity Impact", value: "₹31,380", trend: "+₹3,745", icon: <Heart className="text-primary" />, color: "bg-primary/10" },
          { label: "Draw Entries", value: isSubscribed ? "3" : "0", trend: "Next: " + (settings?.nextDrawDate ? new Date(settings.nextDrawDate).toLocaleDateString() : "TBD"), icon: <Trophy className="text-secondary" />, color: "bg-secondary/10" },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, isSubscribed]);

  useEffect(() => {
    if (!nextDrawDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextDrawDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("00:00:00");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [nextDrawDate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-on-surface-variant font-headline font-black uppercase tracking-widest text-xs animate-pulse">
            Loading Performance Data...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-on-surface-variant font-headline font-black uppercase tracking-widest text-xs">
          Session expired. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline font-black text-4xl uppercase italic tracking-tight mb-2">
            Welcome Back, <span className="text-gradient-red">{user?.name?.split(' ')?.[0] || 'Golfer'}</span>
          </h1>
          <p className="text-on-surface-variant font-medium">Your performance command center is live.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/wallet" className="bg-surface-variant/30 text-on-surface px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:bg-surface-variant transition-all flex items-center gap-2">
            <CreditCard size={14} />
            {walletBalance !== null ? `Wallet: ₹${walletBalance.toLocaleString('en-IN')}` : "Wallet"}
          </Link>
          <Link to="/scores" className="bg-on-surface text-surface px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:bg-primary transition-all glow-primary">
            Add New Score
          </Link>
        </div>
      </motion.div>

      {/* Subscription Status Section */}
      {user?.role !== 'admin' && (
        <motion.div {...fadeInUp} className="glass-card p-8 rounded-3xl border border-outline-variant/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <h3 className="font-headline font-black text-xl uppercase italic">Membership Status</h3>
              <div className="flex items-center gap-4">
                <span className="font-black uppercase tracking-widest text-sm" style={{ color: getStatusColor(user?.subscriptionStatus || 'inactive') }}>
                  {(user?.subscriptionStatus || 'inactive').toUpperCase()}
                </span>
                {user?.subscriptionPlan && (
                  <span className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full bg-surface-variant/30">
                    Plan: {user.subscriptionPlan.toUpperCase()}
                  </span>
                )}
              </div>
              {user?.subscriptionRenewalDate && (
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">
                  Renews: {new Date(user.subscriptionRenewalDate).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>
              )}
            </div>
            <RoleGuard allowedRoles={['inactive', 'guest']}>
              <button
                onClick={() => navigate('/memberships')}
                className="bg-primary text-white px-8 py-3 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:scale-105 transition-all glow-primary"
              >
                Subscribe Now
              </button>
            </RoleGuard>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="glass-card p-8 rounded-3xl border border-outline-variant/10 hover:border-primary/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${stat.trend?.startsWith('+') ? 'text-secondary' : 'text-primary'}`}>
                {stat.trend}
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{stat.label}</div>
            <div className="text-3xl font-headline font-black uppercase italic">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Recent Scores */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 glass-card rounded-3xl border border-outline-variant/10 overflow-hidden"
        >
          <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline font-black uppercase italic text-xl">Recent Performance</h3>
            <Link to="/scores" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
              Manage Scores <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/30">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Course</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Score</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Points</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {scores.map((score, i) => score && (
                  <tr key={i} className="hover:bg-surface-variant/20 transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-on-surface-variant">
                      {score.date ? new Date(score.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-6 font-headline font-bold uppercase italic text-sm">
                      {score.course || "Standard Course"}
                    </td>
                    <td className="px-8 py-6 text-sm font-black">{score.score || 0}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary">{score.score || 0}</span>
                        <div className="w-12 h-1 bg-surface-variant rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${((score.score || 0) / 45) * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-secondary/10 text-secondary`}>
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
                {scores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant font-headline font-bold uppercase tracking-widest text-xs">
                      No scores found. Add your first score to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Side Panels */}
        <div className="lg:col-span-4 space-y-8">
          {/* Charity Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-3xl border border-outline-variant/10 bg-primary/5"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline font-black uppercase italic text-xl">Your Impact</h3>
              <Heart className="text-primary fill-current" size={20} />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden grayscale">
                  <img src="https://picsum.photos/seed/charity1/100/100" alt="Charity" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Current Partner</div>
                  <div className="text-sm font-headline font-bold uppercase italic">Green Fairways</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Monthly Contribution</span>
                  <span>₹3,750</span>
                </div>
                <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "75%" }}></div>
                </div>
              </div>
              <Link to="/charity" className="block w-full py-4 rounded-2xl border border-primary/20 text-primary font-headline font-bold uppercase tracking-widest text-[10px] text-center hover:bg-primary/5 transition-all">
                Change Charity Partner
              </Link>
            </div>
          </motion.div>

          {/* Draw Countdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl border border-outline-variant/10 bg-secondary/5"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline font-black uppercase italic text-xl">Next Draw</h3>
              <Zap className="text-secondary fill-current" size={20} />
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-headline font-black text-on-surface mb-2 tracking-tighter">{timeLeft}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Days : Hours : Mins : Secs</div>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-white/50 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Est. Jackpot</span>
                <span className="text-sm font-headline font-black text-secondary">{prizePool}</span>
              </div>
              <div className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Based on current pool participation</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
