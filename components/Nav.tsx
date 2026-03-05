"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

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

        {/* Desktop links — hidden below md (768px) */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/jobs" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Browse jobs</Link>
          <Link href="/how-it-works" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">How it works</Link>
          <Link href="/become-a-tester" className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Become a tester</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/submit" className="btn btn-accent text-[13px] !py-2 !px-5">Post a test</Link>
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
          <div className="px-5 py-5 space-y-1">
            {[
              { href: "/jobs", label: "Browse jobs" },
              { href: "/how-it-works", label: "How it works" },
              { href: "/become-a-tester", label: "Become a tester" },
              { href: "/dashboard", label: "Dashboard" },
            ].map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block py-3 text-[16px] text-[var(--text-2)] font-medium border-b border-black/[0.03] last:border-0">
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <Link href="/submit" onClick={() => setOpen(false)} className="btn btn-accent w-full">Post a test</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
