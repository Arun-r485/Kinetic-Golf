import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-on-surface font-headline">
              KINETIC GOLF
            </span>
          </Link>
          <h1 className="font-headline font-black text-4xl uppercase italic tracking-tight mb-2">Welcome Back</h1>
          <p className="text-on-surface-variant">Login to your performance command center.</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-outline-variant/10 shadow-2xl bg-white/80 backdrop-blur-xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 text-primary text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Password</label>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all glow-primary shadow-xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>


          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-on-surface hover:text-primary transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Locked Preview Teaser */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-variant/50 border border-outline-variant/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            <Lock className="w-3 h-3" />
            Subscribe to Unlock Full Access
          </div>
        </div>
      </motion.div>
    </div>
  );
}
