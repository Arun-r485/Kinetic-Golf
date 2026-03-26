import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  ShieldCheck,
  Loader2,
  Camera
} from "lucide-react";
import { api } from "../services/api";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function WinnerVerification() {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getWinnerStatus();
        // For now, just show the most recent pending or verified win
        const latestWin = data.sort((a: any, b: any) => 
          new Date(b.drawId?.date || 0).getTime() - new Date(a.drawId?.date || 0).getTime()
        )[0];
        setStatus(latestWin);
      } catch (error) {
        console.error("Failed to fetch winner status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) return;

    try {
      setIsUploading(true);
      await api.uploadProof({
        drawId: status?.drawId?.id || status?.drawId || "current",
        matchType: status?.matchType || 3,
        proofUrl
      });
      alert("Proof uploaded successfully! Our team will verify it shortly.");
      // Refresh status
      const data = await api.getWinnerStatus();
      const latestWin = data.sort((a: any, b: any) => 
        new Date(b.drawId?.date || 0).getTime() - new Date(a.drawId?.date || 0).getTime()
      )[0];
      setStatus(latestWin);
    } catch (error) {
      console.error("Failed to upload proof:", error);
      alert("Failed to upload proof. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <motion.div {...fadeInUp} className="text-center">
        <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-6">
          <Trophy size={48} className="glow-primary" />
        </div>
        <h1 className="font-headline font-black text-4xl md:text-5xl uppercase italic tracking-tight mb-4">
          Winner <span className="text-gradient-red">Verification</span>
        </h1>
        <p className="text-on-surface-variant font-medium max-w-xl mx-auto">
          Congratulations on your performance! Follow the steps below to verify your win and claim your prize.
        </p>
      </motion.div>

      {!status ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-[40px] border border-outline-variant/10 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-surface-variant/30 flex items-center justify-center mx-auto mb-8">
            <Clock className="text-on-surface-variant w-10 h-10" />
          </div>
          <h3 className="font-headline font-black uppercase italic text-2xl mb-4 text-on-surface">No Pending Wins</h3>
          <p className="text-on-surface-variant font-bold uppercase tracking-widest text-sm max-w-md mx-auto leading-relaxed">
            You don't have any pending wins to verify at the moment. Keep tracking your scores to enter the next draw!
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Status Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-[40px] border border-primary/20 bg-primary/5"
          >
            <h3 className="font-headline font-black uppercase italic text-xl mb-8">Win Summary</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Draw Date</span>
                <span className="text-sm font-bold">
                  {status.drawId?.date ? new Date(status.drawId.date).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Match Type</span>
                <span className="text-sm font-bold uppercase text-primary italic">
                  {status.matchType === 5 ? "Jackpot" : status.matchType === 4 ? "Major Prize" : "Minor Prize"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Verification Status</span>
                <div className="flex items-center gap-2">
                  {status.status === 'pending' ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-1">
                      <Clock size={12} /> Pending
                    </span>
                  ) : status.status === 'verified' ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 rounded-3xl bg-on-surface text-surface">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-primary" />
                <h4 className="font-headline font-bold uppercase italic text-sm">Security Note</h4>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
                All wins are manually verified by our compliance team. Verification typically takes 24-48 hours.
              </p>
            </div>
          </motion.div>

          {/* Upload Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-[40px] border border-outline-variant/10"
          >
            <h3 className="font-headline font-black uppercase italic text-xl mb-8">Upload Proof</h3>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-4">
                <div className="p-8 border-2 border-dashed border-outline-variant/20 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-primary/40 transition-all cursor-pointer bg-surface-variant/10">
                  <Camera className="w-12 h-12 text-on-surface-variant/40 mb-4 group-hover:text-primary transition-colors" />
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Upload Scorecard Photo</p>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-40">JPG, PNG up to 5MB</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Proof URL (Alternative)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="url" 
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://example.com/scorecard.jpg"
                      className="w-full bg-white border border-outline-variant/10 rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isUploading || status.status === 'verified'}
                className="w-full py-5 rounded-2xl bg-primary text-white font-headline font-black uppercase tracking-widest text-xs hover:brightness-110 glow-primary transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload size={18} />}
                Submit for Verification
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
