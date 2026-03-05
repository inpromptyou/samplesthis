"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LiveCounter from "./LiveCounter";

const MENUS = [
  {
    label: "For Businesses",
    items: [
      { href: "/submit", title: "Post a Test Job", desc: "Submit your app and set your budget" },
      { href: "/how-it-works", title: "How It Works", desc: "From submission to results" },
      { href: "/pricing", title: "Pricing Guide", desc: "Recommended budgets and plans" },
    ],
  },
  {
    label: "For Testers",
    items: [
      { href: "/become-a-tester", title: "Become a Tester", desc: "Sign up in 60 seconds" },
      { href: "/how-it-works#testers", title: "How Earning Works", desc: "Get matched, test, get paid" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/about", title: "About", desc: "Our story and mission" },
      { href: "/contact", title: "Contact", desc: "Get in touch" },
    ],
  },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-white/[0.04]"
        : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo only — no text */}
        <Link href="/" className="flex items-center group">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-[var(--accent)]/20 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </Link>

        {/* Desktop nav with dropdowns */}
        <div className="hidden md:flex items-center gap-1">
          {MENUS.map((menu) => (
            <div key={menu.label} className="dropdown relative">
              <button className="font-display text-[13px] font-medium text-white/50 hover:text-white px-3 py-2 transition-colors flex items-center gap-1">
                {menu.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className="dropdown-menu absolute top-full left-0 pt-2 w-64">
                <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl p-2 shadow-2xl shadow-black/40">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="font-display text-[13px] font-semibold text-white">{item.title}</span>
                      <span className="text-[11px] text-white/30 mt-0.5">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          <LiveCounter />
          <Link href="/submit" className="btn btn-primary font-display text-[13px] !py-2 !px-5 !rounded-full">
            Post a test
          </Link>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/60 hover:text-white transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0B0F19]/95 backdrop-blur-2xl border-t border-white/[0.04] max-h-[80vh] overflow-y-auto">
          <div className="px-6 py-5 space-y-1">
            {MENUS.map((menu) => (
              <div key={menu.label}>
                <button
                  onClick={() => setMobileMenu(mobileMenu === menu.label ? null : menu.label)}
                  className="w-full flex items-center justify-between py-2.5 font-display text-[14px] font-medium text-white/60"
                >
                  {menu.label}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform ${mobileMenu === menu.label ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {mobileMenu === menu.label && (
                  <div className="pl-3 pb-2 space-y-1">
                    {menu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block py-2 text-[13px] text-white/40 hover:text-white transition-colors"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 space-y-3">
              <LiveCounter />
              <Link href="/submit" onClick={() => setOpen(false)} className="btn btn-primary w-full !rounded-full font-display text-[14px]">
                Post a test
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
