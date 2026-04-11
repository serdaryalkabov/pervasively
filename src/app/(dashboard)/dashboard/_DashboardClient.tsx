"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useUser, useClerk } from "@clerk/nextjs";
import { MoveRight } from "lucide-react";

function PlatformIcon({ p }: { p: string }) {
  if (p === "twitter")
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  if (p === "linkedin")
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
      </svg>
    );
  if (p === "instagram")
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  return null;
}

const platformLabel = (p: string) =>
  p === "twitter" ? "Twitter / X" : p.charAt(0).toUpperCase() + p.slice(1);


export function DashboardClient() {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const convexUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const products = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");

  useEffect(() => {
    if (products && products.length === 0) router.replace("/onboarding");
  }, [products]);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const isLoading = convexUser === undefined || products === undefined;
  const product = selectedProductId
    ? products?.find((p: any) => p._id === selectedProductId) ?? products?.[0]
    : products?.[0];
  const credits = convexUser?.credits ?? 0;

  const Spinner = ({ label }: { label: string }) => (
    <div style={{ minHeight: "100vh", background: "#080D10", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(25,97,117,0.15)", borderTopColor: "#2AA5C0", animation: "spin 0.75s linear infinite" }} />
        <span style={{ fontSize: 13, color: "#3D5A62", letterSpacing: 0.1 }}>{label}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (isLoading) return <Spinner label="Loading your workspace…" />;
  if (!product) return <Spinner label="Setting things up…" />;

  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ?? "?";

  return (
    <div style={{ minHeight: "100vh", background: "#080D10", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: "#F0F4F5", overflowX: "hidden" }}>
      {/* dot grid */}

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(8,13,16,0.84)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        padding: "0 28px", height: 54,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img
            src="/pervasively.jpg"
            alt="Pervasively"
            style={{ width: 26, height: 26, borderRadius: 7, objectFit: "cover" }}
          />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#EDF2F4", letterSpacing: -0.3 }}>Pervasively</span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Credits */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(12,20,23,0.85)", border: "1px solid rgba(255,255,255,0.065)",
            borderRadius: 100, padding: "5px 13px",
          }}>
            {/* <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: credits > 0 ? "#2AA5C0" : "#2E4A55",
              boxShadow: "none",
            }} /> */}
            <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#C5D8DC" : "#3D5A62", letterSpacing: -0.1 }}>
              {credits} {credits === 1 ? "credit" : "credits"}
            </span>
          </div>

          {/* Avatar + Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "#0e2028",
                border: dropdownOpen ? "1.5px solid rgba(42,165,192,0.7)" : "1.5px solid rgba(25,97,117,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: "pointer",
                boxShadow: "none",
                transition: "all 0.16s ease", outline: "none",
              }}
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, width: 228,
                background: "rgba(10,16,20,0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                animation: "ddIn 0.14s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <style>{`
                  @keyframes ddIn { from { opacity:0; transform:translateY(-5px) scale(0.97); } to { opacity:1; transform:none; } }
                  .ddi { display:flex; align-items:center; gap:9px; padding:9px 14px; width:100%; background:none; border:none; cursor:pointer; font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:450; color:#7A9EAA; text-align:left; transition:background 0.1s,color 0.1s; }
                  .ddi:hover { background:rgba(255,255,255,0.04); color:#E0EAED; }
                  .ddi svg { opacity:0.5; flex-shrink:0; transition:opacity 0.1s; }
                  .ddi:hover svg { opacity:0.85; }
                  .ddi-red:hover { background:rgba(200,65,65,0.08) !important; color:#D87070 !important; }
                `}</style>

                {/* Header */}
                <div style={{ padding: "13px 14px 11px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#E0EAED", letterSpacing: -0.1, marginBottom: 2 }}>
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName ?? "Founder"}
                  </div>
                  <div style={{ fontSize: 11, color: "#2E4A55", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.emailAddresses[0]?.emailAddress}
                  </div>
                </div>

                <div style={{ padding: "5px 0" }}>
                  {([
                    { label: "Dashboard", path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                    { label: "Settings", path: "/settings", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                    { label: "Billing & credits", path: "/billing", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                    { label: "History", path: "/history", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                    { label: "Feedback", path: "/feedback", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                  ] as { label: string; path: string; icon: React.ReactNode }[]).map(({ label, path, icon }) => (
                    <button key={label} className="ddi" onClick={() => { router.push(path); setDropdownOpen(false); }}>
                      {icon}{label}
                    </button>
                  ))}
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />

                <div style={{ padding: "5px 0 7px" }}>
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
      <main style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 500, letterSpacing: -0.7, color: "#EDF2F4", lineHeight: 1.25, marginBottom: 7 }}>
            {user?.firstName ? `${user.firstName}'s workspace` : "Your workspace"}
          </h1>
          <p style={{ fontSize: 14, color: "#3D5A62", lineHeight: 1.6, fontWeight: 400 }}>
            Generate a week of posts across all your platforms in one click.
          </p>
        </div>

        {/* ── Product card ── */}
        <div style={{
          background: "rgba(12,20,23,0.65)",
          border: "1px solid rgba(255,255,255,0.062)",
          borderRadius: 18, padding: "22px 22px 20px",
          marginBottom: 12,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          position: "relative", overflow: "hidden",
        }}>

          {/* Product switcher */}
          {products && products.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {products.map((p: any) => {
                const isActive = p._id === (selectedProductId ?? products[0]._id);
                return (
                  <button
                    key={p._id}
                    onClick={() => setSelectedProductId(p._id)}
                    style={{
                      padding: "5px 13px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.14s", letterSpacing: -0.1,
                      background: isActive ? "rgba(25,97,117,0.25)" : "rgba(255,255,255,0.03)",
                      border: isActive ? "1px solid rgba(42,165,192,0.35)" : "1px solid rgba(255,255,255,0.07)",
                      color: isActive ? "#2AA5C0" : "#3D5A62",
                    }}
                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(42,165,192,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "#7A9EAA"; } }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "#3D5A62"; } }}
                  >
                    {p.name}
                  </button>
                );
              })}
              <button
                onClick={() => router.push("/onboarding")}
                style={{
                  padding: "5px 11px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.14s",
                  background: "none", border: "1px dashed rgba(255,255,255,0.1)",
                  color: "#2E4A55", display: "flex", alignItems: "center", gap: 5,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(42,165,192,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "#2AA5C0"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#2E4A55"; }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add product
              </button>
            </div>
          )}

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: "rgba(25,97,117,0.15)",
                border: "1px solid rgba(42,165,192,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(42,165,192,0.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 4 }}>Your product</p>
                <h2 style={{ fontSize: 16, fontWeight: 500, color: "#EDF2F4", letterSpacing: -0.35, lineHeight: 1.2 }}>{product.name}</h2>
                {product.tagline && (
                  <p style={{ fontSize: 12.5, color: "#3D5A62", marginTop: 3, lineHeight: 1.5 }}>{product.tagline}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push(`/edit-product?id=${product._id}`)}
              style={{
                fontSize: 12, fontWeight: 500, color: "#2AA5C0",
                background: "rgba(42,165,192,0.07)", border: "1px solid rgba(42,165,192,0.15)",
                borderRadius: 8, padding: "5px 12px", cursor: "pointer",
                transition: "all 0.14s", flexShrink: 0, letterSpacing: -0.1,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(42,165,192,0.14)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(42,165,192,0.07)"; }}
            >
              Edit
            </button>
          </div>

          {/* Platform pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {product.platforms.map((p: string) => (
              <span key={p} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 500, color: "#2AA5C0",
                padding: "4px 10px", borderRadius: 100,
                border: "1px solid rgba(42,165,192,0.18)",
                background: "rgba(25,97,117,0.09)", letterSpacing: 0.1,
              }}>
                <PlatformIcon p={p} />
                {platformLabel(p)}
              </span>
            ))}
          </div>

          {/* Detail tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Target Audience", value: product.targetAudience },
              { label: "Key Features", value: product.keyFeatures },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: "rgba(8,13,16,0.55)",
                border: "1px solid rgba(255,255,255,0.048)",
                borderRadius: 11, padding: "13px 14px",
              }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#243E48", marginBottom: 7 }}>{label}</p>
                <p style={{ fontSize: 13, color: "#7A9EAA", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Generate CTA ── */}
        <div style={{
          background: "rgba(12,20,23,0.55)",
          border: credits > 0 ? "1px solid rgba(42,165,192,0.2)" : "1px solid rgba(255,255,255,0.052)",
          borderRadius: 18, padding: "26px 26px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: "none",
          position: "relative", overflow: "hidden",
          flexWrap: "wrap", marginBottom: 12,
        }}>
          {credits > 0 && (<div style={{ position: "relative" }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, color: "#EDF2F4", letterSpacing: -0.4, marginBottom: 5, lineHeight: 1.3 }}>
              {credits > 0 ? "Generate this week's posts" : "No credits remaining"}
            </h3>
            <p style={{ fontSize: 13, color: "#3D5A62", lineHeight: 1.6 }}>
              {credits > 0
                ? "Produces a full batch for all connected platforms. Uses 1 credit."
                : "Add credits to keep your content going."}
            </p>
          </div>)}
          

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => router.push(credits > 0 ? `/generate?id=${product._id}` : "/billing")}
              style={{
                padding: "11px 24px",
                background: credits > 0 ? "#196175" : "rgba(255,255,255,0.055)",
                border: credits > 0 ? "1px solid rgba(42,165,192,0.28)" : "1px solid rgba(255,255,255,0.09)",
                borderRadius: 11, color: credits > 0 ? "#fff" : "#4A6A75",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                letterSpacing: -0.15, whiteSpace: "nowrap",
                transition: "all 0.16s ease",
              }}
              onMouseEnter={e => {}}
              onMouseLeave={e => {}}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                {credits > 0 ? "Generate content" : "Top up credits"}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </button>
            {credits > 0 && (
              <p style={{ fontSize: 11, color: "#243E48", letterSpacing: 0.1 }}>
                {credits} {credits === 1 ? "credit" : "credits"} remaining
              </p>
            )}
          </div>
        </div>



      </main>
    </div>
  );
}