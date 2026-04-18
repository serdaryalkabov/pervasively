"use client";

import { useEffect, useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { api } from "../../../../convex/_generated/api";

function NavBar({ credits, user, signOut }: { credits: number; user: any; signOut: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
      background: scrolled ? "rgba(10,13,18,0.88)" : "transparent",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "0 56px", height: 58,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "background 0.25s, border-color 0.25s",
    }}>
      <button
        onClick={() => router.push("/dashboard")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 600, color: "#F0F4FF", letterSpacing: -0.5 }}>
          Pervasive<span style={{ color: "#4D8EFF" }}>ly</span>
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Credits pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(77,142,255,0.08)",
          border: "1px solid rgba(77,142,255,0.20)",
          borderRadius: 100, padding: "5px 14px",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: credits > 0 ? "#4D8EFF" : "#4A5870",
            boxShadow: credits > 0 ? "0 0 6px rgba(77,142,255,0.7)" : "none",
          }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#A8C4FF" : "#4A5870", fontFamily: "'Inter', sans-serif" }}>
            {credits} {credits === 1 ? "credit" : "credits"}
          </span>
        </div>

        {/* Avatar dropdown */}
        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(77,142,255,0.10)",
              border: open ? "1.5px solid rgba(77,142,255,0.7)" : "1.5px solid rgba(77,142,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "#A8C4FF",
              fontFamily: "'Manrope', sans-serif",
              cursor: "pointer", outline: "none",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >{initials}</button>

          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0, width: 236,
              background: "rgba(10,13,18,0.97)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              animation: "ddIn 0.15s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <style>{`
                @keyframes ddIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }
                .nav-dd-item {
                  display: flex; align-items: center; gap: 10px;
                  padding: 9px 15px; width: 100%;
                  background: none; border: none; cursor: pointer;
                  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
                  color: #7A8BA8; text-align: left;
                  transition: background 0.1s, color 0.1s;
                }
                .nav-dd-item:hover { background: rgba(255,255,255,0.04); color: #F0F4FF; }
                .nav-dd-item svg { opacity: 0.45; flex-shrink: 0; transition: opacity 0.1s; }
                .nav-dd-item:hover svg { opacity: 0.8; }
                .nav-dd-item-red:hover { background: rgba(192,57,43,0.08) !important; color: #D87070 !important; }
              `}</style>
              <div style={{ padding: "14px 15px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F4FF", letterSpacing: -0.2, marginBottom: 3, fontFamily: "'Manrope', sans-serif" }}>{fullName}</div>
                <div style={{ fontSize: 11, color: "#4A5870", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Inter', sans-serif" }}>{email}</div>
              </div>
              <div style={{ padding: "6px 0" }}>
                {([
                  { label: "Dashboard", path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                  { label: "Generate",  path: "/generate",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                  { label: "History",   path: "/history",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                  { label: "Settings",  path: "/settings",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { label: "Feedback",  path: "/feedback",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                ] as { label: string; path: string; icon: React.ReactNode }[]).map(({ label, path, icon }) => (
                  <button key={label} className="nav-dd-item" onClick={() => { router.push(path); setOpen(false); }}>
                    {icon}{label}
                  </button>
                ))}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />
              <div style={{ padding: "5px 0 7px" }}>
                <button className="nav-dd-item nav-dd-item-red" onClick={() => signOut(() => router.replace("/sign-in"))}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const PACKS = [
  {
    name: "Starter",
    price: 12,
    credits: 5,
    perCredit: "2.40",
    desc: "~5 weeks of content",
    priceId: "pri_01kncwnma1egw3jxh2dsmb5qgq",
  },
  {
    name: "Builder",
    price: 24,
    credits: 12,
    perCredit: "2.00",
    desc: "~3 months of content",
    featured: true,
    priceId: "pri_01kncwmza3baw3enp3x6d2mdx2",
  },
  {
    name: "Growth",
    price: 45,
    credits: 28,
    perCredit: "1.60",
    desc: "~7 months of content",
    priceId: "pri_01kncwm3pggvb9ajjad28wet71",
  },
];

export function BillingPage() {
  const { user }    = useUser();
  const { signOut } = useClerk();
  const router      = useRouter();
  const convexUser  = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const credits     = convexUser?.credits ?? 0;
  const paddleRef   = useRef<Paddle | null>(null);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const isLoading = convexUser === undefined;

  useEffect(() => {
    async function loadPaddle() {
      const paddle = await initializePaddle({
        environment: "production",
        token: "live_f2d8f63d45c61159c537598d192",
      });
      paddleRef.current = paddle ?? null;
    }
    loadPaddle();
  }, []);

  const openCheckout = (pack: typeof PACKS[0]) => {
    if (!paddleRef.current || !user) return;
    setLoadingPack(pack.name);
    const email = user.primaryEmailAddress?.emailAddress;
    paddleRef.current.Checkout.open({
      items: [{ priceId: pack.priceId, quantity: 1 }],
      ...(email && { customer: { email } }),
      customData: { clerkId: user.id, credits: pack.credits },
      settings: { displayMode: "overlay", theme: "dark" },
    });
    setTimeout(() => setLoadingPack(null), 1500);
  };

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#0A0D12", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)} 25%{transform:translate(80px,60px) scale(1.05)} 50%{transform:translate(40px,120px) scale(0.95)} 75%{transform:translate(-60px,50px) scale(1.08)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 20%{transform:translate(-90px,40px) scale(1.06)} 45%{transform:translate(-50px,-80px) scale(0.96)} 70%{transform:translate(70px,-40px) scale(1.04)} 100%{transform:translate(0,0) scale(1)} }
      `}</style>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(77,142,255,0.15)", borderTopColor: "#4D8EFF", animation: "spin 0.75s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0D12", fontFamily: "'Inter', sans-serif", color: "#F0F4FF", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #4D8EFF;
          --blue-dim: rgba(77,142,255,0.10);
          --blue-border: rgba(77,142,255,0.22);
          --bg: #0A0D12;
          --bg2: #111620;
          --border: rgba(255,255,255,0.07);
          --text: #F0F4FF;
          --muted: #7A8BA8;
          --muted2: #4A5870;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)} 25%{transform:translate(80px,60px) scale(1.05)} 50%{transform:translate(40px,120px) scale(0.95)} 75%{transform:translate(-60px,50px) scale(1.08)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 20%{transform:translate(-90px,40px) scale(1.06)} 45%{transform:translate(-50px,-80px) scale(0.96)} 70%{transform:translate(70px,-40px) scale(1.04)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes ddIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }
        .nav-dd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 15px; width: 100%;
          background: none; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
          color: #7A8BA8; text-align: left;
          transition: background 0.1s, color 0.1s;
        }
        .nav-dd-item:hover { background: rgba(255,255,255,0.04); color: #F0F4FF; }
        .nav-dd-item svg { opacity: 0.45; flex-shrink: 0; transition: opacity 0.1s; }
        .nav-dd-item:hover svg { opacity: 0.8; }
        .nav-dd-item-red:hover { background: rgba(192,57,43,0.08) !important; color: #D87070 !important; }
        .pack-card {
          border-radius: 20px;
          padding: 32px 28px;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s;
        }
        .pack-card:hover {
          transform: translateY(-3px);
        }
        .pack-btn {
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(24px) saturate(2);
          -webkit-backdrop-filter: blur(24px) saturate(2);
          border-radius: 10px;
          width: 100%;
          padding: 12px 0;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          letter-spacing: 0.01em;
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s ease, opacity 0.15s ease;
        }
        .pack-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .pack-btn:hover:not(:disabled) { transform: scale(1.03); }
        .pack-btn:hover::before { opacity: 0; }
        .pack-btn:disabled { cursor: wait; opacity: 0.6; }
        .balance-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 40px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.06) inset;
        }
        .noise-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }
        @media (max-width: 640px) {
          .packs-grid { grid-template-columns: 1fr !important; }
          .billing-main { padding: 40px 24px 80px !important; }
        }
      `}</style>

      {/* Background blobs */}
      <div className="noise-bg" />
      <div style={{ position: "fixed", top: -200, left: "20%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,142,255,0.09) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0, animation: "blob1 22s ease-in-out infinite" }} />
      <div style={{ position: "fixed", bottom: -100, right: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,142,255,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0, animation: "blob2 28s ease-in-out infinite" }} />

      <NavBar credits={credits} user={user} signOut={signOut} />

      <main className="billing-main" style={{ maxWidth: 780, margin: "0 auto", padding: "64px 56px 100px", position: "relative", zIndex: 1, animation: "fadeUp 0.5s ease-out both" }}>

        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--blue)" }}>Billing</span>
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.05, color: "var(--text)", marginBottom: 12 }}>
            Credits &amp; billing.
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            Pay once, generate whenever. <span style={{ color: "var(--blue)" }}>Credits never expire.</span>
          </p>
        </div>

        {/* Current balance card */}
        <div className="balance-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 10 }}>Current balance</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 52, fontWeight: 600, letterSpacing: -2, color: "var(--text)", lineHeight: 1 }}>{credits}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "var(--muted)", fontWeight: 300 }}>{credits === 1 ? "credit" : "credits"}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              {/* Status pill */}
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                background: credits > 0 ? "rgba(77,142,255,0.08)" : "rgba(255,255,255,0.03)",
                border: credits > 0 ? "1px solid rgba(77,142,255,0.22)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 100, padding: "6px 14px",
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: credits > 0 ? "#4D8EFF" : "#4A5870",
                  boxShadow: credits > 0 ? "0 0 8px rgba(77,142,255,0.7)" : "none",
                }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: credits > 0 ? "#A8C4FF" : "#4A5870" }}>
                  {credits > 0 ? `~${credits} week${credits !== 1 ? "s" : ""} of content` : "No credits remaining"}
                </span>
              </div>

              {/* What a credit means */}
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted2)", fontFamily: "'Inter', sans-serif" }}>
                {["21 posts", "3 platforms", "1 week"].map((item, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4D8EFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted2)" }}>Credit packs</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--muted2)" }}>More credits = lower cost per credit</span>
        </div>

        {/* Pricing cards */}
        <div className="packs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {PACKS.map((pack) => (
            <div
              key={pack.name}
              className="pack-card"
              style={{
                background: pack.featured ? "rgba(77,142,255,0.08)" : "rgba(255,255,255,0.03)",
                border: pack.featured ? "1px solid rgba(77,142,255,0.30)" : "1px solid rgba(255,255,255,0.07)",
                boxShadow: pack.featured
                  ? "0 4px 40px rgba(77,142,255,0.18), 0 1px 0 rgba(255,255,255,0.08) inset"
                  : "0 4px 20px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset",
              }}
            >
              {pack.featured && (
                <div style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  background: "var(--blue)",
                  color: "#ffffff",
                  fontFamily: "'Manrope', sans-serif", fontSize: 8, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "3px 14px", borderRadius: "0 0 8px 8px",
                }}>Most popular</div>
              )}

              {/* Subtle glow for featured */}
              {pack.featured && (
                <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: "radial-gradient(circle, rgba(77,142,255,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
              )}

              {/* Pack name */}
              <div style={{
                fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--blue)", marginBottom: 16,
                marginTop: pack.featured ? 12 : 0,
              }}>{pack.name}</div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 500, color: "var(--muted)" }}>$</span>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 46, fontWeight: 600, letterSpacing: -2, color: "var(--text)", lineHeight: 1 }}>{pack.price}</span>
              </div>

              {/* Credits */}
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{pack.credits} credits</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--muted2)", marginLeft: 6 }}>${pack.perCredit} / credit</span>
              </div>

              {/* Desc */}
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--muted2)", marginBottom: 24 }}>{pack.desc}</div>

              {/* CTA button */}
              <button
                className="pack-btn"
                onClick={() => openCheckout(pack)}
                disabled={!!loadingPack}
                style={{
                  background: pack.featured
                    ? "linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)"
                    : "rgba(255,255,255,0.05)",
                  border: pack.featured
                    ? "1px solid rgba(160,200,255,0.50)"
                    : "1px solid rgba(255,255,255,0.10)",
                  color: pack.featured ? "#ffffff" : "var(--text)",
                  boxShadow: pack.featured
                    ? "0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 4px 20px rgba(77,142,255,0.20)"
                    : "0 2px 12px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.07) inset",
                  opacity: loadingPack && loadingPack !== pack.name ? 0.45 : 1,
                }}
              >
                {loadingPack === pack.name ? "Opening…" : `Get ${pack.credits} credits`}
              </button>
            </div>
          ))}
        </div>

        {/* Everything included row */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "20px 28px",
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted2)", marginBottom: 14 }}>Everything included in all packs</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px" }}>
            {["21 posts per credit", "Twitter, LinkedIn & Instagram", "Platform-native tone", "Credits never expire"].map(f => (
              <span key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--muted)", fontFamily: "'Inter', sans-serif" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {f}
              </span>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted2)", fontFamily: "'Inter', sans-serif" }}>
          New accounts start with <strong style={{ color: "var(--blue)", fontWeight: 600 }}>3 free credits</strong> — no card required.
        </p>

      </main>
    </div>
  );
}