import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "GOOGLE_ID",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_SECRET",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                // Hardcoded bypass for demo/development
                if (credentials.email.toLowerCase() === "admin@dineops.com" && credentials.password === "admin123") {
                    return {
                        id: "1",
                        name: "Admin User",
                        email: "admin@dineops.com",
                        role: "ADMIN",
                    };
                }

                if (credentials.email.toLowerCase() === "staff@dineops.com" && credentials.password === "staff123") {
                    return {
                        id: "2",
                        name: "Kitchen Staff",
                        email: "staff@dineops.com",
                        role: "STAFF",
                    };
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email.toLowerCase() });

                if (!user) {
                    throw new Error("No account found with this email");
                }

                if (!user.password) {
                    throw new Error("This account uses Google sign-in");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Auto-create user on Google sign-in
            if (account?.provider === "google") {
                try {
                    await connectDB();
                    const existingUser = await User.findOne({ email: user.email?.toLowerCase() });

                    if (!existingUser) {
                        await User.create({
                            name: user.name,
                            email: user.email?.toLowerCase(),
                            image: user.image,
                            provider: "google",
                            role: "RESTAURANT_OWNER",
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("DEBUG: MongoDB connection error during Google SignIn:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }: any) {
            if (user) {
                token.role = user.role || "RESTAURANT_OWNER";
                token.id = user.id;
            }

            // For Google users, fetch role from DB
            if (account?.provider === "google" && token.email) {
                await connectDB();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                }
            }

            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-demo",
};
