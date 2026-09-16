"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { TEAM_MEMBERS } from "@/lib/data-store";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
    DollarSign,
    Users,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Star,
    TrendingUp,
    Activity,
    Package,
    Sparkles,
    Loader2
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MetricCard = ({ title, value, subValue, trend, icon: Icon, isActive, onClick }) => (
    <Card
        onClick={onClick}
        className={cn(
            "shadow-sm p-5 rounded-2xl flex-1 cursor-pointer transition-all duration-300",
            isActive
                ? "bg-orange-500 text-white ring-4 ring-orange-50 dark:ring-orange-950/40 border border-orange-500"
                : "bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80"
        )}
    >
        <div className="flex justify-between items-center mb-1">
            <h4 className={cn("text-2xl font-bold tracking-tight", isActive ? "text-white" : "text-slate-900 dark:text-white")}>
                {typeof value === 'number' ? value.toFixed(2) : value}
            </h4>
            <div className={cn("p-2 rounded-xl transition-colors", isActive ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800")}>
                <Icon className={isActive ? "text-white" : "text-slate-400 dark:text-slate-300"} size={18} />
            </div>
        </div>
        <p className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-white/90" : "text-slate-500 dark:text-slate-300")}>{title}</p>
        <div className="flex items-center gap-1.5 mt-4">
            {trend > 0 ? (
                <div className={cn("flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-lg transition-colors", isActive ? "text-white bg-white/20" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40")}>
                    <ArrowUpRight size={12} /> {trend.toFixed(2)}%
                </div>
            ) : (
                <div className={cn("flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-lg transition-colors", isActive ? "text-white bg-white/20" : "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border border-transparent dark:border-rose-800/40")}>
                    <ArrowDownRight size={12} /> {Math.abs(trend).toFixed(2)}%
                </div>
            )}
            <span className={cn("text-[11px] font-medium truncate", isActive ? "text-white/70" : "text-slate-400 dark:text-slate-400")}>{subValue}</span>
        </div>
    </Card>
);

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMetric, setActiveMetric] = useState('all');
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && theme === 'dark';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/analytics/menu");
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                if (json.success) setAnalytics(json.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleMetric = (metric) => {
        if (activeMetric === metric) setActiveMetric('all');
        else setActiveMetric(metric);
    };

    if (loading) return (
        <DashboardLayout>
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        </DashboardLayout>
    );

    // Derived dynamic data
    const sortedByPopularity = [...analytics].sort((a, b) => b.popularityScore - a.popularityScore);
    const bestSeller = sortedByPopularity.length > 0 ? sortedByPopularity[0] : null;
    const worstSeller = sortedByPopularity.length > 0 ? sortedByPopularity[sortedByPopularity.length - 1] : null;

    // Build timeline for charts using real dailyHistory
    // Aggregate across all items for each date
    const dateMap = {};
    analytics.forEach(item => {
        if (item.dailyHistory) {
            item.dailyHistory.forEach(day => {
                if (!dateMap[day.date]) {
                    dateMap[day.date] = { date: day.date, revenue: 0, profit: 0, costs: 0, orders: 0 };
                }
                const dayProfit = (item.currentPrice - item.cost) * day.qty;
                const dayCost = item.cost * day.qty;

                dateMap[day.date].revenue += day.revenue;
                dateMap[day.date].profit += dayProfit;
                dateMap[day.date].costs += dayCost;
                dateMap[day.date].orders += day.orders;
            });
        }
    });

    const timelineData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    const recent7Days = timelineData.slice(-7);
    const prev7Days = timelineData.slice(-14, -7);

    const weekRevenue = recent7Days.reduce((a, b) => a + b.revenue, 0);
    const prevWeekRevenue = prev7Days.reduce((a, b) => a + b.revenue, 0);
    const revTrend = prevWeekRevenue > 0 ? ((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100 : 0;

    const weekProfit = recent7Days.reduce((a, b) => a + b.profit, 0);
    const prevWeekProfit = prev7Days.reduce((a, b) => a + b.profit, 0);
    const profitTrend = prevWeekProfit > 0 ? ((weekProfit - prevWeekProfit) / prevWeekProfit) * 100 : 0;

    const weekCosts = recent7Days.reduce((a, b) => a + b.costs, 0);
    const prevWeekCosts = prev7Days.reduce((a, b) => a + b.costs, 0);
    const costTrend = prevWeekCosts > 0 ? ((weekCosts - prevWeekCosts) / prevWeekCosts) * 100 : 0;

    const todayData = timelineData[timelineData.length - 1] || { profit: 0, orders: 0 };
    const todayProfit = todayData.profit;
    const todayOrders = todayData.orders;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="flex-1 space-y-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Intelligence Overview • Real-time</p>
                            </div>
                            <div className="flex bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl gap-1 border border-slate-100 dark:border-slate-700/60">
                                <button
                                    onClick={() => setActiveMetric('all')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold tracking-wide rounded-xl transition-all",
                                        activeMetric === 'all'
                                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}
                                >
                                    Overview
                                </button>
                                <button
                                    className="px-4 py-2 text-xs font-bold text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                    disabled
                                >
                                    Reports
                                </button>
                            </div>
                        </div>

                        {/* KPIS Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Revenue"
                                value={`₹${weekRevenue.toFixed(2)}`}
                                trend={revTrend}
                                subValue="this week"
                                icon={DollarSign}
                                isActive={activeMetric === 'revenue'}
                                onClick={() => toggleMetric('revenue')}
                            />
                            <MetricCard
                                title="Net Profit"
                                value={`₹${weekProfit.toFixed(2)}`}
                                trend={profitTrend}
                                subValue="this week"
                                icon={TrendingUp}
                                isActive={activeMetric === 'profit'}
                                onClick={() => toggleMetric('profit')}
                            />
                            <MetricCard
                                title="Operating Cost"
                                value={`₹${weekCosts.toFixed(2)}`}
                                trend={costTrend}
                                subValue="this week"
                                icon={Activity}
                                isActive={activeMetric === 'costs'}
                                onClick={() => toggleMetric('costs')}
                            />
                        </div>

                        {/* Interactive Main Chart */}
                        <Card className="border border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl p-8 bg-white dark:bg-slate-900 overflow-hidden transition-colors">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Performance Visualization</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Daily interaction tracking</p>
                                </div>
                                <div className="flex flex-wrap gap-6">
                                    {(activeMetric === 'all' || activeMetric === 'revenue') && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/20" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Revenue</span>
                                        </div>
                                    )}
                                    {(activeMetric === 'all' || activeMetric === 'profit') && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Profit</span>
                                        </div>
                                    )}
                                    {(activeMetric === 'all' || activeMetric === 'costs') && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-slate-400/20" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Op. Cost</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-[350px] w-full min-w-0">
                                {recent7Days.length === 0 ? (
                                    <div className="h-full w-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-950/40">
                                        <div className="p-3 bg-orange-100 dark:bg-orange-950/40 rounded-2xl text-orange-500 dark:text-orange-400 mb-3">
                                            <TrendingUp size={22} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Transaction Data Recorded Yet</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                            Real-time daily revenue, profit margins, and operating cost trends will appear here as orders are placed.
                                        </p>
                                    </div>
                                ) : mounted ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                                        <AreaChart data={recent7Days}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fontWeight: 500, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                                dy={15}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 500, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                                tickFormatter={(value) => `₹${value}`}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                formatter={(value) => [`₹${Number(value).toFixed(2)}`, ""]}
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)',
                                                    padding: '12px',
                                                    backgroundColor: isDarkMode ? '#0f172a' : 'rgba(255, 255, 255, 0.98)',
                                                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                                                }}
                                                labelStyle={{ fontWeight: 700, color: isDarkMode ? '#f8fafc' : '#0f172a', marginBottom: '8px', fontSize: '12px' }}
                                            />
                                            {(activeMetric === 'all' || activeMetric === 'revenue') && (
                                                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
                                            )}
                                            {(activeMetric === 'all' || activeMetric === 'profit') && (
                                                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" animationDuration={1000} />
                                            )}
                                            {(activeMetric === 'all' || activeMetric === 'costs') && (
                                                <Area type="monotone" dataKey="costs" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorCosts)" animationDuration={1000} />
                                            )}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : null}
                            </div>
                        </Card>

                    </div>

                    {/* Rights Column - Insights */}
                    <div className="w-full xl:w-96 space-y-6">
                        {/* Pulses Hub */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white relative overflow-hidden h-36 flex flex-col justify-between transition-colors">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Today's Profit</p>
                                    <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">₹{todayProfit.toFixed(2)}</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-xl transition-colors">
                                        <TrendingUp size={16} className="text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                            </Card>
                            <Card className="shadow-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-36 flex flex-col justify-between transition-colors">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-1">Today's Orders</p>
                                    <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{todayOrders}</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-950/40 rounded-xl">
                                        <Package size={16} className="text-orange-500 dark:text-orange-400" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60 bg-orange-50/50 dark:bg-orange-950/30">Live</Badge>
                                </div>
                            </Card>
                        </div>

                        {/* Intelligence Card */}
                        <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl p-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
                            <div className="flex items-center gap-2 mb-8">
                                <Sparkles size={16} className="text-orange-500 dark:text-orange-400" />
                                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">Menu Intelligence</h3>
                            </div>

                            <div className="space-y-6">
                                {bestSeller && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Best Performer</p>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm dark:border dark:border-slate-700 flex items-center justify-center text-xl transition-colors">🔥</div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate leading-tight tracking-tight text-slate-900 dark:text-white">{bestSeller.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Pop: {bestSeller.popularityScore?.toFixed(2) || 0}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                    </div>
                                )}

                                {bestSeller && worstSeller && (
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 w-full transition-colors" />
                                )}

                                {worstSeller && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Least Performer</p>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-80 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm dark:border dark:border-slate-700 flex items-center justify-center text-xl transition-colors">🧊</div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate leading-tight tracking-tight text-slate-900 dark:text-white">{worstSeller.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Pop: {worstSeller.popularityScore?.toFixed(2) || 0}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                    </div>
                                )}

                                {!bestSeller && !worstSeller && (
                                    <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
                                        No menu items performance data yet
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Order Volume */}
                        <Card className="border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl p-7 bg-white dark:bg-slate-900 overflow-hidden transition-colors">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Order Volume</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Transaction frequency analysis</p>
                                </div>
                                <Badge className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 px-3 py-1 font-bold text-[10px] uppercase tracking-wide transition-colors">Live</Badge>
                            </div>
                            <div className="h-[140px] w-full min-w-0">
                                {recent7Days.length === 0 ? (
                                    <div className="h-full w-full flex items-center justify-center text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                                        No order volume recorded
                                    </div>
                                ) : mounted ? (
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                                        <BarChart data={recent7Days}>
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 500, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 500, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                                width={30}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc' }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: isDarkMode ? '1px solid #1e293b' : 'none',
                                                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                                }}
                                            />
                                            <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} barSize={16} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : null}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
