import Link from "next/link";
import Image from "next/image";

const COLS = [
  { title: "For testers", links: [{ href: "/become-a-tester", label: "Sign up" }, { href: "/jobs", label: "Browse jobs" }, { href: "/dashboard", label: "Dashboard" }] },
  { title: "For businesses", links: [{ href: "/submit", label: "Post a test" }, { href: "/how-it-works", label: "How it works" }] },
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
          <p className="text-[11px] text-[var(--text-dim)]">&copy; 2026 Flinchify</p>
          <p className="text-[11px] text-[var(--text-dim)]">Made in Australia</p>
        </div>
      </div>
    </footer>
  );
}
