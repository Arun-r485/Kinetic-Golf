import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Heart, 
  Globe, 
  Users, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function CharitySelection() {
  const { user } = useAuth();
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [charities, setCharities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const data = await api.getCharities();
        setCharities(data);
        if (user?.charityId) {
          setSelectedCharity(String(user.charityId));
        }
      } catch (error) {
        console.error("Failed to fetch charities:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCharities();
  }, [user]);

  const handleSelectCharity = async (charityId: string) => {
    try {
      setIsSelecting(true);
      await api.selectCharity({ charityId });
      setSelectedCharity(charityId);
      alert("Charity partner updated successfully!");
    } catch (error) {
      console.error("Failed to select charity:", error);
      alert("Failed to update charity partner. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  };

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div {...fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline font-black text-4xl uppercase italic tracking-tight mb-2">
            Charity <span className="text-gradient-red">Selection</span>
          </h1>
          <p className="text-on-surface-variant font-medium">Choose where your subscription impact goes.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search charities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant/10 rounded-full py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-3 rounded-full bg-white border border-outline-variant/10 text-on-surface-variant hover:text-on-surface transition-all">
            <Filter size={20} />
          </button>
        </div>
      </motion.div>

      {/* Impact Overview */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden p-10 rounded-3xl bg-on-surface text-surface shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 grid md:grid-cols-3 gap-12 items-center">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3 fill-current" />
              Your Personal Impact
            </div>
            <h2 className="font-headline font-black text-4xl md:text-5xl uppercase italic mb-6 leading-tight">
              Every swing you track <br/>helps build the <span className="text-primary">future</span> of the game.
            </h2>
            <p className="text-surface/60 max-w-xl text-lg font-light leading-relaxed">
              50% of your monthly subscription profit is directly donated to your selected partner. Join thousands of golfers making a difference.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-widest text-surface/40 mb-2">Total Platform Impact</div>
              <div className="text-3xl font-headline font-black text-primary">$1.2M+</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-black uppercase tracking-widest text-surface/40 mb-2">Athletes Supported</div>
              <div className="text-3xl font-headline font-black text-secondary">25,000+</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charity Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {filteredCharities.map((charity, i) => (
          <motion.div 
            key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`glass-card rounded-3xl overflow-hidden border transition-all duration-500 group relative ${
              selectedCharity === charity.id ? 'border-primary/40 ring-2 ring-primary/10' : 'border-outline-variant/10 hover:border-primary/20'
            }`}
          >
            {selectedCharity === charity.id && (
              <div className="absolute top-6 right-6 z-20 bg-primary text-white p-2 rounded-full shadow-lg glow-primary">
                <CheckCircle2 size={20} />
              </div>
            )}

            <div className="h-64 relative overflow-hidden">
              <img 
                src={charity.image || `https://picsum.photos/seed/${charity.name}/800/600`} 
                alt={charity.name} 
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${selectedCharity === charity.id ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-8">
                <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">{charity.category || "Youth Development"}</div>
                <h3 className="font-headline font-black text-3xl text-white uppercase italic">{charity.name}</h3>
              </div>
            </div>

            <div className="p-8">
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8 h-12 overflow-hidden line-clamp-2">
                {charity.description}
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Total Raised</div>
                  <div className="text-xl font-headline font-black">${charity.totalDonations?.toLocaleString() || "0"}</div>
                </div>
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Impact Status</div>
                  <div className="text-xl font-headline font-black text-secondary">Active</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-outline-variant/10">
                <div className="flex items-center gap-2 text-primary">
                  <Heart size={16} className="fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Community Partner</span>
                </div>
                {selectedCharity === charity.id ? (
                  <div className="text-secondary font-headline font-black uppercase tracking-widest text-[10px] italic">Active Partner</div>
                ) : (
                  <button 
                    onClick={() => handleSelectCharity(charity.id)}
                    disabled={isSelecting}
                    className="bg-on-surface text-surface px-6 py-3 rounded-full font-headline font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSelecting && <Loader2 className="w-3 h-3 animate-spin" />}
                    Select Partner
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="inline-flex items-center gap-3 text-on-surface-variant text-xs font-medium">
          <Info size={16} className="text-primary" />
          <span>You can change your charity partner once per billing cycle.</span>
        </div>
      </motion.div>
    </div>
  );
}
