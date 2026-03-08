"use client";

import { useState } from "react";

const APP_TYPES = ["Web app", "Mobile app", "SaaS", "Chrome extension", "Desktop app", "API/CLI", "Other"];

export default function PostTestForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    app_url: "",
    app_type: "",
    description: "",
    target_audience: "",
    testers_count: 5,
    price_per_tester: 12,
    custom_price: "",
    booking_enabled: false,
    booking_date: "",
    booking_time: "",
    booking_duration: 30,
  });

  const pricePerTester = form.custom_price ? Number(form.custom_price) : form.price_per_tester;
  const total = form.testers_count * pricePerTester;
  const isValidPrice = pricePerTester >= 5;

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_url: form.app_url,
          app_type: form.app_type,
          description: form.description,
          target_audience: form.target_audience,
          testers_count: form.testers_count,
          price_per_tester: pricePerTester,
          ...(form.booking_enabled && {
            booking: {
              scheduled_date: form.booking_date,
              scheduled_time: form.booking_time,
              duration_minutes: form.booking_duration,
            },
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h2 className="h text-[18px] font-bold text-[var(--text)] mb-2">Test job posted!</h2>
        <p className="text-[13px] text-[var(--text-muted)]">Testers will start applying soon. You'll be notified by email.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-black/[0.04]">
            <div className={`h-full rounded-full transition-all duration-500 ${step >= s ? "grad-warm-bg w-full" : "w-0"}`} />
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="h text-[15px] font-semibold text-[var(--text)]">About your app</h3>
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">App URL</label>
            <input className="input" type="url" placeholder="https://yourapp.com" value={form.app_url}
              onChange={e => setForm({ ...form, app_url: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">App type</label>
            <div className="flex flex-wrap gap-2">
              {APP_TYPES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, app_type: t })}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                    form.app_type === t ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-black/[0.06] text-[var(--text-dim)] hover:border-orange-200"
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">What should testers do?</label>
            <textarea className="input min-h-[100px] resize-y" placeholder="E.g. Sign up, complete onboarding, try to make a purchase. Note anything confusing or broken."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Target audience (optional)</label>
            <input className="input" placeholder="E.g. Women 25-40 who shop online" value={form.target_audience}
              onChange={e => setForm({ ...form, target_audience: e.target.value })} />
          </div>

          {/* Schedule a test session */}
          <div className="border border-black/[0.06] rounded-xl p-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.booking_enabled}
                onChange={e => setForm({ ...form, booking_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-black/[0.15] accent-orange-500" />
              <div>
                <span className="text-[13px] font-medium text-[var(--text)]">Schedule a test session</span>
                <p className="text-[11px] text-[var(--text-dim)]">Book a specific date & time for the tester to test your app live</p>
              </div>
            </label>
            {form.booking_enabled && (
              <div className="mt-4 space-y-3 pt-3 border-t border-black/[0.04]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Date</label>
                    <input className="input" type="date" value={form.booking_date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setForm({ ...form, booking_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Time</label>
                    <input className="input" type="time" value={form.booking_time}
                      onChange={e => setForm({ ...form, booking_time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Duration</label>
                  <select className="input" value={form.booking_duration}
                    onChange={e => setForm({ ...form, booking_duration: Number(e.target.value) })}>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => { if (form.app_url && form.description && (!form.booking_enabled || (form.booking_date && form.booking_time))) setStep(2); }}
            disabled={!form.app_url || !form.description || (form.booking_enabled && (!form.booking_date || !form.booking_time))}
            className="btn btn-primary w-full disabled:opacity-40">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="h text-[15px] font-semibold text-[var(--text)]">Set your budget</h3>
          
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Number of testers</label>
            <div className="flex items-center gap-4">
              <input type="range" min={1} max={50} value={form.testers_count}
                onChange={e => setForm({ ...form, testers_count: Number(e.target.value) })}
                className="flex-1 accent-orange-500" />
              <span className="h text-[18px] font-bold text-[var(--text)] w-10 text-right">{form.testers_count}</span>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">Price per tester</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { per: 8, label: "Economy" },
                { per: 12, label: "Standard" },
                { per: 20, label: "Priority" },
              ].map(b => (
                <button key={b.per} onClick={() => setForm({ ...form, price_per_tester: b.per, custom_price: "" })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    form.price_per_tester === b.per && !form.custom_price
                      ? "border-orange-300 bg-orange-50"
                      : "border-black/[0.06] hover:border-orange-200"
                  }`}>
                  <p className="h text-[16px] font-bold text-[var(--text)]">${b.per}</p>
                  <p className="text-[11px] text-[var(--text-dim)]">{b.label}</p>
                </button>
              ))}
            </div>
            <div>
              <input className="input" type="number" min={5} placeholder="Custom price ($5 min)"
                value={form.custom_price} onChange={e => setForm({ ...form, custom_price: e.target.value })} />
            </div>
          </div>

          <div className="bg-[var(--bg-2)] rounded-xl p-4">
            <div className="flex justify-between text-[14px] mb-1">
              <span className="text-[var(--text-muted)]">{form.testers_count} testers × ${pricePerTester}</span>
              <span className="h font-bold text-[var(--text)]">${total}</span>
            </div>
            {!isValidPrice && <p className="text-[12px] text-red-500">Minimum $5 per tester</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn btn-outline flex-1">Back</button>
            <button onClick={() => { if (isValidPrice) setStep(3); }}
              disabled={!isValidPrice}
              className="btn btn-primary flex-1 disabled:opacity-40">Review</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="h text-[15px] font-semibold text-[var(--text)]">Review & pay</h3>

          <div className="space-y-3">
            <div className="bg-[var(--bg-2)] rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><span className="text-[var(--text-dim)]">URL</span><p className="font-medium text-[var(--text)] truncate">{form.app_url}</p></div>
                <div><span className="text-[var(--text-dim)]">Type</span><p className="font-medium text-[var(--text)]">{form.app_type || "—"}</p></div>
                <div><span className="text-[var(--text-dim)]">Testers</span><p className="font-medium text-[var(--text)]">{form.testers_count}</p></div>
                <div><span className="text-[var(--text-dim)]">Per tester</span><p className="font-medium text-[var(--text)]">${pricePerTester}</p></div>
              </div>
            </div>
            <div className="bg-[var(--bg-2)] rounded-xl p-4">
              <span className="text-[12px] text-[var(--text-dim)]">Tasks</span>
              <p className="text-[13px] text-[var(--text)] mt-1">{form.description}</p>
            </div>
            {form.booking_enabled && form.booking_date && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <span className="text-[12px] text-blue-600 font-medium">Scheduled session</span>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[13px]">
                  <div><span className="text-blue-400">Date</span><p className="font-medium text-blue-800">{new Date(form.booking_date + "T00:00:00").toLocaleDateString("en-AU")}</p></div>
                  <div><span className="text-blue-400">Time</span><p className="font-medium text-blue-800">{form.booking_time}</p></div>
                  <div><span className="text-blue-400">Duration</span><p className="font-medium text-blue-800">{form.booking_duration}m</p></div>
                </div>
              </div>
            )}
            <div className="bg-black rounded-xl p-4 flex justify-between items-center">
              <span className="text-[14px] text-white/60">Total</span>
              <span className="h text-xl font-bold text-white">${total} AUD</span>
            </div>
          </div>

          {error && <p className="text-[13px] text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn btn-outline flex-1">Back</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn btn-primary flex-1 disabled:opacity-60">
              {submitting ? "Processing..." : `Pay $${total} & post`}
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-dim)] text-center">Secure payment via Stripe. You'll be redirected to checkout.</p>
        </div>
      )}
    </div>
  );
}
