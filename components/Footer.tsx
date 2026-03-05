import Link from "next/link";

const COLS = [
  { title: "Product", links: [{ href: "/submit", label: "Post a test job" }, { href: "/pricing", label: "Budget guide" }, { href: "/how-it-works", label: "How it works" }] },
  { title: "Testers", links: [{ href: "/become-a-tester", label: "Become a tester" }, { href: "/how-it-works#testers", label: "How earning works" }] },
  { title: "Company", links: [{ href: "/about", label: "About" }, { href: "/contact", label: "Contact" }, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.05] bg-[var(--bg-2)]">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="w-9 h-9 rounded-[12px] grad-warm-bg flex items-center justify-center shadow-lg shadow-orange-500/15 mb-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4" /></svg>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] leading-[1.8]">Find the flinch before<br />your users do.</p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="h text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-5">{col.title}</p>
              <div className="space-y-3">
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} className="block text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200">{l.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-black/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-[var(--text-dim)]">&copy; 2026 Flinchify. All rights reserved.</p>
          <p className="text-[11px] text-[var(--text-dim)]">Made in Australia</p>
        </div>
      </div>
    </footer>
  );
}
