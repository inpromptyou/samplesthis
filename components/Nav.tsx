"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface DropdownItem { href: string; label: string; desc?: string; }

interface DropdownItemFull extends DropdownItem { authRequired?: boolean; authMode?: string; }

const NAV_DROPDOWNS: { label: string; items: DropdownItemFull[] }[] = [
  {
    label: "How it Works",
    items: [
      { href: "/how-it-works", label: "Overview", desc: "The full testing process" },
      { href: "/pricing", label: "Pricing", desc: "Pay per tester, no subscriptions" },
      { href: "/about", label: "About Flinchify", desc: "Why we exist" },
      { href: "/terms", label: "Terms of Service", desc: "Rules and agreements" },
      { href: "/privacy", label: "Privacy Policy", desc: "How we handle your data" },
    ],
  },
  {
    label: "For Testers",
    items: [
      { href: "#", label: "Become a Tester", desc: "Sign up and start earning", authRequired: true, authMode: "tester" },
      { href: "/explore", label: "Browse Jobs", desc: "See open test jobs" },
      { href: "#", label: "Tester Dashboard", desc: "Manage your tests", authRequired: true, authMode: "login" },
    ],
  },
  {
    label: "For Builders",
    items: [
      { href: "#", label: "Post a Test", desc: "Get real user feedback", authRequired: true, authMode: "tester" },
      { href: "/integrations", label: "Integrations", desc: "ChatGPT, Claude, Cursor, CLI" },
      { href: "/pricing", label: "Pricing", desc: "Simple pay-per-tester" },
      { href: "/contact", label: "Contact Us", desc: "Questions? Reach out" },
    ],
  },
];

interface UserInfo { type: "tester" | "business"; name?: string; email?: string; }

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/testers/me").then(r => r.json()).then(d => {
      if (d.id) setUser({ type: "tester", name: d.name, email: d.email });
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
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const handleDropdownEnter = (idx: number) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(idx);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const triggerAuth = (mode: string) => {
    if (window.location.pathname === "/") {
      window.dispatchEvent(new CustomEvent("open-auth", { detail: mode }));
    } else {
      window.location.href = `/?auth=${mode}`;
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
      scrolled || mobileOpen
        ? "bg-white/95 backdrop-blur-xl border-black/[0.04]"
        : "bg-transparent border-transparent"
    }`}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 h-[56px] sm:h-[60px] flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="Flinchify" width={32} height={32} className="sm:w-9 sm:h-9" priority />
        </Link>

        {/* Desktop nav — dropdowns */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_DROPDOWNS.map((dropdown, idx) => (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => handleDropdownEnter(idx)}
              onMouseLeave={handleDropdownLeave}
            >
              <button className="px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
                {dropdown.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`transition-transform ${openDropdown === idx ? 'rotate-180' : ''}`}>
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>

              {openDropdown === idx && (
                <div className="absolute top-full left-0 mt-1 w-[240px] bg-white rounded-xl border border-black/[0.06] shadow-lg py-2 animate-in fade-in duration-150">
                  {dropdown.items.map((item, i) => {
                    if (item.authRequired && !user) {
                      return (
                        <button
                          key={i}
                          className="block w-full text-left px-4 py-2.5 hover:bg-black/[0.02] transition-colors"
                          onClick={() => { setOpenDropdown(null); triggerAuth(item.authMode || "tester"); }}
                        >
                          <div className="text-[13px] font-medium text-[var(--text)]">{item.label}</div>
                          {item.desc && <div className="text-[11px] text-[var(--text-dim)] mt-0.5">{item.desc}</div>}
                        </button>
                      );
                    }
                    const resolvedHref = item.authRequired && user
                      ? (item.authMode === "login" ? "/dashboard" : "/submit")
                      : item.href;
                    return (
                      <Link
                        key={i}
                        href={resolvedHref}
                        className="block px-4 py-2.5 hover:bg-black/[0.02] transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <div className="text-[13px] font-medium text-[var(--text)]">{item.label}</div>
                        {item.desc && <div className="text-[11px] text-[var(--text-dim)] mt-0.5">{item.desc}</div>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium">Dashboard</Link>
              <button onClick={signOut} className="btn btn-outline text-[13px] !py-2 !px-5">Sign out</button>
            </>
          ) : (
            <>
              <button onClick={() => triggerAuth("login")} className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Log in</button>
              <button onClick={() => triggerAuth("tester")} className="btn btn-accent text-[13px] !py-2 !px-5">Sign up</button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 -mr-2 text-[var(--text)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 7h16" /><path d="M4 12h12" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu — accordion style */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-black/[0.04] animate-in max-h-[80vh] overflow-y-auto">
          <div className="px-5 py-4 space-y-0">
            {NAV_DROPDOWNS.map((dropdown, idx) => (
              <MobileAccordion key={idx} label={dropdown.label} items={dropdown.items} onNavigate={() => setMobileOpen(false)} user={user} />
            ))}
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn btn-accent w-full">Dashboard</Link>
                  <button onClick={() => { setMobileOpen(false); signOut(); }} className="btn btn-outline w-full">Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); triggerAuth("login"); }} className="btn btn-outline w-full">Log in</button>
                  <button onClick={() => { setMobileOpen(false); triggerAuth("tester"); }} className="btn btn-accent w-full">Sign up</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileAccordion({ label, items, onNavigate, user }: { label: string; items: DropdownItemFull[]; onNavigate: () => void; user: UserInfo | null }) {
  const [open, setOpen] = useState(false);

  const triggerAuth = (mode: string) => {
    onNavigate();
    if (window.location.pathname === "/") {
      window.dispatchEvent(new CustomEvent("open-auth", { detail: mode }));
    } else {
      window.location.href = `/?auth=${mode}`;
    }
  };

  return (
    <div className="border-b border-black/[0.03]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3.5 text-[15px] text-[var(--text-2)] font-medium">
        {label}
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>
      {open && (
        <div className="pb-3 pl-3 space-y-0.5">
          {items.map((item, i) => {
            if (item.authRequired && !user) {
              return (
                <button key={i} onClick={() => triggerAuth(item.authMode || "tester")} className="block py-2 text-[14px] text-[var(--text-muted)] text-left">
                  {item.label}
                </button>
              );
            }
            const resolvedHref = item.authRequired && user
              ? (item.authMode === "login" ? "/dashboard" : "/submit")
              : item.href;
            return (
              <Link key={i} href={resolvedHref} onClick={onNavigate} className="block py-2 text-[14px] text-[var(--text-muted)]">
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
