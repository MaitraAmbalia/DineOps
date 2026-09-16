"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    PhoneIncoming,
    CheckCircle2,
    Clock,
    Terminal,
    MessageSquare,
    ChevronRight,
    Headphones,
    FileJson,
    Activity,
    User,
    Hash,
    Receipt,
    Phone,
    CornerUpRight,
    Search,
    Loader2,
    RefreshCw
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL = 5000; // 5 seconds

// Map DB order to UI shape
function mapOrderToUI(dbOrder) {
    const createdAt = dbOrder.createdAt ? new Date(dbOrder.createdAt) : new Date();
    const timeStr = createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    // Determine call type from DB fields
    let callType = "AI_SUCCESS";
    let status = "COMPLETED";
    if (dbOrder.status === "pending") {
        status = "PENDING_CALLBACK";
        callType = "CALLBACK";
    } else if (!dbOrder.callSuccessful) {
        status = "TRANSFERRED";
        callType = "HUMAN_TRANSFER";
    }

    // KOT status mapping
    const kotMap = { pending: "PENDING", preparing: "PREPARING", ready: "READY", complete: "READY" };
    const kotStatus = kotMap[dbOrder.kotStatus?.toLowerCase()] || "NONE";

    // Build transcript text from messages
    const transcriptMessages = (dbOrder.transcript?.messages || [])
        .filter(m => m.text && m.text.trim() !== ""); // Filter out blank messages

    // Map 'speaker' and 'text' back to UI format
    const uiMessages = transcriptMessages.map(m => ({
        role: m.speaker === "agent" ? "ai" : m.speaker, // Map 'agent' to 'ai'
        text: m.text
    }));

    const customerMessages = uiMessages.filter(m => m.role === "human" || m.role === "user").map(m => m.text);
    const transcriptText = customerMessages.join(" | ") || "No transcript available";

    // AI upsell detection from transcript
    const aiMessages = uiMessages.filter(m => m.role === "ai");
    const upsellMsg = aiMessages.find(m =>
        m.text.toLowerCase().includes("would you like") ||
        m.text.toLowerCase().includes("combo") ||
        m.text.toLowerCase().includes("add")
    );
    const aiUpsell = upsellMsg
        ? (dbOrder.upsellSuccessful ? `Upsell Accepted` : `Upsell Suggested`)
        : "None";

    return {
        id: dbOrder.orderId || dbOrder._id,
        time: timeStr,
        customer: dbOrder.customerName || "Unknown Customer",
        phoneNumber: dbOrder.phoneNo || "N/A",
        transactionId: `TXN_${dbOrder.orderId?.slice(-6) || "000000"}`,
        invoiceNo: `INV-${createdAt.getFullYear()}-${String(dbOrder.orderId?.slice(-3) || "000").padStart(3, "0")}`,
        transcript: transcriptText,
        transcriptMessages: transcriptMessages,
        uiMessages: uiMessages,
        structuredJson: {
            items: (dbOrder.items || []).map(i => ({
                name: i.name,
                qty: i.qty,
                price: i.price,
                addons: i.addons || [],
            })),
            total: dbOrder.totalPrice || 0,
        },
        status,
        kotStatus,
        aiUpsell,
        callType,
        orderType: dbOrder.orderType || "pickup",
        address: dbOrder.address || "",
    };
}

const CallAnalyticsStats = ({ analytics, loading }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
            { label: "Total Calls", value: analytics.totalCalls, icon: PhoneIncoming, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
            { label: "Successful", value: analytics.successfulCalls, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { label: "Human Transfers", value: analytics.humanTransfers, icon: Headphones, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
            { label: "Pending", value: analytics.pendingCallbacks, icon: Clock, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
        ].map((stat, i) => (
            <div key={i} className="glass p-5 rounded-[24px] border border-slate-200/50 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {loading ? <span className="animate-pulse">—</span> : stat.value}
                    </h3>
                </div>
            </div>
        ))}
    </div>
);

const OrderCard = ({ order, isActive, onClick }) => {
    const getKOTStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50';
            case 'PREPARING': return 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/50';
            case 'READY': return 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50';
            default: return 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ x: 4 }}
            className={`p-6 rounded-3xl border transition-all cursor-pointer group ${isActive
                ? "bg-slate-900 border-slate-800 shadow-xl shadow-slate-950/40 text-white dark:bg-slate-800 dark:border-slate-700"
                : "bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${isActive ? "bg-white/10" : "bg-orange-50 dark:bg-orange-950/40"}`}>
                    {order.status === 'PENDING_CALLBACK' ?
                        <CornerUpRight className={isActive ? "text-white" : "text-rose-500"} size={18} /> :
                        <PhoneIncoming className={isActive ? "text-white" : "text-orange-500"} size={18} />
                    }
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                        {order.time}
                    </span>
                    {order.kotStatus !== 'NONE' && (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getKOTStyle(order.kotStatus)}`}>
                            KOT: {order.kotStatus}
                        </span>
                    )}
                </div>
            </div>

            <h4 className={`font-bold ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>{order.customer}</h4>
            <p className={`text-xs mt-1 font-medium ${isActive ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                {order.status === 'COMPLETED' ? 'Order Processed' : order.status === 'TRANSFERRED' ? 'Human Handling' : 'Pending Callback'}
            </p>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={14} className={isActive ? "text-emerald-400" : "text-emerald-500"} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {order.callType.replace('_', ' ')}
                    </span>
                </div>
                <ChevronRight size={16} className={isActive ? "text-white/30" : "text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform"} />
            </div>
        </motion.div>
    );
};

export default function LiveOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState({ totalCalls: 0, successfulCalls: 0, humanTransfers: 0, pendingCallbacks: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch("/api/orders?limit=50");
            const json = await res.json();
            if (json.success) {
                const mapped = json.data.map(mapOrderToUI);
                setOrders(mapped);
                setAnalytics(json.analytics);
                setLastUpdated(new Date());

                // Auto-select first order if none selected
                setSelectedOrder(prev => {
                    if (!prev && mapped.length > 0) return mapped[0];
                    // Keep current selection if it still exists
                    if (prev) {
                        const stillExists = mapped.find(o => o.id === prev.id);
                        return stillExists || (mapped.length > 0 ? mapped[0] : null);
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-140px)] flex flex-col gap-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Live Orders & Voice Analytics</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Monitoring real-time AI and Human call performance
                            {lastUpdated && (
                                <span className="ml-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    Updated {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchOrders}
                            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                <CallAnalyticsStats analytics={analytics} loading={loading} />

                <div className="flex-1 flex gap-8 overflow-hidden">
                    {/* Order List */}
                    <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 size={24} className="text-orange-500 animate-spin" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading orders...</p>
                            </div>
                        ) : orders.length > 0 ? (
                            orders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    isActive={selectedOrder?.id === order.id}
                                    onClick={() => setSelectedOrder(order)}
                                />
                            ))
                        ) : null}

                        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center gap-3 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <Clock size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {orders.length === 0 && !loading ? "No orders yet" : "Waiting for calls..."}
                            </p>
                        </div>
                    </div>

                    {/* Details Pane */}
                    <div className="flex-1 glass rounded-[40px] border border-slate-200/50 dark:border-slate-800 shadow-premium flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait">
                            {selectedOrder ? (
                                <motion.div
                                    key={selectedOrder.id}
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    className="flex flex-col h-full"
                                >
                                    {/* Pane Header */}
                                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center text-white shadow-lg">
                                                <User size={28} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedOrder.customer}</h3>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Phone size={12} className="text-orange-500" /> {selectedOrder.phoneNumber}
                                                    </p>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} className="text-blue-500" /> {selectedOrder.orderType}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 uppercase tracking-wider">
                                                <Headphones size={18} /> Transfer to Human
                                            </button>
                                            <button className="px-5 py-3 rounded-2xl bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-100 dark:shadow-none hover:bg-rose-600 transition-all uppercase tracking-wider">
                                                Close Call
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order Meta Info Bar */}
                                    <div className="px-8 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex gap-8">
                                        <div className="flex items-center gap-2">
                                            <Hash size={12} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID:</span>
                                            <span className="text-[10px] font-bold text-slate-900 dark:text-white">{selectedOrder.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Receipt size={12} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type:</span>
                                            <span className="text-[10px] font-bold text-slate-900 dark:text-white capitalize">{selectedOrder.orderType}</span>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upsell:</span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${selectedOrder.aiUpsell !== "None" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                                {selectedOrder.aiUpsell}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex overflow-hidden">
                                        {/* Transcript Section */}
                                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <MessageSquare size={14} /> Voice-to-Text Transcript
                                            </h4>
                                            <div className="space-y-6">
                                                {selectedOrder.uiMessages && selectedOrder.uiMessages.length > 0 ? (
                                                    selectedOrder.uiMessages.map((msg, idx) => (
                                                        <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black ${msg.role === "ai"
                                                                ? "bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400"
                                                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 italic"
                                                                }`}>
                                                                {msg.role === "ai" ? "AI" : "CU"}
                                                            </div>
                                                            <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === "ai"
                                                                ? "bg-orange-50 dark:bg-orange-950/40 rounded-tl-none border border-orange-100 dark:border-orange-900/40"
                                                                : "bg-white dark:bg-slate-800 rounded-tr-none border border-slate-200 dark:border-slate-700 shadow-sm"
                                                                }`}>
                                                                <p className={`text-sm font-medium leading-relaxed ${msg.role === "ai"
                                                                    ? "text-orange-950 dark:text-orange-200"
                                                                    : "text-slate-700 dark:text-slate-200 italic"
                                                                    }`}>
                                                                    {msg.role === "human" || msg.role === "user" ? `"${msg.text}"` : msg.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-12 opacity-40">
                                                        <MessageSquare size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transcript available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* JSON Output Section */}
                                        <div className="w-80 border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-8 overflow-y-auto custom-scrollbar">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <FileJson size={14} /> Order Payload (JSON)
                                            </h4>
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                                {selectedOrder.structuredJson.items.length > 0 ? (
                                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {selectedOrder.structuredJson.items.map((item, idx) => (
                                                            <div key={idx} className="p-4 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                                                                    {item.addons && item.addons.length > 0 && (
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                                            + {item.addons.join(", ")}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-black text-slate-900 dark:text-white">₹{item.price}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Qty: {item.qty}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center opacity-50">
                                                        <Receipt size={24} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No items ordered</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-8 space-y-4">
                                                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Bill</p>
                                                    <h5 className="text-xl font-black text-slate-900 dark:text-white">₹{selectedOrder.structuredJson.total.toFixed(2)}</h5>
                                                </div>
                                                {selectedOrder.status === "COMPLETED" && (
                                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-3">
                                                        <CheckCircle2 size={20} className="text-emerald-500 dark:text-emerald-400" />
                                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Order Confirmed</span>
                                                    </div>
                                                )}
                                                {selectedOrder.status === "PENDING_CALLBACK" && (
                                                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-800/40 flex items-center gap-3">
                                                        <Clock size={20} className="text-amber-500 dark:text-amber-400" />
                                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Pending Callback</span>
                                                    </div>
                                                )}
                                                {selectedOrder.status === "TRANSFERRED" && (
                                                    <div className="p-4 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-100 dark:border-orange-800/40 flex items-center gap-3">
                                                        <Headphones size={20} className="text-orange-500 dark:text-orange-400" />
                                                        <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">Human Transfer</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                                    <PhoneIncoming size={64} className="text-slate-300 dark:text-slate-600 mb-6" />
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No active calls</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mt-2">
                                        {loading ? "Loading orders from database..." : "Select an order from the list to view transcripts and order details."}
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
