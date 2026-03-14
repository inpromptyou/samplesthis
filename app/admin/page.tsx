"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Tab = "overview" | "waitlist" | "orders" | "testers" | "applications";
type Obj = Record<string, unknown>;

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "waitlist", label: "Waitlist", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "orders", label: "Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "testers", label: "Testers", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { key: "applications", label: "Applications", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

const SC: Record<string, string> = {
  paid: "bg-green-50 text-green-700 border-green-200",
  pending_payment: "bg-yellow-50 text-yellow-700 border-yellow-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  active: "bg-green-50 text-green-700 border-green-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  banned: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  refunded: "bg-purple-50 text-purple-700 border-purple-200",
};

function s(v: unknown) { return String(v || ""); }
function n(v: unknown) { return Number(v) || 0; }
function Badge({ status }: { status: string }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${SC[status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>{status}</span>;
}
function timeAgo(d: unknown) {
  const mins = Math.floor((Date.now() - new Date(s(d)).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}
function dom(url: unknown) {
  try { return new URL(s(url)).hostname.replace("www.", ""); } catch { return s(url); }
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Obj>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin?tab=${t}`, { headers: { "x-admin-key": authKey } });
      if (!r.ok) { setAuthed(false); return; }
      setData(await r.json());
    } catch { setAuthed(false); }
    setLoading(false);
  }, [authKey]);

  useEffect(() => { if (authed) load(tab); }, [tab, authed, load]);

  const act = async (method: string, body: Obj) => {
    const id = `${body.type}-${body.id}-${body.status || "del"}`;
    setBusy(id);
    await fetch("/api/admin", { method, headers: { "Content-Type": "application/json", "x-admin-key": authKey }, body: JSON.stringify(body) });
    setBusy("");
    load(tab);
  };

  const payout = async (appId: unknown) => {
    const id = `payout-${appId}`;
    setBusy(id);
    const r = await fetch("/api/connect/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": authKey },
      body: JSON.stringify({ application_id: appId }),
    });
    const d = await r.json();
    setBusy("");
    if (r.ok) { alert(`Paid! $${(d.payout_cents / 100).toFixed(2)} to tester (fee: $${(d.platform_fee_cents / 100).toFixed(2)})`); }
    else { alert(`Payout failed: ${d.error}`); }
    load(tab);
  };

  const login = async () => {
    const r = await fetch("/api/admin?tab=overview", { headers: { "x-admin-key": key } });
    if (r.ok) { setAuthed(true); setAuthKey(key); } else { alert("Wrong key"); }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-2)] px-5">
        <div className="bg-white rounded-2xl border border-black/[0.06] p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Image src="/logo.png" alt="Flinchify" width={28} height={28} />
            <span className="h text-[15px] font-bold">Admin</span>
          </div>
          <input className="input mb-3" type="password" placeholder="Admin key" value={key}
            onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          <button onClick={login} className="btn btn-primary w-full">Sign in</button>
        </div>
      </div>
    );
  }

  const stats = (data.stats || {}) as Record<string, number>;
  const orders = (data.orders || []) as Obj[];
  const testers = (data.testers || []) as Obj[];
  const applications = (data.applications || []) as Obj[];

  const Btn = ({ onClick, color, children, id }: { onClick: () => void; color: string; children: React.ReactNode; id?: string }) => (
    <button onClick={onClick} disabled={busy === id} className={`px-2 py-1 rounded-lg text-[11px] border font-medium hover:opacity-80 transition-opacity ${color}`}>
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-2)] flex">
      <aside className="hidden md:flex flex-col w-[220px] bg-white border-r border-black/[0.04] p-5 shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <Image src="/logo.png" alt="Flinchify" width={24} height={24} />
          <span className="h text-[14px] font-bold text-[var(--text)]">Admin</span>
        </Link>
        <nav className="space-y-0.5 flex-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                tab === t.key ? "bg-black/[0.04] text-[var(--text)]" : "text-[var(--text-muted)] hover:bg-black/[0.02]"
              }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
              {t.label}
            </button>
          ))}
        </nav>
        <Link href="/" className="text-[11px] text-[var(--text-dim)] hover:text-[var(--text)] mt-4">Back to site</Link>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.04] px-2 h-[50px] flex items-center gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium ${tab === t.key ? "bg-black/[0.05] text-[var(--text)]" : "text-[var(--text-dim)]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-5 md:p-8 pt-16 md:pt-8 overflow-y-auto min-w-0">
        {loading ? <div className="py-20 text-center text-[var(--text-dim)]">Loading...</div> : <>

        {tab === "overview" && (
          <div>
            <h1 className="h text-lg font-bold text-[var(--text)] mb-5">Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { l: "Total Testers", v: stats.totalTesters },
                { l: "Total Orders", v: stats.totalOrders },
                { l: "Paid Orders", v: stats.paidOrders, c: "text-green-600" },
                { l: "Pending", v: stats.pendingOrders, c: "text-yellow-600" },
                { l: "Applications", v: stats.totalApplications },
                { l: "Revenue", v: `$${((stats.totalRevenue || 0) / 100).toFixed(2)}`, c: "text-green-600" },
              ].map(x => (
                <div key={x.l} className="bg-white rounded-xl border border-black/[0.04] p-4">
                  <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-1">{x.l}</p>
                  <p className={`h text-xl font-bold ${x.c || "text-[var(--text)]"}`}>{x.v}</p>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {(["orders", "testers", "applications"] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} className="bg-white rounded-xl border border-black/[0.04] p-4 text-left hover:border-black/[0.08] transition-colors">
                  <span className="text-[13px] font-medium text-[var(--accent)]">View {t} →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "waitlist" && (() => {
          const entries = (data.entries || []) as Obj[];
          const wStats = (data.stats || {}) as Record<string, number>;
          const exportCSV = () => {
            const header = "Email,Name,Role,Signed Up\n";
            const rows = entries.map(e => `${s(e.email)},${s(e.name).replace(/,/g, "")},${s(e.role) || "tester"},${new Date(s(e.created_at)).toISOString()}`).join("\n");
            const blob = new Blob([header + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `flinchify-waitlist-${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          };
          return (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="h text-lg font-bold text-[var(--text)]">Waitlist ({wStats.total || 0})</h1>
                <button onClick={exportCSV} className="btn btn-outline text-[12px] !py-1.5 !px-4">Export CSV</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {[
                  { l: "Total Signups", v: wStats.total || 0 },
                  { l: "Testers", v: wStats.testers || 0, c: "text-green-600" },
                  { l: "Developers", v: wStats.developers || 0, c: "text-blue-600" },
                  { l: "Both", v: wStats.both || 0, c: "text-purple-600" },
                  { l: "Today", v: wStats.today || 0, c: "text-orange-600" },
                  { l: "This Week", v: wStats.thisWeek || 0 },
                ].map(x => (
                  <div key={x.l} className="bg-white rounded-xl border border-black/[0.04] p-4">
                    <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-medium mb-1">{x.l}</p>
                    <p className={`h text-xl font-bold ${x.c || "text-[var(--text)]"}`}>{x.v}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {entries.map((e) => (
                  <div key={n(e.id)} className="bg-white rounded-xl border border-black/[0.04] p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center text-[12px] font-bold text-orange-700 shrink-0">
                        {(s(e.name) || s(e.email)).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-[var(--text)] truncate">{s(e.name) || "No name"}</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            s(e.role) === "developer" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            s(e.role) === "both" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            "bg-green-50 text-green-700 border-green-200"
                          }`}>{s(e.role) || "tester"}</span>
                        </div>
                        <p className="text-[12px] text-[var(--text-dim)] truncate">{s(e.email)}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[var(--text-dim)] shrink-0">{timeAgo(e.created_at)}</span>
                  </div>
                ))}
                {entries.length === 0 && <p className="text-[var(--text-dim)] py-8 text-center">No signups yet. Start marketing!</p>}
              </div>
            </div>
          );
        })()}

        {tab === "orders" && (
          <div>
            <h1 className="h text-lg font-bold text-[var(--text)] mb-5">Orders ({orders.length})</h1>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={n(o.id)} className="bg-white rounded-xl border border-black/[0.04] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="h text-[14px] font-semibold">{dom(o.app_url)}</span>
                        <Badge status={s(o.status)} />
                        {o.app_type ? <span className="text-[10px] text-[var(--text-dim)] bg-black/[0.03] px-2 py-0.5 rounded-full">{s(o.app_type)}</span> : null}
                      </div>
                      <p className="text-[12px] text-[var(--text-dim)] mt-0.5">{s(o.email)} · {timeAgo(o.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="h text-[15px] font-bold">${(n(o.price_cents) / 100).toFixed(0)}</p>
                      <p className="text-[10px] text-[var(--text-dim)]">{n(o.testers_count)} x ${(n(o.price_per_tester_cents) / 100).toFixed(0)}</p>
                    </div>
                  </div>
                  {o.description ? <p className="text-[12px] text-[var(--text-muted)] mb-2 line-clamp-2">{s(o.description)}</p> : null}
                  {o.target_audience ? <p className="text-[11px] text-[var(--text-dim)] mb-2">Audience: {s(o.target_audience)}</p> : null}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="text-[var(--text-dim)]">{n(o.apps_count)} apps, {n(o.accepted_count)} accepted</span>
                    <div className="flex-1" />
                    {s(o.status) === "pending_payment" && <Btn onClick={() => act("PATCH", { type: "order", id: o.id, status: "paid" })} color="bg-green-50 text-green-700 border-green-200">Mark Paid</Btn>}
                    {s(o.status) === "paid" && <Btn onClick={() => act("PATCH", { type: "order", id: o.id, status: "completed" })} color="bg-blue-50 text-blue-700 border-blue-200">Complete</Btn>}
                    <Btn onClick={() => act("PATCH", { type: "order", id: o.id, status: "refunded" })} color="bg-purple-50 text-purple-700 border-purple-200">Refund</Btn>
                    <Btn onClick={() => { if (confirm("Delete order?")) act("DELETE", { type: "order", id: o.id }); }} color="bg-red-50 text-red-600 border-red-200">Delete</Btn>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-[var(--text-dim)]">No orders yet.</p>}
            </div>
          </div>
        )}

        {tab === "testers" && (
          <div>
            <h1 className="h text-lg font-bold text-[var(--text)] mb-5">Testers ({testers.length})</h1>
            <div className="space-y-3">
              {testers.map((t) => {
                const devices: string[] = (() => { try { return JSON.parse(s(t.devices)); } catch { return []; } })();
                const interests: string[] = (() => { try { return JSON.parse(s(t.interests)); } catch { return []; } })();
                return (
                  <div key={n(t.id)} className="bg-white rounded-xl border border-black/[0.04] p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full grad-warm-bg flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                          {s(t.name).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="h text-[14px] font-semibold">{s(t.name)}</span>
                            <Badge status={s(t.status)} />
                          </div>
                          <p className="text-[12px] text-[var(--text-dim)]">{s(t.email)} · {s(t.location) || "No location"} · {timeAgo(t.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 text-[11px] text-[var(--text-dim)]">
                        <p>{n(t.total_apps)} apps</p>
                        <p>{n(t.accepted_apps)} accepted</p>
                      </div>
                    </div>
                    {t.age_range ? <p className="text-[11px] text-[var(--text-dim)] mb-1">Age: {s(t.age_range)}, Tech: {n(t.tech_comfort)}/5</p> : null}
                    {devices.length > 0 ? <div className="flex flex-wrap gap-1 mb-1">{devices.map(d => <span key={d} className="text-[10px] bg-black/[0.03] px-2 py-0.5 rounded-full text-[var(--text-dim)]">{d}</span>)}</div> : null}
                    {interests.length > 0 ? <div className="flex flex-wrap gap-1 mb-2">{interests.map(i => <span key={i} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">{i}</span>)}</div> : null}
                    {t.bio ? <p className="text-[11px] text-[var(--text-muted)] mb-2 line-clamp-2">{s(t.bio)}</p> : null}
                    <div className="flex items-center gap-2 text-[11px]">
                      <div className="flex-1" />
                      {s(t.status) === "active" && <Btn onClick={() => act("PATCH", { type: "tester", id: t.id, status: "banned" })} color="bg-red-50 text-red-600 border-red-200">Ban</Btn>}
                      {s(t.status) === "banned" && <Btn onClick={() => act("PATCH", { type: "tester", id: t.id, status: "active" })} color="bg-green-50 text-green-700 border-green-200">Unban</Btn>}
                      <Btn onClick={() => { if (confirm(`Delete ${s(t.name)}?`)) act("DELETE", { type: "tester", id: t.id }); }} color="bg-red-50 text-red-600 border-red-200">Delete</Btn>
                    </div>
                  </div>
                );
              })}
              {testers.length === 0 && <p className="text-[var(--text-dim)]">No testers yet.</p>}
            </div>
          </div>
        )}

        {tab === "applications" && (
          <div>
            <h1 className="h text-lg font-bold text-[var(--text)] mb-5">Applications ({applications.length})</h1>
            <div className="space-y-3">
              {applications.map((a) => (
                <div key={n(a.id)} className="bg-white rounded-xl border border-black/[0.04] p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="h text-[13px] font-semibold">{s(a.tester_name)}</span>
                        <span className="text-[11px] text-[var(--text-dim)]">→</span>
                        <span className="text-[13px] text-[var(--text-muted)]">{dom(a.app_url)}</span>
                        <Badge status={s(a.status)} />
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{s(a.tester_email)} · {timeAgo(a.created_at)}</p>
                    </div>
                    <p className="h text-[14px] font-bold shrink-0">${(n(a.price_per_tester_cents) / 100).toFixed(0)}</p>
                  </div>
                  {a.note ? <p className="text-[11px] text-[var(--text-muted)] mb-2 italic">{s(a.note)}</p> : null}
                  {a.payout_transfer_id ? <p className="text-[10px] text-green-600 mb-2">Paid ${(n(a.payout_cents) / 100).toFixed(2)} · {s(a.payout_transfer_id)}</p> : null}
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="flex-1" />
                    {s(a.status) === "pending" && <>
                      <Btn onClick={() => act("PATCH", { type: "application", id: a.id, status: "accepted" })} color="bg-green-50 text-green-700 border-green-200">Accept</Btn>
                      <Btn onClick={() => act("PATCH", { type: "application", id: a.id, status: "rejected" })} color="bg-red-50 text-red-600 border-red-200">Reject</Btn>
                    </>}
                    {s(a.status) === "accepted" && !a.payout_transfer_id ? <Btn onClick={() => { if (confirm("Complete & pay tester?")) payout(a.id); }} color="bg-green-50 text-green-700 border-green-200" id={`payout-${a.id}`}>Complete & Pay</Btn> : null}
                    <Btn onClick={() => { if (confirm("Delete?")) act("DELETE", { type: "application", id: a.id }); }} color="bg-red-50 text-red-600 border-red-200">Delete</Btn>
                  </div>
                </div>
              ))}
              {applications.length === 0 && <p className="text-[var(--text-dim)]">No applications yet.</p>}
            </div>
          </div>
        )}

        </>}
      </main>
    </div>
  );
}
