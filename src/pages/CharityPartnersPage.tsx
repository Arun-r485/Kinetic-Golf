import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Heart, Globe, Target, ArrowUpRight } from 'lucide-react';
import { useRole } from '../lib/useRole';

const CharityPartnersPage = () => {
    const { isAdmin } = useRole();
    const partners = [
        {
            name: "Green Fairways Foundation",
            mission: "Building sustainable golf programs in rural communities.",
            impact: "$120k Raised",
            img: "https://picsum.photos/seed/green/800/500",
            tags: ["Sustainability", "Community"]
        },
        {
            name: "Sports For All",
            mission: "Providing elite coaching to underprivileged young athletes.",
            impact: "5k+ Youth Coached",
            img: "https://picsum.photos/seed/sports/800/500",
            tags: ["Education", "Athletics"]
        },
        {
            name: "Metro Golf Sanctuary",
            mission: "Creating urban golf sanctuaries in high-density cities.",
            impact: "12 New Facilities",
            img: "https://picsum.photos/seed/metro/800/500",
            tags: ["Urban", "Wellness"]
        },
        {
            name: "Junior Link Program",
            mission: "Connecting young golfers with professional mentors.",
            impact: "850+ Mentorships",
            img: "https://picsum.photos/seed/junior/800/500",
            tags: ["Mentorship", "Youth"]
        },
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
                            <span className="w-12 h-[1px] bg-primary/30"></span> REAL WORLD IMPACT
                        </div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                            Our Charity<br /><span className="text-secondary italic">Partners.</span>
                        </h1>
                        <p className="text-on-surface-variant text-xl max-w-2xl leading-relaxed font-light">
                            We partner with organizations that share our vision of a more accessible, sustainable, and impactful game of golf.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 mb-32">
                        {partners.map((partner, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative rounded-[40px] overflow-hidden aspect-[16/10]"
                            >
                                <img
                                    src={partner.img}
                                    alt={partner.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
                                <div className="absolute bottom-10 left-10 right-10">
                                    <div className="flex gap-2 mb-6">
                                        {partner.tags.map(tag => (
                                            <span key={tag} className="px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="font-headline font-black uppercase italic text-3xl text-white mb-4 leading-tight">
                                        {partner.name}
                                    </h3>
                                    <p className="text-white/60 text-lg mb-8 max-w-md leading-relaxed">
                                        {partner.mission}
                                    </p>
                                    <div className="flex items-center justify-between pt-8 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Target className="w-5 h-5" />
                                            <span className="font-headline font-black uppercase italic text-xl">{partner.impact}</span>
                                        </div>
                                        {!isAdmin && (
                                            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-all">
                                                <ArrowUpRight className="w-6 h-6" />
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <div className="text-primary text-[10px] font-black uppercase tracking-widest text-center">
                                                Administrative Oversight Enabled
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Transparency", desc: "100% of the allocated charity pool is distributed directly to our partners.", icon: Globe },
                            { title: "Direct Impact", desc: "We track and report on the specific outcomes of every dollar donated.", icon: Heart },
                            { title: "Community Driven", desc: "Our community votes on which partners receive the largest share of the pool.", icon: Target },
                        ].map((feature, i) => (
                            <div key={i} className="p-10 rounded-3xl bg-surface-variant/10 border border-outline-variant/10">
                                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-8">
                                    <feature.icon className="w-6 h-6 text-secondary" />
                                </div>
                                <h3 className="font-headline font-black uppercase italic text-2xl mb-4">{feature.title}</h3>
                                <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CharityPartnersPage;
