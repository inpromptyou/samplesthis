"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ReferralData {
  code: string;
  stats: { totalReferrals: number; activeReferrals: number; bonusEarned: number };
  referrals: { id: number; name: string; created_at: string; status: string }[];
}

const SIDEBAR = [
  { key: "explore", label: "Explore", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", href: "/explore" },
  { key: "referrals", label: "Referrals", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", href: "/referrals" },
  { key: "earnings", label: "Earnings", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", href: "/dashboard?tab=payouts" },
  { key: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", href: "/dashboard?tab=profile" },
];

function avatarColor(s: string) {
  const colors = ["#F97316", "#EF4444", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#6366F1"];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 60) return "just now";
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function ReferralsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/testers/me").then(r => r.json()).then(d => {
      setAuthed(d.authenticated);
      if (d.authenticated) {
        fetch("/api/referrals").then(r => r.json()).then(setData).catch(() => {});
      }
    }).catch(() => setAuthed(false));
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = data ? `${baseUrl}/become-a-tester?ref=${data.code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[72px] bg-white border-r border-black/[0.04] items-center py-6 shrink-0 fixed left-0 top-0 bottom-0">
        <Link href="/" className="mb-8">
          <Image src="/logo.png" alt="Flinchify" width={28} height={28} />
        </Link>
        <nav className="flex-1 flex flex-col items-center gap-1">
          {SIDEBAR.map(item => (
            <Link key={item.key} href={item.href}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                item.key === "referrals" ? "bg-black/[0.04] text-[var(--text)]" : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-black/[0.02]"
              }`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.04] px-4 h-[50px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Flinchify" width={24} height={24} />
        </Link>
        <div className="flex items-center gap-2">
          {SIDEBAR.slice(0, 2).map(item => (
            <Link key={item.key} href={item.href}
              className={`p-2 rounded-lg ${item.key === "referrals" ? "bg-black/[0.04]" : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={item.key === "referrals" ? "#111" : "#999"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-[72px] px-5 md:px-10 pt-16 md:pt-10 pb-20">
        <div className="max-w-[800px] mx-auto">
          <h1 className="h text-[22px] md:text-[28px] font-bold text-[var(--text)] mb-2">Referrals</h1>
          <p className="text-[14px] text-[var(--text-muted)] mb-8">Invite friends to test. Earn $1 for every tester who signs up and completes their first test.</p>

          {authed === false && (
            <div className="bg-white rounded-2xl border border-black/[0.06] p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h2 className="h text-[16px] font-bold text-[var(--text)] mb-2">Sign up to start referring</h2>
              <p className="text-[13px] text-[var(--text-muted)] mb-6">Create a tester account to get your unique referral link.</p>
              <Link href="/become-a-tester" className="inline-flex px-6 py-3 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-black/90 transition-colors">
                Become a tester
              </Link>
            </div>
          )}

          {authed && data && (
            <>
              {/* Referral link card */}
              <div className="bg-[#FFFBF7] rounded-2xl border border-orange-100 p-6 mb-6">
                <p className="text-[12px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-2">Your referral link</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-xl border border-black/[0.06] px-4 py-2.5 text-[13px] text-[var(--text)] truncate font-mono">
                    {referralLink}
                  </div>
                  <button onClick={copyLink}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-black text-white text-[13px] font-semibold hover:bg-black/90 transition-colors">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                  <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-1">Total Referrals</p>
                  <p className="h text-2xl font-bold text-[var(--text)]">{data.stats.totalReferrals}</p>
                </div>
                <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                  <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-1">Active</p>
                  <p className="h text-2xl font-bold text-green-600">{data.stats.activeReferrals}</p>
                </div>
                <div className="bg-white rounded-xl border border-black/[0.06] p-5">
                  <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-1">Bonus Earned</p>
                  <p className="h text-2xl font-bold text-[var(--accent)]">${(data.stats.bonusEarned / 100).toFixed(2)}</p>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 mb-8">
                <h2 className="h text-[15px] font-bold text-[var(--text)] mb-4">How referrals work</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { step: "1", title: "Share your link", desc: "Send your unique referral link to friends who want to earn money testing apps." },
                    { step: "2", title: "They sign up", desc: "Your friend creates a tester account using your link. They get a head start." },
                    { step: "3", title: "You both earn", desc: "When they complete their first test, you get $1 bonus. They get paid for testing." },
                  ].map(s => (
                    <div key={s.step} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-black/[0.04] flex items-center justify-center text-[12px] font-bold text-[var(--text)] shrink-0">{s.step}</div>
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--text)] mb-0.5">{s.title}</p>
                        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referred testers */}
              <div>
                <h2 className="h text-[15px] font-bold text-[var(--text)] mb-4">Your referrals</h2>
                {data.referrals.length === 0 ? (
                  <div className="bg-white rounded-xl border border-black/[0.06] p-8 text-center">
                    <p className="text-[13px] text-[var(--text-muted)]">No referrals yet. Share your link to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.referrals.map(r => (
                      <div key={r.id} className="bg-white rounded-xl border border-black/[0.06] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: avatarColor(r.name) }}>
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[var(--text)]">{r.name}</p>
                            <p className="text-[11px] text-[var(--text-dim)]">{timeAgo(r.created_at)}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          r.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
                        }`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {authed === null && (
            <div className="py-20 text-center text-[var(--text-dim)]">Loading...</div>
          )}
        </div>
      </main>
    </div>
  );
}
