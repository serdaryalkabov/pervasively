"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MoveRight } from "lucide-react";

type Post = { twitter?: string; instagram?: string; linkedin?: string };
type Day = { day: number; type: string; posts: Post };
type GeneratedData = { days: Day[] };

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  linkedin: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

// Normalise verbose AI type strings into short labels for the day strip
const DAY_TYPE_SHORT: Record<string, string> = {
  "Value Post": "Value",
  "Product Post": "Product",
  "Product / feature post": "Feature",
  "Story Post": "Story",
  "Story / founder post": "Founder",
  "Hot Take Post": "Opinion",
  "Hot take / opinion post": "Opinion",
  "Behind the Scenes Post": "BTS",
  "Behind the scenes post": "BTS",
  "Social Proof Post": "Social",
  "Social proof / milestone post": "Milestone",
  "CTA Post": "CTA",
  "CTA / engagement post": "CTA",
};
function shortType(type: string) {
  return DAY_TYPE_SHORT[type] ?? type.split(/[\s/]/)[0];
}

/* ─── Copy button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 text-xs font-medium transition"
      style={{ color: copied ? "#2AA5C0" : "#3D5A62", background: "none", border: "none", cursor: "pointer" }}
    >
      {copied ? (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          Copy
        </>
      )}
    </button>
  );
}

/* ─── Split Instagram content from visual direction note ─── */
function splitInstagramContent(content: string): { body: string; visual: string | null } {
  // Match the last [...] block at the end of the string (the visual direction)
  const match = content.match(/^([\s\S]*?)(\[([^\]]+)\])\s*$/);
  if (match) {
    return { body: match[1].trimEnd(), visual: match[3].trim() };
  }
  return { body: content, visual: null };
}

/* ─── Single platform card ─── */
function PlatformCard({ platform, content }: { platform: string; content: string }) {
  const isTwitter = platform === "twitter";
  const isInstagram = platform === "instagram";

  const { body, visual } = isInstagram ? splitInstagramContent(content) : { body: content, visual: null };

  const charCount = content.length;
  const overLimit = isTwitter && charCount > 280;

  return (
    <div
      className="flex flex-col gap-3 flex-1 rounded-2xl p-5"
      style={{ background: "rgba(12,20,23,0.7)", border: "1px solid rgba(255,255,255,0.06)", minWidth: 220 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: "#2AA5C0" }}>
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 28, height: 28, background: "rgba(25,97,117,0.15)", border: "1px solid rgba(42,165,192,0.18)" }}
          >
            {PLATFORM_ICONS[platform]}
          </div>
          <span className="text-xs font-medium">{PLATFORM_LABELS[platform] ?? platform}</span>
        </div>
        <CopyButton text={content} />
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed flex-1 whitespace-pre-wrap" style={{ color: "#C5D8DC" }}>
        {body}
      </p>

      {/* Instagram visual direction */}
      {isInstagram && visual && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(25,97,117,0.07)", border: "1px solid rgba(42,165,192,0.1)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0, opacity: 0.6 }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="text-xs leading-relaxed" style={{ color: "#3D6672", fontStyle: "italic" }}>
            {visual}
          </span>
        </div>
      )}

      {/* Twitter char count */}
      {isTwitter && (
        <div className="flex justify-end">
          <span className="text-xs font-medium" style={{ color: overLimit ? "#E07070" : "#2E4A55" }}>
            {charCount} / 280
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */
function GenerateInner() {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();
  const [avatarOpen, setAvatarOpen] = useState(false);

  const convexUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const products = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");
  const saveGeneration = useMutation(api.products.saveGeneration);
  
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const product = productId
    ? products?.find((p: any) => p._id === productId) ?? products?.[0]
    : products?.[0];
  // Fetch previous angle summaries for this product (skip until product is known)
  const previousAngles = useQuery(
    api.products.getRecentAngles,
    product ? { productId: product._id, limit: 4 } : "skip"
  );

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedData | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [error, setError] = useState("");

  const credits = convexUser?.credits ?? 0;
  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const isLoading = !convexUser || !products;
  const currentDay = generated?.days.find(d => d.day === activeDay);
  const totalDays = generated?.days.length ?? 7;

  const handleGenerate = async () => {
    if (!user || !product || credits < 1) return;
    setGenerating(true); setError(""); setGenerated(null);
    try {
      const res  = await fetch("/api/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          product,
          examplePosts:   convexUser?.examplePosts ?? [],
          previousAngles: previousAngles ?? [],        // ← anti-repetition history
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Generation failed. Please try again.");
        setGenerating(false);
        return;
      }
      await saveGeneration({
        userId:       user.id,
        productId:    product._id as Id<"products">,
        posts:        json.data,
        windowDays:   7,
        angleSummary: json.angleSummary ?? undefined,  // ← store for next time
      });
      setGenerated(json.data);
      setActiveDay(1);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#080D10" }}>
      <div className="rounded-full animate-spin" style={{ width: 20, height: 20, border: "1.5px solid rgba(25,97,117,0.2)", borderTopColor: "#2AA5C0" }} />
    </div>
  );

  if (!product) { router.replace("/onboarding"); return null; }

  return (
    <div className="min-h-screen" style={{ background: "#080D10", fontFamily: "'Inter', -apple-system, sans-serif", color: "#F0F4F5" }}>

      {/* Ambient + dot grid */}

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6"
        style={{ height: 54, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,13,16,0.85)", backdropFilter: "blur(20px)" }}
      >
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <a href="#" style={{ fontFamily: "'Manrope',sans-serif", fontSize: 19, fontWeight: 500, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>Pervasive<span style={{ color: "#2AA5C0" }}>ly</span></a>
            {/* <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "cover" }} />
            <span className="font-medium" style={{ fontSize: 14, letterSpacing: -0.3, color: "#EDF2F4" }}>Pervasively</span> */}
          </div>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)" }} />
          {/* <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-xs font-medium transition"
            style={{ color: "#2E4A55", background: "none", border: "none", cursor: "pointer", letterSpacing: -0.1 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")}
            onMouseLeave={e => (e.currentTarget.style.color = "#2E4A55")}
          >
            <ChevronLeft size={13} /> Dashboard
          </button> */}
        </div>

        {/* Right: credits + avatar */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(12,20,23,0.9)", border: "1px solid rgba(255,255,255,0.065)" }}>
            {/* <div className="rounded-full" style={{ width: 6, height: 6, background: credits > 0 ? "#2AA5C0" : "#2E4A55", boxShadow: "none" }} /> */}
            <span className="text-xs font-medium" style={{ color: credits > 0 ? "#C5D8DC" : "#3D5A62" }}>
              {credits} {credits === 1 ? "credit" : "credits"}
            </span>
          </div>

          {/* Avatar dropdown */}
          <div ref={avatarRef} style={{ position: "relative" }}>
            <button
              onClick={() => setAvatarOpen(o => !o)}
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "#0e2028",
                border: avatarOpen ? "1.5px solid rgba(42,165,192,0.7)" : "1.5px solid rgba(25,97,117,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.9)", cursor: "pointer",
                boxShadow: "none",
                transition: "all 0.16s", outline: "none",
              }}
            >{initials}</button>

            {avatarOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, width: 228,
                background: "rgba(10,16,20,0.97)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, overflow: "hidden",
                backdropFilter: "blur(28px)", animation: "ddIn 0.14s cubic-bezier(0.16,1,0.3,1)",
              }}>
                <style>{`
                  @keyframes ddIn { from { opacity:0; transform:translateY(-5px) scale(0.97); } to { opacity:1; transform:none; } }
                  .gddi { display:flex; align-items:center; gap:9px; padding:9px 14px; width:100%; background:none; border:none; cursor:pointer; font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:450; color:#7A9EAA; text-align:left; transition:background 0.1s,color 0.1s; }
                  .gddi:hover { background:rgba(255,255,255,0.04); color:#E0EAED; }
                  .gddi svg { opacity:0.5; flex-shrink:0; transition:opacity 0.1s; }
                  .gddi:hover svg { opacity:0.85; }
                  .gddi-red:hover { background:rgba(200,65,65,0.08) !important; color:#D87070 !important; }
                `}</style>
                <div style={{ padding: "13px 14px 11px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#E0EAED", marginBottom: 2 }}>{fullName}</div>
                  <div style={{ fontSize: 11, color: "#2E4A55", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
                </div>
                <div style={{ padding: "5px 0" }}>
                  {([
                    { label: "Dashboard", path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
                    { label: "Billing & credits", path: "/billing", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
                    { label: "History", path: "/history", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
                    { label: "Settings", path: "/settings", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
                    { label: "Feedback", path: "/feedback", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
                  ] as { label: string; path: string; icon: React.ReactNode }[]).map(({ label, path, icon }) => (
                    <button key={label} className="gddi" onClick={() => { router.push(path); setAvatarOpen(false); }}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />
                <div style={{ padding: "5px 0 7px" }}>
                  <button className="gddi gddi-red" onClick={() => signOut(() => router.replace("/sign-in"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto px-6 py-12" style={{ maxWidth: 920 }}>

        {/* Page header */}
        <div className="mb-10">
          {/* <p className="text-xs font-bold uppercase mb-2" style={{ color: "#196175", letterSpacing: "0.12em" }}>Content generation</p> */}
          <h1 className="tracking-tight mb-1.5" style={{ fontWeight: 500, fontSize: 26, letterSpacing: -0.7, color: "#EDF2F4" }}>
            {generated ? `${product.name}: this week` : "Generate your week"}
          </h1>
          <p className="text-sm" style={{ color: "#3D5A62" }}>
            {generated
              ? `${totalDays} days, ${product.platforms.length} platform${product.platforms.length !== 1 ? "s" : ""}, ${totalDays * product.platforms.length} posts`
              : `7 days, ${product.platforms.length} platform${product.platforms.length !== 1 ? "s" : ""}, 1 credit`}
          </p>
        </div>

        {/* ── Pre-generation card ── */}
        {!generated && (
          <div
            className="flex flex-col items-center text-center rounded-2xl p-12 mb-6 relative overflow-hidden"
            style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(42,165,192,0.13)" }}
          >
            {/* <div className="pointer-events-none absolute" style={{ top: -60, right: -60, width: 240, height: 240, background: "radial-gradient(circle, rgba(42,165,192,0.06) 0%, transparent 70%)" }} /> */}

            {/* <div className="flex items-center justify-center rounded-2xl mb-5" style={{ width: 52, height: 52, background: "rgba(25,97,117,0.12)", border: "1px solid rgba(42,165,192,0.2)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div> */}

            <h2 className="mb-2" style={{ fontWeight: 500, fontSize: 17, letterSpacing: -0.3, color: "#EDF2F4" }}>
              {credits < 1 ? "No credits remaining" : "Ready to generate"}
            </h2>
            <p className="text-sm mb-8" style={{ color: "#3D5A62", maxWidth: 360, lineHeight: 1.7 }}>
              {credits < 1
                ? "Top up your credits to generate content."
                : `Pervasively will write ${product.platforms.length * 7} platform-native posts from your product brief – one per platform, per day. Takes about 15 seconds.`}
            </p>

            {/* Platform + window pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {product.platforms.map((p: string) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1"
                  style={{ color: "#2AA5C0", border: "1px solid rgba(42,165,192,0.18)", background: "rgba(25,97,117,0.09)" }}
                >
                  {PLATFORM_ICONS[p]}
                  {PLATFORM_LABELS[p] ?? p}
                </span>
              ))}
              <span className="text-xs font-medium rounded-full px-3 py-1" style={{ color: "#2E4A55", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(12,20,23,0.5)" }}>
                7 days
              </span>
            </div>

            <button
              onClick={credits < 1 ? () => router.push("/billing") : handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 rounded-xl transition"
              style={{
                padding: "12px 28px", fontSize: 13, letterSpacing: -0.1,
                background: credits < 1 ? "rgba(255,255,255,0.04)" : "#196175",
                border: credits < 1 ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(42,165,192,0.28)",
                color: credits < 1 ? "#4A6A75" : "#fff",
                opacity: generating ? 0.7 : 1, cursor: generating ? "wait" : "pointer",
              }}
            >
              {generating ? (
                <>
                  <div className="rounded-full animate-spin" style={{ width: 14, height: 14, border: "1.5px solid rgba(255,255,255,0.2)", borderTopColor: "#fff" }} />
                  Generating…
                </>
              ) : credits < 1 ? <span className="flex items-center gap-2">Add credits <MoveRight size={14} /></span> : <span style={{ fontWeight: 500 }} className="flex items-center gap-2">Generate this week's content </span>}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 mb-5" style={{ background: "rgba(224,90,90,0.07)", border: "1px solid rgba(224,90,90,0.18)" }}>
            <p className="text-sm" style={{ color: "#E07070" }}>{error}</p>
          </div>
        )}

        {/* ── Generated view ── */}
        {generated && (
          <>
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{ width: 7, height: 7, background: "#2AA5C0", boxShadow: "none" }} />
                <span className="text-xs font-medium" style={{ color: "#3D5A62" }}>
                  {totalDays * product.platforms.length} posts ready
                </span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || credits < 1}
                className="text-xs font-medium rounded-lg px-3 py-1.5 transition"
                style={{ color: "#2AA5C0", background: "rgba(42,165,192,0.07)", border: "1px solid rgba(42,165,192,0.14)", opacity: generating || credits < 1 ? 0.4 : 1, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(42,165,192,0.13)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(42,165,192,0.07)")}
              >
                {generating ? "Generating…" : "Regenerate — 1 credit"}
              </button>
            </div>

            {/* ── Day strip ── */}
            <div className="flex gap-2 mb-6 pb-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {generated.days.map(day => {
                const active = day.day === activeDay;
                return (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className="flex flex-col items-center gap-1 rounded-xl flex-shrink-0 transition"
                    style={{
                      padding: "10px 16px",
                      background: active ? "rgba(25,97,117,0.18)" : "rgba(12,20,23,0.55)",
                      border: active ? "1px solid rgba(42,165,192,0.35)" : "1px solid rgba(255,255,255,0.052)",
                      boxShadow: "none",
                      cursor: "pointer", outline: "none",
                    }}
                  >
                    <span className="font-bold" style={{ fontSize: 10, letterSpacing: "0.09em", color: active ? "#2AA5C0" : "#2E4A55" }}>
                      DAY {day.day}
                    </span>
                    <span className="font-medium whitespace-nowrap" style={{ fontSize: 11, color: active ? "#8AABB5" : "#243E48" }}>
                      {shortType(day.type)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── Active day content ── */}
            {currentDay && (
              <>
                <div className="flex items-baseline gap-2.5 mb-4">
                  <span className="font-medium" style={{ fontSize: 15, letterSpacing: -0.3, color: "#EDF2F4" }}>Day {currentDay.day}</span>
                  <span className="text-xs font-medium" style={{ color: "#2E4A55" }}>{currentDay.type}</span>
                </div>

                {/* Platform cards — side by side */}
                <div className="flex gap-3" style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
                  {product.platforms.map((platform: string) => {
                    const content = currentDay.posts[platform as keyof Post];
                    if (!content) return null;
                    return <PlatformCard key={platform} platform={platform} content={content} />;
                  })}
                </div>

                {/* Prev / Next */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setActiveDay(d => Math.max(1, d - 1))}
                    disabled={activeDay === 1}
                    className="flex items-center gap-1.5 text-xs font-medium transition"
                    style={{ color: activeDay === 1 ? "#1E2E33" : "#3D5A62", background: "none", border: "none", cursor: activeDay === 1 ? "default" : "pointer" }}
                    onMouseEnter={e => { if (activeDay !== 1) e.currentTarget.style.color = "#8AABB5"; }}
                    onMouseLeave={e => { if (activeDay !== 1) e.currentTarget.style.color = "#3D5A62"; }}
                  >
                    <ChevronLeft size={13} /> Previous day
                  </button>
                  <span className="text-xs font-medium" style={{ color: "#243E48", letterSpacing: "0.05em" }}>
                    {activeDay} / {totalDays}
                  </span>
                  <button
                    onClick={() => setActiveDay(d => Math.min(totalDays, d + 1))}
                    disabled={activeDay === totalDays}
                    className="flex items-center gap-1.5 text-xs font-medium transition"
                    style={{ color: activeDay === totalDays ? "#1E2E33" : "#3D5A62", background: "none", border: "none", cursor: activeDay === totalDays ? "default" : "pointer" }}
                    onMouseEnter={e => { if (activeDay !== totalDays) e.currentTarget.style.color = "#8AABB5"; }}
                    onMouseLeave={e => { if (activeDay !== totalDays) e.currentTarget.style.color = "#3D5A62"; }}
                  >
                    Next day <ChevronRight size={13} />
                  </button>
                </div>
              </>
            )}


          </>
        )}
      </main>
    </div>
  );
}

export function GenerateClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#080D10" }} />}>
      <GenerateInner />
    </Suspense>
  );
}