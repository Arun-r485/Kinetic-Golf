import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Plus, 
  ChevronRight, 
  ArrowUpRight, 
  History,
  Target,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { api } from "../services/api";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ScoreManagement() {
  const [scores, setScores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [entryMode, setEntryMode] = useState<"quick" | "detailed">("quick");
  const [newScore, setNewScore] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    course: "", 
    score: "" 
  });
  const [holesCount, setHolesCount] = useState<9 | 18>(18);
  const [holeScores, setHoleScores] = useState<number[]>(new Array(18).fill(0));
  const [holePars, setHolePars] = useState<number[]>(new Array(18).fill(4));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateStableford = (scores: number[], pars: number[]) => {
    return scores.reduce((acc, strokes, i) => {
      if (strokes === 0) return acc;
      const par = pars[i];
      const diff = strokes - par;
      if (diff >= 2) return acc + 0;
      if (diff === 1) return acc + 1;
      if (diff === 0) return acc + 2;
      if (diff === -1) return acc + 3;
      if (diff === -2) return acc + 4;
      if (diff <= -3) return acc + 5;
      return acc;
    }, 0);
  };

  const currentStableford = entryMode === "detailed" 
    ? calculateStableford(holeScores, holePars)
    : parseInt(newScore.score) || 0;

  const fetchScores = async () => {
    try {
      setIsLoading(true);
      const data = await api.getScores();
      // Ensure we only show last 5 in UI even if backend handles it
      setScores(data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch scores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        date: newScore.date,
        course: newScore.course,
        score: entryMode === "detailed" ? holeScores.reduce((a, b) => a + b, 0) : parseInt(newScore.score) || 0,
        holes: entryMode === "detailed" ? holesCount : 18,
        holeScores: entryMode === "detailed" ? holeScores : undefined,
        holePars: entryMode === "detailed" ? holePars : undefined
      };

      if (editingId) {
        await api.updateScore(editingId, payload);
      } else {
        await api.addScore(payload);
      }

      await fetchScores();
      setIsAdding(false);
      setEditingId(null);
      setNewScore({ date: new Date().toISOString().split('T')[0], course: "", score: "" });
      setHoleScores(new Array(holesCount).fill(0));
      setHolePars(new Array(holesCount).fill(4));
    } catch (error: any) {
      console.error("Failed to save score:", error);
      let message = "Failed to save score. Please try again.";
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.message) message = parsed.message;
      } catch (e) {
        message = error.message || message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditScore = (score: any) => {
    setEditingId(score.id);
    setNewScore({
      date: new Date(score.date).toISOString().split('T')[0],
      course: score.course,
      score: score.points.toString()
    });
    if (score.holeScores && score.holePars) {
      setEntryMode("detailed");
      setHolesCount(score.holeScores.length as 9 | 18);
      setHoleScores(score.holeScores);
      setHolePars(score.holePars);
    } else {
      setEntryMode("quick");
    }
    setIsAdding(true);
  };

  const handleDeleteScore = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this score? This action cannot be undone.")) return;
    try {
      setIsSubmitting(true);
      await api.deleteScore(id);
      await fetchScores();
    } catch (error) {
      console.error("Failed to delete score:", error);
      alert("Failed to delete score.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const kineticIndex = scores.length > 0 
    ? (scores.reduce((acc, s) => acc + s.points, 0) / scores.length).toFixed(1)
    : "0.0";

  const avgScore = scores.length > 0
    ? (scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(1)
    : "0.0";

  const bestScore = scores.length > 0
    ? Math.max(...scores.map(s => s.points))
    : 0;

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline font-black text-4xl uppercase italic tracking-tight mb-2">
            Score <span className="text-gradient-red">Management</span>
          </h1>
          <p className="text-on-surface-variant font-medium">Manage your performance profile and draw eligibility.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-8 py-4 rounded-full font-headline font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all glow-primary"
        >
          <Plus size={18} />
          Add New Score
        </button>
      </motion.div>

      {/* Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-surface-variant/30 border border-outline-variant/10 flex items-start gap-4"
      >
        <AlertCircle className="text-primary w-6 h-6 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-headline font-bold uppercase italic text-sm mb-1">The "Last 5" Rule</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
            Only your most recent 5 official scores are stored. Adding a new score will automatically replace your oldest entry. This ensures your performance index is always current and fair.
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Score List */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
          ) : scores.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl border border-outline-variant/10 text-center">
              <Trophy className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
              <h3 className="font-headline font-black uppercase italic text-xl mb-2 text-on-surface-variant">No Scores Yet</h3>
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">Add your first score to start your kinetic journey.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {scores.map((score, i) => (
                <motion.div 
                  key={score.id || i}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`glass-card p-8 rounded-3xl border transition-all group relative overflow-hidden ${
                    i === 0 ? 'border-primary/40 bg-primary/5' : 'border-outline-variant/10'
                  }`}
                >
                  {i === 0 && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-lg">
                      Latest Entry
                    </div>
                  )}
                  {i === 4 && (
                    <div className="absolute top-0 right-0 bg-on-surface-variant/20 text-on-surface-variant px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-lg">
                      Oldest Entry
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-headline font-black text-xl italic ${
                        i === 0 ? 'bg-primary text-white glow-primary' : 'bg-surface-variant text-on-surface'
                      }`}>
                        {score.score}
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-xl uppercase italic mb-1">{score.course}</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(score.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Target size={12} className="text-secondary" /> Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Kinetic Points</div>
                        <div className="text-2xl font-headline font-black text-primary italic">{score.points}</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditScore(score)}
                          className="p-3 rounded-xl bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteScore(score.id)}
                          className="p-3 rounded-xl bg-surface-variant/50 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Add Score Sidebar / Stats */}
        <div className="lg:col-span-4 space-y-8">
          {isAdding ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 rounded-3xl border border-primary/30 bg-primary/5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline font-black uppercase italic text-xl">
                  {editingId ? "Edit Score Entry" : "New Score Entry"}
                </h3>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                  <button
                    onClick={() => {
                      setEntryMode("quick");
                      setError(null);
                    }}
                    className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                      entryMode === "quick" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Quick Add
                  </button>
                  <button
                    onClick={() => {
                      setEntryMode("detailed");
                      setError(null);
                    }}
                    className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                      entryMode === "detailed" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Detailed
                  </button>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-4 transition-all"
                >
                  <div className="p-2 rounded-xl bg-primary/20 text-primary">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-grow pt-1.5">
                    <div className="text-xs font-black uppercase tracking-widest text-primary mb-1">Action Required</div>
                    <div className="text-sm text-on-surface font-medium leading-relaxed">
                      {error}
                    </div>
                    {error.toLowerCase().includes("subscription") && (
                      <Link 
                        to="/settings" 
                        className="inline-flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                      >
                        Upgrade Membership <ArrowUpRight size={14} />
                      </Link>
                    )}
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <Plus className="rotate-45" size={20} />
                  </button>
                </motion.div>
              )}

              <form onSubmit={handleAddScore} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Course Name</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="text" 
                      required
                      value={newScore.course}
                      onChange={(e) => setNewScore({...newScore, course: e.target.value})}
                      placeholder="e.g. Augusta National"
                      className="w-full bg-white border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[1.3fr_0.7fr] gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={newScore.date}
                      onChange={(e) => setNewScore({...newScore, date: e.target.value})}
                      className="w-full bg-white border border-outline-variant/10 rounded-2xl py-4 px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  {entryMode === "quick" && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Stableford Pts</label>
                      <input 
                        type="number" 
                        required
                        value={newScore.score}
                        onChange={(e) => setNewScore({...newScore, score: e.target.value})}
                        placeholder="36"
                        className="w-full bg-white border border-outline-variant/10 rounded-2xl py-4 px-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  )}
                </div>

                {entryMode === "detailed" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Hole by Hole</label>
                       <div className="flex bg-black/20 p-0.5 rounded-md border border-outline-variant/10">
                          {[9, 18].map(count => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => {
                                setHolesCount(count as 9 | 18);
                                setHoleScores(new Array(count).fill(0));
                                setHolePars(new Array(count).fill(4));
                              }}
                              className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${
                                holesCount === count ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              {count} Holes
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className={`grid ${holesCount === 9 ? 'grid-cols-3' : 'grid-cols-6'} gap-2`}>
                      {holeScores.map((score, i) => (
                        <div key={i} className="space-y-1">
                          <label className="block text-[8px] font-black text-on-surface-variant text-center uppercase">H{i + 1}</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={score || ""}
                            onChange={(e) => {
                              const newHoles = [...holeScores];
                              newHoles[i] = parseInt(e.target.value) || 0;
                              setHoleScores(newHoles);
                            }}
                            className="w-full bg-white border border-outline-variant/10 rounded-lg py-2 text-center text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Stableford: {currentStableford} Pts</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Strokes: {holeScores.reduce((a, b) => a + b, 0)}</span>
                    </div>
                  </div>
                )}

                {scores.length >= 5 && (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                    <AlertCircle className="text-primary w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] font-bold text-primary leading-relaxed uppercase tracking-widest">
                      This will replace your oldest score from {new Date(scores[4].date).toLocaleDateString()} at {scores[4].course}.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                    }}
                    className="flex-grow py-4 rounded-2xl border border-outline-variant/20 font-headline font-black uppercase tracking-widest text-xs hover:bg-surface-variant transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow py-4 rounded-2xl bg-primary text-white font-headline font-black uppercase tracking-widest text-xs hover:brightness-110 glow-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? "Update Entry" : "Confirm Entry"}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 rounded-3xl border border-outline-variant/10 bg-surface-variant/10"
            >
              <h3 className="font-headline font-black uppercase italic text-xl mb-8">Performance Summary</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Kinetic Index</div>
                    <div className="text-3xl font-headline font-black text-on-surface italic">{kineticIndex}</div>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(parseFloat(kineticIndex) * 2, 100)}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-white border border-outline-variant/10">
                    <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Avg Score</div>
                    <div className="text-xl font-headline font-black">{avgScore}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-outline-variant/10">
                    <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Best Kinetic</div>
                    <div className="text-xl font-headline font-black text-secondary">{bestScore}</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/10">
                  <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant mb-4">
                    <Trophy size={16} className="text-secondary" />
                    <span>Eligible for Next Draw</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase tracking-widest font-bold">
                    {scores.length > 0 
                      ? "Your performance profile is active. You are automatically entered into the next monthly draw."
                      : "Add at least one score to become eligible for the next monthly draw."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
