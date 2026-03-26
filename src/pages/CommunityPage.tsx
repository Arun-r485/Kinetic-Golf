import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Users, MessageSquare, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { useRole } from '../lib/useRole';
import { Link } from 'react-router-dom';

const CommunityPage = () => {
    const { isAdmin } = useRole();
    const events = [
        { title: "Kinetic Open: Metro Sanctuary", date: "April 15, 2024", location: "New York, NY", type: "Tournament", img: "https://picsum.photos/seed/event1/800/500" },
        { title: "Charity Gala: Green Fairways", date: "May 2, 2024", location: "London, UK", type: "Gala", img: "https://picsum.photos/seed/event2/800/500" },
        { title: "Youth Clinic: Sports For All", date: "June 10, 2024", location: "Chicago, IL", type: "Workshop", img: "https://picsum.photos/seed/event3/800/500" },
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
                        <div className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-3">
                            <span className="w-12 h-[1px] bg-secondary/30"></span> THE CLUBHOUSE
                        </div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                            The Kinetic<br /><span className="text-primary italic">Community.</span>
                        </h1>
                        <p className="text-on-surface-variant text-xl max-w-2xl leading-relaxed font-light">
                            Connect with golfers who share a passion for the game and a commitment to making a real-world impact.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-32">
                        {[
                            { title: "Member Forums", desc: `Discuss gear, strategy, and local courses with fellow ${isAdmin ? 'members' : 'subscribers'}.`, icon: MessageSquare },
                            { title: "Local Chapters", desc: "Join or start a Kinetic Golf chapter in your city for local meetups.", icon: Users },
                            { title: "Leaderboards", desc: "Compete for top spots in our monthly performance rankings.", icon: Trophy },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-3xl bg-surface-variant/10 border border-outline-variant/10 hover:border-primary/30 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-headline font-black uppercase italic text-2xl mb-4">{feature.title}</h3>
                                <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{feature.desc}</p>
                                <button className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-2 group-hover:gap-4 transition-all">
                                    Explore <ArrowRight className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mb-32">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="font-headline text-4xl font-black uppercase italic mb-2">Upcoming Events</h2>
                                <p className="text-on-surface-variant text-sm">Exclusive access for Kinetic Golf members.</p>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                View All Events <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative rounded-3xl overflow-hidden aspect-[4/5]"
                                >
                                    <img
                                        src={event.img}
                                        alt={event.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest">
                                                {event.type}
                                            </span>
                                            <span className="text-white/60 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {event.date}
                                            </span>
                                        </div>
                                        <h3 className="font-headline font-black uppercase italic text-2xl text-white mb-2 leading-tight">
                                            {event.title}
                                        </h3>
                                        <p className="text-white/60 text-xs uppercase tracking-widest font-bold">{event.location}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-32 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-12 rounded-[40px] bg-surface-variant/5 border border-outline-variant/10 flex flex-col items-center"
                        >
                            <Users className="w-12 h-12 text-primary mb-6" />
                            <h2 className="font-headline text-3xl font-black uppercase italic mb-4">Local Chapters</h2>
                            <p className="text-on-surface-variant text-lg max-w-xl mb-8 font-light">
                                Kinetic Golf is more than just an online platform. Connect with members in your area and take the game to your local fairways.
                            </p>
                            <button className="bg-primary text-white px-12 py-5 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:scale-105 transition-all glow-primary shadow-xl shadow-primary/20">
                                Find or Start a Local Chapter
                            </button>
                        </motion.div>
                    </div>

                    <div className="p-16 rounded-[40px] bg-secondary text-white relative overflow-hidden">
                        <div className="absolute inset-0 kinetic-gradient opacity-20"></div>
                        <div className="relative z-10 text-center max-w-3xl mx-auto">
                            <h2 className="font-headline text-5xl md:text-6xl font-black uppercase italic mb-8 leading-tight">
                                Join the Movement.
                            </h2>
                            <p className="text-white/80 text-xl mb-12 font-light">
                                {isAdmin 
                                  ? "You have full administrative access to the Kinetic Golf community and member network."
                                  : "Become a part of the fastest-growing community in golf. Subscribe today and get instant access to our member network."}
                            </p>
                            <Link to={isAdmin ? "/dashboard" : "/membership"} className="bg-white text-secondary px-16 py-6 rounded-full font-headline font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-2xl inline-block">
                                {isAdmin ? "Go to Dashboard" : "Get Started"}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CommunityPage;
