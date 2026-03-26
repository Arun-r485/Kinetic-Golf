import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { ShieldCheck, Info, CheckCircle2, AlertCircle } from 'lucide-react';

const DrawRulesPage = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-surface pt-20 pb-32">
                <div className="container mx-auto px-6 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20 text-center"
                    >
                        <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center justify-center gap-3">
                            <span className="w-12 h-[1px] bg-primary/30"></span> THE WINNING MECHANISM
                        </div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                            Draw<br /><span className="text-secondary italic">Rules & Integrity.</span>
                        </h1>
                        <p className="text-on-surface-variant text-xl leading-relaxed font-light mx-auto max-w-2xl">
                            Transparency and fairness are the foundation of Kinetic Golf. Understand how our draw system works and how we ensure a level playing field.
                        </p>
                    </motion.div>

                    <div className="space-y-16">
                        <section className="p-12 rounded-[40px] bg-surface-variant/10 border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Info className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="font-headline text-3xl font-black uppercase italic">The Kinetic Index</h2>
                            </div>
                            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                                Your entry into the monthly draw is based on your "Kinetic Index" — a unique 5-digit number derived from your performance data.
                            </p>
                            <div className="grid md:grid-cols-2 gap-8">
                                {[
                                    { title: "Score Submission", desc: "Members must submit at least 5 official scores per month to qualify for the full draw weight." },
                                    { title: "Index Calculation", desc: "Our algorithm processes your Stableford points, handicap, and course difficulty to generate your 5-digit key." },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-headline font-bold uppercase italic text-lg mb-2">{item.title}</h4>
                                            <p className="text-sm text-on-surface-variant/60 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="p-12 rounded-[40px] bg-on-surface text-surface relative overflow-hidden">
                            <div className="absolute inset-0 kinetic-gradient opacity-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="font-headline text-3xl font-black uppercase italic">Draw Integrity</h2>
                                </div>
                                <p className="text-surface/60 text-lg leading-relaxed mb-10">
                                    The monthly "Kinetic Key" is generated using a provably fair random number generator (RNG) and is independently audited.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        "Draws occur on the 1st of every month at 12:00 PM UTC.",
                                        "Winning numbers are published instantly on the platform and via email.",
                                        "All prize distributions are handled through secure, encrypted payment gateways.",
                                        "Verification of scores is mandatory for all top-tier winners."
                                    ].map((rule, i) => (
                                        <div key={i} className="flex items-center gap-4 text-sm font-medium">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            {rule}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="p-12 rounded-[40px] bg-surface-variant/10 border border-outline-variant/10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-secondary" />
                                </div>
                                <h2 className="font-headline text-3xl font-black uppercase italic">Dispute Resolution</h2>
                            </div>
                            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                                In the event of a dispute regarding scores or draw outcomes, our integrity committee will review the case within 7 business days.
                            </p>
                            <button className="bg-on-surface text-surface px-10 py-5 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:bg-primary transition-all">
                                Contact Integrity Committee
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DrawRulesPage;
