import Link from "next/link";
import Image from "next/image";

const COLS = [
  { title: "For testers", links: [{ href: "/become-a-tester", label: "Sign up" }, { href: "/explore", label: "Explore jobs" }, { href: "/referrals", label: "Referrals" }, { href: "/dashboard", label: "Dashboard" }] },
  { title: "For businesses", links: [{ href: "/submit", label: "Post a test" }, { href: "/pricing", label: "Pricing" }, { href: "/how-it-works", label: "How it works" }] },
  { title: "Company", links: [{ href: "/about", label: "About" }, { href: "/contact", label: "Contact" }, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.04]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10 sm:mb-12">
          <div className="col-span-2 sm:col-span-1">
            <Image src="/logo.png" alt="Flinchify" width={28} height={28} className="mb-3" />
            <p className="text-[12px] text-[var(--text-dim)] leading-[1.6]">Find the flinch before<br />your users do.</p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-semibold text-[var(--text)] mb-3">{col.title}</p>
              <div className="space-y-2">
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} className="block text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-black/[0.04]">
          <p className="text-[11px] text-[var(--text-dim)]">&copy; {new Date().getFullYear()} Flinchify. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://x.com/Flinchify" target="_blank" rel="noopener noreferrer" className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <p className="text-[11px] text-[var(--text-dim)]">Made in Australia</p>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-dim)]/50 text-center mt-4 leading-relaxed max-w-xl mx-auto">
          Flinchify, the Flinchify logo, &quot;Find the flinch,&quot; and all associated marks, designs, and content 
          are the exclusive property of Flinchify and may not be reproduced, distributed, or used without prior 
          written permission. All third-party trademarks shown are property of their respective owners.
        </p>
      </div>
    </footer>
  );
}
