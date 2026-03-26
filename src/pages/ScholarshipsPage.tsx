import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Award, ArrowRight } from 'lucide-react';
import { useRole } from '../lib/useRole';

const ScholarshipsPage = () => {
    const { isAdmin } = useRole();
    const stories = [
        { name: "Rahul J.", school: "Stanford University", year: "2023", story: "Rahul was our first recipient, now studying Sports Management while competing on the collegiate golf team.", img: "https://picsum.photos/seed/student1/600/600" },
        { name: "Elena S.", school: "University of St Andrews", year: "2024", story: "Elena is pursuing a degree in Sustainable Turf Management, aiming to revolutionize golf course maintenance.", img: "https://picsum.photos/seed/student2/600/600" },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-surface pt-20 pb-32">
                <div className="container mx-auto px-6 max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20"
                    >
                        <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-3">
                            <span className="w-12 h-[1px] bg-primary/30"></span> INVESTING IN THE FUTURE
                        </div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                            Kinetic Golf<br /><span className="text-secondary italic">Scholarships.</span>
                        </h1>
                        <p className="text-on-surface-variant text-xl max-w-2xl leading-relaxed font-light">
                            Empowering the next generation of golfers through academic and athletic support.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
                        <div className="space-y-12">
                            {[
                                { title: "Academic Excellence", desc: "We provide financial support for students pursuing degrees in sports management, turf science, and related fields.", icon: BookOpen },
                                { title: "Athletic Development", desc: "Scholarships cover coaching, equipment, and tournament fees for promising young athletes from underprivileged backgrounds.", icon: Award },
                                { title: "Mentorship Program", desc: "Every recipient is paired with a professional mentor from the Kinetic Golf community.", icon: GraduationCap },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-black uppercase italic text-2xl mb-2">{item.title}</h3>
                                        <p className="text-on-surface-variant text-lg leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative p-12 rounded-[40px] bg-on-surface text-surface overflow-hidden">
                            <div className="absolute inset-0 kinetic-gradient opacity-10"></div>
                            <div className="relative z-10">
                                <h2 className="font-headline text-4xl font-black uppercase italic mb-8">Apply for 2024</h2>
                                <div className="space-y-6 mb-12">
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Deadline</div>
                                        <div className="text-xl font-headline font-black italic uppercase tracking-tighter">August 15, 2024</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Fund</div>
                                        <div className="text-xl font-headline font-black italic uppercase tracking-tighter">$250,000 USD</div>
                                    </div>
                                </div>
                                {!isAdmin && (
                                    <button className="w-full bg-primary text-white py-6 rounded-full font-headline font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform glow-primary">
                                        Start Application
                                    </button>
                                )}
                                {isAdmin && (
                                    <div className="text-primary text-[10px] font-black uppercase tracking-widest text-center mt-4">
                                        Administrative Oversight Enabled
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mb-32">
                        <h2 className="font-headline text-4xl font-black uppercase italic mb-12 text-center">Recipient Stories</h2>
                        <div className="grid md:grid-cols-2 gap-12">
                            {stories.map((story, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col md:flex-row gap-8 p-8 rounded-[40px] bg-surface-variant/10 border border-outline-variant/10"
                                >
                                    <div className="w-48 h-48 rounded-3xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={story.img}
                                            alt={story.name}
                                            className="w-full h-full object-cover grayscale"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-headline font-black uppercase italic text-2xl">{story.name}</h3>
                                                <p className="text-primary text-xs font-bold uppercase tracking-widest">{story.school}</p>
                                            </div>
                                            <span className="text-on-surface-variant/40 font-headline font-black italic text-xl">'{story.year}</span>
                                        </div>
                                        <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic">"{story.story}"</p>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                                            Read Full Story <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ScholarshipsPage;
