/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Zap,
  Check,
  Loader2,
  Heart,
  Coins,
  Package
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Checkout() {
  const { user, isAuthenticated, refreshUser, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    pincode: ""
  });
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: ""
  });
  const [saveCard, setSaveCard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");

  // Mock selected plan from state or default
  const selectedPlan = location.state?.plan || {
    name: "The Pro",
    price: 3999,
    cycle: "yearly",
    features: [
      "Pro-V Performance Box (12pk)",
      "2× Kinetic Performance Polos",
      "3× Draw Entries",
      "VIP Tournament Access"
    ]
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout", plan: selectedPlan } });
    }

    if (user) {
      setFormData({
        name: user.name || user.displayName || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        state: (user as any).state || "",
        pincode: (user as any).pincode || ""
      });
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isAuthenticated, navigate, selectedPlan]);

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + " / " + value.substring(2, 4);
    }
    setCardDetails({ ...cardDetails, expiry: value.substring(0, 7) });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsPreparing(true);
    setError(null);

    try {
      // 1. Update Profile if user wants to save details (or just always update to keep it persistent)
      await api.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        pincode: formData.pincode
      });

      // 2. Create Order on Backend
      const amount = Math.round(selectedPlan.price * 1.18); // Including tax
      const order = await api.createOrder(amount, selectedPlan.cycle);

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "Kinetic Golf Club",
        description: `Subscription for ${selectedPlan.name}`,
        order_id: order.id,
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            setIsPreparing(false);
          }
        },
        handler: async (response: any) => {
          try {
            setIsPreparing(false);
            setIsLoading(true);
            // 3. Verify Payment on Backend
            const data = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan.cycle
            });

            // 4. Use fresh user from verify-payment response
            const token = localStorage.getItem('token');
            if (data.success && token) {
              login(token, data.user);
              setIsSuccess(true);
              setTimeout(() => {
                navigate("/dashboard");
              }, 4000);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err: any) {
            setError("Payment verification failed. Please contact support.");
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#00FF00",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || "Payment failed. Please try again.");
        setIsLoading(false);
        setIsPreparing(false);
      });

      // Small delay to show the "Preparing" state for smoothness
      setTimeout(() => {
        rzp.open();
        setIsPreparing(false);
      }, 1500);
    } catch (err: any) {
      setError("Failed to initialize payment. Please try again.");
      console.error(err);
      setIsLoading(false);
      setIsPreparing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 rounded-3xl border border-outline-variant/10 text-center max-w-md w-full relative"
        >
          {/* Money into Box Animation */}
          <div className="relative h-40 w-full mb-8 flex items-center justify-center">
            {/* The Box */}
            <motion.div
              initial={{ y: 20 }}
              animate={{
                y: [20, 25, 20],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 0.5,
                repeat: 5,
                repeatType: "reverse"
              }}
              className="absolute bottom-0 z-10 text-primary"
            >
              <Package size={80} strokeWidth={1.5} />
            </motion.div>

            {/* Falling Coins */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: (i - 2.5) * 20, opacity: 0, scale: 0.5 }}
                animate={{
                  y: 20,
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.8],
                  rotate: 360
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.2,
                  repeat: 2,
                  ease: "easeIn"
                }}
                className="absolute text-secondary"
              >
                <Coins size={24} fill="currentColor" />
              </motion.div>
            ))}

            {/* Success Glow */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute bottom-4 w-32 h-32 bg-primary rounded-full blur-3xl"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-headline font-black text-3xl uppercase italic mb-4">Transaction Complete!</h2>
            <p className="text-on-surface-variant mb-8">Your payment was successful. Welcome to the elite tier of Kinetic Golf.</p>

            <div className="flex items-center justify-center gap-2 text-primary font-headline font-bold uppercase tracking-widest text-[10px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              Finalizing your account...
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-6xl">
        {isPreparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-surface/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full"
              />
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
            </div>
            <h3 className="mt-8 font-headline font-black uppercase italic text-2xl tracking-tight">Preparing Secure Gateway</h3>
            <p className="mt-2 text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Connecting to Razorpay...</p>
          </motion.div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface mb-8 transition-colors font-headline font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} />
          Back to Plans
        </button>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div {...fadeInUp} className="glass-card p-8 md:p-10 rounded-3xl border border-outline-variant/10">
              <h2 className="font-headline font-black text-2xl uppercase italic mb-8">Billing Information</h2>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Billing Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                    placeholder="123 Golf Lane, Club House"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">State / Province</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                      placeholder="California"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Pincode / ZIP</label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                      placeholder="90210"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="font-headline font-black text-xl uppercase italic mb-6 flex items-center gap-2">
                    <CreditCard size={20} className="text-primary" />
                    Payment Method
                  </h3>

                  {error && (
                    <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-bold uppercase tracking-widest">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer relative ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-outline-variant/10 bg-surface-variant/5"}`}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest">Credit or Debit Card</span>
                        <div className="flex gap-2">
                          <div className="w-8 h-5 bg-on-surface/10 rounded"></div>
                          <div className="w-8 h-5 bg-on-surface/10 rounded"></div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="text"
                            required={paymentMethod === "card"}
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, "").substring(0, 16) })}
                            className="w-full bg-white border border-outline-variant/20 rounded-xl px-12 py-4 focus:outline-none focus:border-primary transition-all font-mono"
                            placeholder="0000 0000 0000 0000"
                          />
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            required={paymentMethod === "card"}
                            value={cardDetails.expiry}
                            onChange={handleExpiryChange}
                            className="w-full bg-white border border-outline-variant/20 rounded-xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-mono"
                            placeholder="MM / YY"
                          />
                          <input
                            type="text"
                            required={paymentMethod === "card"}
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "").substring(0, 3) })}
                            className="w-full bg-white border border-outline-variant/20 rounded-xl px-6 py-4 focus:outline-none focus:border-primary transition-all font-mono"
                            placeholder="CVC"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="checkbox"
                            id="saveCard"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="w-4 h-4 rounded border-outline-variant/20 text-primary focus:ring-primary"
                          />
                          <label htmlFor="saveCard" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant cursor-pointer">
                            Save card details for future payments
                          </label>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-outline-variant/10 bg-surface-variant/5"}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest">UPI / Net Banking</span>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">Fastest</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-lg hover:brightness-110 active:scale-[0.98] transition-all glow-primary shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay & Activate Subscription
                        <Zap size={20} className="fill-current" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                    <ShieldCheck size={12} className="text-secondary" />
                    Secure 256-bit SSL Encrypted Payment
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 space-y-6"
            >
              <div className="glass-card p-8 rounded-3xl border border-outline-variant/10">
                <h3 className="font-headline font-black text-xl uppercase italic mb-6">Order Summary</h3>

                <div className="p-6 rounded-2xl bg-on-surface text-surface mb-8">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-headline font-black uppercase italic text-lg">{selectedPlan.name}</h4>
                    <div className="text-primary font-headline font-black text-xl">₹{selectedPlan.price}</div>
                  </div>
                  <p className="text-surface/60 text-xs mb-6 uppercase tracking-widest">Billed {selectedPlan.cycle}</p>

                  <ul className="space-y-3">
                    {selectedPlan.features.map((feat: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-surface/80">
                        <Check size={12} className="text-primary" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span>₹{selectedPlan.price}.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-on-surface-variant">Tax (GST 18%)</span>
                    <span>₹{(selectedPlan.price * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="h-[1px] bg-outline-variant/10"></div>
                  <div className="flex justify-between text-xl font-headline font-black uppercase italic">
                    <span>Total</span>
                    <span className="text-primary">₹{(selectedPlan.price * 1.18).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-variant/30 border border-outline-variant/5">
                    <Zap className="text-primary w-5 h-5 mt-0.5" />
                    <p className="text-[10px] font-bold text-on-surface-variant leading-relaxed uppercase tracking-widest">
                      Instant access to score entry and monthly draw participation upon payment.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-variant/30 border border-outline-variant/5">
                    <Heart className="text-secondary w-5 h-5 mt-0.5" />
                    <p className="text-[10px] font-bold text-on-surface-variant leading-relaxed uppercase tracking-widest">
                      A portion of this payment directly funds youth golf scholarships.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
