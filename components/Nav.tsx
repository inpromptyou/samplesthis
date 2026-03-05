"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LiveCounter from "./LiveCounter";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/become-a-tester", label: "Become a tester" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-black/70 backdrop-blur-2xl border-b border-white/[0.06]"
        : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span className="text-[16px] font-semibold tracking-tight text-white">ShipTest</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[13px] text-white/60 hover:text-white transition-colors duration-200">
              {l.label}
            </Link>
          ))}
          <LiveCounter />
          <Link href="/submit" className="btn btn-primary text-[13px] !py-2 !px-5 !rounded-full">
            Get testers
          </Link>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/60 hover:text-white transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 8h16" /><path d="M4 16h16" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/90 backdrop-blur-2xl border-t border-white/[0.06]">
          <div className="px-6 py-5 space-y-4">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-[15px] text-white/70 hover:text-white py-1 transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <LiveCounter />
            </div>
            <Link href="/submit" onClick={() => setOpen(false)} className="btn btn-primary w-full !rounded-full text-[14px] mt-3">
              Get testers
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
