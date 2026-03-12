"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import PostTestForm from "@/components/PostTestForm";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface Tester {
  id: number; name: string; email: string; age_range: string | null;
  location: string | null; devices: string; interests: string;
  tech_comfort: number; bio: string | null; tests_completed: number;
  total_earned_cents: number; avg_rating: number; stripe_onboarded: boolean;
  credit_cents: number; created_at: string;
  linkedin: string; twitter: string; github: string; portfolio: string;
}

interface MyApp {
  id: number; order_id: number; status: string; app_url: string;
  app_type: string | null; job_description: string | null;
  price_per_tester_cents: number; feedback: string | null;
  screen_recording_url: string | null; payout_cents: number;
  payout_transfer_id: string | null; created_at: string; submitted_at: string | null;
}

interface Booking {
  id: number; order_id: number; tester_id: number | null;
  scheduled_date: string; scheduled_time: string; timezone: string;
  duration_minutes: number; status: string; app_ready: boolean;
  app_ready_deadline: string | null; notes: string | null;
  created_at: string; confirmed_at: string | null; completed_at: string | null;
  app_url: string; app_type: string | null; job_description: string | null;
  tester_name?: string; tester_email?: string;
}

interface ExploreJob {
  id: number; app_url: string; app_type: string | null; description: string | null;
  target_audience: string | null; testers_count: number; price_cents: number;
  price_per_tester_cents: number; status: string; applications_count: number;
  accepted_count: number; created_at: string;
}

/* ═══════════════════════════════════════════════
   NAV CONFIG
   ═══════════════════════════════════════════════ */

const NAV_ITEMS = [
  { key: "overview", label: "Overview", section: "main", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { key: "explore", label: "Explore Jobs", section: "main", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
  )},
  { key: "myjobs", label: "My Jobs", section: "main", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
  )},
  { key: "posttest", label: "Post a Test", section: "main", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  )},
  { key: "bookings", label: "Bookings", section: "main", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { key: "payouts", label: "Payouts", section: "finance", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
  )},
  { key: "api", label: "API & Credits", section: "finance", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
  )},
  { key: "profile", label: "Profile", section: "account", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { key: "settings", label: "Settings", section: "account", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  )},
  { key: "admin", label: "Admin", section: "admin", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
  )},
];

const ADMIN_EMAILS = ["inpromptyou@gmail.com", "flinchify@gmail.com"];

const SORT_OPTIONS = ["Newest", "Highest pay", "Most spots"];
const TYPE_FILTERS = ["All", "Web App", "Mobile App", "SaaS", "E-commerce", "Other"];

/* ═══════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════ */

function dom(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}
function avatarColor(s: string) {
  const c = ["#F97316","#EF4444","#8B5CF6","#06B6D4","#10B981","#F59E0B","#EC4899","#6366F1"];
  let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
}

/* ═══════════════════════════════════════════════
   THEME HOOK
   ═══════════════════════════════════════════════ */

function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = localStorage.getItem("dash-theme") as "light" | "dark" | null;
    const t = saved || "light";
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);
  const setTheme = (t: "light" | "dark") => {
    setThemeState(t);
    localStorage.setItem("dash-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };
  const toggle = () => setTheme(theme === "light" ? "dark" : "light");
  return { theme, toggle };
}

/* ═══════════════════════════════════════════════
   MINI CHARTS (SVG)
   ═══════════════════════════════════════════════ */

function BarChart({ data, color = "#F97316" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 280, h = 120, gap = 4;
  const barW = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      {data.map((v, i) => {
        const barH = (v / max) * (h - 8);
        return (
          <rect key={i} x={i * (barW + gap)} y={h - barH} width={barW} height={barH}
            rx={3} fill={color} opacity={0.15 + (0.85 * (v / max))} />
        );
      })}
    </svg>
  );
}

function LineChart({ data, color = "#10B981" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 280, h = 100, px = 4;
  const pts = data.map((v, i) => {
    const x = px + (i / (data.length - 1)) * (w - 2 * px);
    const y = h - px - (v / max) * (h - 2 * px);
    return `${x},${y}`;
  });
  const areaPath = `M${px},${h} L${pts.join(" L")} L${w - px},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lc-grad)" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((v, i) => {
        const x = px + (i / (data.length - 1)) * (w - 2 * px);
        const y = h - px - (v / max) * (h - 2 * px);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════ */

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dash-bg, #F9FAFB)", color: "var(--dash-text-dim, #9CA3AF)" }}>
        Loading...
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD SHELL
   ═══════════════════════════════════════════════ */

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggle } = useTheme();
  const [tester, setTester] = useState<Tester | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get("tab") || "overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<{ onboarded: boolean; hasAccount: boolean } | null>(null);
  const [myApps, setMyApps] = useState<MyApp[]>([]);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [submitForm, setSubmitForm] = useState<{ id: number; feedback: string; recording: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [exploreJobs, setExploreJobs] = useState<ExploreJob[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreSort, setExploreSort] = useState("Newest");
  const [exploreFilter, setExploreFilter] = useState("All");
  const [applying, setApplying] = useState<number | null>(null);
  const [appliedSet, setAppliedSet] = useState<Set<number>>(new Set());
  const [applyError, setApplyError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingAction, setBookingAction] = useState<number | null>(null);
  const [postedJobs, setPostedJobs] = useState<ExploreJob[]>([]);
  const [postedLoading, setPostedLoading] = useState(false);
  const [managingJob, setManagingJob] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [cancellingJob, setCancellingJob] = useState(false);
  // Notifications
  const [notifications, setNotifications] = useState<{ id: number; type: string; title: string; message: string; link: string | null; read: boolean; created_at: string }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiOpen, setNotiOpen] = useState(false);

  useEffect(() => {
    fetch("/api/testers/me")
      .then(r => r.json())
      .then(d => { if (!d.authenticated) { router.push("/"); return; } setTester(d.tester); setLoading(false); })
      .catch(() => router.push("/"));
    fetch("/api/connect/status").then(r => r.json()).then(d => setConnectStatus(d)).catch(() => {});
    fetch("/api/notifications").then(r => r.json()).then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unread || 0); }).catch(() => {});
  }, [router]);

  // Poll notifications every 30s
  useEffect(() => {
    const iv = setInterval(() => {
      fetch("/api/notifications").then(r => r.json()).then(d => { setNotifications(d.notifications || []); setUnreadCount(d.unread || 0); }).catch(() => {});
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (tab === "myjobs") {
      setMyAppsLoading(true);
      fetch("/api/applications/mine").then(r => r.json()).then(d => { setMyApps(d.applications || []); setMyAppsLoading(false); }).catch(() => setMyAppsLoading(false));
    }
    if (tab === "explore") {
      setExploreLoading(true);
      fetch("/api/orders").then(r => r.json()).then(d => { setExploreJobs(d.jobs || []); setExploreLoading(false); }).catch(() => setExploreLoading(false));
    }
    if (tab === "bookings") {
      setBookingsLoading(true);
      fetch("/api/bookings").then(r => r.json()).then(d => { setBookings(d.bookings || []); setBookingsLoading(false); }).catch(() => setBookingsLoading(false));
    }
    if (tab === "overview") {
      // Fetch active jobs + bookings for overview cards
      fetch("/api/applications/mine").then(r => r.json()).then(d => setMyApps(d.applications || [])).catch(() => {});
      fetch("/api/bookings").then(r => r.json()).then(d => setBookings(d.bookings || [])).catch(() => {});
    }
    if (tab === "overview" || tab === "posttest") {
      setPostedLoading(true);
      fetch("/api/orders/mine").then(r => r.json()).then(d => { setPostedJobs(d.orders || []); setPostedLoading(false); }).catch(() => setPostedLoading(false));
    }
  }, [tab]);

  /* ─── Actions ─── */
  const applyToJob = async (jobId: number) => {
    setApplying(jobId); setApplyError("");
    try {
      const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order_id: jobId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppliedSet(prev => new Set(prev).add(jobId));
    } catch (e: unknown) { setApplyError(e instanceof Error ? e.message : "Failed to apply"); }
    setApplying(null);
  };

  const submitResults = async () => {
    if (!submitForm || !submitForm.feedback) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/applications/submit", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: submitForm.id, feedback: submitForm.feedback, screen_recording_url: submitForm.recording || null }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSubmitForm(null);
      const apps = await fetch("/api/applications/mine").then(r2 => r2.json());
      setMyApps(apps.applications || []);
      if (d.payout?.paid) alert(`Submitted! You earned $${(d.payout.amount / 100).toFixed(2)}`);
      else alert("Submitted! " + (d.payout?.error || "Payout will process once you set up Stripe."));
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Failed to submit"); }
    setSubmitting(false);
  };

  const handleBookingAction = async (bookingId: number, action: string) => {
    setBookingAction(bookingId);
    try {
      const r = await fetch(`/api/bookings/${bookingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const res = await fetch("/api/bookings").then(r2 => r2.json());
      setBookings(res.bookings || []);
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Action failed"); }
    setBookingAction(null);
  };

  const loadApplicants = useCallback(async (orderId: number) => {
    setManagingJob(orderId); setApplicantsLoading(true);
    try { const r = await fetch(`/api/orders/${orderId}/applicants`); const d = await r.json(); setJobApplicants(d.applicants || []); }
    catch { setJobApplicants([]); }
    setApplicantsLoading(false);
  }, []);

  const handleApplicant = async (orderId: number, applicationId: number, action: "accept" | "deny") => {
    setActionLoading(applicationId);
    try {
      const r = await fetch(`/api/orders/${orderId}/applicants`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ application_id: applicationId, action }) });
      const d = await r.json();
      if (!r.ok) { alert(d.error); setActionLoading(null); return; }
      await loadApplicants(orderId);
    } catch { alert("Action failed"); }
    setActionLoading(null);
  };

  const cancelJob = async (orderId: number) => {
    if (!confirm("Cancel this job? You'll receive credit (no cash refund).")) return;
    setCancellingJob(true);
    try {
      const r = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) { alert(d.error); setCancellingJob(false); return; }
      alert(d.message); setManagingJob(null);
      fetch("/api/orders/mine").then(r2 => r2.json()).then(d2 => setPostedJobs(d2.orders || []));
    } catch { alert("Cancel failed"); }
    setCancellingJob(false);
  };

  const setupPayouts = async () => {
    setConnectLoading(true);
    try {
      const r = await fetch("/api/connect/onboard", { method: "POST" });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      alert(d.error || "Failed to start payout setup");
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Something went wrong"); }
    setConnectLoading(false);
  };

  const switchTab = (key: string) => { setTab(key); setSidebarOpen(false); };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read_all: true }) });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  /* ─── Loading state ─── */
  if (loading || !tester) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dash-bg)", color: "var(--dash-text-dim)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, border: "3px solid var(--dash-border)", borderTopColor: "#F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13 }}>Loading dashboard...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const devices = (() => { try { return JSON.parse(tester.devices); } catch { return []; } })();
  const interests = (() => { try { return JSON.parse(tester.interests); } catch { return []; } })();
  const earned = (tester.total_earned_cents || 0) / 100;
  const memberSince = new Date(tester.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  /* ─── Sidebar sections ─── */
  const isAdmin = tester && ADMIN_EMAILS.includes(tester.email?.toLowerCase());
  const sections = [
    { id: "main", label: null, items: NAV_ITEMS.filter(n => n.section === "main") },
    { id: "finance", label: "Finance", items: NAV_ITEMS.filter(n => n.section === "finance") },
    { id: "account", label: "Account", items: NAV_ITEMS.filter(n => n.section === "account") },
    ...(isAdmin ? [{ id: "admin", label: "Admin", items: NAV_ITEMS.filter(n => n.section === "admin") }] : []),
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--dash-bg)", color: "var(--dash-text)", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══════ MOBILE OVERLAY ══════ */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90, display: "block" }} />
      )}

      {/* ══════ SIDEBAR ══════ */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: 240, background: "var(--dash-sidebar)", borderRight: "1px solid var(--dash-border)",
        display: "flex", flexDirection: "column", zIndex: 100,
        transition: "transform 0.2s ease",
      }} className={`sidebar-aside ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/logo.png" alt="Flinchify" width={28} height={28} />
            <span className="h" style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text)" }}>Flinchify</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotiOpen(!notiOpen)}
                style={{ background: "none", border: "none", color: "var(--dash-text-secondary)", cursor: "pointer", padding: 4, position: "relative" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 0, right: 0, width: 16, height: 16, borderRadius: "50%",
                    background: "#EF4444", color: "white", fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              {/* Notification dropdown */}
              {notiOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: -80, width: 300, maxHeight: 400,
                  background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)", zIndex: 200, overflow: "hidden", marginTop: 8,
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: "none", border: "none", fontSize: 12, color: "#F97316", cursor: "pointer", fontWeight: 500 }}>Mark all read</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "var(--dash-text-dim)" }}>No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => { if (n.link) { setTab(n.link.includes("tab=") ? n.link.split("tab=")[1] : "overview"); } setNotiOpen(false); }}
                          style={{
                            padding: "12px 16px", borderBottom: "1px solid var(--dash-border)",
                            cursor: n.link ? "pointer" : "default",
                            background: n.read ? "transparent" : "rgba(249,115,22,0.04)",
                          }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                            {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316", marginTop: 6, flexShrink: 0 }} />}
                            <div>
                              <p style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: "var(--dash-text)", margin: 0 }}>{n.title}</p>
                              {n.message && <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>{n.message}</p>}
                              <p style={{ fontSize: 10, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>{new Date(n.created_at).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Mobile close */}
            <button onClick={() => setSidebarOpen(false)} className="sidebar-close"
              style={{ display: "none", background: "none", border: "none", color: "var(--dash-text-dim)", cursor: "pointer", padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
          {sections.map(sec => (
            <div key={sec.id} style={{ marginBottom: 8 }}>
              {sec.label && (
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "12px 8px 4px", margin: 0 }}>
                  {sec.label}
                </p>
              )}
              {sec.items.map(item => {
                const active = tab === item.key;
                return (
                  <button key={item.key} onClick={() => switchTab(item.key)} style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: active ? 600 : 500, textAlign: "left",
                    background: active ? "var(--dash-active)" : "transparent",
                    color: active ? "var(--dash-active-text)" : "var(--dash-text-secondary)",
                    transition: "all 0.15s ease",
                  }}
                    onMouseEnter={e => { if (!active) (e.currentTarget.style.background = "var(--dash-hover)"); }}
                    onMouseLeave={e => { if (!active) (e.currentTarget.style.background = "transparent"); }}
                  >
                    <span style={{ display: "flex", opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: theme + user */}
        <div style={{ padding: "12px 12px 16px", borderTop: "1px solid var(--dash-border)" }}>
          {/* Theme toggle */}
          <button onClick={toggle} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px",
            borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: "transparent", color: "var(--dash-text-secondary)", textAlign: "left",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--dash-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            )}
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 0" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #F97316, #F59E0B)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {tester.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tester.name}</p>
              <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tester.email}</p>
            </div>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
              style={{ background: "none", border: "none", color: "var(--dash-text-dim)", cursor: "pointer", padding: 4, flexShrink: 0 }}
              title="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="dash-main" style={{ marginLeft: 240, flex: 1, minHeight: "100vh", background: "var(--dash-bg)" }}>
        {/* Top bar (mobile) */}
        <header className="dash-topbar" style={{
          display: "none", position: "sticky", top: 0, zIndex: 50,
          background: "var(--dash-sidebar)", borderBottom: "1px solid var(--dash-border)",
          padding: "12px 16px", alignItems: "center", justifyContent: "space-between",
        }}>
          <button onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", color: "var(--dash-text)", cursor: "pointer", padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo.png" alt="Flinchify" width={24} height={24} />
            <span className="h" style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text)" }}>Flinchify</span>
          </Link>
          <button onClick={toggle} style={{ background: "none", border: "none", color: "var(--dash-text-dim)", cursor: "pointer", padding: 4 }}>
            {theme === "light" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            )}
          </button>
        </header>

        {/* Page content */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 48px" }}>

          {/* ═══ OVERVIEW ═══ */}
          {tab === "overview" && (
            <div>
              <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 24px" }}>
                Welcome back, {tester.name.split(" ")[0]}
              </h1>

              {/* Payout banner */}
              {connectStatus && !connectStatus.onboarded && (
                <div style={{
                  background: theme === "dark" ? "rgba(249,115,22,0.1)" : "#FFF7ED",
                  border: `1px solid ${theme === "dark" ? "rgba(249,115,22,0.2)" : "#FDBA74"}`,
                  borderRadius: 12, padding: "16px 20px", marginBottom: 24,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                }}>
                  <div>
                    <p className="h" style={{ fontSize: 14, fontWeight: 600, color: theme === "dark" ? "#FB923C" : "#9A3412", margin: 0 }}>Set up payouts to get paid</p>
                    <p style={{ fontSize: 12, color: theme === "dark" ? "rgba(251,146,60,0.7)" : "#C2410C", margin: "4px 0 0" }}>Connect your bank account to receive payments.</p>
                  </div>
                  <button onClick={setupPayouts} disabled={connectLoading} style={{
                    padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "#F97316", color: "white", fontSize: 13, fontWeight: 600,
                    opacity: connectLoading ? 0.5 : 1,
                  }}>
                    {connectLoading ? "Loading..." : "Set up"}
                  </button>
                </div>
              )}

              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Tests Completed", value: String(tester.tests_completed), accent: false },
                  { label: "Total Earned", value: `$${earned.toFixed(2)}`, accent: true },
                  { label: "Credit Balance", value: tester.credit_cents > 0 ? `$${(tester.credit_cents / 100).toFixed(2)}` : "$0.00", accent: false },
                  { label: "Avg Rating", value: tester.avg_rating > 0 ? `${tester.avg_rating.toFixed(1)}/5` : "—", accent: false },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "var(--dash-card)", border: "1px solid var(--dash-border)",
                    borderRadius: 12, padding: "20px",
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>{s.label}</p>
                    <p className="h" style={{ fontSize: 24, fontWeight: 700, color: s.accent ? "#F97316" : "var(--dash-text)", margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 16px" }}>Activity (last 7 days)</p>
                  <BarChart data={[2, 5, 3, 8, 4, 6, 1]} color="#F97316" />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                      <span key={d} style={{ fontSize: 10, color: "var(--dash-text-dim)" }}>{d}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 16px" }}>Earnings trend</p>
                  <LineChart data={[0, 12, 8, 25, 18, 30, earned]} color="#10B981" />
                </div>
              </div>

              {/* Two-column: Active jobs + Notifications/Support */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>

                {/* Active jobs (applied) */}
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>Active Jobs</p>
                    <button onClick={() => setTab("myjobs")} style={{ background: "none", border: "none", fontSize: 12, color: "#F97316", cursor: "pointer", fontWeight: 500 }}>View all</button>
                  </div>
                  {myApps.filter(a => a.status === "accepted" || a.status === "pending").length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: 0 }}>No active jobs</p>
                      <button onClick={() => setTab("explore")} style={{ background: "none", border: "none", fontSize: 12, color: "#F97316", cursor: "pointer", marginTop: 4 }}>Browse jobs →</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {myApps.filter(a => a.status === "accepted" || a.status === "pending").slice(0, 4).map(a => (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "var(--dash-bg)" }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--dash-text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dom(a.app_url)}</p>
                            <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>${((a.price_per_tester_cents || 0) / 100).toFixed(0)} · {a.app_type || "App"}</p>
                          </div>
                          <span style={{
                            flexShrink: 0, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, marginLeft: 8,
                            background: a.status === "accepted" ? "rgba(37,99,235,0.1)" : "rgba(234,179,8,0.1)",
                            color: a.status === "accepted" ? "#2563EB" : "#CA8A04",
                          }}>{a.status === "accepted" ? "In Progress" : "Pending"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent notifications */}
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>Notifications</p>
                      {unreadCount > 0 && <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: "#EF4444", color: "white" }}>{unreadCount}</span>}
                    </div>
                    {unreadCount > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", fontSize: 11, color: "#F97316", cursor: "pointer" }}>Mark read</button>}
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--dash-text-dim)", textAlign: "center", padding: "20px 0", margin: 0 }}>No notifications yet</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {notifications.slice(0, 5).map(n => (
                        <div key={n.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", borderRadius: 8, background: n.read ? "transparent" : "rgba(249,115,22,0.04)" }}>
                          {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316", marginTop: 5, flexShrink: 0 }} />}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: "var(--dash-text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</p>
                            <p style={{ fontSize: 10, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>{new Date(n.created_at).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Two-column: Upcoming bookings + Support messages */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                {/* Upcoming bookings */}
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>Upcoming Bookings</p>
                    <button onClick={() => setTab("bookings")} style={{ background: "none", border: "none", fontSize: 12, color: "#F97316", cursor: "pointer", fontWeight: 500 }}>View all</button>
                  </div>
                  {bookings.filter(b => b.status === "pending" || b.status === "confirmed").length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--dash-text-dim)", textAlign: "center", padding: "20px 0", margin: 0 }}>No upcoming bookings</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {bookings.filter(b => b.status === "pending" || b.status === "confirmed").slice(0, 3).map(b => (
                        <div key={b.id} style={{ padding: "10px 12px", borderRadius: 8, background: "var(--dash-bg)" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--dash-text)", margin: 0 }}>{dom(b.app_url)}</p>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, color: b.status === "confirmed" ? "#2563EB" : "#CA8A04", background: b.status === "confirmed" ? "rgba(37,99,235,0.1)" : "rgba(234,179,8,0.1)" }}>{b.status}</span>
                          </div>
                          <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>
                            {new Date(b.scheduled_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })} at {b.scheduled_time} · {b.duration_minutes}min
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Support messages preview */}
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>Support</p>
                  </div>
                  <SupportPreview />
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
                {[
                  { label: "Explore jobs", desc: "Find test jobs and earn", tab: "explore", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                  { label: "Post a test", desc: "Get humans to test your app", tab: "posttest", icon: "M12 4v16m8-8H4" },
                  { label: "API & Credits", desc: "Manage keys and credits", tab: "api", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.74 5.74L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.59l5.96-5.96A6 6 0 1121 9z" },
                ].map(a => (
                  <button key={a.tab} onClick={() => setTab(a.tab)} style={{
                    background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12,
                    padding: "20px 16px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dash-border)"; }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dash-text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}><path d={a.icon}/></svg>
                    <p className="h" style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 2px" }}>{a.label}</p>
                    <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: 0 }}>{a.desc}</p>
                  </button>
                ))}
              </div>

              {/* Posted jobs */}
              {postedJobs.length > 0 && (
                <div>
                  <h2 className="h" style={{ fontSize: 16, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 16px" }}>My posted jobs</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {postedJobs.map(job => (
                      <div key={job.id} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                          <div>
                            <p className="h" style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{dom(job.app_url)}</p>
                            <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>{job.app_type} · Posted {new Date(job.created_at).toLocaleDateString("en-AU")}</p>
                            {job.description && <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{job.description}</p>}
                          </div>
                          <span style={{
                            flexShrink: 0, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: job.status === "paid" ? (theme === "dark" ? "rgba(34,197,94,0.1)" : "#F0FDF4") : (theme === "dark" ? "rgba(234,179,8,0.1)" : "#FFFBEB"),
                            color: job.status === "paid" ? "#16A34A" : "#CA8A04",
                          }}>
                            {job.status === "paid" ? "Live" : job.status}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, fontSize: 12, color: "var(--dash-text-dim)" }}>
                          <span>{job.applications_count || 0} applications</span>
                          <span>{job.accepted_count || 0}/{job.testers_count} accepted</span>
                          <span>${((job.price_per_tester_cents || 0) / 100).toFixed(0)}/tester</span>
                          {job.status === "paid" && (
                            <button onClick={() => loadApplicants(job.id)}
                              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#F97316" }}>
                              Manage →
                            </button>
                          )}
                        </div>

                        {/* Applicant management */}
                        {managingJob === job.id && (
                          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--dash-border)" }}>
                            {applicantsLoading ? (
                              <p style={{ fontSize: 13, color: "var(--dash-text-dim)" }}>Loading applicants...</p>
                            ) : jobApplicants.length === 0 ? (
                              <p style={{ fontSize: 13, color: "var(--dash-text-secondary)" }}>No applicants yet.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Applicants ({jobApplicants.length})</p>
                                {jobApplicants.map((a: { id: number; tester_id: number; name: string; email: string; location: string | null; country: string | null; bio: string | null; tests_completed: number; avg_rating: number; status: string; note: string | null; feedback: string | null; submitted_at: string | null; linkedin: string | null; portfolio: string | null; twitter: string | null; github: string | null; devices: string; interests: string; deadline_at: string | null; accepted_at: string | null }) => (
                                  <div key={a.id} style={{ background: "var(--dash-bg)", borderRadius: 10, padding: 16 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700, flexShrink: 0, backgroundColor: avatarColor(a.name) }}>
                                          {a.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{a.name}</p>
                                          <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>
                                            {a.location || a.country || "Unknown"}
                                            {" · "}
                                            <span style={{ fontWeight: 700, color: a.tests_completed >= 10 ? "#16A34A" : a.tests_completed >= 3 ? "#F97316" : "var(--dash-text-secondary)" }}>
                                              {a.tests_completed} test{a.tests_completed !== 1 ? "s" : ""} completed
                                            </span>
                                            {" · "}{a.avg_rating > 0 ? `${a.avg_rating}/5 rating` : "New tester"}
                                          </p>
                                        </div>
                                      </div>
                                      <span style={{
                                        flexShrink: 0, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                                        background: a.status === "accepted" ? "rgba(34,197,94,0.1)" : a.status === "rejected" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
                                        color: a.status === "accepted" ? "#16A34A" : a.status === "rejected" ? "#EF4444" : "#CA8A04",
                                      }}>{a.status}</span>
                                    </div>
                                    {a.bio && <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "8px 0 0" }}>{a.bio}</p>}
                                    {a.note && <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "4px 0 0", fontStyle: "italic" }}>&quot;{a.note}&quot;</p>}
                                    {a.status === "accepted" && a.deadline_at && (() => {
                                      const expired = new Date(a.deadline_at) < new Date();
                                      return <p style={{ fontSize: 11, marginTop: 6, fontWeight: 500, color: expired ? "#EF4444" : "#F97316" }}>{expired ? "Deadline passed" : `Due: ${new Date(a.deadline_at).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}`}</p>;
                                    })()}
                                    {a.feedback && (
                                      <div style={{ marginTop: 8, padding: 12, background: "var(--dash-card)", borderRadius: 8, border: "1px solid var(--dash-border)" }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", margin: "0 0 4px" }}>Feedback</p>
                                        <p style={{ fontSize: 13, color: "var(--dash-text)", margin: 0 }}>{a.feedback}</p>
                                      </div>
                                    )}
                                    {a.status === "pending" && (
                                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                        <button onClick={() => handleApplicant(job.id, a.id, "accept")} disabled={actionLoading === a.id}
                                          style={{ padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "#16A34A", color: "white", fontSize: 12, fontWeight: 600, opacity: actionLoading === a.id ? 0.5 : 1 }}>
                                          {actionLoading === a.id ? "..." : "Accept"}
                                        </button>
                                        <button onClick={() => handleApplicant(job.id, a.id, "deny")} disabled={actionLoading === a.id}
                                          style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid var(--dash-border)", cursor: "pointer", background: "transparent", color: "#EF4444", fontSize: 12, fontWeight: 600, opacity: actionLoading === a.id ? 0.5 : 1 }}>
                                          {actionLoading === a.id ? "..." : "Deny"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <button onClick={() => cancelJob(job.id)} disabled={cancellingJob}
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#EF4444", fontWeight: 500, opacity: cancellingJob ? 0.5 : 1 }}>
                                {cancellingJob ? "Cancelling..." : "Cancel job"}
                              </button>
                              <button onClick={() => setManagingJob(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--dash-text-dim)" }}>Close</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ EXPLORE ═══ */}
          {tab === "explore" && (() => {
            const filtered = exploreJobs
              .filter(j => {
                const q = exploreSearch.toLowerCase();
                if (q && !dom(j.app_url).toLowerCase().includes(q) && !(j.description || "").toLowerCase().includes(q) && !(j.app_type || "").toLowerCase().includes(q)) return false;
                if (exploreFilter !== "All" && (j.app_type || "").toLowerCase() !== exploreFilter.toLowerCase()) return false;
                return true;
              })
              .sort((a, b) => {
                if (exploreSort === "Highest pay") return (b.price_per_tester_cents || 0) - (a.price_per_tester_cents || 0);
                if (exploreSort === "Most spots") return (b.testers_count - b.accepted_count) - (a.testers_count - a.accepted_count);
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              });
            return (
              <div>
                <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 24px" }}>Explore jobs</h1>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--dash-text-dim)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input type="text" placeholder="Search jobs..." value={exploreSearch} onChange={e => setExploreSearch(e.target.value)}
                      style={{ width: "100%", height: 40, borderRadius: 8, border: "1px solid var(--dash-border)", paddingLeft: 36, paddingRight: 16, fontSize: 13, color: "var(--dash-text)", background: "var(--dash-input-bg)", outline: "none" }} />
                  </div>
                  <select value={exploreSort} onChange={e => setExploreSort(e.target.value)}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--dash-border)", padding: "0 12px", fontSize: 13, color: "var(--dash-text-secondary)", background: "var(--dash-input-bg)", outline: "none" }}>
                    {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {TYPE_FILTERS.map(f => (
                    <button key={f} onClick={() => setExploreFilter(f)} style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                      border: `1px solid ${exploreFilter === f ? "#F97316" : "var(--dash-border)"}`,
                      background: exploreFilter === f ? (theme === "dark" ? "rgba(249,115,22,0.12)" : "#FFF7ED") : "transparent",
                      color: exploreFilter === f ? "#F97316" : "var(--dash-text-secondary)",
                    }}>{f}</button>
                  ))}
                </div>
                {applyError && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 13, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>{applyError}</div>}
                {exploreLoading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} style={{ borderRadius: 10, border: "1px solid var(--dash-border)", padding: 20, opacity: 0.5 }}>
                        <div style={{ height: 16, background: "var(--dash-border)", borderRadius: 4, width: "60%", marginBottom: 8 }} />
                        <div style={{ height: 12, background: "var(--dash-border)", borderRadius: 4, width: "40%" }} />
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <p style={{ color: "var(--dash-text-secondary)", fontSize: 15 }}>No active test jobs right now.</p>
                    <p style={{ fontSize: 13, color: "var(--dash-text-dim)", marginTop: 4 }}>Check back soon.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {filtered.map(job => {
                      const pay = (job.price_per_tester_cents || 0) / 100;
                      const spots = job.testers_count - job.accepted_count;
                      const hasApplied = appliedSet.has(job.id);
                      return (
                        <div key={job.id} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 10, padding: 20, transition: "border-color 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dash-border)"; }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                            <div>
                              <p className="h" style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{dom(job.app_url)}</p>
                              {job.app_type && <span style={{ fontSize: 11, color: "var(--dash-text-dim)" }}>{job.app_type}</span>}
                            </div>
                            <p className="h" style={{ fontSize: 18, fontWeight: 700, color: "var(--dash-text)", margin: 0, flexShrink: 0 }}>${pay.toFixed(0)}</p>
                          </div>
                          {job.description && <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{job.description}</p>}
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 11, color: "var(--dash-text-dim)" }}>
                            <span>{job.applications_count} applied</span>
                            <span>{spots > 0 ? `${spots} spots` : "Full"}</span>
                          </div>
                          {hasApplied ? (
                            <button disabled style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid var(--dash-border)", background: "transparent", fontSize: 12, fontWeight: 500, color: "var(--dash-text-dim)", cursor: "default" }}>Applied</button>
                          ) : spots <= 0 ? (
                            <button disabled style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid var(--dash-border)", background: "transparent", fontSize: 12, fontWeight: 500, color: "var(--dash-text-dim)", cursor: "default" }}>Full</button>
                          ) : (
                            <button onClick={() => applyToJob(job.id)} disabled={applying === job.id}
                              style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: "var(--dash-text)", color: "var(--dash-bg)", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: applying === job.id ? 0.5 : 1 }}>
                              {applying === job.id ? "Applying..." : "Apply"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ═══ MY JOBS ═══ */}
          {tab === "myjobs" && (
            <div>
              <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 24px" }}>My Jobs</h1>
              {myAppsLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1,2,3].map(i => <div key={i} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 24, opacity: 0.5 }}><div style={{ height: 16, background: "var(--dash-border)", borderRadius: 4, width: "30%" }} /></div>)}
                </div>
              ) : myApps.length === 0 ? (
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ color: "var(--dash-text-secondary)" }}>No jobs yet.</p>
                  <p style={{ fontSize: 13, color: "var(--dash-text-dim)", marginTop: 4 }}>
                    <button onClick={() => setTab("explore")} style={{ background: "none", border: "none", color: "#F97316", cursor: "pointer", fontWeight: 500, fontSize: 13 }}>Explore jobs</button> and apply to start earning.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {myApps.map(a => {
                    const pay = (a.price_per_tester_cents || 0) / 100;
                    const hostname = dom(a.app_url);
                    const sc: Record<string, string> = { pending: "#CA8A04", accepted: "#2563EB", submitted: "#7C3AED", completed: "#16A34A", rejected: "#EF4444" };
                    return (
                      <div key={a.id} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span className="h" style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)" }}>{hostname}</span>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, color: sc[a.status] || "#6B7280", background: `${sc[a.status] || "#6B7280"}15` }}>{a.status}</span>
                              {a.app_type && <span style={{ fontSize: 11, color: "var(--dash-text-dim)" }}>{a.app_type}</span>}
                            </div>
                            {a.job_description && <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", marginTop: 4 }}>{a.job_description}</p>}
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p className="h" style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>${pay.toFixed(0)}</p>
                            {a.payout_cents > 0 && <p style={{ fontSize: 10, color: "#16A34A", margin: "2px 0 0" }}>Earned ${(a.payout_cents / 100).toFixed(2)}</p>}
                          </div>
                        </div>
                        {a.status === "accepted" && !submitForm && (
                          <button onClick={() => setSubmitForm({ id: a.id, feedback: "", recording: "" })}
                            style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "var(--dash-text)", color: "var(--dash-bg)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Submit test results
                          </button>
                        )}
                        {submitForm && submitForm.id === a.id && (
                          <div style={{ marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--dash-border)" }}>
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--dash-text-secondary)", marginBottom: 6 }}>Your feedback *</label>
                              <textarea style={{ width: "100%", borderRadius: 8, border: "1px solid var(--dash-border)", padding: 12, fontSize: 13, minHeight: 120, resize: "none", outline: "none", background: "var(--dash-input-bg)", color: "var(--dash-text)" }}
                                placeholder="What worked, what was confusing, what broke?"
                                value={submitForm.feedback}
                                onChange={e => setSubmitForm({ ...submitForm, feedback: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--dash-text-secondary)", marginBottom: 6 }}>Screen recording URL (optional)</label>
                              <input style={{ width: "100%", borderRadius: 8, border: "1px solid var(--dash-border)", padding: "10px 12px", fontSize: 13, outline: "none", background: "var(--dash-input-bg)", color: "var(--dash-text)" }}
                                placeholder="Loom, YouTube, or any video link"
                                value={submitForm.recording}
                                onChange={e => setSubmitForm({ ...submitForm, recording: e.target.value })} />
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => setSubmitForm(null)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid var(--dash-border)", background: "transparent", fontSize: 13, fontWeight: 500, color: "var(--dash-text-secondary)", cursor: "pointer" }}>Cancel</button>
                              <button onClick={submitResults} disabled={submitting || submitForm.feedback.length < 20}
                                style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "var(--dash-text)", color: "var(--dash-bg)", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: (submitting || submitForm.feedback.length < 20) ? 0.4 : 1 }}>
                                {submitting ? "Submitting..." : "Submit & get paid"}
                              </button>
                            </div>
                          </div>
                        )}
                        {(a.status === "submitted" || a.status === "completed") && a.feedback && (
                          <div style={{ marginTop: 12, background: "var(--dash-bg)", borderRadius: 8, padding: 12 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", margin: "0 0 4px" }}>Your feedback</p>
                            <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: 0 }}>{a.feedback}</p>
                          </div>
                        )}
                        {a.status === "pending" && <p style={{ fontSize: 12, color: "var(--dash-text-dim)", marginTop: 8 }}>Waiting for review.</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ POST A TEST ═══ */}
          {tab === "posttest" && (
            <div>
              <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 8px" }}>Post a Test</h1>
              <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 24px" }}>Get real humans to test your app. Set your budget, define tasks, and get results.</p>
              <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "24px 28px" }}>
                <PostTestForm />
              </div>
            </div>
          )}

          {/* ═══ BOOKINGS ═══ */}
          {tab === "bookings" && (
            <div>
              <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 24px" }}>Bookings</h1>
              {bookingsLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1,2,3].map(i => <div key={i} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 24, opacity: 0.5 }}><div style={{ height: 16, background: "var(--dash-border)", borderRadius: 4, width: "30%" }} /></div>)}
                </div>
              ) : bookings.length === 0 ? (
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ color: "var(--dash-text-secondary)", fontSize: 15 }}>No bookings yet.</p>
                  <p style={{ fontSize: 13, color: "var(--dash-text-dim)", marginTop: 4 }}>Scheduled test sessions will appear here.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {bookings.map(b => {
                    const hostname = dom(b.app_url);
                    const sc: Record<string, { color: string; label: string }> = {
                      pending: { color: "#CA8A04", label: "Pending" }, confirmed: { color: "#2563EB", label: "Confirmed" },
                      completed: { color: "#16A34A", label: "Completed" }, cancelled: { color: "#EF4444", label: "Cancelled" },
                      no_show: { color: "#6B7280", label: "No Show" },
                    };
                    const st = sc[b.status] || sc.pending;
                    const dateStr = new Date(b.scheduled_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
                    const isUpcoming = b.status === "pending" || b.status === "confirmed";
                    return (
                      <div key={b.id} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 24, opacity: isUpcoming ? 1 : 0.6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <span className="h" style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)" }}>{hostname}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, color: st.color, background: `${st.color}15` }}>{st.label}</span>
                        </div>
                        <div style={{ background: "var(--dash-bg)", borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                          <div><span style={{ fontSize: 11, color: "var(--dash-text-dim)" }}>Date</span><p style={{ fontSize: 13, fontWeight: 500, color: "var(--dash-text)", margin: "4px 0 0" }}>{dateStr}</p></div>
                          <div><span style={{ fontSize: 11, color: "var(--dash-text-dim)" }}>Time</span><p style={{ fontSize: 13, fontWeight: 500, color: "var(--dash-text)", margin: "4px 0 0" }}>{b.scheduled_time}</p></div>
                          <div><span style={{ fontSize: 11, color: "var(--dash-text-dim)" }}>Duration</span><p style={{ fontSize: 13, fontWeight: 500, color: "var(--dash-text)", margin: "4px 0 0" }}>{b.duration_minutes}m</p></div>
                        </div>
                        {b.tester_name && <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", marginBottom: 12 }}>Tester: <span style={{ fontWeight: 500, color: "var(--dash-text)" }}>{b.tester_name}</span></p>}
                        {b.status === "pending" && b.tester_id && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleBookingAction(b.id, "confirm")} disabled={bookingAction === b.id}
                              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#2563EB", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: bookingAction === b.id ? 0.5 : 1 }}>
                              {bookingAction === b.id ? "..." : "Confirm"}
                            </button>
                            <button onClick={() => handleBookingAction(b.id, "cancel")} disabled={bookingAction === b.id}
                              style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid var(--dash-border)", background: "transparent", fontSize: 13, fontWeight: 500, color: "var(--dash-text-secondary)", cursor: "pointer" }}>
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ PAYOUTS ═══ */}
          {tab === "payouts" && (
            <div>
              <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 24px" }}>Payouts</h1>
              {connectStatus && !connectStatus.onboarded ? (
                <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </div>
                  <h2 className="h" style={{ fontSize: 16, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 8px" }}>Set up your bank account</h2>
                  <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 24px", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>Connect your bank through Stripe to receive automatic payments.</p>
                  <button onClick={setupPayouts} disabled={connectLoading} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: "var(--dash-text)", color: "var(--dash-bg)", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: connectLoading ? 0.5 : 1 }}>
                    {connectLoading ? "Setting up..." : "Connect bank account"}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#16A34A", margin: 0 }}>Payouts active</p>
                      <p style={{ fontSize: 11, color: "#16A34A", opacity: 0.7, margin: "2px 0 0" }}>Payments arrive automatically after approval.</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Total Earned</p>
                      <p className="h" style={{ fontSize: 24, fontWeight: 700, color: "#F97316", margin: 0 }}>${earned.toFixed(2)}</p>
                    </div>
                    <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 20 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Tests Completed</p>
                      <p className="h" style={{ fontSize: 24, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>{tester.tests_completed}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PROFILE (EDITABLE) ═══ */}
          {tab === "profile" && <ProfileTab tester={tester} devices={devices} interests={interests} memberSince={memberSince} onUpdate={(t) => setTester(t)} />}

          {/* ═══ SETTINGS ═══ */}
          {tab === "settings" && (
            <div>
              <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 24px" }}>Settings</h1>

              {/* Appearance */}
              <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 4px" }}>Appearance</p>
                <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 12px" }}>Choose your preferred theme.</p>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["light", "dark"] as const).map(t => (
                    <button key={t} onClick={() => { localStorage.setItem("dash-theme", t); document.documentElement.setAttribute("data-theme", t); window.location.reload(); }}
                      style={{
                        padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                        border: `2px solid ${theme === t ? "#F97316" : "var(--dash-border)"}`,
                        background: theme === t ? "rgba(249,115,22,0.08)" : "transparent",
                        color: theme === t ? "#F97316" : "var(--dash-text-secondary)",
                        textTransform: "capitalize",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 4px" }}>Pricing</p>
                <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 16px" }}>How Flinchify pricing works.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "var(--dash-bg)", borderRadius: 8, padding: 16, textAlign: "center" }}>
                    <p className="h" style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>$5</p>
                    <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>Minimum per tester</p>
                  </div>
                  <div style={{ background: "var(--dash-bg)", borderRadius: 8, padding: 16, textAlign: "center" }}>
                    <p className="h" style={{ fontSize: 20, fontWeight: 700, color: "#F97316", margin: 0 }}>80%</p>
                    <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>Goes to testers</p>
                  </div>
                  <div style={{ background: "var(--dash-bg)", borderRadius: 8, padding: 16, textAlign: "center" }}>
                    <p className="h" style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>20%</p>
                    <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>Platform fee</p>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: 0 }}>
                  You set the price per tester. No subscriptions, no hidden fees. Testers receive 80% of the amount you pay. Credit packs include the 20% fee.
                </p>
              </div>

              {/* Legal / Agreements */}
              <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "24px 28px", marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 4px" }}>Legal</p>
                <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 16px" }}>By using Flinchify, you agree to the following:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Terms of Service", href: "/terms", desc: "Rules for using the platform, posting jobs, and completing tests." },
                    { label: "Privacy Policy", href: "/privacy", desc: "How we collect, use, and protect your personal information." },
                    { label: "Tester Agreement", href: "/terms#tester-agreement", desc: "Obligations when completing test jobs: honest feedback, no plagiarism, meet deadlines." },
                    { label: "Business Agreement", href: "/terms#business-agreement", desc: "Obligations when posting jobs: timely review, fair rejection, no harassment." },
                  ].map(item => (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--dash-border)", textDecoration: "none", transition: "border-color 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dash-border)"; }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>{item.desc}</p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dash-text-dim)" strokeWidth="1.5" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Account */}
              <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "24px 28px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 4px" }}>Account</p>
                <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 12px" }}>Manage your account.</p>
                <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* ═══ API KEYS ═══ */}
          {tab === "api" && <ApiKeysTab theme={theme} />}

          {/* ═══ ADMIN ═══ */}
          {tab === "admin" && isAdmin && <AdminTab />}
        </div>
      </main>

      {/* ═══ RESPONSIVE STYLES ═══ */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-aside { transform: translateX(-100%) !important; }
          .sidebar-aside.sidebar-open { transform: translateX(0) !important; }
          .sidebar-close { display: block !important; }
          .dash-main { margin-left: 0 !important; }
          .dash-topbar { display: flex !important; }
        }
        @media (max-width: 640px) {
          .dash-main > div { padding: 20px 16px 40px !important; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUPPORT PREVIEW (OVERVIEW TAB)
   ═══════════════════════════════════════════════ */

function SupportPreview() {
  const [msgs, setMsgs] = useState<{ id: number; sender: string; message: string; created_at: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/support").then(r => r.json()).then(d => { setMsgs(d.messages || []); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <p style={{ fontSize: 12, color: "var(--dash-text-dim)", textAlign: "center", padding: "20px 0", margin: 0 }}>Loading...</p>;

  if (msgs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--dash-text-dim)" strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "0 0 4px" }}>No support messages</p>
        <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: 0, opacity: 0.7 }}>Use the chat bubble to reach us</p>
      </div>
    );
  }

  const recent = msgs.slice(-3);
  const hasAdminReply = recent.some(m => m.sender === "admin");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {recent.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0" }}>
          <div style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0, fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: m.sender === "admin" ? "#F97316" : "var(--dash-hover)",
            color: m.sender === "admin" ? "white" : "var(--dash-text-dim)",
          }}>{m.sender === "admin" ? "F" : "You"}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, color: "var(--dash-text)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.message}</p>
            <p style={{ fontSize: 10, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>{new Date(m.created_at).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}</p>
          </div>
        </div>
      ))}
      {hasAdminReply && (
        <p style={{ fontSize: 11, color: "#16A34A", fontWeight: 500, margin: "4px 0 0" }}>Team replied — check the chat bubble</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE TAB (EDITABLE)
   ═══════════════════════════════════════════════ */

function ProfileTab({ tester, devices, interests, memberSince, onUpdate }: {
  tester: Tester; devices: string[]; interests: string[]; memberSince: string;
  onUpdate: (t: Tester) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: tester.name, bio: tester.bio || "", location: tester.location || "",
    age_range: tester.age_range || "", tech_comfort: tester.tech_comfort,
    linkedin: tester.linkedin || "", twitter: tester.twitter || "",
    github: tester.github || "", portfolio: tester.portfolio || "",
    devices: devices, interests: interests,
  });
  const [newDevice, setNewDevice] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/testers/me", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          devices: JSON.stringify(form.devices),
          interests: JSON.stringify(form.interests),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      // Refresh tester data
      const me = await fetch("/api/testers/me").then(r => r.json());
      if (me.tester) onUpdate(me.tester);
      setEditing(false);
    } catch { alert("Failed to save profile"); }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--dash-border)",
    fontSize: 13, background: "var(--dash-input-bg)", color: "var(--dash-text)", outline: "none",
  };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: "var(--dash-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px", display: "block" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid var(--dash-border)", background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--dash-text-secondary)", cursor: "pointer" }}>
            Edit profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--dash-border)", background: "transparent", fontSize: 13, fontWeight: 500, color: "var(--dash-text-secondary)", cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#F97316", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </div>

      <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--dash-border)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #F97316, #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
            {tester.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, fontSize: 16, fontWeight: 600 }} placeholder="Your name" />
            ) : (
              <h2 className="h" style={{ fontSize: 18, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>{tester.name}</h2>
            )}
            <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "4px 0 0" }}>{tester.email}</p>
            <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>Member since {memberSince} · {tester.tests_completed} tests completed</p>
          </div>
        </div>

        {/* Basic info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div>
            <p style={labelStyle}>Location</p>
            {editing ? (
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} placeholder="e.g. Sydney, Australia" />
            ) : (
              <p style={{ fontSize: 14, color: "var(--dash-text)", margin: 0 }}>{tester.location || "Not set"}</p>
            )}
          </div>
          <div>
            <p style={labelStyle}>Age Range</p>
            {editing ? (
              <select value={form.age_range} onChange={e => setForm({ ...form, age_range: e.target.value })} style={inputStyle}>
                <option value="">Select</option>
                {["18-24","25-34","35-44","45-54","55+"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <p style={{ fontSize: 14, color: "var(--dash-text)", margin: 0 }}>{tester.age_range || "Not set"}</p>
            )}
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <p style={labelStyle}>Tech Comfort (1-5)</p>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => editing && setForm({ ...form, tech_comfort: n })} style={{
                  width: 32, height: 32, borderRadius: 6, fontSize: 13, fontWeight: 700, border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: n <= (editing ? form.tech_comfort : tester.tech_comfort) ? "linear-gradient(135deg, #F97316, #F59E0B)" : "var(--dash-hover)",
                  color: n <= (editing ? form.tech_comfort : tester.tech_comfort) ? "white" : "var(--dash-text-dim)",
                  cursor: editing ? "pointer" : "default",
                }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 24 }}>
          <p style={labelStyle}>Bio</p>
          {editing ? (
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Tell people about yourself, your testing experience..." />
          ) : (
            <p style={{ fontSize: 14, color: "var(--dash-text-secondary)", lineHeight: 1.6, margin: 0 }}>{tester.bio || "No bio yet."}</p>
          )}
        </div>

        {/* Social links */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ ...labelStyle, marginBottom: 12 }}>Social Links</p>
          {editing ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "0 0 4px" }}>LinkedIn URL</p>
                <input value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} style={inputStyle} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "0 0 4px" }}>X / Twitter</p>
                <input value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} style={inputStyle} placeholder="username (no @)" />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "0 0 4px" }}>GitHub</p>
                <input value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} style={inputStyle} placeholder="username" />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "0 0 4px" }}>Portfolio / Website</p>
                <input value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} style={inputStyle} placeholder="https://..." />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {tester.linkedin && <a href={tester.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>LinkedIn</a>}
              {tester.twitter && <a href={`https://x.com/${tester.twitter}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>@{tester.twitter}</a>}
              {tester.github && <a href={`https://github.com/${tester.github}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>GitHub</a>}
              {tester.portfolio && <a href={tester.portfolio} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>Portfolio</a>}
              {!tester.linkedin && !tester.twitter && !tester.github && !tester.portfolio && (
                <p style={{ fontSize: 13, color: "var(--dash-text-dim)" }}>No social links added yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Devices */}
        <div style={{ marginBottom: 24 }}>
          <p style={labelStyle}>Devices</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(editing ? form.devices : devices).map((d: string) => (
              <span key={d} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, background: "var(--dash-hover)", color: "var(--dash-text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                {d}
                {editing && (
                  <button onClick={() => setForm({ ...form, devices: form.devices.filter(x => x !== d) })}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dash-text-dim)", fontSize: 14, lineHeight: 1, padding: 0 }}>x</button>
                )}
              </span>
            ))}
            {editing && (
              <div style={{ display: "flex", gap: 4 }}>
                <input value={newDevice} onChange={e => setNewDevice(e.target.value)} placeholder="Add device" onKeyDown={e => {
                  if (e.key === "Enter" && newDevice.trim()) { setForm({ ...form, devices: [...form.devices, newDevice.trim()] }); setNewDevice(""); }
                }} style={{ ...inputStyle, width: 140, padding: "4px 10px" }} />
              </div>
            )}
          </div>
        </div>

        {/* Interests */}
        <div>
          <p style={labelStyle}>Interests</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(editing ? form.interests : interests).map((i: string) => (
              <span key={i} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, background: "rgba(249,115,22,0.08)", color: "#F97316", border: "1px solid rgba(249,115,22,0.15)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                {i}
                {editing && (
                  <button onClick={() => setForm({ ...form, interests: form.interests.filter(x => x !== i) })}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#F97316", fontSize: 14, lineHeight: 1, padding: 0 }}>x</button>
                )}
              </span>
            ))}
            {editing && (
              <input value={newInterest} onChange={e => setNewInterest(e.target.value)} placeholder="Add interest" onKeyDown={e => {
                if (e.key === "Enter" && newInterest.trim()) { setForm({ ...form, interests: [...form.interests, newInterest.trim()] }); setNewInterest(""); }
              }} style={{ ...inputStyle, width: 140, padding: "4px 10px" }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   API KEYS TAB
   ═══════════════════════════════════════════════ */

function ApiKeysTab({ theme }: { theme: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [keyName, setKeyName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [credits, setCredits] = useState<any>(null);
  const [buyingPack, setBuyingPack] = useState("");

  const fetchKeys = async () => { const r = await fetch("/api/v1/keys"); const d = await r.json(); setKeys(d.keys || []); setLoading(false); };
  const fetchCredits = async () => { const r = await fetch("/api/v1/credits"); const d = await r.json(); setCredits(d); };
  useEffect(() => { fetchKeys(); fetchCredits(); }, []);

  const createKey = async () => {
    setCreating(true);
    const r = await fetch("/api/v1/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: keyName || "default" }) });
    const d = await r.json();
    if (d.key) { setNewKey(d.key); setKeyName(""); fetchKeys(); }
    setCreating(false);
  };

  const revokeKey = async (id: number) => {
    if (!confirm("Revoke this key?")) return;
    await fetch("/api/v1/keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key_id: id }) });
    fetchKeys();
  };

  const buyCredits = async (packId: string) => {
    setBuyingPack(packId);
    const r = await fetch("/api/v1/credits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pack_id: packId }) });
    const d = await r.json();
    if (d.checkout_url) window.location.href = d.checkout_url;
    setBuyingPack("");
  };

  return (
    <div>
      <h1 className="h" style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 8px" }}>API & Credits</h1>
      <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 24px" }}>Use the Flinchify API and CLI to create tests programmatically.</p>

      {/* Quick start */}
      <div style={{ background: theme === "dark" ? "#1A1D27" : "#111", borderRadius: 12, padding: 24, marginBottom: 24, overflowX: "auto" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Quick start</p>
        <pre style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, margin: 0 }}><code>{`# Install the CLI
npm install -g flinchify

# Save your API key
flinchify init

# Create a test
flinchify test https://yourapp.com \\
  --flow "sign up and create a project" \\
  --testers 3 --budget 10

# Check results
flinchify results ft_42`}</code></pre>
      </div>

      {/* Credits */}
      {credits && (
        <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>API Credits</h2>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>${credits.balance}</p>
              <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: 0 }}>available balance</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "0 0 16px" }}>Pre-purchase credits for AI agents. Non-refundable. 20% fee included.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {credits.packs?.map((pack: any) => (
              <button key={pack.id} onClick={() => buyCredits(pack.id)} disabled={!!buyingPack}
                style={{ padding: 16, borderRadius: 10, border: "1px solid var(--dash-border)", background: "transparent", cursor: "pointer", textAlign: "left", opacity: buyingPack ? 0.5 : 1, transition: "border-color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#F97316"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dash-border)"; }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{pack.label}</p>
                <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "4px 0 0" }}>{pack.credits} in credits</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#F97316", margin: "8px 0 0" }}>{pack.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create key */}
      <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 16px" }}>Generate new key</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <input type="text" placeholder="Key name (e.g. production, ci)" value={keyName} onChange={e => setKeyName(e.target.value)}
            style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "1px solid var(--dash-border)", fontSize: 13, outline: "none", background: "var(--dash-input-bg)", color: "var(--dash-text)" }} />
          <button onClick={createKey} disabled={creating}
            style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--dash-text)", color: "var(--dash-bg)", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: creating ? 0.5 : 1 }}>
            {creating ? "Creating..." : "Generate"}
          </button>
        </div>
        {newKey && (
          <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#16A34A", margin: "0 0 8px" }}>Key created — copy it now:</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <code style={{ flex: 1, fontSize: 12, color: "#16A34A", background: "rgba(34,197,94,0.06)", padding: "8px 12px", borderRadius: 6, fontFamily: "monospace", wordBreak: "break-all" }}>{newKey}</code>
              <button onClick={() => {
                  navigator.clipboard.writeText(newKey).then(() => {
                    const btn = document.activeElement as HTMLButtonElement;
                    if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "Copy"; }, 2000); }
                  }).catch(() => {
                    // Fallback: select text
                    const el = document.querySelector('code') as HTMLElement;
                    if (el) { const range = document.createRange(); range.selectNodeContents(el); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); document.execCommand('copy'); sel?.removeAllRanges(); }
                    const btn = document.activeElement as HTMLButtonElement;
                    if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "Copy"; }, 2000); }
                  });
                }}
                style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "rgba(34,197,94,0.15)", color: "#16A34A", fontSize: 12, fontWeight: 500, cursor: "pointer", flexShrink: 0 }}>
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Key list */}
      <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--dash-text)", margin: "0 0 16px" }}>Your keys</h2>
        {loading ? (
          <p style={{ fontSize: 13, color: "var(--dash-text-dim)" }}>Loading...</p>
        ) : keys.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--dash-text-dim)" }}>No API keys yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {keys.map((k: any) => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 10, border: `1px solid ${k.revoked ? "rgba(239,68,68,0.15)" : "var(--dash-border)"}`, opacity: k.revoked ? 0.5 : 1 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--dash-text)", margin: 0 }}>{k.name} <span style={{ fontFamily: "monospace", color: "var(--dash-text-dim)" }}>{k.key_preview}</span></p>
                  <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                    {k.revoked && <span style={{ color: "#EF4444", marginLeft: 8 }}>Revoked</span>}
                  </p>
                </div>
                {!k.revoked && (
                  <button onClick={() => revokeKey(k.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#EF4444", fontWeight: 500 }}>Revoke</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADMIN TAB
   ═══════════════════════════════════════════════ */

type AdminSubTab = "overview" | "orders" | "testers" | "applications";
type AObj = Record<string, unknown>;

function AdminTab() {
  const [subTab, setSubTab] = useState<AdminSubTab>("overview");
  const [data, setData] = useState<AObj>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const load = useCallback(async (t: AdminSubTab) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin?tab=${t}`);
      if (r.ok) setData(await r.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(subTab); }, [subTab, load]);

  const act = async (method: string, body: AObj) => {
    const id = `${body.type}-${body.id}-${body.status || "del"}`;
    setBusy(id);
    await fetch("/api/admin", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy("");
    load(subTab);
  };

  const payout = async (appId: unknown) => {
    const id = `payout-${appId}`;
    setBusy(id);
    const r = await fetch("/api/connect/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: appId }),
    });
    const d = await r.json();
    setBusy("");
    if (r.ok) alert(`Paid! $${(d.payout_cents / 100).toFixed(2)}`);
    else alert(`Payout failed: ${d.error}`);
    load(subTab);
  };

  const aStr = (v: unknown) => String(v || "");
  const aNum = (v: unknown) => Number(v) || 0;

  const ABadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      paid: "#16A34A", pending_payment: "#CA8A04", pending: "#CA8A04", active: "#16A34A",
      accepted: "#16A34A", rejected: "#EF4444", banned: "#EF4444", completed: "#2563EB", refunded: "#9333EA",
    };
    const c = colors[status] || "#6B7280";
    return <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, color: c, background: `${c}12`, border: `1px solid ${c}25` }}>{status}</span>;
  };

  const ABtn = ({ onClick, color, children, id: btnId }: { onClick: () => void; color: string; children: React.ReactNode; id?: string }) => (
    <button onClick={onClick} disabled={busy === btnId}
      style={{ padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500, border: `1px solid ${color}30`, background: `${color}10`, color, cursor: "pointer" }}>
      {children}
    </button>
  );

  const stats = (data.stats || {}) as Record<string, number>;
  const orders = (data.orders || []) as AObj[];
  const testers = (data.testers || []) as AObj[];
  const applications = (data.applications || []) as AObj[];

  const subTabs: { key: AdminSubTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: "Orders" },
    { key: "testers", label: "Testers" },
    { key: "applications", label: "Applications" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 20px" }}>Admin Panel</h1>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setSubTab(t.key)}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              border: subTab === t.key ? "1px solid var(--dash-accent)" : "1px solid var(--dash-border)",
              background: subTab === t.key ? "var(--dash-accent)" : "var(--dash-card)",
              color: subTab === t.key ? "#fff" : "var(--dash-text-secondary)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--dash-text-dim)" }}>Loading...</div>
      ) : (
        <>
          {/* Overview */}
          {subTab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
                {[
                  { l: "Total Testers", v: stats.totalTesters },
                  { l: "Total Orders", v: stats.totalOrders },
                  { l: "Paid Orders", v: stats.paidOrders, c: "#16A34A" },
                  { l: "Pending", v: stats.pendingOrders, c: "#CA8A04" },
                  { l: "Applications", v: stats.totalApplications },
                  { l: "Revenue", v: `$${((stats.totalRevenue || 0) / 100).toFixed(2)}`, c: "#16A34A" },
                ].map(x => (
                  <div key={x.l} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 10, color: "var(--dash-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, margin: "0 0 4px" }}>{x.l}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: x.c || "var(--dash-text)", margin: 0 }}>{x.v}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {(["orders", "testers", "applications"] as AdminSubTab[]).map(t => (
                  <button key={t} onClick={() => setSubTab(t)}
                    style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 16, textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--dash-accent)" }}>
                    View {t} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {subTab === "orders" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{orders.length} orders</p>
              {orders.map((o) => (
                <div key={aNum(o.id)} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)" }}>{dom(aStr(o.app_url))}</span>
                        <ABadge status={aStr(o.status)} />
                      </div>
                      <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>{aStr(o.email)}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>${(aNum(o.price_cents) / 100).toFixed(0)}</p>
                      <p style={{ fontSize: 10, color: "var(--dash-text-dim)", margin: 0 }}>{aNum(o.testers_count)} testers</p>
                    </div>
                  </div>
                  {o.description ? <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", margin: "0 0 8px" }}>{aStr(o.description)}</p> : null}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {aStr(o.status) === "pending_payment" && <ABtn onClick={() => act("PATCH", { type: "order", id: o.id, status: "paid" })} color="#16A34A">Mark Paid</ABtn>}
                    {aStr(o.status) === "paid" && <ABtn onClick={() => act("PATCH", { type: "order", id: o.id, status: "completed" })} color="#2563EB">Complete</ABtn>}
                    <ABtn onClick={() => act("PATCH", { type: "order", id: o.id, status: "refunded" })} color="#9333EA">Refund</ABtn>
                    <ABtn onClick={() => { if (confirm("Delete order?")) act("DELETE", { type: "order", id: o.id }); }} color="#EF4444">Delete</ABtn>
                  </div>
                </div>
              ))}
              {!orders.length && <p style={{ color: "var(--dash-text-dim)" }}>No orders yet.</p>}
            </div>
          )}

          {/* Testers */}
          {subTab === "testers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{testers.length} testers</p>
              {testers.map((t) => (
                <div key={aNum(t.id)} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8, marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColor(aStr(t.name)), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {aStr(t.name).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)" }}>{aStr(t.name)}</span>
                          <ABadge status={aStr(t.status)} />
                        </div>
                        <p style={{ fontSize: 12, color: "var(--dash-text-dim)", margin: "2px 0 0" }}>{aStr(t.email)} · {aStr(t.location) || "No location"}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {aStr(t.status) === "active" && <ABtn onClick={() => act("PATCH", { type: "tester", id: t.id, status: "banned" })} color="#EF4444">Ban</ABtn>}
                    {aStr(t.status) === "banned" && <ABtn onClick={() => act("PATCH", { type: "tester", id: t.id, status: "active" })} color="#16A34A">Unban</ABtn>}
                    <ABtn onClick={() => { if (confirm(`Delete ${aStr(t.name)}?`)) act("DELETE", { type: "tester", id: t.id }); }} color="#EF4444">Delete</ABtn>
                  </div>
                </div>
              ))}
              {!testers.length && <p style={{ color: "var(--dash-text-dim)" }}>No testers yet.</p>}
            </div>
          )}

          {/* Applications */}
          {subTab === "applications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dash-text)", margin: 0 }}>{applications.length} applications</p>
              {applications.map((a) => (
                <div key={aNum(a.id)} style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)" }}>{aStr(a.tester_name)}</span>
                        <span style={{ color: "var(--dash-text-dim)" }}>→</span>
                        <span style={{ fontSize: 13, color: "var(--dash-text-secondary)" }}>{dom(aStr(a.app_url))}</span>
                        <ABadge status={aStr(a.status)} />
                      </div>
                      <p style={{ fontSize: 11, color: "var(--dash-text-dim)", margin: "4px 0 0" }}>{aStr(a.tester_email)}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text)", margin: 0, flexShrink: 0 }}>${(aNum(a.price_per_tester_cents) / 100).toFixed(0)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {aStr(a.status) === "pending" && <>
                      <ABtn onClick={() => act("PATCH", { type: "application", id: a.id, status: "accepted" })} color="#16A34A">Accept</ABtn>
                      <ABtn onClick={() => act("PATCH", { type: "application", id: a.id, status: "rejected" })} color="#EF4444">Reject</ABtn>
                    </>}
                    {aStr(a.status) === "accepted" && !a.payout_transfer_id && <ABtn onClick={() => { if (confirm("Complete & pay?")) payout(a.id); }} color="#16A34A" id={`payout-${a.id}`}>Complete & Pay</ABtn>}
                    <ABtn onClick={() => { if (confirm("Delete?")) act("DELETE", { type: "application", id: a.id }); }} color="#EF4444">Delete</ABtn>
                  </div>
                </div>
              ))}
              {!applications.length && <p style={{ color: "var(--dash-text-dim)" }}>No applications yet.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
