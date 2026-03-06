import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Pricing() {
  return (
    <>
      <Nav />
      <main className="pt-20 min-h-screen">
        <div className="max-w-[900px] mx-auto px-5 py-16 md:py-24">
          <div className="text-center mb-14">
            <h1 className="h text-3xl md:text-4xl font-bold text-[var(--text)] mb-3">Simple pricing</h1>
            <p className="text-[16px] text-[var(--text-muted)] max-w-md mx-auto">No subscriptions. No hidden fees. Pay per tester, set your own budget.</p>
          </div>

          {/* How pricing works */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-8 md:p-10 mb-8">
            <h2 className="h text-[18px] font-bold text-[var(--text)] mb-6">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <span className="h text-[16px] font-bold text-[var(--accent)]">1</span>
                </div>
                <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">Choose testers</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">Pick how many testers you want. From 1 to 100.</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <span className="h text-[16px] font-bold text-[var(--accent)]">2</span>
                </div>
                <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">Set your price</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">Pay $5+ per tester. Higher pay attracts faster, more experienced testers.</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <span className="h text-[16px] font-bold text-[var(--accent)]">3</span>
                </div>
                <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">Get results</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">Real humans test your app. You get honest feedback on what breaks.</p>
              </div>
            </div>
          </div>

          {/* Suggested budgets */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { tier: "Economy", price: 8, desc: "Good for quick checks", testers: "1-3 testers", speed: "24-48h", quality: "Mixed experience" },
              { tier: "Standard", price: 12, desc: "Best value for most tests", testers: "3-10 testers", speed: "12-24h", quality: "Experienced testers", popular: true },
              { tier: "Priority", price: 20, desc: "Fast, thorough coverage", testers: "5-20 testers", speed: "Under 12h", quality: "Top-rated testers" },
            ].map(t => (
              <div key={t.tier} className={`rounded-2xl border p-6 relative ${t.popular ? "border-[var(--accent)] bg-orange-50/30" : "border-black/[0.06] bg-white"}`}>
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-semibold uppercase tracking-wider">Most popular</div>
                )}
                <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-1">{t.tier}</p>
                <p className="h text-3xl font-bold text-[var(--text)] mb-1">${t.price}<span className="text-[14px] text-[var(--text-muted)] font-normal"> / tester</span></p>
                <p className="text-[13px] text-[var(--text-muted)] mb-5">{t.desc}</p>
                <div className="space-y-2 text-[12px]">
                  {[t.testers, t.speed, t.quality].map(f => (
                    <div key={f} className="flex items-center gap-2 text-[var(--text-muted)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-[13px] text-[var(--text-dim)] mb-4">These are suggestions. You set whatever price you want ($5 minimum).</p>
            <Link href="/submit" className="btn btn-accent text-[14px] !px-8 !py-3">Post a test</Link>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="h text-[18px] font-bold text-[var(--text)] mb-6 text-center">Common questions</h2>
            <div className="space-y-4">
              {[
                { q: "What do I get for my money?", a: "Real humans testing your app and reporting what confused them, what broke, and what they loved. You get written feedback with screenshots and screen recordings." },
                { q: "How do testers get paid?", a: "Testers connect their bank account via Stripe. When you mark a test as complete, they get paid automatically. We handle everything." },
                { q: "What if a tester does a bad job?", a: "You can reject low-quality submissions. You only pay for work you accept. Bad testers get removed from the platform." },
                { q: "Is there a subscription?", a: "No. Pay per test, when you need it. No monthly fees, no commitments." },
                { q: "Can I get a refund?", a: "If no testers accept your job within 7 days, you get a full refund. Otherwise, contact us and we'll sort it out." },
              ].map(f => (
                <div key={f.q} className="bg-white rounded-xl border border-black/[0.06] p-5">
                  <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">{f.q}</h3>
                  <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
