import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Shield,
    CreditCard,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Loader2,
    Banknote,
    Smartphone,
    X,
    History,
    Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

type SettingsTab = 'security' | 'subscription';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('security');
    const { user, isSubscribed, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [billingHistory, setBillingHistory] = useState<any[]>([]);
    const [showBillingHistory, setShowBillingHistory] = useState(false);
    const [showUpdatePayment, setShowUpdatePayment] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Security State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");



    useEffect(() => {
        const fetchData = async () => {
            try {
                const historyData = await api.getBillingHistory().catch(() => []);
                setBillingHistory(historyData);
            } catch (err) {
                console.error("Failed to fetch settings data:", err);
            }
        };
        fetchData();
    }, []);



    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // Mock password update
            await api.updateProfile({ currentPassword, newPassword });
            setMessage({ type: 'success', text: "Security settings updated successfully." });
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to update security settings." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        setIsLoading(true);
        try {
            await api.cancelSubscription();
            setMessage({ type: 'success', text: "Subscription cancelled successfully." });
            setShowCancelModal(false);
            refreshUser();
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to cancel subscription." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.updatePaymentMethod({});
            setMessage({ type: 'success', text: "Payment method updated successfully." });
            setShowUpdatePayment(false);
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to update payment method." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-2">
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-headline font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'security'
                                ? "bg-primary text-white glow-primary"
                                : "text-on-surface-variant hover:bg-surface-variant/50"
                            }`}
                    >
                        <Shield size={18} />
                        Security
                    </button>
                    {user?.role !== 'admin' && (
                        <button
                            onClick={() => setActiveTab('subscription')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-headline font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'subscription'
                                    ? "bg-primary text-white glow-primary"
                                    : "text-on-surface-variant hover:bg-surface-variant/50"
                                }`}
                        >
                            <CreditCard size={18} />
                            Subscription
                        </button>
                    )}

                </div>

                {/* Content Area */}
                <div className="flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="glass-card p-8 rounded-3xl border border-outline-variant/10 bg-white/50 backdrop-blur-sm"
                        >
                            {message && (
                                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <span className="text-sm font-bold uppercase tracking-widest">{message.text}</span>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-headline font-black text-2xl uppercase italic mb-2">Security Settings</h3>
                                        <p className="text-on-surface-variant text-sm">Manage your account security and password.</p>
                                    </div>

                                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-primary text-white px-8 py-3 rounded-2xl font-headline font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all glow-primary disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Update Password"}
                                        </button>
                                    </form>

                                    <div className="pt-6 border-t border-outline-variant/10">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-variant/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Smartphone size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black uppercase tracking-widest">Two-Factor Authentication</div>
                                                    <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Add an extra layer of security</div>
                                                </div>
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Enable</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'subscription' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-headline font-black text-2xl uppercase italic mb-2">Subscription Management</h3>
                                        <p className="text-on-surface-variant text-sm">View and manage your current membership plan.</p>
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden shadow-xl shadow-primary/20">
                                        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 translate-x-1/4 -translate-y-1/4">
                                            <CreditCard size={200} />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Membership Status</div>
                                                    <div className="text-4xl font-headline font-black uppercase italic leading-none">
                                                        {user?.plan?.name || (isSubscribed ? "Kinetic Pro" : "Free Tier")}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-secondary animate-pulse' : 'bg-white/40'}`} />
                                                        {isSubscribed ? "Active Subscription" : "No Active Plan"}
                                                    </div>
                                                    {isSubscribed && (
                                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                            Renews: April 25, 2026
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {!isSubscribed && (
                                                <button className="bg-white text-primary px-8 py-3 rounded-2xl font-headline font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg">
                                                    Upgrade Now
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setShowUpdatePayment(true)}
                                            className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/10 hover:bg-surface-variant/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CreditCard size={18} className="text-on-surface-variant" />
                                                <span className="text-xs font-black uppercase tracking-widest">Update Payment Method</span>
                                            </div>
                                            <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => setShowBillingHistory(true)}
                                            className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant/10 hover:bg-surface-variant/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Banknote size={18} className="text-on-surface-variant" />
                                                <span className="text-xs font-black uppercase tracking-widest">Billing History</span>
                                            </div>
                                            <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>

                                    {isSubscribed && (
                                        <div className="pt-8 border-t border-outline-variant/10">
                                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="space-y-1 text-center md:text-left">
                                                    <h4 className="font-headline font-black uppercase italic text-primary">Danger Zone</h4>
                                                    <p className="text-on-surface-variant text-xs">Cancel your subscription and lose access to exclusive benefits.</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowCancelModal(true)}
                                                    disabled={isLoading}
                                                    className="px-6 py-3 rounded-2xl border border-primary/20 text-primary font-headline font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all flex items-center gap-2 group"
                                                >
                                                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                                    Cancel Membership
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}


                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Billing History Modal */}
            <AnimatePresence>
                {showBillingHistory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBillingHistory(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl glass-card rounded-3xl border border-outline-variant/10 bg-surface overflow-hidden"
                        >
                            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-variant/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-black uppercase italic text-xl">Billing History</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Your recent transactions</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowBillingHistory(false)} className="p-3 hover:bg-surface-variant/50 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 max-h-[60vh] overflow-y-auto">
                                {billingHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {billingHistory.map((bill, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] border border-outline-variant/10 hover:bg-surface-variant/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-surface-variant/30 flex items-center justify-center">
                                                        <Banknote size={18} className="text-on-surface-variant" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black uppercase italic">{new Date(bill.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Membership Renewal</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-primary">₹{bill.amount.toLocaleString()}</div>
                                                    <div className="text-[8px] font-black uppercase tracking-widest text-secondary">{bill.status}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-surface-variant/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Banknote size={32} className="text-on-surface-variant/30" />
                                        </div>
                                        <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs">No transactions found yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Update Payment Modal */}
            <AnimatePresence>
                {showUpdatePayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUpdatePayment(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md glass-card rounded-3xl border border-outline-variant/10 bg-surface overflow-hidden"
                        >
                            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-variant/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-black uppercase italic text-xl">Update Payment</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Securely update your card</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowUpdatePayment(false)} className="p-3 hover:bg-surface-variant/50 rounded-2xl transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdatePayment} className="p-8 space-y-8">
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-on-surface to-on-surface/80 text-surface relative overflow-hidden shadow-xl">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <CreditCard size={100} />
                                    </div>
                                    <div className="relative z-10 space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-8 bg-surface/20 rounded-md backdrop-blur-sm" />
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Kinetic Card</div>
                                        </div>
                                        <div className="text-xl font-mono tracking-[0.2em]">•••• •••• •••• ••••</div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Card Holder</div>
                                                <div className="text-xs font-black uppercase tracking-widest">{user?.name || "Your Name"}</div>
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">MM/YY</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Card Number</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Expiry Date</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="MM/YY"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">CVV</label>
                                            <input
                                                type="password"
                                                required
                                                maxLength={3}
                                                className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="•••"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all glow-primary disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Update Payment Method"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Cancel Subscription Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCancelModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="relative w-full max-w-lg glass-card rounded-[2.5rem] border border-primary/20 bg-surface overflow-hidden shadow-2xl shadow-primary/20"
                        >
                            <div className="p-10 text-center space-y-8">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle size={40} className="text-primary animate-pulse" />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-headline font-black uppercase italic text-3xl leading-none">Wait! Don't Go Just Yet</h3>
                                    <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm mx-auto">
                                        By cancelling your <span className="text-primary font-black uppercase italic">Kinetic Pro</span> membership, you'll lose access to:
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-left">
                                    {[
                                        "Exclusive High-Stakes Weekly Draws",
                                        "Real-Time Draw Notifications & Alerts",
                                        "Premium Charity Selection Rights",
                                        "Advanced Performance Analytics Dashboard"
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-variant/30 border border-outline-variant/5">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                                <X size={10} className="text-primary" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 space-y-4">
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={isLoading}
                                        className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:brightness-110 transition-all glow-primary disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Yes, Cancel My Membership"}
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                                    >
                                        Actually, I'll Stay
                                    </button>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-4 text-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                                    Your benefits will remain active until the end of this billing cycle
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
