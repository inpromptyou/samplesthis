import Link from "next/link";

const COLS = [
  {
    title: "Product",
    links: [
      { href: "/submit", label: "Get testers" },
      { href: "/pricing", label: "Pricing" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Testers",
    links: [
      { href: "/become-a-tester", label: "Become a tester" },
      { href: "/how-it-works#testers", label: "How earning works" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"><path d="M9 12l2 2 4-4" /></svg>
              </div>
              <span className="text-[14px] font-semibold">ShipTest</span>
            </div>
            <p className="text-[12px] text-white/25 leading-relaxed">
              Real humans testing real apps.<br />Ship with confidence.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold text-white/20 uppercase tracking-[0.15em] mb-4">{col.title}</p>
              <div className="space-y-2.5">
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href} className="block text-[13px] text-white/35 hover:text-white/70 transition-colors duration-200">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/15">&copy; 2026 ShipTest. All rights reserved.</p>
          <p className="text-[11px] text-white/15">Made in Australia</p>
        </div>
      </div>
    </footer>
  );
}
