import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useRole } from "../lib/useRole";
import RoleGuard from "./RoleGuard";
import {
  LayoutDashboard,
  Trophy,
  Heart,
  Settings,
  LogOut,
  Zap,
  Menu,
  X,
  User,
  CreditCard,
  Bell,
  ShieldCheck,
  Activity,
  ShoppingBag,
  Users,
  Wallet as WalletIcon,
  Banknote,
  BarChart3
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getWallet } from "../services/walletService";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { isAdmin, isSubscriber } = useRole();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      getWallet(token).then(data => {
        if (data.success) setWalletBalance(data.wallet?.balance ?? 0);
      }).catch(err => console.error("Failed to fetch wallet balance:", err));
    }
  }, [isAuthenticated]);

  const menuItems: { icon: React.ReactNode; label: string; path: string; adminOnly?: boolean; allowedRoles?: ('admin' | 'subscriber' | 'guest' | 'inactive')[] }[] = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard", allowedRoles: ['admin', 'subscriber', 'inactive'] },
    {
      icon: <WalletIcon size={20} />,
      label: walletBalance !== null ? `Wallet: ₹${walletBalance.toLocaleString('en-IN')}` : "Wallet",
      path: "/wallet",
      allowedRoles: ['admin', 'subscriber']
    },
    { icon: <Trophy size={20} />, label: "Scores", path: "/scores", allowedRoles: ['admin', 'subscriber'] },
    { icon: <Heart size={20} />, label: "Charity", path: isSubscriber || isAdmin ? "/charity" : "/charity-partners", allowedRoles: ['admin', 'subscriber', 'inactive'] },
    { icon: <ShoppingBag size={20} />, label: "Gear", path: "/gear", allowedRoles: ['admin', 'subscriber', 'inactive'] },
    { icon: <Users size={20} />, label: "Community", path: "/community", allowedRoles: ['admin', 'subscriber', 'inactive'] },
    { icon: <ShieldCheck size={20} />, label: "Admin", path: "/admin", adminOnly: true },
    { icon: <BarChart3 size={20} />, label: "Reports", path: "/admin/reports", adminOnly: true },
    { icon: <Banknote size={20} />, label: "Withdrawals", path: "/admin/withdrawals", adminOnly: true },
    { icon: <Activity size={20} />, label: "QA System", path: "/qa", adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-outline-variant/10 p-6">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 mb-12 px-2 cursor-default">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black italic tracking-tighter text-on-surface font-headline">
              KINETIC GOLF
            </span>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-2 mb-12 px-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black italic tracking-tighter text-on-surface font-headline">
              KINETIC GOLF
            </span>
          </Link>
        )}

        <nav className="flex-grow space-y-2">
          {menuItems.map((item) => (
            <RoleGuard 
              key={item.path} 
              allowedRoles={item.adminOnly ? ['admin'] : (item.allowedRoles || ['admin', 'subscriber', 'inactive'])}
            >
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-headline font-bold uppercase tracking-widest text-xs transition-all ${location.pathname === item.path
                    ? "bg-primary text-white glow-primary"
                    : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </RoleGuard>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/10">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-variant/30 mb-8">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-headline font-black text-lg">
              {user?.name?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="text-sm font-black uppercase tracking-widest truncate">{user?.name}</div>
                <RoleGuard allowedRoles={['admin']}>
                  <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                    ADMIN
                  </span>
                </RoleGuard>
              </div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-widest truncate">{user?.role}</div>
            </div>
          </div>
          <Link
            to="/settings"
            className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl font-headline font-bold uppercase tracking-widest text-xs text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-all mb-2"
          >
            <Settings size={20} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl font-headline font-bold uppercase tracking-widest text-xs text-primary hover:bg-primary/5 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-outline-variant/10 z-40 px-6 py-4 flex justify-between items-center">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 cursor-default">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-black italic tracking-tighter text-on-surface font-headline">
              KINETIC
            </span>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-lg font-black italic tracking-tighter text-on-surface font-headline">
              KINETIC
            </span>
          </Link>
        )}
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-on-surface">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-white z-50 p-8 flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center mb-12">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 cursor-default">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Zap className="text-white w-5 h-5 fill-current" />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter text-on-surface font-headline">
                      KINETIC GOLF
                    </span>
                  </div>
                ) : (
                  <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => setIsSidebarOpen(false)}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Zap className="text-white w-5 h-5 fill-current" />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter text-on-surface font-headline">
                      KINETIC GOLF
                    </span>
                  </Link>
                )}
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-on-surface-variant">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-grow space-y-4">
                {menuItems.map((item) => (
                  <RoleGuard 
                    key={item.path}
                    allowedRoles={item.adminOnly ? ['admin'] : (item.allowedRoles || ['admin', 'subscriber', 'inactive'])}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-headline font-bold uppercase tracking-widest text-sm transition-all ${location.pathname === item.path
                          ? "bg-primary text-white glow-primary"
                          : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </RoleGuard>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-outline-variant/10">
                <Link
                  to="/settings"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl font-headline font-bold uppercase tracking-widest text-sm text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-all mb-4"
                >
                  <Settings size={20} />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl font-headline font-black uppercase tracking-widest text-sm text-primary hover:bg-primary/5 transition-all"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow min-h-screen pt-20 lg:pt-0 overflow-x-hidden">
        <header className="hidden lg:flex h-20 items-center justify-between px-12 bg-white/50 backdrop-blur-sm border-b border-outline-variant/10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-headline font-black uppercase italic text-xl tracking-tight">
              {menuItems.find(item => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <RoleGuard allowedRoles={['inactive', 'guest']}>
              <Link to="/memberships" className="bg-secondary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Subscribe Now
              </Link>
            </RoleGuard>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-on-surface-variant hover:text-on-surface transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-outline-variant/10 bg-surface-variant/10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest">Notifications</span>
                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Mark all as read</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {[
                          { id: 1, title: "Withdrawal Approved", desc: "Your request for ₹5,000 has been approved.", time: "2h ago", icon: <Zap size={14} />, color: "text-green-500 bg-green-500/10" },
                          { id: 2, title: "New Draw Live", desc: "The Weekly Mega Draw is now open for entries!", time: "5h ago", icon: <Trophy size={14} />, color: "text-primary bg-primary/10" },
                          { id: 3, title: "Welcome to Kinetic", desc: "Complete your profile to get started.", time: "1d ago", icon: <User size={14} />, color: "text-blue-500 bg-blue-500/10" },
                        ].map((n) => (
                          <div key={n.id} className="p-4 border-b border-outline-variant/5 hover:bg-surface-variant/20 transition-colors cursor-pointer">
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
                                {n.icon}
                              </div>
                              <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-tight">{n.title}</div>
                                <div className="text-[10px] text-on-surface-variant leading-tight">{n.desc}</div>
                                <div className="text-[8px] font-bold opacity-40 uppercase">{n.time}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center bg-surface-variant/5">
                        <button className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">View All Notifications</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/20"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <RoleGuard allowedRoles={['admin']}>
                    <span className="text-[8px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      ADMIN
                    </span>
                  </RoleGuard>
                  <div className="text-[10px] font-black uppercase tracking-widest leading-none">{user?.name}</div>
                </div>
                <div className="text-[8px] text-on-surface-variant uppercase tracking-widest mt-1">
                  Tier: {user?.role === 'admin' ? 'ADMIN' : (user?.plan?.name || (isSubscriber ? "Pro" : "Free"))}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-headline font-black text-xs">
                {user?.name?.[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
