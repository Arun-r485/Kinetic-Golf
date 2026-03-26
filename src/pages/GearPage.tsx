import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { useRole } from '../lib/useRole';
import { Link } from 'react-router-dom';

const GearPage = () => {
    const { isAdmin } = useRole();
    const products = [
        { name: "Kinetic Performance Polo", price: "₹5,499", category: "Apparel", img: "https://picsum.photos/seed/polo/400/500" },
        { name: "Pro-V Performance Balls (12pk)", price: "₹4,599", category: "Equipment", img: "https://picsum.photos/seed/golfball/400/500" },
        { name: "Kinetic Tech Glove", price: "₹2,099", category: "Accessories", img: "https://picsum.photos/seed/glove/400/500" },
        { name: "Elite Hybrid Headcover", price: "₹3,799", category: "Accessories", img: "https://picsum.photos/seed/headcover/400/500" },
        { name: "Kinetic Lightweight Stand Bag", price: "₹19,999", category: "Equipment", img: "https://picsum.photos/seed/golfbag/400/500" },
        { name: "Performance Quarter-Zip", price: "₹7,099", category: "Apparel", img: "https://picsum.photos/seed/zip/400/500" },
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
                            <span className="w-12 h-[1px] bg-primary/30"></span> THE PRO SHOP
                        </div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]">
                            Elite Gear.<br /><span className="text-secondary italic">Peak Performance.</span>
                        </h1>
                        <p className="text-on-surface-variant text-xl max-w-2xl leading-relaxed font-light">
                            Curated equipment and apparel designed for the modern golfer who demands both style and substance.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map((product, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative"
                            >
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-surface-variant/10 border border-outline-variant/10 mb-6 relative">
                                    <img
                                        src={product.img}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="px-4 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-on-surface">
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="bg-primary text-white px-8 py-4 rounded-full font-headline font-black uppercase tracking-widest text-xs flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            Add to Cart <ShoppingBag className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-headline font-black uppercase italic text-xl mb-1 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-secondary">
                                            {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-headline font-black text-on-surface">
                                        {product.price}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-32 p-12 rounded-[40px] bg-on-surface text-surface relative overflow-hidden">
                        <div className="absolute inset-0 kinetic-gradient opacity-10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="max-w-xl">
                                <h2 className="font-headline text-4xl md:text-5xl font-black uppercase italic mb-6 leading-tight">
                                    {isAdmin ? "Admin Benefit:" : "Subscriber Exclusive:"}<br /><span className="text-primary">20% Off All Gear</span>
                                </h2>
                                <p className="text-surface/60 text-lg">
                                    {isAdmin 
                                      ? "As an administrator, you enjoy the same elite benefits and early access as our premium subscribers."
                                      : "All Kinetic Golf subscribers receive automatic discounts and early access to limited edition drops."}
                                </p>
                            </div>
                            <Link to={isAdmin ? "/dashboard" : "/membership"} className="bg-primary text-white px-12 py-6 rounded-full font-headline font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:scale-105 transition-transform glow-primary inline-flex">
                                {isAdmin ? "Go to Dashboard" : "Join the Club"} <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GearPage;
