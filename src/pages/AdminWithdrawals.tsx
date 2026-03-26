import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    Filter,
    Search,
    AlertCircle,
    MoreVertical,
    Banknote,
    Smartphone,
    Building
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
    getAdminWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    markPaidWithdrawal
} from "../services/walletService";

interface Withdrawal {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    amount: number;
    withdrawalMethod: 'bank' | 'upi';
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    adminNote?: string;
    createdAt: string;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    upiId?: string;
}

export default function AdminWithdrawals() {
    const { user } = useAuth();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'paid'>('all');
    const [searchQuery, setSearchQuery] = useState("");
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return;
        fetchWithdrawals();
    }, [token]);

    const fetchWithdrawals = async () => {
        if (!token) return;
        try {
            const data = await getAdminWithdrawals(token);
            if (data.success) {
                setWithdrawals(data.withdrawals);
            }
        } catch (err) {
            console.error("Failed to fetch withdrawals:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!token) return;
        try {
            const res = await approveWithdrawal(token, id);
            if (res.success) {
                fetchWithdrawals();
            }
        } catch (err) {
            console.error("Failed to approve withdrawal:", err);
        }
    };

    const handleReject = async () => {
        if (!token || !rejectingId || !adminNote) return;
        setIsSubmitting(true);
        try {
            const res = await rejectWithdrawal(token, rejectingId, adminNote);
            if (res.success) {
                setRejectingId(null);
                setAdminNote("");
                fetchWithdrawals();
            }
        } catch (err) {
            console.error("Failed to reject withdrawal:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkPaid = async (id: string) => {
        if (!token) return;
        try {
            const res = await markPaidWithdrawal(token, id);
            if (res.success) {
                fetchWithdrawals();
            }
        } catch (err) {
            console.error("Failed to mark withdrawal as paid:", err);
        }
    };

    const filteredWithdrawals = withdrawals.filter(w => {
        const matchesTab = activeTab === 'all' || w.status === activeTab;
        const matchesSearch = w.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const stats = {
        pending: withdrawals.filter(w => w.status === 'pending').length,
        approved: withdrawals.filter(w => w.status === 'approved').reduce((acc, w) => acc + w.amount, 0),
        paid: withdrawals.filter(w => w.status === 'paid').reduce((acc, w) => acc + w.amount, 0),
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 bg-yellow-500/10';
            case 'approved': return 'text-blue-500 bg-blue-500/10';
            case 'rejected': return 'text-red-500 bg-red-500/10';
            case 'paid': return 'text-green-500 bg-green-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* SECTION A — STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-3xl border border-outline-variant/10"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Pending Requests</div>
                            <div className="text-2xl font-headline font-black italic">{stats.pending}</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 rounded-3xl border border-outline-variant/10"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Approved Amount</div>
                            <div className="text-2xl font-headline font-black italic">₹{stats.approved.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 rounded-3xl border border-outline-variant/10"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Total Paid</div>
                            <div className="text-2xl font-headline font-black italic">₹{stats.paid.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* SECTION B — FILTER TABS & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex bg-surface-variant/30 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
                    {['all', 'pending', 'approved', 'rejected', 'paid'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2 rounded-xl font-headline font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap ${activeTab === tab
                                    ? "bg-on-surface text-surface shadow-lg"
                                    : "text-on-surface-variant hover:text-on-surface"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input
                        type="text"
                        placeholder="Search users or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-2xl py-3 pl-12 pr-4 font-bold text-xs outline-none transition-all"
                    />
                </div>
            </div>

            {/* SECTION C — WITHDRAWALS TABLE */}
            <div className="glass-card rounded-[2rem] border border-outline-variant/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant/10">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">User</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Method</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Details</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWithdrawals.length > 0 ? (
                                filteredWithdrawals.map((w) => (
                                    <tr key={w.id} className="border-b border-outline-variant/5 hover:bg-surface-variant/20 transition-colors">
                                        <td className="px-6 py-4 font-bold text-xs">
                                            {new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-headline font-black uppercase tracking-widest text-[10px]">{w.userName}</div>
                                            <div className="text-[8px] text-on-surface-variant font-bold truncate max-w-[120px]">{w.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 font-headline font-black">₹{w.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {w.withdrawalMethod === 'bank' ? <Building size={14} /> : <Smartphone size={14} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{w.withdrawalMethod}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] font-bold text-on-surface-variant leading-tight">
                                                {w.withdrawalMethod === 'bank' ? (
                                                    <>
                                                        <div>{w.bankName}</div>
                                                        <div>{w.bankAccountNumber}</div>
                                                        <div>{w.bankIfsc}</div>
                                                    </>
                                                ) : (
                                                    <div>{w.upiId}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(w.status)}`}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {w.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(w.id)}
                                                            className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectingId(w.id)}
                                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {w.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(w.id)}
                                                        className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all font-headline font-black uppercase tracking-widest text-[10px]"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <Filter size={48} />
                                            <span className="font-headline font-black uppercase tracking-widest text-sm">No requests found</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            <AnimatePresence>
                {rejectingId && (
                    <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl"
                        >
                            <h3 className="font-headline font-black text-2xl uppercase italic mb-6">Reject Withdrawal</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Reason for Rejection</label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Enter reason for rejection..."
                                        className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-2xl py-4 px-4 font-bold text-sm outline-none transition-all h-32 resize-none"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setRejectingId(null);
                                            setAdminNote("");
                                        }}
                                        className="flex-1 bg-surface-variant text-on-surface-variant py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:bg-surface-variant/80 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={!adminNote || isSubmitting}
                                        className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
