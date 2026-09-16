"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { PROCESSED_MENU } from "@/lib/data-store";
import { recommendCombos, getPriceOptimization } from "@/lib/revenue-engine";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    CheckCircle2,
    ArrowUpRight,
    Plus,
    ShoppingBag,
    Zap,
    TrendingUp,
    ChevronRight,
    Target
} from "lucide-react";
import { useState } from "react";

const SuggestionCard = ({ type, title, description, badge, items, actionLabel, impact, onApprove }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-800 shadow-premium flex flex-col gap-6 relative overflow-hidden group"
    >
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${type === 'combo' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {type === 'combo' ? <ShoppingBag size={24} /> : <TrendingUp size={24} />}
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{badge}</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
            </div>
            <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-wide">
                    Impact: {impact}
                </span>
            </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{description}</p>

        {items && (
            <div className="flex items-center gap-2 flex-wrap">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item}</span>
                    </div>
                ))}
            </div>
        )}

        <button
            onClick={onApprove}
            className="mt-4 w-full gradient-orange text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
            <Zap size={18} className="group-hover:animate-pulse" />
            {actionLabel}
        </button>
    </motion.div>
);

export default function AIHubPage() {
    const [approvedCount, setApprovedCount] = useState(0);
    const items = PROCESSED_MENU;
    const combos = recommendCombos(items, []);

    const handleApprove = () => {
        setApprovedCount(prev => prev + 1);
        // In a real app, this would trigger a PoS sync and DB update
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 rounded-full border border-orange-100 dark:border-orange-900/40 mb-2">
                            <Sparkles size={14} className="text-orange-500 dark:text-orange-400" />
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">Revenue Engine Active</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight italic">AI Hub</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">1-Click revenue enhancement strategies</p>
                    </div>

                    <div className="glass px-6 py-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Strategies Approved</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-0.5">{approvedCount}</h4>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Section: Intelligent Combos */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-3">
                            <Plus size={18} /> Bundle Recommendations
                        </h2>
                        {combos.map((combo, i) => (
                            <SuggestionCard
                                key={i}
                                type="combo"
                                badge="Association Analysis"
                                title={combo.name}
                                description={combo.reason}
                                items={["Classic Burger", "Truffle Fries"]} // Mock items mapping
                                impact={combo.profitImpact}
                                actionLabel="Create & Push to PoS"
                                onApprove={handleApprove}
                            />
                        ))}
                    </div>

                    {/* Section: Price Optimization */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-3">
                            <Target size={18} /> Price Optimization
                        </h2>
                        {items.filter(i => i.classification === 'Challenge').slice(0, 2).map((item, i) => {
                            const opt = getPriceOptimization(item);
                            return (
                                <SuggestionCard
                                    key={i}
                                    type="price"
                                    badge="Margin Analysis"
                                    title={`Adjust ${item.name}`}
                                    description={`${opt.suggestion}. Currently "${item.classification}" status with high margin potential.`}
                                    impact="Medium-High"
                                    actionLabel="Review & Update Price"
                                    onApprove={handleApprove}
                                />
                            );
                        })}

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="glass p-8 rounded-[32px] border border-orange-100 dark:border-slate-800 bg-gradient-to-br from-orange-50/50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center text-center gap-4 cursor-pointer min-h-[200px]"
                        >
                            <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg flex items-center justify-center text-orange-500">
                                <ChevronRight size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">View 12 More Strategies</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Updated every 6 hours based on sales velocity</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
