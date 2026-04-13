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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(8,13,16,0.85)", backdropFilter: "blur(20px)",
      padding: "0 28px", height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <button
        onClick={() => router.push("/dashboard")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 19, fontWeight: 500, color: "#EDF2F4", letterSpacing: -0.5 }}>
          Pervasive<span style={{ color: "#2AA5C0" }}>ly</span>
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(12,20,23,0.9)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 100, padding: "5px 13px" }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#C5D8DC" : "#3D5A62" }}>{credits} {credits === 1 ? "credit" : "credits"}</span>
        </div>

        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#0e2028",
              border: open ? "1.5px solid rgba(42,165,192,0.7)" : "1.5px solid rgba(25,97,117,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.9)",
              cursor: "pointer", outline: "none", transition: "all 0.16s ease",
            }}
          >{initials}</button>

          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, width: 228,
              background: "rgba(10,16,20,0.97)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              backdropFilter: "blur(28px)",
              animation: "ddIn 0.14s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <style>{`
                @keyframes ddIn { from { opacity:0; transform:translateY(-5px) scale(0.97); } to { opacity:1; transform:none; } }
                .bddi { display:flex; align-items:center; gap:9px; padding:9px 14px; width:100%; background:none; border:none; cursor:pointer; font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:450; color:#7A9EAA; text-align:left; transition:background 0.1s,color 0.1s; }
                .bddi:hover { background:rgba(255,255,255,0.04); color:#E0EAED; }
                .bddi svg { opacity:0.5; flex-shrink:0; transition:opacity 0.1s; }
                .bddi:hover svg { opacity:0.85; }
                .bddi-red:hover { background:rgba(200,65,65,0.08) !important; color:#D87070 !important; }
              `}</style>
              <div style={{ padding: "13px 14px 11px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#E0EAED", letterSpacing: -0.1, marginBottom: 2 }}>{fullName}</div>
                <div style={{ fontSize: 11, color: "#2E4A55", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
              </div>
              <div style={{ padding: "5px 0" }}>
                {([
                  { label: "Dashboard",        path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                  { label: "Generate",         path: "/generate",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
                  { label: "History",          path: "/history",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                  { label: "Settings",         path: "/settings",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { label: "Feedback",         path: "/feedback",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                ] as { label: string; path: string; icon: React.ReactNode }[]).map(({ label, path, icon }) => (
                  <button key={label} className="bddi" onClick={() => { router.push(path); setOpen(false); }}>
                    {icon}{label}
                  </button>
                ))}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />
              <div style={{ padding: "5px 0 7px" }}>
                <button className="bddi bddi-red" onClick={() => signOut(() => router.replace("/sign-in"))}>
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
    priceId: 'pri_01kncwnma1egw3jxh2dsmb5qgq',
  },
  {
    name: "Builder",
    price: 24,
    credits: 12,
    perCredit: "2.00",
    desc: "~3 months of content",
    featured: true,
    priceId: 'pri_01kncwmza3baw3enp3x6d2mdx2',
  },
  {
    name: "Growth",
    price: 45,
    credits: 28,
    perCredit: "1.60",
    desc: "~7 months of content",
    priceId: 'pri_01kncwm3pggvb9ajjad28wet71',
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
        environment: "production", // change to "production" when going live
        token: 'live_f2d8f63d45c61159c537598d192',
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
      customData: {
        clerkId: user.id,
        credits: pack.credits,
      },
      settings: {
        displayMode: "overlay",
        theme: "dark",
      },
    });
  
    setTimeout(() => setLoadingPack(null), 1500);
  };

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#080D10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(25,97,117,0.2)", borderTopColor: "#2AA5C0", animation: "spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080D10", fontFamily: "'Inter', -apple-system, sans-serif", color: "#F0F4F5" }}>

      {/* Ambient */}
      {/* <div style={{ position: "fixed", top: -180, left: "50%", transform: "translateX(-50%)", width: 900, height: 460, background: "radial-gradient(ellipse at 50% 0%, rgba(25,97,117,0.12) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} /> */}

      <NavBar credits={credits} user={user} signOut={signOut} />

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          {/* <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#196175", marginBottom: 8 }}>Billing</p> */}
          <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.7, color: "#EDF2F4", marginBottom: 6 }}>Credits & billing</h1>
          <p style={{ fontSize: 14, color: "#3D5A62" }}>Pay once, generate whenever. Credits never expire.</p>
        </div>

        {/* Current balance */}
        <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(255,255,255,0.062)", borderRadius: 16, padding: "20px 22px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 6 }}>Current balance</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 500, color: "#EDF2F4", letterSpacing: -1 }}>{credits}</span>
              <span style={{ fontSize: 14, color: "#3D5A62", fontWeight: 500 }}>{credits === 1 ? "credit" : "credits"}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: credits > 0 ? "#2AA5C0" : "#2E4A55", boxShadow: credits > 0 ? "0 0 8px rgba(42,165,192,0.6)" : "none" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#2AA5C0" : "#2E4A55" }}>
              {credits > 0 ? `~${credits} week${credits !== 1 ? "s" : ""} of content` : "No credits remaining"}
            </span>
          </div>
        </div>

        {/* Credit packs */}
        <h2 style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 14 }}>Credit packs</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {PACKS.map(pack => (
            <div key={pack.name} style={{
              background: pack.featured ? "rgba(16,28,32,0.85)" : "rgba(12,20,23,0.65)",
              border: pack.featured ? "1px solid rgba(42,165,192,0.28)" : "1px solid rgba(255,255,255,0.062)",
              borderRadius: 16, padding: "20px 18px",
              position: "relative", overflow: "hidden",
            }}>
              {pack.featured && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #196175, #2AA5C0)", color: "#fff", fontSize: 7, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 12px", borderRadius: "0 0 8px 8px" }}>
                  Most popular
                </div>
              )}
              {pack.featured && <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "radial-gradient(circle, rgba(42,165,192,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />}

              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2AA5C0", marginBottom: 10, marginTop: pack.featured ? 10 : 0 }}>{pack.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#3D5A62" }}>$</span>
                <span style={{ fontSize: 30, fontWeight: 500, color: "#EDF2F4", letterSpacing: -1, lineHeight: 1 }}>{pack.price}</span>
              </div>
              <p style={{ fontSize: 12, color: "#3D5A62", marginBottom: 12 }}>
                <span style={{ color: "#8AABB5", fontWeight: 500 }}>{pack.credits} credits</span>, ${pack.perCredit}/credit
              </p>
              <p style={{ fontSize: 11.5, color: "#2E4A55", marginBottom: 16 }}>{pack.desc}</p>
              <button
                onClick={() => openCheckout(pack)}
                disabled={loadingPack === pack.name}
                style={{
                  width: "100%", padding: "10px 0",
                  background: pack.featured ? "rgba(25,97,117,0.35)" : "rgba(255,255,255,0.06)",
                  border: pack.featured ? "1px solid rgba(42,165,192,0.35)" : "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: pack.featured ? "#2AA5C0" : "#8AABB5",
                  fontSize: 12, fontWeight: 500,
                  cursor: loadingPack === pack.name ? "wait" : "pointer",
                  letterSpacing: -0.1,
                  transition: "background 0.15s, border-color 0.15s",
                  opacity: loadingPack && loadingPack !== pack.name ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (loadingPack) return;
                  e.currentTarget.style.background = pack.featured ? "rgba(25,97,117,0.5)" : "rgba(255,255,255,0.10)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = pack.featured ? "rgba(25,97,117,0.35)" : "rgba(255,255,255,0.06)";
                }}
              >
                {loadingPack === pack.name ? "Opening…" : `Get ${pack.credits} credits`}
              </button>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "#2E4A55", textAlign: "center" }}>
          1 credit = 7 days across 3 platforms = 21 posts. Credits never expire.
        </p>

      </main>
    </div>
  );
}