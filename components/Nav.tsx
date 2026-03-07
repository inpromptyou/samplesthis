"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const TESTERS_MENU = [
  { href: "/explore", label: "Explore jobs", desc: "Browse open test opportunities" },
  { href: "/?auth=tester", label: "Become a tester", desc: "Sign up and start earning" },
  { href: "/referrals", label: "Referrals", desc: "Invite friends, earn bonuses" },
  { href: "/dashboard", label: "Dashboard", desc: "Your tests, earnings & profile" },
];

const BUSINESS_MENU = [
  { href: "/submit", label: "Post a test", desc: "Get real humans testing your app" },
  { href: "/how-it-works", label: "How it works", desc: "See the process end to end" },
  { href: "/pricing", label: "Pricing", desc: "Pay per tester, no subscriptions" },
];

interface UserInfo {
  type: "tester" | "business";
  name?: string;
  email?: string;
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Check auth on mount
  useEffect(() => {
    // Check tester auth
    fetch("/api/testers/me").then(r => r.json()).then(d => {
      if (d.id) setUser({ type: "tester", name: d.name, email: d.email });
    }).catch(() => {});
    // Check business auth
    fetch("/api/business/me").then(r => r.json()).then(d => {
      if (d.authenticated) setUser(prev => prev || { type: "business", email: d.business?.email, name: d.business?.company });
    }).catch(() => {});
  }, []);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdown(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const openMenu = (menu: string) => {
    clearTimeout(timeoutRef.current);
    setDropdown(menu);
  };

  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => setDropdown(null), 150);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
      scrolled || open
        ? "bg-white/95 backdrop-blur-xl border-black/[0.04]"
        : "bg-transparent border-transparent"
    }`}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 h-[56px] sm:h-[60px] flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="Flinchify" width={32} height={32} className="sm:w-9 sm:h-9" priority />
        </Link>

        {/* Desktop nav with dropdowns */}
        <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
          {/* For Testers dropdown */}
          <div className="relative"
            onMouseEnter={() => openMenu("testers")}
            onMouseLeave={closeMenu}>
            <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              dropdown === "testers" ? "text-[var(--text)] bg-black/[0.03]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}>
              For testers
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${dropdown === "testers" ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdown === "testers" && (
              <div className="absolute top-full left-0 pt-0 w-[280px]"
                onMouseEnter={() => openMenu("testers")} onMouseLeave={closeMenu}>
                <div className="bg-[var(--bg)] rounded-xl border border-black/[0.06] shadow-lg shadow-black/[0.06] py-2 animate-in">
                  {TESTERS_MENU.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setDropdown(null)}
                      className="flex flex-col px-4 py-2.5 hover:bg-[var(--bg-2)] transition-colors">
                      <span className="text-[13px] font-medium text-[var(--text)]">{item.label}</span>
                      <span className="text-[11px] text-[var(--text-dim)]">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* For Business dropdown */}
          <div className="relative"
            onMouseEnter={() => openMenu("business")}
            onMouseLeave={closeMenu}>
            <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              dropdown === "business" ? "text-[var(--text)] bg-black/[0.03]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}>
              For businesses
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${dropdown === "business" ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dropdown === "business" && (
              <div className="absolute top-full left-0 pt-0 w-[280px]"
                onMouseEnter={() => openMenu("business")} onMouseLeave={closeMenu}>
                <div className="bg-[var(--bg)] rounded-xl border border-black/[0.06] shadow-lg shadow-black/[0.06] py-2 animate-in">
                  {BUSINESS_MENU.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setDropdown(null)}
                      className="flex flex-col px-4 py-2.5 hover:bg-[var(--bg-2)] transition-colors">
                      <span className="text-[13px] font-medium text-[var(--text)]">{item.label}</span>
                      <span className="text-[11px] text-[var(--text-dim)]">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/explore" className="px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Explore</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium">Dashboard</Link>
              <Link href="/submit" className="btn btn-accent text-[13px] !py-2 !px-5">Post a test</Link>
            </>
          ) : (
            <>
              <button onClick={() => {
                if (window.location.pathname === "/") {
                  window.dispatchEvent(new CustomEvent("open-auth", { detail: "tester" }));
                } else {
                  window.location.href = "/?auth=tester";
                }
              }} className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Log in</button>
              <button onClick={() => {
                if (window.location.pathname === "/") {
                  window.dispatchEvent(new CustomEvent("open-auth", { detail: "tester" }));
                } else {
                  window.location.href = "/?auth=tester";
                }
              }} className="btn btn-accent text-[13px] !py-2 !px-5">Sign up</button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2 text-[var(--text)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 7h16" /><path d="M4 12h12" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-black/[0.04] animate-in">
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">For testers</p>
            {TESTERS_MENU.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block py-2.5 border-b border-black/[0.03] last:border-0">
                <span className="text-[15px] text-[var(--text-2)] font-medium block">{link.label}</span>
                <span className="text-[12px] text-[var(--text-dim)]">{link.desc}</span>
              </Link>
            ))}
            <p className="text-[10px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2 mt-5">For businesses</p>
            {BUSINESS_MENU.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block py-2.5 border-b border-black/[0.03] last:border-0">
                <span className="text-[15px] text-[var(--text-2)] font-medium block">{link.label}</span>
                <span className="text-[12px] text-[var(--text-dim)]">{link.desc}</span>
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {user ? (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="btn btn-accent w-full">Dashboard</Link>
              ) : (
                <button onClick={() => {
                  setOpen(false);
                  if (window.location.pathname === "/") {
                    window.dispatchEvent(new CustomEvent("open-auth", { detail: "tester" }));
                  } else {
                    window.location.href = "/?auth=tester";
                  }
                }} className="btn btn-accent w-full">Sign up</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
