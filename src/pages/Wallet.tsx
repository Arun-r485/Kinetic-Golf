import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    Building,
    Smartphone,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    History
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getWallet, requestWithdrawal, getWithdrawalHistory } from "../services/walletService";

interface Withdrawal {
    id: string;
    amount: number;
    withdrawalMethod: 'bank' | 'upi';
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    adminNote?: string;
    createdAt: string;
}

export default function Wallet() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [totalWithdrawn, setTotalWithdrawn] = useState(0);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<'bank' | 'upi' | null>(null);
    const [error, setError] = useState("");

    // Bank details
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
    const [ifsc, setIfsc] = useState("");

    // UPI details
    const [upiId, setUpiId] = useState("");

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) return;
        fetchWalletData();
    }, [token]);

    const fetchWalletData = async () => {
        if (!token) return;
        try {
            const walletData = await getWallet(token);
            if (walletData.success) {
                setBalance(walletData.wallet.balance);
                setTotalEarned(walletData.wallet.totalEarned || 0);
                setTotalWithdrawn(walletData.wallet.totalWithdrawn || 0);
            }

            const historyData = await getWithdrawalHistory(token);
            if (historyData.success) {
                setWithdrawals(historyData.withdrawals);
            }
        } catch (err) {
            console.error("Failed to fetch wallet data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const validateStep1 = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            setError("Please enter a valid amount");
            return false;
        }
        if (val < 100) {
            setError("Minimum withdrawal amount is ₹100");
            return false;
        }
        if (val > balance) {
            setError("Insufficient balance");
            return false;
        }
        setError("");
        return true;
    };

    const handleNextStep1 = () => {
        if (validateStep1()) setStep(2);
    };

    const handleNextStep2 = () => {
        if (!method) {
            setError("Please select a withdrawal method");
            return;
        }
        setError("");
        setStep(3);
    };

    const handleSubmit = async () => {
        if (!token || !method) return;

        if (method === 'bank') {
            if (!bankName || !accountName || !accountNumber || !ifsc) {
                setError("All fields are required");
                return;
            }
            if (accountNumber !== confirmAccountNumber) {
                setError("Account numbers do not match");
                return;
            }
        } else {
            if (!upiId) {
                setError("UPI ID is required");
                return;
            }
            if (!upiId.includes('@')) {
                setError("Invalid UPI ID format");
                return;
            }
        }

        try {
            const payload = {
                amount: parseFloat(amount),
                withdrawalMethod: method,
                bankName: method === 'bank' ? bankName : undefined,
                bankAccountName: method === 'bank' ? accountName : undefined,
                bankAccountNumber: method === 'bank' ? accountNumber : undefined,
                bankIfsc: method === 'bank' ? ifsc : undefined,
                upiId: method === 'upi' ? upiId : undefined,
            };

            const res = await requestWithdrawal(token, payload);
            if (res.success) {
                setStep(4);
                fetchWalletData();
            } else {
                setError(res.message || "Failed to submit withdrawal request");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        }
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

    const filteredWithdrawals = withdrawals.filter(w => {
        const matchesStatus = statusFilter === "all" || w.status === statusFilter;
        const withdrawalDate = new Date(w.createdAt);
        const matchesStartDate = !startDate || withdrawalDate >= new Date(startDate);
        const matchesEndDate = !endDate || withdrawalDate <= new Date(endDate + "T23:59:59");
        return matchesStatus && matchesStartDate && matchesEndDate;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* SECTION A — WALLET BALANCE CARD */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden p-8 rounded-[2rem] bg-on-surface text-surface shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 opacity-60">
                        <WalletIcon size={20} />
                        <span className="font-headline font-black uppercase tracking-widest text-xs">Available Balance</span>
                    </div>
                    <div className="text-6xl font-headline font-black italic tracking-tighter mb-8">
                        ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Earned</div>
                            <div className="text-xl font-headline font-black">₹{totalEarned.toLocaleString('en-IN')}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Withdrawn</div>
                            <div className="text-xl font-headline font-black">₹{totalWithdrawn.toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    {!isWithdrawing && (
                        <button
                            onClick={() => setIsWithdrawing(true)}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all glow-primary flex items-center justify-center gap-2"
                        >
                            <ArrowUpRight size={20} />
                            Withdraw Funds
                        </button>
                    )}
                </div>
            </motion.div>

            {/* SECTION B — WITHDRAWAL FORM */}
            <AnimatePresence>
                {isWithdrawing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card rounded-[2rem] border border-outline-variant/10 overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-headline font-black text-2xl uppercase italic">Withdrawal Request</h3>
                                {step < 4 && (
                                    <button
                                        onClick={() => {
                                            setIsWithdrawing(false);
                                            setStep(1);
                                            setError("");
                                        }}
                                        className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Step 1: Enter Amount */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Amount to Withdraw</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline font-black text-2xl">₹</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-2xl py-4 pl-10 pr-4 font-headline font-black text-2xl outline-none transition-all"
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 px-1">
                                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Available: ₹{balance}</span>
                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Min: ₹100</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-xs font-bold uppercase tracking-widest">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleNextStep1}
                                        className="w-full bg-on-surface text-surface py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        Next Step
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Choose Method */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setMethod('bank')}
                                            className={`p-6 rounded-3xl border-2 transition-all text-left space-y-4 ${method === 'bank' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 hover:border-primary/50'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === 'bank' ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                                                <Building size={24} />
                                            </div>
                                            <div>
                                                <div className="font-headline font-black uppercase tracking-widest text-sm">Bank Transfer</div>
                                                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">3-5 Business Days</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setMethod('upi')}
                                            className={`p-6 rounded-3xl border-2 transition-all text-left space-y-4 ${method === 'upi' ? 'border-primary bg-primary/5' : 'border-outline-variant/10 hover:border-primary/50'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === 'upi' ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                                                <Smartphone size={24} />
                                            </div>
                                            <div>
                                                <div className="font-headline font-black uppercase tracking-widest text-sm">UPI Transfer</div>
                                                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Instant to 24 Hours</div>
                                            </div>
                                        </button>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-xs font-bold uppercase tracking-widest">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 bg-surface-variant text-on-surface-variant py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:bg-surface-variant/80 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNextStep2}
                                            className="flex-1 bg-on-surface text-surface py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all"
                                        >
                                            Next Step
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Enter Details */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    {method === 'bank' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Account Holder Name</label>
                                                <input
                                                    type="text"
                                                    value={accountName}
                                                    onChange={(e) => setAccountName(e.target.value)}
                                                    className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-xl py-3 px-4 font-bold outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Account Number</label>
                                                <input
                                                    type="text"
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value)}
                                                    className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-xl py-3 px-4 font-bold outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Confirm Account Number</label>
                                                <input
                                                    type="text"
                                                    value={confirmAccountNumber}
                                                    onChange={(e) => setConfirmAccountNumber(e.target.value)}
                                                    className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-xl py-3 px-4 font-bold outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">IFSC Code</label>
                                                <input
                                                    type="text"
                                                    value={ifsc}
                                                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                                    className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-xl py-3 px-4 font-bold outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Bank Name</label>
                                                <input
                                                    type="text"
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-xl py-3 px-4 font-bold outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">UPI ID</label>
                                            <input
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="username@bank"
                                                className="w-full bg-surface-variant/30 border-2 border-transparent focus:border-primary rounded-xl py-3 px-4 font-bold outline-none transition-all"
                                            />
                                        </div>
                                    )}

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-xs font-bold uppercase tracking-widest">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 bg-surface-variant text-on-surface-variant py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:bg-surface-variant/80 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="flex-1 bg-primary text-white py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all glow-primary"
                                        >
                                            Submit Request
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirmation */}
                            {step === 4 && (
                                <div className="text-center space-y-8 py-8">
                                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 size={40} />
                                    </div>

                                    <div>
                                        <h4 className="font-headline font-black text-3xl uppercase italic mb-2">Request Submitted</h4>
                                        <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Your balance has been deducted. Funds will be transferred within 3-5 business days.</p>
                                    </div>

                                    <div className="bg-surface-variant/30 rounded-3xl p-6 space-y-4 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Amount</span>
                                            <span className="font-headline font-black">₹{amount}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Method</span>
                                            <span className="font-headline font-black uppercase tracking-widest text-xs">{method === 'bank' ? 'Bank Transfer' : 'UPI'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Details</span>
                                            <span className="font-bold text-xs">{method === 'bank' ? accountNumber : upiId}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</span>
                                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest">Pending Approval</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="w-full bg-on-surface text-surface py-4 rounded-2xl font-headline font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SECTION C — WITHDRAWAL HISTORY TABLE */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <History className="text-primary" size={24} />
                        <h3 className="font-headline font-black text-2xl uppercase italic">Withdrawal History</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-surface-variant/30 border border-outline-variant/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-surface-variant/30 border border-outline-variant/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-surface-variant/30 border border-outline-variant/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {(statusFilter !== "all" || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setStatusFilter("all");
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="glass-card rounded-3xl border border-outline-variant/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/10">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Method</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWithdrawals.length > 0 ? (
                                    filteredWithdrawals.map((w) => (
                                        <tr key={w.id} className="border-b border-outline-variant/5 hover:bg-surface-variant/20 transition-colors">
                                            <td className="px-6 py-4 font-bold text-xs">
                                                {new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 font-headline font-black">₹{w.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-surface-variant/50">
                                                    {w.withdrawalMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getStatusColor(w.status)}`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                                                {w.adminNote || "-"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <Clock size={48} />
                                                <span className="font-headline font-black uppercase tracking-widest text-sm">No withdrawals yet</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
