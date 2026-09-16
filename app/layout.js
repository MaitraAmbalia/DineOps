import "./globals.css";
import AuthProviders from "./components/AuthProviders";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dineops Revenue & Voice Copilot",
  description: "AI-Powered Revenue Intelligence and Voice Ordering for Restaurants",
};

import { ThemeProvider } from "./components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProviders>
            <div className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
              {children}
            </div>
          </AuthProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
