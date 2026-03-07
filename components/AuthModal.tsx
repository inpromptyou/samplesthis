"use client";

import { useState, useEffect } from "react";

interface AuthModalProps {
  mode: "tester" | "business" | "login";
  open: boolean;
  onClose: () => void;
  onSuccess: (data: { type: "tester" | "business"; email?: string }) => void;
}

export default function AuthModal({ mode, open, onClose, onSuccess }: AuthModalProps) {
  // Tester fields
  const [tStep, setTStep] = useState(1);
  const [tForm, setTForm] = useState({
    name: "", email: "", age: "", gender: "",
    devices: [] as string[], interests: [] as string[],
    linkedin: "", portfolio: "", twitter: "", github: "",
  });
  const [tLoading, setTLoading] = useState(false);
  const [tError, setTError] = useState("");

  // Business fields
  const [bEmail, setBEmail] = useState("");
  const [bCompany, setBCompany] = useState("");
  const [bCodeSent, setBCodeSent] = useState(false);
  const [bCode, setBCode] = useState("");
  const [bLoading, setBLoading] = useState(false);
  const [bError, setBError] = useState("");

  // Login fields
  const [lEmail, setLEmail] = useState("");
  const [lCodeSent, setLCodeSent] = useState(false);
  const [lCode, setLCode] = useState("");
  const [lLoading, setLLoading] = useState(false);
  const [lError, setLError] = useState("");
  const [lType, setLType] = useState<"tester" | "business">("tester");

  const [checking] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTStep(1); setTError(""); setBCodeSent(false); setBCode(""); setBError("");
      setLCodeSent(false); setLCode(""); setLError(""); setLEmail("");
    }
  }, [open]);

  if (!open) return null;

  const DEVICES = ["iPhone", "Android", "Windows PC", "Mac", "iPad/Tablet"];
  const INTERESTS = ["E-commerce", "SaaS", "Fintech", "Health", "Gaming", "Social", "Education", "Crypto", "Productivity", "Food & Drink"];

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  // ═══ TESTER SIGNUP ═══
  async function submitTester() {
    setTLoading(true); setTError("");
    try {
      const res = await fetch("/api/testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tForm.name, email: tForm.email, age: tForm.age, gender: tForm.gender,
          devices: tForm.devices, interests: tForm.interests,
          linkedin: tForm.linkedin, portfolio: tForm.portfolio,
          twitter: tForm.twitter, github: tForm.github,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      onSuccess({ type: "tester" });
    } catch (e: unknown) {
      setTError(e instanceof Error ? e.message : "Failed");
    }
    setTLoading(false);
  }

  // ═══ BUSINESS VERIFY ═══
  async function sendCode() {
    setBLoading(true); setBError("");
    try {
      const res = await fetch("/api/business/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: bEmail, company: bCompany }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBCodeSent(true);
    } catch (e: unknown) {
      setBError(e instanceof Error ? e.message : "Failed");
    }
    setBLoading(false);
  }

  async function verifyCode() {
    setBLoading(true); setBError("");
    try {
      const res = await fetch("/api/business/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email: bEmail, code: bCode, company: bCompany }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess({ type: "business", email: bEmail });
    } catch (e: unknown) {
      setBError(e instanceof Error ? e.message : "Invalid code");
    }
    setBLoading(false);
  }

  // ═══ LOGIN ═══
  async function loginSendCode() {
    setLLoading(true); setLError("");
    try {
      // Try tester login first
      const tRes = await fetch("/api/testers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: lEmail }),
      });
      if (tRes.ok) {
        setLType("tester");
        setLCodeSent(true);
        setLLoading(false);
        return;
      }
      // Try business login
      const bRes = await fetch("/api/business/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: lEmail }),
      });
      if (bRes.ok) {
        setLType("business");
        setLCodeSent(true);
        setLLoading(false);
        return;
      }
      const data = await tRes.json();
      throw new Error(data.error || "No account found with this email");
    } catch (e: unknown) {
      setLError(e instanceof Error ? e.message : "Failed");
    }
    setLLoading(false);
  }

  async function loginVerifyCode() {
    setLLoading(true); setLError("");
    try {
      const endpoint = lType === "tester" ? "/api/testers/login" : "/api/business/verify";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email: lEmail, code: lCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      onSuccess({ type: lType, email: lEmail });
    } catch (e: unknown) {
      setLError(e instanceof Error ? e.message : "Invalid code");
    }
    setLLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors text-[var(--text-dim)] z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        {checking ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-black/10 border-t-[var(--accent)] rounded-full animate-spin mx-auto" />
          </div>
        ) : mode === "login" ? (
          /* ═══ LOGIN ═══ */
          <div className="p-6 sm:p-8">
            <h2 className="h text-xl font-bold text-[var(--text)] mb-1">Welcome back</h2>
            <p className="text-[13px] text-[var(--text-muted)] mb-5">
              {lCodeSent ? `Enter the code sent to ${lEmail}` : "Log in with your email"}
            </p>

            {/* Google button */}
            {!lCodeSent && (
              <>
                <a href="/api/auth/google?role=tester"
                  className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-lg border border-black/[0.08] bg-white hover:bg-black/[0.02] transition-colors text-[13px] font-medium text-[var(--text)]">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </a>
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px flex-1 bg-black/[0.06]" />
                  <span className="text-[11px] text-[var(--text-dim)]">or use email</span>
                  <div className="h-px flex-1 bg-black/[0.06]" />
                </div>
              </>
            )}

            {!lCodeSent ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Email</label>
                  <input className="input" type="email" placeholder="you@email.com" value={lEmail}
                    onChange={e => setLEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && loginSendCode()} />
                </div>
                {lError && <p className="text-[13px] text-red-600">{lError}</p>}
                <button onClick={loginSendCode} disabled={lLoading || !lEmail}
                  className="btn btn-primary w-full disabled:opacity-40">
                  {lLoading ? "Sending..." : "Send login code"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">6-digit code</label>
                  <input className="input text-center text-xl tracking-[0.3em] font-mono" type="text" maxLength={6}
                    placeholder="000000" value={lCode}
                    onChange={e => setLCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={e => e.key === "Enter" && loginVerifyCode()} />
                </div>
                {lError && <p className="text-[13px] text-red-600">{lError}</p>}
                <button onClick={loginVerifyCode} disabled={lLoading || lCode.length !== 6}
                  className="btn btn-primary w-full disabled:opacity-40">
                  {lLoading ? "Verifying..." : "Log in"}
                </button>
                <button onClick={() => { setLCodeSent(false); setLCode(""); setLError(""); }}
                  className="text-[12px] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors w-full text-center">
                  Use a different email
                </button>
              </div>
            )}
          </div>
        ) : mode === "business" ? (
          /* ═══ BUSINESS AUTH ═══ */
          <div className="p-6 sm:p-8">
            <h2 className="h text-xl font-bold text-[var(--text)] mb-1">Post a test</h2>
            <p className="text-[13px] text-[var(--text-muted)] mb-5">
              {bCodeSent ? `Enter the code sent to ${bEmail}` : "Sign in to get started"}
            </p>

            {/* Google button */}
            {!bCodeSent && (
              <>
                <a href="/api/auth/google?role=business"
                  className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-lg border border-black/[0.08] bg-white hover:bg-black/[0.02] transition-colors text-[13px] font-medium text-[var(--text)]">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </a>
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px flex-1 bg-black/[0.06]" />
                  <span className="text-[11px] text-[var(--text-dim)]">or use email</span>
                  <div className="h-px flex-1 bg-black/[0.06]" />
                </div>
              </>
            )}

            {!bCodeSent ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Work email</label>
                  <input className="input" type="email" placeholder="you@company.com" value={bEmail}
                    onChange={e => setBEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && sendCode()} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Company (optional)</label>
                  <input className="input" placeholder="Your company" value={bCompany}
                    onChange={e => setBCompany(e.target.value)} />
                </div>
                {bError && <p className="text-[13px] text-red-600">{bError}</p>}
                <button onClick={sendCode} disabled={bLoading || !bEmail}
                  className="btn btn-primary w-full disabled:opacity-40">
                  {bLoading ? "Sending..." : "Send verification code"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">6-digit code</label>
                  <input className="input text-center text-xl tracking-[0.3em] font-mono" type="text" maxLength={6}
                    placeholder="000000" value={bCode}
                    onChange={e => setBCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={e => e.key === "Enter" && verifyCode()} />
                </div>
                {bError && <p className="text-[13px] text-red-600">{bError}</p>}
                <button onClick={verifyCode} disabled={bLoading || bCode.length !== 6}
                  className="btn btn-primary w-full disabled:opacity-40">
                  {bLoading ? "Verifying..." : "Verify & continue"}
                </button>
                <button onClick={() => { setBCodeSent(false); setBCode(""); setBError(""); }}
                  className="text-[12px] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors w-full text-center">
                  Use a different email
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ═══ TESTER SIGNUP ═══ */
          <div className="p-6 sm:p-8">
            <h2 className="h text-xl font-bold text-[var(--text)] mb-1">Become a tester</h2>
            <p className="text-[13px] text-[var(--text-muted)] mb-5">
              {tStep === 1 ? "Sign up to start earning." :
               tStep === 2 ? "What devices do you use?" :
               tStep === 3 ? "What are you into?" : "Optional: add your links"}
            </p>

            {/* Progress */}
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-black/[0.04]">
                  <div className={`h-full rounded-full transition-all duration-500 ${tStep >= s ? "grad-warm-bg w-full" : "w-0"}`} />
                </div>
              ))}
            </div>

            {tStep === 1 && (
              <div className="space-y-3">
                {/* Google button */}
                <a href="/api/auth/google?role=tester"
                  className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-lg border border-black/[0.08] bg-white hover:bg-black/[0.02] transition-colors text-[13px] font-medium text-[var(--text)]">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </a>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-black/[0.06]" />
                  <span className="text-[11px] text-[var(--text-dim)]">or</span>
                  <div className="h-px flex-1 bg-black/[0.06]" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Full name</label>
                  <input className="input" placeholder="Your name" value={tForm.name}
                    onChange={e => setTForm({ ...tForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Email</label>
                  <input className="input" type="email" placeholder="you@email.com" value={tForm.email}
                    onChange={e => setTForm({ ...tForm, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Age range</label>
                    <select className="select" value={tForm.age} onChange={e => setTForm({ ...tForm, age: e.target.value })}>
                      <option value="">Select</option>
                      {["18-24", "25-34", "35-44", "45-54", "55+"].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1">Gender</label>
                    <select className="select" value={tForm.gender} onChange={e => setTForm({ ...tForm, gender: e.target.value })}>
                      <option value="">Select</option>
                      {["Male", "Female", "Non-binary", "Prefer not to say"].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => { if (tForm.name && tForm.email) setTStep(2); }}
                  disabled={!tForm.name || !tForm.email}
                  className="btn btn-primary w-full disabled:opacity-40">Continue</button>
              </div>
            )}

            {tStep === 2 && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {DEVICES.map(d => (
                    <button key={d} onClick={() => setTForm({ ...tForm, devices: toggleArr(tForm.devices, d) })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                        tForm.devices.includes(d) ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-black/[0.06] text-[var(--text-dim)] hover:border-orange-200"
                      }`}>{d}</button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setTStep(1)} className="btn btn-outline flex-1">Back</button>
                  <button onClick={() => setTStep(3)} disabled={tForm.devices.length === 0}
                    className="btn btn-primary flex-1 disabled:opacity-40">Continue</button>
                </div>
              </div>
            )}

            {tStep === 3 && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button key={interest} onClick={() => setTForm({ ...tForm, interests: toggleArr(tForm.interests, interest) })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                        tForm.interests.includes(interest) ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-black/[0.06] text-[var(--text-dim)] hover:border-orange-200"
                      }`}>{interest}</button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setTStep(2)} className="btn btn-outline flex-1">Back</button>
                  <button onClick={() => setTStep(4)} disabled={tForm.interests.length === 0}
                    className="btn btn-primary flex-1 disabled:opacity-40">Continue</button>
                </div>
              </div>
            )}

            {tStep === 4 && (
              <div className="space-y-3">
                <input className="input" placeholder="LinkedIn URL (optional)" value={tForm.linkedin}
                  onChange={e => setTForm({ ...tForm, linkedin: e.target.value })} />
                <input className="input" placeholder="Portfolio URL (optional)" value={tForm.portfolio}
                  onChange={e => setTForm({ ...tForm, portfolio: e.target.value })} />
                <input className="input" placeholder="Twitter/X (optional)" value={tForm.twitter}
                  onChange={e => setTForm({ ...tForm, twitter: e.target.value })} />
                <input className="input" placeholder="GitHub (optional)" value={tForm.github}
                  onChange={e => setTForm({ ...tForm, github: e.target.value })} />
                {tError && <p className="text-[13px] text-red-600">{tError}</p>}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setTStep(3)} className="btn btn-outline flex-1">Back</button>
                  <button onClick={submitTester} disabled={tLoading}
                    className="btn btn-primary flex-1 disabled:opacity-60">
                    {tLoading ? "Creating..." : "Start earning"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
