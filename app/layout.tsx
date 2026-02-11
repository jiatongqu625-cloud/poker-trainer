import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import SessionBootstrap from "../components/SessionBootstrap";

export const metadata: Metadata = {
  title: "Poker Trainer MVP",
  description: "Texas Hold'em drill trainer MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SessionBootstrap />
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          <header className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">Poker Trainer</p>
              <h1 className="text-2xl font-semibold">NLH Trainer (MVP)</h1>
            </div>
            <nav className="flex gap-3 text-sm">
              <Link className="badge" href="/">Dashboard</Link>
              <Link className="badge" href="/scenarios">Scenarios</Link>
              <Link className="badge" href="/opponents">Opponents</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
