"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BarChart3,
    UtensilsCrossed,
    PhoneCall,
    LogOut,
    Menu as MenuIcon,
    Bell,
    Plus,
    UserCircle,
    Sun,
    Moon,
    Store,
    Circle,
    ChefHat,
    PanelLeftClose,
    PanelLeftOpen,
    Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// ─── Sidebar Config by Role ─────────────────────────────────────
const ADMIN_SIDEBAR = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Menu", icon: UtensilsCrossed, path: "/edit-menu" },
    { name: "Orders", icon: PhoneCall, path: "/live-orders" },
    { name: "Kitchen", icon: ChefHat, path: "/kitchen" },
    { name: "Analytics", icon: BarChart3, path: "/menu-analytics" },
    { name: "Unit Analysis", icon: Activity, path: "/unit-analysis" },
];

const STAFF_SIDEBAR = [
    { name: "Kitchen", icon: ChefHat, path: "/kitchen" },
];

const ROLE_LABELS = {
    ADMIN: "Administrator",
    STAFF: "Kitchen Staff",
    RESTAURANT_OWNER: "Owner",
};

const STAFF_DEFAULT_ROUTE = "/kitchen";
const ADMIN_DEFAULT_ROUTE = "/dashboard";

export default function DashboardLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarPinned, setIsSidebarPinned] = useState(true);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const isSidebarOpen = isSidebarPinned || isSidebarHovered;

    const isDarkMode = mounted && theme === 'dark';
    const userRole = session?.user?.role || "RESTAURANT_OWNER";
    const isStaff = userRole === "STAFF";
    const sidebarItems = isStaff ? STAFF_SIDEBAR : ADMIN_SIDEBAR;
    const accentColor = isStaff ? "emerald" : "orange";

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: "Call Accepted", desc: "AI successfully handled call from Rahul", type: "success", time: "2m ago" },
        { id: 2, title: "Transfer Requested", desc: "Customer Priya requested human agent", type: "warning", time: "5m ago" },
        { id: 3, title: "Call Rejected", desc: "Spam call detected and blocked", type: "error", time: "12m ago" },
    ]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (status === "authenticated" && isStaff) {
            const staffPaths = STAFF_SIDEBAR.map(i => i.path);
            if (!staffPaths.some(p => pathname.startsWith(p))) {
                router.push(STAFF_DEFAULT_ROUTE);
            }
        }
    }, [status, isStaff, pathname, router]);

    if (status === "loading") {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-16 h-1 bg-orange-500 rounded-full"
                />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-[#0f172a] font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 250 : 72 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
                className={cn(
                    "flex flex-col border-r z-30 overflow-hidden shrink-0 relative",
                    isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-[#e2e8f0] text-slate-900"
                )}
            >
                {/* Logo */}
                <div className={cn("transition-all duration-200", isSidebarOpen ? "p-5 pb-3" : "p-3 pb-2 flex justify-center")}>
                    <div className={cn("flex items-center", isSidebarOpen ? "gap-3" : "justify-center")}>
                        <div className={cn(
                            "p-2 rounded-xl shrink-0 shadow-md transition-shadow",
                            isStaff ? "bg-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/50" : "bg-orange-500 shadow-orange-200 dark:shadow-orange-900/50"
                        )}>
                            {isStaff ? <ChefHat className="text-white w-5 h-5" /> : <UtensilsCrossed className="text-white w-5 h-5" />}
                        </div>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn("font-extrabold text-lg tracking-tight whitespace-nowrap", isDarkMode ? "text-white" : "text-slate-900")}
                                >
                                    {isStaff ? "Kitchen" : "Dineops-Copilot"}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Divider */}
                <div className={cn("mx-4 mb-2 border-t", isDarkMode ? "border-slate-800" : "border-slate-100")} />

                {/* Nav Items */}
                <nav className={cn("flex-1 overflow-y-auto space-y-1 custom-scrollbar", isSidebarOpen ? "px-3" : "px-2")}>
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <div key={item.path} className="relative">
                                <Link href={item.path} title={!isSidebarOpen ? item.name : undefined}>
                                    <div className={cn(
                                        "flex items-center rounded-xl cursor-pointer font-medium text-[13px] transition-all duration-200 relative",
                                        isSidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-2.5",
                                        isActive
                                            ? cn(
                                                isDarkMode ? "bg-slate-800" : "bg-slate-50",
                                                isStaff ? "text-emerald-500" : "text-orange-500"
                                            )
                                            : cn(
                                                isDarkMode
                                                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                            )
                                    )}>
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className={cn(
                                                    "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full",
                                                    isStaff ? "bg-emerald-500" : "bg-orange-500"
                                                )}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <item.icon
                                            size={20}
                                            className={cn(
                                                "shrink-0 transition-colors duration-200",
                                                isActive
                                                    ? (isStaff ? "text-emerald-500" : "text-orange-500")
                                                    : (isDarkMode ? "text-slate-500 group-hover:text-slate-300" : "text-slate-400")
                                            )}
                                        />
                                        <AnimatePresence>
                                            {isSidebarOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -8 }}
                                                    transition={{ duration: 0.15 }}
                                                    className={cn("whitespace-nowrap", isActive && "font-semibold")}
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className={cn("mx-4 mt-2 border-t", isDarkMode ? "border-slate-800" : "border-slate-100")} />

                {/* Logout */}
                <div className={cn("transition-all duration-200", isSidebarOpen ? "p-3" : "p-2")}>
                    <Button
                        variant="ghost"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        title={!isSidebarOpen ? "Log out" : undefined}
                        className={cn(
                            "w-full rounded-xl transition-all duration-200",
                            isSidebarOpen ? "justify-start gap-3 px-3" : "justify-center px-2",
                            isDarkMode ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                        )}
                    >
                        <LogOut size={20} className="shrink-0" />
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm font-medium whitespace-nowrap"
                                >
                                    Log out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>
            </motion.aside>

            {/* Content Area */}
            <div className={cn("flex-1 flex flex-col min-w-0 transition-colors duration-300", isDarkMode ? "bg-slate-950" : "bg-[#f8fafc]")}>
                <header className={cn(
                    "h-16 border-b flex items-center justify-between px-8 relative z-20 transition-all duration-300",
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-[#e2e8f0]"
                )}>
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                            title={isSidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
                            className={cn(
                                "transition-all",
                                isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn("p-1.5 rounded-full transition-colors", isDarkMode ? "bg-slate-800" : "bg-slate-100")}>
                                {isSidebarPinned ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                            </div>
                        </Button>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <div className="flex items-center gap-3">
                            <img src="/logo.svg" alt="Dineops" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Dineops</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                            className={cn("rounded-2xl transition-all", isDarkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-50 text-slate-400")}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </Button>

                        {/* Notifications */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={cn("rounded-2xl relative", isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-400")}
                            >
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                            </Button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={cn(
                                            "absolute right-0 top-full mt-2 w-80 rounded-[24px] border shadow-premium overflow-hidden z-50",
                                            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"
                                        )}
                                    >
                                        <div className={cn("p-4 border-b flex justify-between items-center", isDarkMode ? "border-slate-800" : "border-slate-50")}>
                                            <span className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-900")}>Notifications</span>
                                            <Badge variant="outline" className={cn("text-[9px] font-black", isDarkMode ? "border-slate-700 text-white" : "")}>{notifications.length} New</Badge>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {notifications.map(n => (
                                                <div key={n.id} className={cn("p-3 rounded-2xl transition-colors cursor-pointer group", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50")}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-wider",
                                                            n.type === 'success' ? 'text-emerald-600' : n.type === 'warning' ? 'text-orange-500' : 'text-rose-500'
                                                        )}>{n.title}</span>
                                                        <span className="text-[9px] font-bold text-slate-500">{n.time}</span>
                                                    </div>
                                                    <p className={cn("text-xs font-medium", isDarkMode ? "text-slate-400 group-hover:text-slate-300" : "text-slate-600 group-hover:text-slate-900")}>{n.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={cn("p-3 border-t text-center", isDarkMode ? "border-slate-800" : "border-slate-50")}>
                                            <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600">View All Pipeline</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />

                        {/* User Profile Section */}
                        <div className={cn(
                            "flex items-center gap-3 p-1 pl-3 pr-2 rounded-2xl transition-all border",
                            isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50/50 border-slate-100"
                        )}>
                            <div className="text-right hidden sm:block">
                                <p className={cn("text-xs font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{session.user.name}</p>
                                <div className="flex items-center justify-end gap-1.5">
                                    <Circle size={4} className={cn("fill-current", isStaff ? "text-emerald-500" : "text-orange-500")} />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {ROLE_LABELS[userRole] || userRole}
                                    </p>
                                </div>
                            </div>
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                <AvatarImage src={session.user.image} />
                                <AvatarFallback className={cn("text-white text-xs font-black", isStaff ? "bg-emerald-500" : "bg-orange-500")}>{session.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <main className={cn("flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300", isDarkMode ? "bg-slate-950 text-white" : "bg-[#f8fafc] text-[#0f172a]")}>
                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
