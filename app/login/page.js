"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Sparkles,
    Loader2,
    Crown,
    ChefHat,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result.error) {
                setError("Invalid credentials. Try admin@petpooja.com / admin123  OR  staff@petpooja.com / staff123");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (demoEmail, demoPassword) => {
        setLoading(true);
        setError("");
        setEmail(demoEmail);
        setPassword(demoPassword);

        try {
            const result = await signIn("credentials", {
                email: demoEmail,
                password: demoPassword,
                redirect: false,
            });

            if (result.error) {
                setError("Demo login failed. Please try manual login: admin@petpooja.com / admin123");
            } else {
                router.push(demoEmail.includes("staff") ? "/kitchen" : "/dashboard");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px]"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-orange-500 p-2.5 rounded-2xl shadow-lg shadow-orange-100 mb-4">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">Petpooja Copilot</h1>
                    <p className="text-slate-500 text-sm mt-1">Sign in to your restaurant workspace</p>
                </div>

                <Card className="border-[#e2e8f0] shadow-sm rounded-3xl overflow-hidden p-2">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-lg font-bold">Welcome back</CardTitle>
                        <CardDescription className="text-xs">
                            Choose your preferred sign in method
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-orange-50/50 dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-4 rounded-2xl space-y-3">
                            <div className="flex items-center gap-1.5 px-0.5">
                                <Sparkles className="text-orange-500 w-4 h-4 animate-pulse" />
                                <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest"></span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal px-0.5">
                                Explore the live dashboard features instantly using the quick access buttons below:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin("admin@petpooja.com", "admin123")}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-orange-200 bg-white hover:bg-orange-100/50 text-slate-800 transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-sm text-center group"
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-xs text-orange-700">
                                        <Crown className="w-3.5 h-3.5" />
                                        <span>Demo Admin</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-0.5 font-semibold group-hover:text-slate-500">Full Executive Panel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin("staff@petpooja.com", "staff123")}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-100/50 text-slate-800 transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-sm text-center group"
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700">
                                        <ChefHat className="w-3.5 h-3.5" />
                                        <span>Demo Kitchen</span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-0.5 font-semibold group-hover:text-slate-500">Live KOT Monitor</span>
                                </button>
                            </div>
                            <div className="flex items-start gap-1.5 px-0.5 pt-1 text-[10px] text-slate-400 leading-normal">
                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                                <span>
                                    Signing in with Google or a new sign-up automatically guides you to the <strong>Admin Dashboard</strong> as a new workspace owner.
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 font-bold tracking-widest text-[9px]">Or Sign In Manually</span>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-1">
                                <Input
                                    type="email"
                                    placeholder="name@restaurant.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11 rounded-xl border-[#e2e8f0] bg-[#fcfdfe] focus-visible:ring-orange-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 rounded-xl border-[#e2e8f0] bg-[#fcfdfe] focus-visible:ring-orange-500"
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[11px] font-bold text-red-500 px-1"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl mt-2 shadow-lg shadow-orange-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in to Workspace"}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Button
                                variant="outline"
                                className="h-11 rounded-xl border-[#e2e8f0] hover:bg-[#f8fafc] flex items-center gap-2 font-semibold text-sm"
                                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-0">
                        <p className="text-center text-[10px] text-slate-400 px-4 leading-relaxed">
                            By continuing, you agree to our <span className="underline hover:text-slate-600 cursor-pointer">Terms of Service</span> and <span className="underline hover:text-slate-600 cursor-pointer">Privacy Policy</span>.
                        </p>
                    </CardFooter>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        Don't have an account? <Link href="/signup" className="text-orange-600 font-bold hover:underline">Create one now</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
