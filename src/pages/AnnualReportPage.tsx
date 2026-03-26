import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { FileText, Download, TrendingUp, DollarSign, PieChart } from 'lucide-react';

const AnnualReportPage = () => {
    const reports = [
        { year: "2023", title: "Kinetic Impact Report", status: "Published", img: "https://picsum.photos/seed/report1/600/800" },
        { year: "2022", title: "Kinetic Impact Report", status: "Archived", img: "https://picsum.photos/seed/report2/600/800" },
        { year: "2021", title: "Kinetic Impact Report", status: "Archived", img: "https://picsum.photos/seed/report3/600/800" },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-surface pt-20 pb-32">
                <div className="container mx-auto px-6 max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20 text-center"
                    >
                        <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center justify-center gap-3">
                            <span className="w-12 h-[1px] bg-primary/30"></span> TRANSPARENCY & ACCOUNTABILITY
                        </div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                            Annual<br /><span className="text-secondary italic">Impact Reports.</span>
                        </h1>
                        <p className="text-on-surface-variant text-xl leading-relaxed font-light mx-auto max-w-2xl">
                            We are committed to radical transparency. Explore our annual reports to see how our community's contribution drives the growth of golf and social impact.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-32">
                        {[
                            { title: "Total Raised", value: "$380,450", icon: DollarSign },
                            { title: "Charity Pool", value: "25% Revenue", icon: PieChart },
                            { title: "Growth Rate", value: "+42% YoY", icon: TrendingUp },
                        ].map((stat, i) => (
                            <div key={i} className="p-10 rounded-3xl bg-surface-variant/10 border border-outline-variant/10">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                                    <stat.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-headline font-black uppercase italic text-xl mb-2">{stat.title}</h3>
                                <div className="text-4xl font-headline font-black text-on-surface">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mb-32">
                        <h2 className="font-headline text-4xl font-black uppercase italic mb-12">Report Archive</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {reports.map((report, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative rounded-[40px] overflow-hidden aspect-[3/4] bg-surface-variant/10 border border-outline-variant/10"
                                >
                                    <img
                                        src={report.img}
                                        alt={report.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-10 left-10 right-10">
                                        <div className="flex justify-between items-end mb-6">
                                            <div>
                                                <div className="text-primary text-xs font-black uppercase tracking-widest mb-1">{report.year}</div>
                                                <h3 className="font-headline font-black uppercase italic text-2xl text-white leading-tight">
                                                    {report.title}
                                                </h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${report.status === 'Published' ? 'bg-primary text-white' : 'bg-white/10 text-white/60'}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <button className="w-full bg-white text-on-surface py-5 rounded-full font-headline font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all">
                                            Download PDF <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-16 rounded-[40px] bg-on-surface text-surface relative overflow-hidden">
                        <div className="absolute inset-0 kinetic-gradient opacity-10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-headline text-4xl font-black uppercase italic mb-4">Financial Integrity</h2>
                                <p className="text-surface/60 text-lg max-w-2xl leading-relaxed">
                                    Our financial statements are audited by independent third-party firms to ensure every dollar is accounted for and distributed according to our mission.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AnnualReportPage;
