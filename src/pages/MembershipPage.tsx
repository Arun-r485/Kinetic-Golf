import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, Zap, Trophy, Heart, ShieldCheck } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

export default function MembershipPage() {
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin';

    const tiers = [
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
    ];

    const handleSelectPlan = (tier: any) => {
        navigate("/checkout", { state: { plan: tier } });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-surface py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-24">
                        <motion.div {...fadeInUp}>
                            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center justify-center gap-3">
                                <span className="w-12 h-[1px] bg-primary/30"></span> THE CLUBHOUSE
                            </div>
                            <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tight uppercase mb-8">
                                {isAdmin ? "Administrator Access" : "Choose Your Tier"}
                            </h1>
                            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-12 font-light">
                                {isAdmin
                                    ? "As an administrator, you have full access to all platform features and elite gear drops without requiring a subscription plan."
                                    : "Select the membership that matches your game. Every tier includes elite gear and direct charitable impact."
                                }
                            </p>

                            {!isAdmin && (
                                <div className="inline-flex items-center p-1 bg-surface-variant/30 rounded-full mb-12 border border-outline-variant/10">
                                    <button
                                        onClick={() => setBillingCycle("monthly")}
                                        className={`px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${billingCycle === "monthly" ? 'bg-white text-on-surface shadow-md' : 'text-on-surface-variant'}`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle("yearly")}
                                        className={`px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${billingCycle === "yearly" ? 'bg-white text-on-surface shadow-md' : 'text-on-surface-variant'}`}
                                    >
                                        Yearly <span className="text-primary ml-1">-20%</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {!isAdmin && (
                        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-32">
                            {tiers.map((tier, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative flex flex-col p-10 rounded-[40px] border transition-all duration-500 ${tier.featured ? 'bg-on-surface text-surface border-on-surface scale-105 z-10 shadow-2xl' : 'bg-white text-on-surface border-outline-variant/20 hover:border-primary/30 shadow-xl shadow-black/5'}`}
                                >
                                    {tier.featured && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30">
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
                                    <button
                                        onClick={() => handleSelectPlan(tier)}
                                        className={`w-full py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-xs transition-all text-center ${tier.featured ? 'bg-primary text-white hover:brightness-110 glow-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface hover:bg-on-surface hover:text-surface shadow-sm'}`}
                                    >
                                        {tier.cta}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="grid md:grid-cols-4 gap-8 border-t border-outline-variant/10 pt-20">
                        {[
                            { icon: Zap, title: "Instant Access", desc: "Unlock your dashboard immediately after payment." },
                            { icon: ShieldCheck, title: "Secure Payment", desc: "256-bit SSL encrypted transactions via Razorpay." },
                            { icon: Heart, title: "Direct Impact", desc: "A portion of every tier funds youth golf scholarships." },
                            { icon: Trophy, title: "Elite Rewards", desc: "Access to monthly draws and premium gear drops." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 bg-surface-variant/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="font-headline font-black uppercase italic text-sm mb-2">{item.title}</h4>
                                <p className="text-on-surface-variant text-[10px] leading-relaxed uppercase tracking-widest font-bold">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
