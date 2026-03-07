"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";

type Post = { twitter?: string; instagram?: string; linkedin?: string };
type Day  = { day: number; type: string; posts: Post };
type Generation = {
  _id: string;
  createdAt: number;
  windowDays: number;
  creditsUsed: number;
  posts: { days: Day[] };
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></svg>,
  linkedin: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
};

const DAY_TYPE_SHORT: Record<string, string> = {
  "Value Post": "Value", "Product Post": "Product", "Product / feature post": "Feature",
  "Story Post": "Story", "Story / founder post": "Founder",
  "Hot Take Post": "Opinion", "Hot take / opinion post": "Opinion",
  "Behind the Scenes Post": "BTS", "Behind the scenes post": "BTS",
  "Social Proof Post": "Social", "Social proof / milestone post": "Milestone",
  "CTA Post": "CTA", "CTA / engagement post": "CTA",
};
function shortType(type: string) {
  return DAY_TYPE_SHORT[type] ?? type.split(/[\s/]/)[0];
}

function splitInstagramContent(content: string): { body: string; visual: string | null } {
  const match = content.match(/^([\s\S]*?)(\[([^\]]+)\])\s*$/);
  if (match) return { body: match[1].trimEnd(), visual: match[3].trim() };
  return { body: content, visual: null };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={handle} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, color: copied ? "#2AA5C0" : "#3D5A62", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}>
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
    </button>
  );
}

function PlatformCard({ platform, content }: { platform: string; content: string }) {
  const isTwitter   = platform === "twitter";
  const isInstagram = platform === "instagram";
  const { body, visual } = isInstagram ? splitInstagramContent(content) : { body: content, visual: null };
  const charCount = content.length;
  const overLimit = isTwitter && charCount > 280;

  return (
    <div style={{ flex: 1, minWidth: 200, background: "rgba(12,20,23,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#2AA5C0" }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(25,97,117,0.15)", border: "1px solid rgba(42,165,192,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {PLATFORM_ICONS[platform]}
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600 }}>{PLATFORM_LABELS[platform] ?? platform}</span>
        </div>
        <CopyButton text={content} />
      </div>
      <p style={{ fontSize: 13, color: "#C5D8DC", lineHeight: 1.7, whiteSpace: "pre-wrap", flex: 1 }}>{body}</p>
      {isInstagram && visual && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(25,97,117,0.07)", border: "1px solid rgba(42,165,192,0.1)", borderRadius: 10, padding: "10px 12px" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0, opacity: 0.6 }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
          </svg>
          <span style={{ fontSize: 11.5, color: "#3D6672", fontStyle: "italic", lineHeight: 1.5 }}>{visual}</span>
        </div>
      )}
      {isTwitter && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: overLimit ? "#E07070" : "#2E4A55" }}>{charCount} / 280</span>
        </div>
      )}
    </div>
  );
}

function GenerationViewer({ generation, platforms, onClose }: {
  generation: Generation;
  platforms: string[];
  onClose: () => void;
}) {
  const days = generation.posts?.days ?? [];
  const [activeDay, setActiveDay] = useState(1);
  const currentDay = days.find(d => d.day === activeDay);
  const totalDays  = days.length;

  const date = new Date(generation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,9,12,0.92)", backdropFilter: "blur(16px)", overflowY: "auto" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Modal nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#196175", marginBottom: 4 }}>Generation</p>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#EDF2F4", letterSpacing: -0.4 }}>{date}</h2>
            <p style={{ fontSize: 12, color: "#2E4A55", marginTop: 2 }}>
              {totalDays} days · {platforms.length} platform{platforms.length !== 1 ? "s" : ""} · {totalDays * platforms.length} posts
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "#3D5A62", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, padding: "7px 14px", cursor: "pointer", transition: "color 0.14s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")}
            onMouseLeave={e => (e.currentTarget.style.color = "#3D5A62")}
          >
            ✕ Close
          </button>
        </div>

        {/* Day strip */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {days.map(day => {
            const active = day.day === activeDay;
            return (
              <button key={day.day} onClick={() => setActiveDay(day.day)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 16px", borderRadius: 12, flexShrink: 0, background: active ? "rgba(25,97,117,0.18)" : "rgba(12,20,23,0.55)", border: active ? "1px solid rgba(42,165,192,0.35)" : "1px solid rgba(255,255,255,0.052)", boxShadow: active ? "0 0 16px rgba(25,97,117,0.14)" : "none", cursor: "pointer", outline: "none" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", color: active ? "#2AA5C0" : "#2E4A55" }}>DAY {day.day}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: active ? "#8AABB5" : "#243E48", whiteSpace: "nowrap" }}>{shortType(day.type)}</span>
              </button>
            );
          })}
        </div>

        {/* Day content */}
        {currentDay && (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#EDF2F4", letterSpacing: -0.3 }}>Day {currentDay.day}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#2E4A55" }}>{currentDay.type}</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
              {platforms.map(platform => {
                const content = currentDay.posts[platform as keyof Post];
                if (!content) return null;
                return <PlatformCard key={platform} platform={platform} content={content} />;
              })}
            </div>

            {/* Prev / Next */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setActiveDay(d => Math.max(1, d - 1))} disabled={activeDay === 1} style={{ fontSize: 12, fontWeight: 500, color: activeDay === 1 ? "#1E2E33" : "#3D5A62", background: "none", border: "none", cursor: activeDay === 1 ? "default" : "pointer", transition: "color 0.13s" }} onMouseEnter={e => { if (activeDay !== 1) e.currentTarget.style.color = "#8AABB5"; }} onMouseLeave={e => { if (activeDay !== 1) e.currentTarget.style.color = "#3D5A62"; }}>← Previous day</button>
              <span style={{ fontSize: 11, color: "#1E2E33", fontWeight: 600 }}>{activeDay} / {totalDays}</span>
              <button onClick={() => setActiveDay(d => Math.min(totalDays, d + 1))} disabled={activeDay === totalDays} style={{ fontSize: 12, fontWeight: 500, color: activeDay === totalDays ? "#1E2E33" : "#3D5A62", background: "none", border: "none", cursor: activeDay === totalDays ? "default" : "pointer", transition: "color 0.13s" }} onMouseEnter={e => { if (activeDay !== totalDays) e.currentTarget.style.color = "#8AABB5"; }} onMouseLeave={e => { if (activeDay !== totalDays) e.currentTarget.style.color = "#3D5A62"; }}>Next day →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HistoryClient() {
  const { user }   = useUser();
  const { signOut } = useClerk();
  const router     = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef  = useRef<HTMLDivElement>(null);
  const convexUser = useQuery(api.users.getUser,            user ? { clerkId: user.id } : "skip");
  const products   = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");
  const generations = useQuery(api.products.getGenerations, user ? { userId: user.id } : "skip") as Generation[] | undefined;

  const [viewing, setViewing]           = useState<Generation | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const credits   = convexUser?.credits ?? 0;
  const initials  = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName  = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const isLoading = convexUser === undefined || products === undefined || generations === undefined;

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#080D10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(25,97,117,0.2)", borderTopColor: "#2AA5C0", animation: "spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeProductId = selectedProductId ?? products?.[0]?._id ?? null;
  const product = products?.find((p: any) => p._id === activeProductId) ?? products?.[0];
  const sorted = [...(generations ?? [])]
    .filter((g: any) => !activeProductId || g.productId === activeProductId)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div style={{ minHeight: "100vh", background: "#080D10", fontFamily: "'Inter', -apple-system, sans-serif", color: "#F0F4F5" }}>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(rgba(25,97,117,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -180, left: "50%", transform: "translateX(-50%)", width: 900, height: 460, background: "radial-gradient(ellipse at 50% 0%, rgba(25,97,117,0.12) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,13,16,0.85)", backdropFilter: "blur(20px)", padding: "0 28px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "cover", boxShadow: "0 0 12px rgba(25,97,117,0.35)" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#EDF2F4", letterSpacing: -0.3 }}>Pervasively</span>
          </div>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)" }} />
          <button onClick={() => router.push("/dashboard")} style={{ fontSize: 12, fontWeight: 500, color: "#2E4A55", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", letterSpacing: -0.1 }} onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")} onMouseLeave={e => (e.currentTarget.style.color = "#2E4A55")}>
            ← Dashboard
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(12,20,23,0.9)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 100, padding: "5px 13px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: credits > 0 ? "#2AA5C0" : "#2E4A55", boxShadow: credits > 0 ? "0 0 6px rgba(42,165,192,0.6)" : "none" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#C5D8DC" : "#3D5A62" }}>{credits} {credits === 1 ? "credit" : "credits"}</span>
          </div>
          <div ref={avatarRef} style={{ position: "relative" }}>
            <button onClick={() => setAvatarOpen(o => !o)} style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #196175, #0c3340)", border: avatarOpen ? "1.5px solid rgba(42,165,192,0.7)" : "1.5px solid rgba(25,97,117,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", cursor: "pointer", boxShadow: avatarOpen ? "0 0 0 3px rgba(42,165,192,0.13)" : "none", transition: "all 0.16s", outline: "none" }}>
              {initials}
            </button>
            {avatarOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 228, background: "rgba(10,16,20,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)", backdropFilter: "blur(28px)", animation: "ddIn 0.14s cubic-bezier(0.16,1,0.3,1)" }}>
                <style>{`
                  @keyframes ddIn { from { opacity:0; transform:translateY(-5px) scale(0.97); } to { opacity:1; transform:none; } }
                  .hddi { display:flex; align-items:center; gap:9px; padding:9px 14px; width:100%; background:none; border:none; cursor:pointer; font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:450; color:#7A9EAA; text-align:left; transition:background 0.1s,color 0.1s; }
                  .hddi:hover { background:rgba(255,255,255,0.04); color:#E0EAED; }
                  .hddi svg { opacity:0.5; flex-shrink:0; transition:opacity 0.1s; }
                  .hddi:hover svg { opacity:0.85; }
                  .hddi-red:hover { background:rgba(200,65,65,0.08) !important; color:#D87070 !important; }
                `}</style>
                <div style={{ padding: "13px 14px 11px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#E0EAED", marginBottom: 2 }}>{fullName}</div>
                  <div style={{ fontSize: 11, color: "#2E4A55", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
                </div>
                <div style={{ padding: "5px 0" }}>
                  {([
                    { label: "Dashboard",        path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                    { label: "Settings",         path: "/settings",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                    { label: "Billing & credits", path: "/billing",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                    { label: "History",           path: "/history",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                    { label: "Feedback",          path: "/feedback", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                  ] as { label: string; path: string; icon: React.ReactNode }[]).map(({ label, path, icon }) => (
                    <button key={label} className="hddi" onClick={() => { router.push(path); setAvatarOpen(false); }}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />
                <div style={{ padding: "5px 0 7px" }}>
                  <button className="hddi hddi-red" onClick={() => signOut(() => router.replace("/sign-in"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#196175", marginBottom: 8 }}>History</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.7, color: "#EDF2F4", marginBottom: 6 }}>Past generations</h1>
          <p style={{ fontSize: 14, color: "#3D5A62" }}>
            {sorted.length > 0 ? `${sorted.length} batch${sorted.length !== 1 ? "es" : ""} for ${product?.name ?? "this product"}` : "No generations yet."}
          </p>
        </div>

        {/* Product tabs */}
        {products && products.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
            {(products as any[]).map((p: any) => {
              const isActive = p._id === activeProductId;
              const count = (generations ?? []).filter((g: any) => g.productId === p._id).length;
              return (
                <button
                  key={p._id}
                  onClick={() => { setSelectedProductId(p._id); setViewing(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "7px 14px", borderRadius: 100, fontSize: 12.5, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.14s", letterSpacing: -0.1,
                    background: isActive ? "rgba(25,97,117,0.2)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1px solid rgba(42,165,192,0.35)" : "1px solid rgba(255,255,255,0.07)",
                    color: isActive ? "#2AA5C0" : "#3D5A62",
                    boxShadow: isActive ? "0 0 14px rgba(42,165,192,0.1)" : "none",
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(42,165,192,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "#7A9EAA"; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "#3D5A62"; } }}
                >
                  {p.name}
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                    padding: "1px 6px", borderRadius: 100,
                    background: isActive ? "rgba(42,165,192,0.18)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#2AA5C0" : "#2E4A55",
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {sorted.length === 0 && (
          <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "56px 32px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(25,97,117,0.1)", border: "1px solid rgba(42,165,192,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#EDF2F4", marginBottom: 6, letterSpacing: -0.3 }}>No generations yet</h2>
            <p style={{ fontSize: 13, color: "#2E4A55", marginBottom: 20, lineHeight: 1.6 }}>Head to the dashboard to generate your first week of content.</p>
            <button onClick={() => router.push("/generate")} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg, #1a6d85, #196175)", border: "1px solid rgba(42,165,192,0.28)", borderRadius: 10, padding: "10px 22px", cursor: "pointer", boxShadow: "0 4px 16px rgba(25,97,117,0.3)" }}>
              Generate content →
            </button>
          </div>
        )}

        {/* Generation list */}
        {sorted.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((gen, i) => {
              const days      = gen.posts?.days ?? [];
              const platforms = product?.platforms ?? [];
              const totalPosts = days.length * platforms.length;
              const date = new Date(gen.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
              const time = new Date(gen.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
              const isFirst = i === 0;

              return (
                <button
                  key={gen._id}
                  onClick={() => setViewing(gen)}
                  style={{
                    background: "rgba(12,20,23,0.65)", border: isFirst ? "1px solid rgba(42,165,192,0.18)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: "18px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "border-color 0.14s, background 0.14s",
                  }}
                  onMouseEnter={e => { (e.currentTarget.style.borderColor = "rgba(42,165,192,0.25)"); (e.currentTarget.style.background = "rgba(25,97,117,0.06)"); }}
                  onMouseLeave={e => { (e.currentTarget.style.borderColor = isFirst ? "rgba(42,165,192,0.18)" : "rgba(255,255,255,0.06)"); (e.currentTarget.style.background = "rgba(12,20,23,0.65)"); }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(25,97,117,0.12)", border: "1px solid rgba(42,165,192,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#C5D8DC", letterSpacing: -0.1 }}>{date}</span>
                        {isFirst && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#2AA5C0", background: "rgba(42,165,192,0.1)", border: "1px solid rgba(42,165,192,0.2)", borderRadius: 100, padding: "2px 8px" }}>Latest</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11.5, color: "#2E4A55" }}>{time}</span>
                        <span style={{ fontSize: 11.5, color: "#1E2E33" }}>·</span>
                        <span style={{ fontSize: 11.5, color: "#2E4A55" }}>{days.length} days</span>
                        <span style={{ fontSize: 11.5, color: "#1E2E33" }}>·</span>
                        <span style={{ fontSize: 11.5, color: "#2E4A55" }}>{totalPosts} posts</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {platforms.slice(0, 3).map(p => (
                      <div key={p} style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(25,97,117,0.1)", border: "1px solid rgba(42,165,192,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2AA5C0" }}>
                        {PLATFORM_ICONS[p]}
                      </div>
                    ))}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2E4A55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </main>

      {/* Viewer modal */}
      {viewing && (
        <GenerationViewer
          generation={viewing}
          platforms={product?.platforms ?? []}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}