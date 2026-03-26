import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard as CardIcon,
  Edit3,
  Trophy,
  Heart,
  ArrowUpRight,
  Globe,
  Mail,
  Share2,
  Star,
  Zap,
  BarChart3,
  Award,
  ShieldCheck,
  TrendingUp,
  Info,
  Coins,
} from "lucide-react";
import GolfBallScene from "../components/GolfBallScene";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from '../lib/useRole';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8 }
};

const ScoreReplacementAnimation = () => {
  const [scores, setScores] = useState([32, 35, 38, 40, 42]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      const newScore = Math.floor(Math.random() * 15) + 30;
      setScores(prev => {
        const next = [...prev.slice(1), newScore];
        return next;
      });
      setHighlightIndex(4);
      setTimeout(() => setHighlightIndex(-1), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-1">
      <AnimatePresence mode="popLayout">
        {scores.map((score, i) => (
          <motion.div
            key={`${i}-${score}`}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{
              opacity: 1,
              scale: i === highlightIndex ? 1.1 : 1,
              x: 0,
              backgroundColor: i === highlightIndex ? "rgba(255, 99, 33, 0.2)" : "rgba(255, 255, 255, 0.05)"
            }}
            exit={{ opacity: 0, scale: 0.5, x: -20 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-14 rounded-lg border border-outline-variant/10 flex flex-col items-center justify-center"
          >
            <div className="text-[8px] font-bold text-on-surface-variant/40 mb-1">S{i + 1}</div>
            <div className="text-sm font-headline font-black text-on-surface">{score}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const DrawAnimation = () => {
  return (
    <div className="flex gap-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-headline font-black text-lg shadow-lg shadow-primary/20"
        >
          {Math.floor(Math.random() * 50) + 1}
        </motion.div>
      ))}
    </div>
  );
};

const ImpactAnimation = () => {
  return (
    <div className="flex items-center gap-8">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Coins className="text-primary w-6 h-6" />
        </div>
        <div className="text-[8px] font-black uppercase tracking-widest text-primary">Winnings</div>
      </motion.div>
      <div className="h-8 w-[1px] bg-outline-variant/20"></div>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
          <Heart className="text-secondary w-6 h-6 fill-current" />
        </div>
        <div className="text-[8px] font-black uppercase tracking-widest text-secondary">Charity</div>
      </motion.div>
    </div>
  );
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  viewport: { once: true }
};

const DrawSystemVisual = () => {
  const userNumbers = [12, 24, 36, 42, 48];
  const winningNumbers = [12, 25, 36, 42, 49];
  const matches = userNumbers.filter(num => winningNumbers.includes(num)).length;
  const reward = matches === 4 ? "₹2,50,000" : matches === 3 ? "₹12,500" : "₹2,500";

  return (
    <div className="relative p-8 md:p-12 glass-card rounded-[2.5rem] border-2 border-outline-variant/20 bg-surface-variant/5 overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-6">
        <div className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/30 glow-primary">
          Live Draw Simulation
        </div>
      </div>

      <div className="space-y-12">
        {/* Winning Numbers */}
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant text-center">Winning Numbers</div>
          <div className="flex justify-center gap-3 md:gap-4">
            {winningNumbers.map((num, i) => (
              <motion.div
                key={`win-${i}`}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-surface-variant/10 border-2 border-outline-variant/20 flex items-center justify-center text-xl md:text-2xl font-black text-on-surface shadow-inner"
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>

        {/* User Numbers & Matching */}
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant text-center">Your Numbers</div>
          <div className="flex justify-center gap-3 md:gap-4">
            {userNumbers.map((num, i) => {
              const isMatch = winningNumbers.includes(num);
              return (
                <motion.div
                  key={`user-${i}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 + 1 }}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black transition-all duration-700 ${isMatch
                      ? "bg-secondary/20 border-2 border-secondary text-secondary glow-secondary scale-110"
                      : "bg-surface-variant/10 border-2 border-outline-variant/20 text-on-surface-variant/40"
                    }`}
                >
                  {num}
                  {isMatch && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl bg-secondary/30 blur-xl"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Result Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="flex justify-center"
        >
          <div className="px-8 py-4 rounded-2xl bg-secondary text-black font-headline font-black uppercase italic tracking-tighter text-xl glow-secondary">
            {matches} Matches! {reward} Reward
          </div>
        </motion.div>
      </div>

      {/* Background Accents */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
    </div>
  );
};

const DashboardPreviewVisual = () => {
  return (
    <div className="relative group">
      {/* Device Frame */}
      <div className="relative z-10 glass-card rounded-[2.5rem] border-2 border-outline-variant/20 shadow-2xl overflow-hidden bg-surface aspect-[16/10]">
        {/* Browser Top Bar */}
        <div className="bg-surface-variant/5 px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>
          <div className="mx-auto px-4 py-1 rounded-md bg-surface-variant/10 text-[8px] font-mono text-on-surface-variant/40 tracking-wider">
            app.kineticgolf.com/dashboard
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 md:p-10 grid grid-cols-12 gap-6 h-full">
          {/* Sidebar */}
          <div className="col-span-3 space-y-6 hidden md:block">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Zap className="text-on-primary w-4 h-4 fill-current" />
              </div>
              <div className="text-[10px] font-black italic tracking-tighter text-on-surface font-headline">KINETIC</div>
            </div>
            <div className="space-y-2">
              {[Trophy, BarChart3, Award, Heart, ShieldCheck].map((Icon, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${i === 0 ? 'bg-primary/10 text-primary' : 'text-on-surface-variant/30'}`}>
                  <Icon className="w-4 h-4" />
                  <div className="h-2 w-16 bg-current opacity-20 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Main View */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Winnings", val: "₹6,22,500", color: "text-secondary" },
                { label: "Kinetic Index", val: "38.4", color: "text-primary" },
                { label: "Draw Entries", val: "12", color: "text-on-surface" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl bg-surface-variant/5 border border-outline-variant/10"
                >
                  <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{stat.label}</div>
                  <div className={`text-lg md:text-xl font-black ${stat.color}`}>{stat.val}</div>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Scores Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl bg-surface-variant/5 border border-outline-variant/10 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-on-surface">Your Scores</div>
                  <div className="text-[8px] font-bold text-on-surface-variant/40">Last 5</div>
                </div>
                <div className="space-y-3">
                  {[42, 38, 40, 35, 39].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-[8px] font-mono text-on-surface-variant/30">0{i + 1}</div>
                      <div className="flex-grow h-1.5 bg-surface-variant/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(s / 50) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <div className="text-[10px] font-black text-on-surface-variant">{s}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Winnings Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-surface-variant/5 border border-outline-variant/10 space-y-4"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-on-surface">Recent Winnings</div>
                <div className="space-y-3">
                  {[
                    { date: "Mar 15", amt: "₹2,50,000", status: "Paid" },
                    { date: "Feb 12", amt: "₹12,500", status: "Paid" },
                    { date: "Jan 08", amt: "₹60,000", status: "Pending" }
                  ].map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-variant/5 border border-outline-variant/10">
                      <div>
                        <div className="text-[8px] font-bold text-on-surface-variant/40">{w.date}</div>
                        <div className="text-xs font-black text-on-surface">{w.amt}</div>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[6px] font-black uppercase tracking-widest ${w.status === 'Paid' ? 'bg-secondary/20 text-secondary' : 'bg-amber-500/20 text-amber-500'}`}>
                        {w.status}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-10 -right-10 z-20 p-6 glass-card rounded-2xl border border-secondary/30 bg-secondary/10 shadow-xl"
      >
        <div className="text-[8px] font-black uppercase tracking-widest text-secondary mb-1">Upcoming Draw</div>
        <div className="text-xl font-black text-on-surface">14:22:05</div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute -bottom-10 -left-10 z-20 p-6 glass-card rounded-2xl border border-primary/30 bg-primary/10 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Heart className="text-primary w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">Total Donated</div>
            <div className="text-lg font-black text-on-surface">₹62,000</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const { isAdmin } = useRole();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Navigation */}
      <motion.nav
        initial={{
          backgroundColor: "rgba(253, 253, 253, 0)",
          backdropFilter: "blur(0px)",
          paddingTop: "1.5rem",
          paddingBottom: "1.5rem",
          borderBottomColor: "rgba(196, 199, 207, 0)"
        }}
        animate={{
          backgroundColor: scrolled ? "rgba(253, 253, 253, 0.8)" : "rgba(253, 253, 253, 0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
          paddingTop: scrolled ? "1rem" : "1.5rem",
          paddingBottom: scrolled ? "1rem" : "1.5rem",
          borderBottomColor: scrolled ? "rgba(196, 199, 207, 0.1)" : "rgba(196, 199, 207, 0)",
          boxShadow: scrolled ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "0 0 #0000"
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 w-full z-50 border-b"
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center max-w-screen-2xl">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 cursor-default">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-primary">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-on-surface font-headline">
                KINETIC GOLF
              </span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-primary">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-on-surface font-headline">
                KINETIC GOLF
              </span>
            </Link>
          )}

          <div className="hidden lg:flex items-center gap-10">
            <a
              href="#process"
              className="text-on-surface-variant hover:text-primary font-headline font-bold tracking-tighter uppercase text-sm transition-colors relative group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <Link
              to="/charity-partners"
              className="text-on-surface-variant hover:text-primary font-headline font-bold tracking-tighter uppercase text-sm transition-colors relative group"
            >
              Charities
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/gear"
              className="text-on-surface-variant hover:text-primary font-headline font-bold tracking-tighter uppercase text-sm transition-colors relative group"
            >
              Gear
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/community"
              className="text-on-surface-variant hover:text-primary font-headline font-bold tracking-tighter uppercase text-sm transition-colors relative group"
            >
              Community
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>


          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="bg-primary text-white px-8 py-3 rounded-full font-headline font-black tracking-tighter uppercase text-sm hover:scale-105 active:scale-95 transition-all glow-primary shadow-lg shadow-primary/20">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-on-surface-variant hover:text-on-surface font-headline font-bold tracking-tighter uppercase text-sm transition-colors">
                  Log In
                </Link>
                <Link to="/memberships" className="bg-primary text-white px-8 py-3 rounded-full font-headline font-black tracking-tighter uppercase text-sm hover:scale-105 active:scale-95 transition-all glow-primary shadow-lg shadow-primary/20">
                  Join Club
                </Link>
              </>
            )}
          </div>

        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden hero-mesh">
        <div className="container mx-auto px-6 md:px-12 max-w-screen-2xl grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-headline font-bold text-xs tracking-widest uppercase mb-8">
              <Star className="w-3 h-3 fill-current" />
              The Future of Golf Subscriptions
            </div>
            <h1 className="font-headline font-black text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight uppercase mb-8">
              BOLD GEAR.<br />
              <span className="text-gradient-red">BIGGER IMPACT.</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant max-w-xl mb-12 leading-relaxed font-light">
              Elite performance equipment delivered monthly. A subscription platform where your game funds the next generation of athletes.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              {user?.role === 'admin' ? (
                <Link to="/admin" className="group bg-primary text-white px-10 py-5 rounded-full font-headline font-black text-lg tracking-tighter uppercase flex items-center justify-center gap-3 hover:brightness-110 transition-all glow-primary shadow-xl shadow-primary/20">
                  Manage Site
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link to="/checkout" className="group bg-primary text-white px-10 py-5 rounded-full font-headline font-black text-lg tracking-tighter uppercase flex items-center justify-center gap-3 hover:brightness-110 transition-all glow-primary shadow-xl shadow-primary/20">
                  Join the Club
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <button className="group bg-white/50 backdrop-blur-md text-on-surface border border-outline-variant/20 px-10 py-5 rounded-full font-headline font-black text-lg tracking-tighter uppercase hover:bg-white transition-all">
                View Impact
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-surface overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/user${i}/100/100`}
                      alt="User"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-secondary fill-current" />
                  ))}
                </div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  Trusted by 12,000+ Golfers
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative h-[600px] lg:h-[800px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full"></div>
            <GolfBallScene />
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Explore</span>
          <motion.div
            className="w-[1px] h-16 bg-gradient-to-b from-primary to-transparent"
            animate={{ scaleY: [1, 0.5, 1], originY: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="process" className="py-32 bg-surface relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24">
            <motion.div {...fadeInUp}>
              <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 flex items-center justify-center gap-3">
                <span className="w-12 h-[1px] bg-secondary/30"></span> THE KINETIC CYCLE
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tight uppercase mb-6">How It Works</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">A seamless integration of elite gear, performance tracking, and charitable giving.</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Step 1 */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="glass-card p-8 rounded-3xl border border-outline-variant/10 relative group hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <CardIcon className="text-primary w-7 h-7" />
              </div>
              <h3 className="font-headline font-bold text-2xl mb-4 italic uppercase tracking-tight">1. Subscribe</h3>
              <ul className="space-y-2 mb-8">
                <li className="text-xs text-on-surface-variant flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Choose a monthly or yearly plan
                </li>
                <li className="text-xs text-on-surface-variant flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Unlock full access to the platform
                </li>
                <li className="text-xs text-on-surface-variant flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Start contributing to charity
                </li>
              </ul>

              <div className="relative h-32 bg-surface-variant/30 rounded-xl border border-outline-variant/5 overflow-hidden p-4">
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary/20 blur-xl"></div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-2">Plan Preview</div>
                <div className="space-y-2">
                  <div className="h-2 w-2/3 bg-primary/20 rounded-full"></div>
                  <div className="h-2 w-1/2 bg-on-surface-variant/10 rounded-full"></div>
                </div>
                <button className="absolute bottom-4 left-4 right-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 group-hover:animate-pulse">
                  Join Now
                </button>
              </div>
              <div className="absolute top-6 right-8 text-4xl font-headline font-black text-on-surface/5 italic group-hover:text-primary/10 transition-colors">01</div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-3xl border border-outline-variant/10 relative group hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Edit3 className="text-secondary w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-headline font-bold text-2xl italic uppercase tracking-tight">2. Enter Scores</h3>
                <div className="group/tooltip relative">
                  <Info className="w-4 h-4 text-on-surface-variant/40 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-on-surface text-surface text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                    “Stableford scoring rewards consistency, not just low scores”
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-8">
                Add your recent golf scores. Only your latest 5 scores are stored, automatically replacing the oldest.
              </p>

              <div className="relative h-32 flex items-center justify-center gap-2">
                <ScoreReplacementAnimation />
              </div>
              <div className="absolute top-6 right-8 text-4xl font-headline font-black text-on-surface/5 italic group-hover:text-secondary/10 transition-colors">02</div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-3xl border border-outline-variant/10 relative group hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="text-primary w-7 h-7" />
              </div>
              <h3 className="font-headline font-bold text-2xl mb-4 italic uppercase tracking-tight">3. Auto Draw</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-8">
                Your scores generate your draw entries. Every month, a draw is conducted automatically — no extra action required.
              </p>

              <div className="relative h-32 bg-surface-variant/20 rounded-xl border border-outline-variant/5 overflow-hidden flex items-center justify-center">
                <DrawAnimation />
              </div>
              <div className="absolute top-6 right-8 text-4xl font-headline font-black text-on-surface/5 italic group-hover:text-primary/10 transition-colors">03</div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-3xl border border-outline-variant/10 relative group hover:bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Heart className="text-secondary w-7 h-7" />
              </div>
              <h3 className="font-headline font-bold text-2xl mb-4 italic uppercase tracking-tight">4. Match & Impact</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed mb-6">
                Match your numbers to win prizes. A portion of every subscription supports your selected charity.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                  <span>5 Matches</span>
                  <span>Jackpot</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <span>4 Matches</span>
                  <span>High Rewards</span>
                </div>
              </div>

              <div className="relative h-24 bg-surface-variant/20 rounded-xl border border-outline-variant/5 overflow-hidden flex items-center justify-center">
                <ImpactAnimation />
              </div>
              <div className="absolute top-6 right-8 text-4xl font-headline font-black text-on-surface/5 italic group-hover:text-secondary/10 transition-colors">04</div>
            </motion.div>
          </div>

          {/* Mini Flow Line */}
          <motion.div
            {...fadeInUp}
            className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-20 py-6 border-y border-outline-variant/10"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">The Flow</span>
            {["Play", "Enter", "Match", "Win", "Give"].map((text, i) => (
              <div key={text} className="flex items-center gap-4 md:gap-8">
                <span className="font-headline font-bold text-sm md:text-lg italic uppercase tracking-tight text-on-surface group hover:text-primary transition-colors cursor-default">
                  {text}
                </span>
                {i < 4 && <ArrowRight className="w-4 h-4 text-primary/30" />}
              </div>
            ))}
          </motion.div>

          {/* Trust Layer */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 p-8 rounded-3xl bg-surface-variant/20 border border-outline-variant/10"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
                    <img src={`https://picsum.photos/seed/trust${i}/100/100`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-2xl font-headline font-black text-on-surface">10,000+</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Players Participating</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 p-8 rounded-3xl bg-surface-variant/20 border border-outline-variant/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Heart className="text-secondary w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="text-2xl font-headline font-black text-on-surface">₹71,25,000</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Donated So Far</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Score System Explanation */}
      <section id="scores" className="py-32 bg-surface-variant/20 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
                <span className="w-12 h-[1px] bg-primary/30"></span> PERFORMANCE MATH
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9] mb-10">
                The Scoring<br /><span className="text-secondary italic">System.</span>
              </h2>

              <div className="space-y-10">
                {[
                  { title: "Stableford Scoring", desc: "A simple point-based system where better scores earn more points. We normalize this across all courses." },
                  { title: "The Last 5 Rule", desc: "Your entry is always based on your most recent 5 official scores for maximum fairness." },
                  { title: "Auto-Replacement", desc: "New scores automatically push out the oldest, keeping your performance profile current." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline font-black">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-xl uppercase italic mb-2">{item.title}</h4>
                      <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 rounded-3xl border border-outline-variant/20 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-headline font-black uppercase italic text-xl">Recent Performance</h3>
                <div className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-full">Live Feed</div>
              </div>

              <div className="space-y-8">
                {[
                  { date: "Mar 22", score: 38, label: "Stableford Pts", color: "bg-primary", status: "Latest Score" },
                  { date: "Mar 18", score: 42, label: "Stableford Pts", color: "bg-secondary" },
                  { date: "Mar 12", score: 35, label: "Stableford Pts", color: "bg-primary" },
                  { date: "Mar 05", score: 40, label: "Stableford Pts", color: "bg-secondary" },
                  { date: "Feb 28", score: 37, label: "Stableford Pts", color: "bg-primary", status: "Oldest Replaced" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2 relative">
                    {item.status && (
                      <div className={`absolute -top-4 right-0 text-[8px] font-black uppercase tracking-widest ${item.status === 'Latest Score' ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
                        {item.status}
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      <span>{item.date}</span>
                      <span>{item.score} {item.label}</span>
                    </div>
                    <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.score / 50) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${item.color} progress-bar-glow`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-outline-variant/10 flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Kinetic Index</div>
                  <div className="text-3xl font-headline font-black text-on-surface">38.4</div>
                </div>
                <button className="text-primary font-headline font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-3 transition-all">
                  Full Analytics <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Draw System Section */}
      <section id="draw" className="py-32 bg-surface relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-3">
                <span className="w-12 h-[1px] bg-secondary/30"></span> THE WINNING MECHANISM
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9] mb-10 text-on-surface">
                How You<br /><span className="text-primary italic">Win Rewards.</span>
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-12">
                Every month, your scores automatically enter you into a draw. The more your scores align with the monthly "Kinetic Key", the higher your reward.
              </p>

              <div className="space-y-6">
                {[
                  { tier: "5 Match", label: "JACKPOT", desc: "Match all 5 numbers to win the monthly rollover jackpot.", color: "text-primary" },
                  { tier: "4 Match", label: "HIGH REWARDS", desc: "Significant cash prizes and elite equipment vouchers.", color: "text-secondary" },
                  { tier: "3 Match", label: "SMALLER REWARDS", desc: "Platform credits and exclusive gear discounts.", color: "text-on-surface" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-2xl bg-surface-variant/10 border-2 border-outline-variant/20 hover:bg-surface-variant/20 transition-all group">
                    <div className={`text-2xl font-headline font-black italic uppercase tracking-tighter ${item.color} group-hover:scale-110 transition-transform`}>
                      {item.tier}
                    </div>
                    <div>
                      <h4 className="font-headline font-bold uppercase italic text-sm mb-1 text-on-surface">{item.label}</h4>
                      <p className="text-xs text-on-surface-variant/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <DrawSystemVisual />
            </motion.div>
          </div>
        </div>

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-32 bg-surface-variant/5 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-7"
            >
              <DashboardPreviewVisual />
            </motion.div>

            <motion.div className="lg:col-span-5" {...fadeInUp}>
              <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-3">
                <span className="w-12 h-[1px] bg-secondary/30"></span> PRODUCT PREVIEW
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9] mb-10 text-on-surface">
                Your Elite<br /><span className="text-gradient-red">Command Center.</span>
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-12">
                Experience a premium dashboard designed for the modern golfer. Track your game, monitor your winnings, and see your charitable impact in real-time.
              </p>

              <div className="space-y-8">
                {[
                  { title: "Score Tracking", desc: "Maintain your Kinetic Index with your last 5 official scores.", icon: Edit3 },
                  { title: "Winnings Overview", desc: "Instant visibility into your earnings and payment status.", icon: Coins },
                  { title: "Participation Stats", desc: "Never miss a draw with automated entry tracking.", icon: TrendingUp }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-variant/10 border border-outline-variant/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold uppercase italic text-lg mb-1 text-on-surface">{item.title}</h4>
                      <p className="text-sm text-on-surface-variant/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link to="/signup" className="group bg-on-surface text-surface px-10 py-5 rounded-full font-headline font-black text-lg tracking-tighter uppercase flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all glow-primary">
                  Explore Dashboard
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Charity Impact */}
      <section id="impact" className="py-32 bg-surface-variant/10 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <motion.div {...fadeInUp}>
              <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-6 flex items-center gap-3">
                <span className="w-12 h-[1px] bg-secondary/30"></span> REAL WORLD IMPACT
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9] mb-10">
                Bold Gear.<br /><span className="text-on-surface-variant italic">Bigger Purpose.</span>
              </h2>
              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div className="text-4xl font-headline font-black text-on-surface">₹1,90,22,500</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-secondary">Raised This Year</div>
                  </div>
                  <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "72%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-secondary progress-bar-glow"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    <span>Goal: ₹2,50,00,000</span>
                    <span>72% Complete</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-3xl font-headline font-black mb-1">12,400</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Youth Coached</div>
                  </div>
                  <div>
                    <div className="text-3xl font-headline font-black mb-1">850+</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Clubs Donated</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-3xl overflow-hidden group"
            >
              <img
                src="https://picsum.photos/seed/charity/1000/1000"
                alt="Charity Impact"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <p className="font-headline font-bold text-2xl text-white italic mb-4 leading-tight">
                  "Golf taught me discipline. Kinetic Golf gave me the opportunity to learn it."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-headline font-black text-xs">RJ</div>
                  <div>
                    <div className="text-white font-bold text-sm">Rahul J.</div>
                    <div className="text-white/60 text-[10px] uppercase tracking-widest">Scholarship Recipient</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Green Fairways", desc: "Building sustainable golf programs in rural communities.", img: "https://picsum.photos/seed/green/600/400" },
              { title: "Sports For All", desc: "Providing elite coaching to underprivileged young athletes.", img: "https://picsum.photos/seed/sports/600/400" },
              { title: "Metro Impact", desc: "Creating urban golf sanctuaries in high-density cities.", img: "https://picsum.photos/seed/metro/600/400" }
            ].map((partner, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10 group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={partner.img}
                    alt={partner.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-headline font-black uppercase italic text-xl mb-3">{partner.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{partner.desc}</p>
                  <button className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                    Partner Details <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Membership Tiers */}
      <section id="membership" className="py-32 bg-surface relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24">
            <motion.div {...fadeInUp}>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center justify-center gap-3">
                <span className="w-12 h-[1px] bg-primary/30"></span> THE CLUBHOUSE
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tight uppercase mb-8">Membership Tiers</h2>

              <div className="inline-flex items-center p-1 bg-surface-variant rounded-full mb-12">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${billingCycle === "monthly" ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${billingCycle === "yearly" ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant'}`}
                >
                  Yearly <span className="text-primary ml-1">-20%</span>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {[
              {
                name: "The Amateur",
                price: billingCycle === "monthly" ? 2499 : 1999,
                desc: "Essential gear for the weekend warrior.",
                features: ["Premium Golf Ball Box (12pk)", "Kinetic Performance Tees", "Monthly Draw Entry", "Charity Impact Report"],
                cta: "Start Here",
                featured: false,
                cycle: billingCycle
              },
              {
                name: "The Pro",
                price: billingCycle === "monthly" ? 4999 : 3999,
                desc: "Elite equipment for the serious player.",
                features: ["Pro-V Performance Box (12pk)", "2× Kinetic Performance Polos", "3× Draw Entries", "VIP Tournament Access"],
                cta: "Go Pro Now",
                featured: true,
                cycle: billingCycle
              },
              {
                name: "The Legend",
                price: billingCycle === "monthly" ? 9999 : 7999,
                desc: "The ultimate performance ecosystem.",
                features: ["Full Performance Gear Kit", "Personalized Club Fitting", "Unlimited Draw Entries", "Private Donor Dinner"],
                cta: "Become a Legend",
                featured: false,
                cycle: billingCycle
              }
            ].map((tier, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col p-10 rounded-3xl border transition-all duration-500 ${tier.featured ? 'bg-on-surface text-surface border-on-surface scale-105 z-10 shadow-2xl' : 'bg-white text-on-surface border-outline-variant/20 hover:border-primary/30'}`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="mb-10">
                  <h3 className="font-headline font-black uppercase italic text-2xl mb-2">{tier.name}</h3>
                  <p className={`text-sm ${tier.featured ? 'text-surface/60' : 'text-on-surface-variant'}`}>{tier.desc}</p>
                </div>
                <div className="mb-10">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-headline font-black">₹{tier.price}</span>
                    <span className={`text-sm font-bold uppercase tracking-widest mb-2 ${tier.featured ? 'text-surface/40' : 'text-on-surface-variant'}`}>/{tier.cycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <div className={`h-1 w-12 mt-4 ${tier.featured ? 'bg-primary' : 'bg-primary/20'}`}></div>
                </div>
                <ul className="space-y-6 mb-12 flex-grow">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className={`w-4 h-4 ${tier.featured ? 'text-primary' : 'text-secondary'}`} />
                      {feat}
                    </li>
                  ))}
                </ul>
                {!isAdmin && (
                  <Link to="/memberships" className={`w-full py-5 rounded-full font-headline font-black uppercase tracking-widest text-xs transition-all text-center ${tier.featured ? 'bg-primary text-white hover:brightness-110 glow-primary' : 'bg-surface-variant text-on-surface hover:bg-on-surface hover:text-surface'}`}>
                    {tier.cta}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-surface relative overflow-hidden">
        <div className="absolute inset-0 kinetic-gradient opacity-5"></div>
        <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-10 leading-[0.9]">
              Start Winning &<br /><span className="text-secondary">Supporting Charity.</span>
            </h2>
            <p className="text-on-surface-variant text-xl md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed font-light">
              Join the elite community of golfers who play for something bigger than the scorecard.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to={isAdmin ? "/dashboard" : "/memberships"} className="bg-primary text-white px-16 py-6 rounded-full font-headline font-black text-xl tracking-tighter uppercase shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all glow-primary">
                {isAdmin ? "View Dashboard" : "Subscribe Now"}
              </Link>
              <button className="bg-white text-on-surface border border-outline-variant/20 px-16 py-6 rounded-full font-headline font-black text-xl tracking-tighter uppercase hover:bg-surface-variant transition-all">
                Impact Report
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-variant/30 py-24 border-t border-outline-variant/10">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="text-white w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-black italic tracking-tighter text-on-surface font-headline">
                  KINETIC GOLF
                </span>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                The premium golf subscription platform combining elite performance with radical charitable impact.
              </p>
              <div className="flex gap-4">
                {[Globe, Mail, Share2].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Platform", links: [
                  { name: "Membership", path: "#membership" },
                  { name: "Gear Shop", path: "/gear" },
                  { name: "Kinetic Index", path: "#index" },
                  { name: "Draw Rules", path: "/draw-rules" }
                ]
              },
              {
                title: "Impact", links: [
                  { name: "Charity Partners", path: "/charity-partners" },
                  { name: "Scholarships", path: "/scholarships" },
                  { name: "Annual Report", path: "/annual-report" },
                  { name: "Foundation", path: "#impact" }
                ]
              },
              {
                title: "Company", links: [
                  { name: "About Us", path: "#" },
                  { name: "Careers", path: "#" },
                  { name: "Press Kit", path: "#" },
                  { name: "Contact", path: "#" }
                ]
              }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-headline font-black uppercase tracking-widest text-xs mb-8">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link.name}>
                      {link.path.startsWith('#') ? (
                        <a href={link.path} className="text-on-surface-variant hover:text-primary text-sm transition-colors">{link.name}</a>
                      ) : (
                        <Link to={link.path} className="text-on-surface-variant hover:text-primary text-sm transition-colors">{link.name}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              © 2024 KINETIC GOLF. ALL RIGHTS RESERVED.
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">Privacy Policy</a>
              <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
