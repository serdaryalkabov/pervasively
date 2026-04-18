"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useUser, useClerk } from "@clerk/nextjs";

/* ── Shared design tokens ── */
const T = {
  blue:       "#4D8EFF",
  blueDim:    "rgba(77,142,255,0.10)",
  blueBorder: "rgba(77,142,255,0.22)",
  bg:         "#0A0D12",
  bg2:        "#111620",
  border:     "rgba(255,255,255,0.07)",
  text:       "#F0F4FF",
  muted:      "#7A8BA8",
  muted2:     "#4A5870",
};

const NAV_ITEMS = [
  { label: "Dashboard",       path: "/dashboard",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: "Settings",        path: "/settings",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { label: "Billing & credits", path: "/billing",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { label: "History",          path: "/history",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: "Feedback",         path: "/feedback",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

function PlatformIcon({ p }: { p: string }) {
  if (p === "twitter") return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  if (p === "linkedin") return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
  if (p === "instagram") return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
  return null;
}

const platformLabel = (p: string) => p === "twitter" ? "Twitter / X" : p.charAt(0).toUpperCase() + p.slice(1);

export function DashboardClient() {
  const { user } = useUser();
  const router   = useRouter();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const convexUser = useQuery(api.users.getUser,           user ? { clerkId: user.id } : "skip");
  const products   = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");

  useEffect(() => {
    if (products && products.length === 0) router.replace("/onboarding");
  }, [products]);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const isLoading = convexUser === undefined || products === undefined;
  const product   = selectedProductId
    ? products?.find((p: any) => p._id === selectedProductId) ?? products?.[0]
    : products?.[0];
  const credits = convexUser?.credits ?? 0;

  if (isLoading || !product) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blob1{0%{transform:translate(0,0) scale(1)}25%{transform:translate(80px,60px) scale(1.05)}50%{transform:translate(40px,120px) scale(0.95)}75%{transform:translate(-60px,50px) scale(1.08)}100%{transform:translate(0,0) scale(1)}}`}</style>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(77,142,255,0.15)", borderTopColor: T.blue, animation: "spin 0.75s linear infinite" }} />
    </div>
  );

  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ?? "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email    = user?.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter', sans-serif", color: T.text, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes ddIn  { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)}25%{transform:translate(80px,60px) scale(1.05)}50%{transform:translate(40px,120px) scale(0.95)}75%{transform:translate(-60px,50px) scale(1.08)}100%{transform:translate(0,0) scale(1)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)}20%{transform:translate(-90px,40px) scale(1.06)}45%{transform:translate(-50px,-80px) scale(0.96)}70%{transform:translate(70px,-40px) scale(1.04)}100%{transform:translate(0,0) scale(1)} }
        .ddi {
          display:flex; align-items:center; gap:10px;
          padding:9px 15px; width:100%;
          background:none; border:none; cursor:pointer;
          font-family:'Inter',sans-serif; font-size:13px; font-weight:400;
          color:${T.muted}; text-align:left;
          transition:background 0.1s, color 0.1s;
        }
        .ddi:hover { background:rgba(255,255,255,0.04); color:${T.text}; }
        .ddi svg { opacity:0.45; flex-shrink:0; transition:opacity 0.1s; }
        .ddi:hover svg { opacity:0.8; }
        .ddi-red:hover { background:rgba(192,57,43,0.08) !important; color:#D87070 !important; }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.06) inset;
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        .noise-bg {
          position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.028;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size:256px 256px;
        }
        @media (max-width: 640px) {
          .dash-main { padding: 40px 20px 80px !important; }
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient */}
      <div className="noise-bg" />
      <div style={{ position:"fixed", top:-200, left:"30%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(77,142,255,0.08) 0%, transparent 70%)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob1 22s ease-in-out infinite" }} />
      <div style={{ position:"fixed", bottom:-100, right:"20%", width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(77,142,255,0.05) 0%, transparent 70%)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob2 28s ease-in-out infinite" }} />

      {/* ── NAV ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        background: scrolled ? "rgba(10,13,18,0.88)" : "transparent",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        padding:"0 56px", height:58,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        transition:"background 0.25s, border-color 0.25s",
      }}>
        <a href="/dashboard" style={{ fontFamily:"'Manrope',sans-serif", fontSize:20, fontWeight:600, color:T.text, textDecoration:"none", letterSpacing:-0.5 }}>
          Pervasive<span style={{ color:T.blue }}>ly</span>
        </a>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Credits pill */}
          <div style={{ display:"flex", alignItems:"center", gap:6, background:T.blueDim, border:`1px solid ${T.blueBorder}`, borderRadius:100, padding:"5px 14px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: credits > 0 ? T.blue : T.muted2, boxShadow: credits > 0 ? "0 0 6px rgba(77,142,255,0.7)" : "none" }} />
            <span style={{ fontSize:12, fontWeight:500, color: credits > 0 ? "#A8C4FF" : T.muted2, fontFamily:"'Inter',sans-serif" }}>
              {credits} {credits === 1 ? "credit" : "credits"}
            </span>
          </div>

          {/* Avatar */}
          <div ref={dropdownRef} style={{ position:"relative" }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                width:32, height:32, borderRadius:"50%",
                background:T.blueDim,
                border: dropdownOpen ? `1.5px solid rgba(77,142,255,0.7)` : `1.5px solid rgba(77,142,255,0.25)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:600, color:"#A8C4FF",
                fontFamily:"'Manrope',sans-serif",
                cursor:"pointer", outline:"none", transition:"border-color 0.15s",
              }}
            >{initials}</button>

            {dropdownOpen && (
              <div style={{
                position:"absolute", top:"calc(100% + 10px)", right:0, width:236,
                background:"rgba(10,13,18,0.97)",
                border:"1px solid rgba(255,255,255,0.09)",
                borderRadius:16, overflow:"hidden",
                boxShadow:"0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
                backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
                animation:"ddIn 0.15s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <div style={{ padding:"14px 15px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:-0.2, marginBottom:3, fontFamily:"'Manrope',sans-serif" }}>{fullName}</div>
                  <div style={{ fontSize:11, color:T.muted2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Inter',sans-serif" }}>{email}</div>
                </div>
                <div style={{ padding:"6px 0" }}>
                  {NAV_ITEMS.map(({ label, path, icon }) => (
                    <button key={label} className="ddi" onClick={() => { router.push(path); setDropdownOpen(false); }}>{icon}{label}</button>
                  ))}
                </div>
                <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"2px 0" }} />
                <div style={{ padding:"5px 0 7px" }}>
                  <button className="ddi ddi-red" onClick={() => signOut(() => router.replace("/sign-in"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="dash-main" style={{ maxWidth:780, margin:"0 auto", padding:"56px 56px 100px", position:"relative", zIndex:1, animation:"fadeUp 0.5s ease-out both" }}>

        {/* Greeting */}
        <div style={{ marginBottom:44 }}>
          {/* <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:T.blue, marginBottom:10 }}>Workspace</div> */}
          <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:600, letterSpacing:-1.5, color:T.text, lineHeight:1.05, marginBottom:10 }}>
            {user?.firstName ? `${user.firstName}'s workspace` : "Your workspace"}
          </h1>
          <p style={{ fontSize:15, color:T.muted, lineHeight:1.7, fontWeight:300 }}>
            Generate a week of posts across all your platforms in one click.
          </p>
        </div>

        {/* ── Product card ── */}
        <div className="glass-card" style={{ padding:"28px 28px 24px", marginBottom:14, position:"relative", overflow:"hidden" }}>

          {/* Product switcher */}
          {products && products.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20, flexWrap:"wrap" }}>
              {products.map((p: any) => {
                const isActive = p._id === (selectedProductId ?? products[0]._id);
                return (
                  <button
                    key={p._id}
                    onClick={() => setSelectedProductId(p._id)}
                    style={{
                      padding:"5px 13px", borderRadius:100, fontSize:12, fontWeight:500,
                      cursor:"pointer", transition:"all 0.14s", letterSpacing:-0.1,
                      background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                      border: isActive ? "1px solid rgba(255,255,255,0.18)" : `1px solid ${T.border}`,
                      color: isActive ? T.text : T.muted2,
                      fontFamily:"'Inter',sans-serif",
                    }}
                  >{p.name}</button>
                );
              })}
              <button
                onClick={() => router.push("/onboarding")}
                style={{
                  padding:"5px 11px", borderRadius:100, fontSize:12, fontWeight:500,
                  cursor:"pointer", transition:"all 0.14s",
                  background:"none", border:"1px dashed rgba(255,255,255,0.10)",
                  color:T.muted2, display:"flex", alignItems:"center", gap:5,
                  fontFamily:"'Inter',sans-serif",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)"; (e.currentTarget as HTMLButtonElement).style.color = T.text; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)"; (e.currentTarget as HTMLButtonElement).style.color = T.muted2; }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add product
              </button>
            </div>
          )}

          {/* Product top row */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              </div>
              <div>
                <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:T.muted2, marginBottom:5, fontFamily:"'Manrope',sans-serif" }}>Your product</p>
                <h2 style={{ fontSize:17, fontWeight:600, color:T.text, letterSpacing:-0.4, lineHeight:1.2, fontFamily:"'Manrope',sans-serif" }}>{product.name}</h2>
                {product.tagline && <p style={{ fontSize:13, color:T.muted, marginTop:3, lineHeight:1.5, fontFamily:"'Inter',sans-serif" }}>{product.tagline}</p>}
              </div>
            </div>
            <button
              onClick={() => router.push(`/edit-product?id=${product._id}`)}
              style={{
                fontSize:12, fontWeight:600, color:T.muted,
                background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)",
                borderRadius:8, padding:"5px 14px", cursor:"pointer",
                transition:"all 0.14s", flexShrink:0, letterSpacing:0,
                fontFamily:"'Manrope',sans-serif",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.10)"; (e.currentTarget as HTMLButtonElement).style.color = T.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLButtonElement).style.color = T.muted; }}
            >Edit</button>
          </div>

          {/* Platform pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
            {product.platforms.map((p: string) => (
              <span key={p} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:500, color:T.muted, padding:"4px 10px", borderRadius:100, border:"1px solid rgba(255,255,255,0.10)", background:"rgba(255,255,255,0.05)", letterSpacing:0.1, fontFamily:"'Inter',sans-serif" }}>
                <PlatformIcon p={p} />
                {platformLabel(p)}
              </span>
            ))}
          </div>

          {/* Detail tiles */}
          <div className="detail-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Target Audience", value:product.targetAudience },
              { label:"Key Features",    value:product.keyFeatures },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:"rgba(255,255,255,0.025)", border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
                <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:T.muted2, marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>{label}</p>
                <p style={{ fontSize:13, color:T.muted, lineHeight:1.65, display:"-webkit-box", WebkitLineClamp:3 as any, WebkitBoxOrient:"vertical" as any, overflow:"hidden", fontFamily:"'Inter',sans-serif", fontWeight:300 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Generate CTA ── */}
        <div style={{
          background: credits > 0 ? "rgba(77,142,255,0.06)" : "rgba(255,255,255,0.03)",
          border: credits > 0 ? `1px solid rgba(77,142,255,0.22)` : `1px solid ${T.border}`,
          borderRadius:20, padding:"28px 28px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:20,
          backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
          boxShadow: credits > 0 ? "0 4px 32px rgba(77,142,255,0.12), 0 1px 0 rgba(255,255,255,0.06) inset" : "0 4px 20px rgba(0,0,0,0.2)",
          position:"relative", overflow:"hidden", flexWrap:"wrap",
        }}>
          {credits > 0 && (
            <div style={{ position:"relative" }}>
              <h3 style={{ fontSize:17, fontWeight:600, color:T.text, letterSpacing:-0.4, marginBottom:6, lineHeight:1.3, fontFamily:"'Manrope',sans-serif" }}>
                Generate this week's posts
              </h3>
              <p style={{ fontSize:14, color:T.muted, lineHeight:1.65, fontFamily:"'Inter',sans-serif", fontWeight:300 }}>
                Produces a full batch for all connected platforms. Uses 1 credit.
              </p>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
            <button
              onClick={() => router.push(credits > 0 ? `/generate?id=${product._id}` : "/billing")}
              style={{
                position:"relative", overflow:"hidden",
                padding:"12px 28px",
                background: credits > 0
                  ? "linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)"
                  : "rgba(255,255,255,0.04)",
                border: credits > 0
                  ? "1px solid rgba(160,200,255,0.50)"
                  : `1px solid ${T.border}`,
                borderRadius:10,
                color: credits > 0 ? "#ffffff" : T.muted,
                fontSize:13, fontWeight:600, cursor:"pointer",
                letterSpacing:0.01, whiteSpace:"nowrap",
                backdropFilter:"blur(24px) saturate(2)",
                WebkitBackdropFilter:"blur(24px) saturate(2)",
                boxShadow: credits > 0
                  ? "0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 4px 20px rgba(77,142,255,0.20)"
                  : "none",
                transition:"transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s ease",
                fontFamily:"'Manrope',sans-serif",
                display:"inline-flex", alignItems:"center", gap:8,
              }}
              onMouseEnter={e => { if (credits > 0) { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(160deg, rgba(140,185,255,0.55) 0%, rgba(70,125,250,0.70) 50%, rgba(45,100,220,0.80) 100%)"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; if (credits > 0) (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)"; }}
            >
              {credits > 0 ? "Generate content" : "Top up credits"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            {credits > 0 && (
              <p style={{ fontSize:11, color:T.muted2, letterSpacing:0.1, fontFamily:"'Inter',sans-serif" }}>
                {credits} {credits === 1 ? "credit" : "credits"} remaining
              </p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}