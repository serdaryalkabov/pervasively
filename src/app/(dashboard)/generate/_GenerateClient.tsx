"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

type Post = { twitter?: string; instagram?: string; linkedin?: string };
type BatchResult  = { batchIndex: number; topic: string; posts: Post };
type SingleResult = { platform: string; topic: string; post: string };
type GeneratedData =
  | { mode: "single"; result: SingleResult }
  | { mode: "batch";  batches: BatchResult[] };

const T = {
  blue:       "#4D8EFF",
  blueDim:    "rgba(77,142,255,0.10)",
  blueBorder: "rgba(77,142,255,0.22)",
  bg:         "#0A0D12",
  border:     "rgba(255,255,255,0.07)",
  text:       "#F0F4FF",
  muted:      "#7A8BA8",
  muted2:     "#4A5870",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter / X", instagram: "Instagram", linkedin: "LinkedIn",
};
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter:   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5" strokeLinecap="round"/></svg>,
  linkedin:  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
};

const POST_TYPES = [
  "Value / tip",
  "Product / feature",
  "Founder / story",
  "Hot take / opinion",
  "Behind the scenes",
  "Social proof / milestone",
  "Problem / pain",
  "CTA / engagement",
];

const NAV_ITEMS = [
  { label: "Dashboard",        path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: "Billing & credits", path: "/billing",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { label: "History",           path: "/history",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: "Settings",          path: "/settings",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { label: "Feedback",          path: "/feedback",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

/* ── Copy button ── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={handle} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: copied ? T.blue : T.muted2, background:"none", border:"none", cursor:"pointer", transition:"color 0.15s", fontFamily:"'Inter',sans-serif" }}>
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
    </button>
  );
}

function splitInstagram(content: string): { body: string; visual: string | null } {
  const match = content.match(/^([\s\S]*?)(\[([^\]]+)\])\s*$/);
  return match ? { body: match[1].trimEnd(), visual: match[3].trim() } : { body: content, visual: null };
}

/* ── Platform card ── */
function PlatformCard({ platform, content }: { platform: string; content: string }) {
  const isTwitter   = platform === "twitter";
  const isInstagram = platform === "instagram";
  const { body, visual } = isInstagram ? splitInstagram(content) : { body: content, visual: null };
  const overLimit = isTwitter && content.length > 280;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, flex:1, borderRadius:16, padding:20, background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, backdropFilter:"blur(20px)", minWidth:220, boxShadow:"0 4px 20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.05) inset" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, color:T.blue }}>
          <div style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:8, background:T.blueDim, border:`1px solid ${T.blueBorder}` }}>{PLATFORM_ICONS[platform]}</div>
          <span style={{ fontSize:12, fontWeight:600, fontFamily:"'Manrope',sans-serif" }}>{PLATFORM_LABELS[platform] ?? platform}</span>
        </div>
        <CopyButton text={content} />
      </div>
      <p style={{ fontSize:13, lineHeight:1.7, flex:1, whiteSpace:"pre-wrap", color:T.muted, fontFamily:"'Inter',sans-serif", fontWeight:300 }}>{body}</p>
      {isInstagram && visual && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:8, borderRadius:10, padding:"10px 12px", background:T.blueDim, border:`1px solid ${T.blueBorder}` }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:1, flexShrink:0, opacity:0.7 }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span style={{ fontSize:12, lineHeight:1.65, color:T.muted, fontStyle:"italic", fontFamily:"'Inter',sans-serif" }}>{visual}</span>
        </div>
      )}
      {isTwitter && (
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <span style={{ fontSize:11, fontWeight:500, color: overLimit ? "#E07070" : T.muted2, fontFamily:"'Inter',sans-serif" }}>{content.length} / 280</span>
        </div>
      )}
    </div>
  );
}

/* ── Segmented control ── */
function SegmentedControl({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.03)", border:`1px solid ${T.border}`, borderRadius:10, padding:4 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex:1, padding:"7px 14px", borderRadius:7, fontSize:12, fontWeight:600,
            fontFamily:"'Manrope',sans-serif", cursor:"pointer", border:"none",
            background: value === opt.value ? T.blue : "transparent",
            color: value === opt.value ? "#fff" : T.muted2,
            transition:"background 0.14s, color 0.14s",
            boxShadow: value === opt.value ? "0 2px 8px rgba(77,142,255,0.30)" : "none",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Topic selector ── */
function TopicSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
      {POST_TYPES.map(type => {
        const sel = value === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            style={{
              padding:"9px 12px", borderRadius:10, fontSize:12, fontWeight:500,
              fontFamily:"'Inter',sans-serif", cursor:"pointer", textAlign:"left",
              border:`1px solid ${sel ? T.blueBorder : T.border}`,
              background: sel ? T.blueDim : "rgba(255,255,255,0.02)",
              color: sel ? T.blue : T.muted,
              transition:"all 0.14s",
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:T.muted2, marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>{children}</p>;
}

/* ── Inner page ── */
function GenerateInner() {
  const { user }    = useUser();
  const router      = useRouter();
  const { signOut } = useClerk();
  const [avatarOpen, setAvatarOpen] = useState(false);

  const convexUser     = useQuery(api.users.getUser,            user ? { clerkId: user.id } : "skip");
  const products       = useQuery(api.products.getUserProducts,  user ? { userId: user.id } : "skip");
  const saveGeneration = useMutation(api.products.saveGeneration);

  const searchParams = useSearchParams();
  const productId    = searchParams.get("id");
  const product      = productId
    ? products?.find((p: any) => p._id === productId) ?? products?.[0]
    : products?.[0];

  const previousAngles = useQuery(api.products.getRecentAngles, product ? { productId: product._id, limit: 4 } : "skip");

  // ── Mode
  const [mode, setMode] = useState<"single" | "batch">("single");

  // ── Shared
  const [postLength,  setPostLength]  = useState<"short" | "medium" | "long">("medium");
  const [generating,  setGenerating]  = useState(false);
  const [generated,   setGenerated]   = useState<GeneratedData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error,       setError]       = useState("");

  // ── Single config
  const [singlePlatform, setSinglePlatform] = useState("twitter");
  const [singleTopic,    setSingleTopic]    = useState(POST_TYPES[0]);

  // ── Batch config
  const [batchPlatforms, setBatchPlatforms] = useState<string[]>(product?.platforms ?? ["twitter"]);
  const [batchTopics,    setBatchTopics]    = useState<string[]>([POST_TYPES[0]]);

  const credits   = convexUser?.credits ?? 0;
  const initials  = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName  = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // sync batch platforms with product on load
  useEffect(() => {
    if (product?.platforms?.length) setBatchPlatforms(product.platforms);
  }, [product?._id]);

  const isLoading = !convexUser || !products;

  // Credit cost: single = 1, batch = number of batches
  const creditCost = mode === "single" ? 1 : batchTopics.length;

  const toggleBatchPlatform = (p: string) => {
    setBatchPlatforms(prev =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) : [...prev, p]
    );
  };

  const addBatch = () => {
    if (batchTopics.length < 4) setBatchTopics(prev => [...prev, POST_TYPES[prev.length % POST_TYPES.length]]);
  };

  const removeBatch = (i: number) => {
    if (batchTopics.length > 1) setBatchTopics(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateBatchTopic = (i: number, val: string) => {
    setBatchTopics(prev => { const next = [...prev]; next[i] = val; return next; });
  };

  const handleGenerate = async () => {
    if (!user || !product || credits < creditCost) return;
    setGenerating(true); setError(""); setGenerated(null);

    try {
      let body: any;
      if (mode === "single") {
        body = {
          mode: "single",
          product,
          examplePosts: convexUser?.examplePosts ?? [],
          postLength,
          platform: singlePlatform,
          topic: singleTopic,
        };
      } else {
        body = {
          mode: "batch",
          product,
          examplePosts: convexUser?.examplePosts ?? [],
          previousAngles: previousAngles ?? [],
          postLength,
          platforms: batchPlatforms,
          batchTopics,
        };
      }

      const res  = await fetch("/api/generate", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Generation failed. Please try again."); setGenerating(false); return; }

      // Save to DB & deduct credits
      if (mode === "single") {
        await saveGeneration({
          userId: user.id,
          productId: product._id as Id<"products">,
          posts: { mode: "single", result: json.data },
          windowDays: 1,
          angleSummary: `Single: ${singleTopic} (${singlePlatform})`,
        });
        setGenerated({ mode: "single", result: json.data });
      } else {
        await saveGeneration({
          userId: user.id,
          productId: product._id as Id<"products">,
          posts: { mode: "batch", batches: json.data.batches },
          windowDays: batchTopics.length,
          angleSummary: json.angleSummary ?? undefined,
        });
        setGenerated({ mode: "batch", batches: json.data.batches });
      }
      setActiveIndex(0);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setGenerating(false); }
  };

  if (isLoading) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:22, height:22, borderRadius:"50%", border:"2px solid rgba(77,142,255,0.15)", borderTopColor:T.blue, animation:"spin 0.75s linear infinite" }} />
    </div>
  );

  if (!product) { router.replace("/onboarding"); return null; }

  const canGenerate = credits >= creditCost && !generating;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Inter',sans-serif", color:T.text, overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes ddIn   { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes blob1  { 0%{transform:translate(0,0) scale(1)}25%{transform:translate(80px,60px) scale(1.05)}50%{transform:translate(40px,120px) scale(0.95)}75%{transform:translate(-60px,50px) scale(1.08)}100%{transform:translate(0,0) scale(1)} }
        .gddi { display:flex; align-items:center; gap:10px; padding:9px 15px; width:100%; background:none; border:none; cursor:pointer; font-family:'Inter',sans-serif; font-size:13px; font-weight:400; color:${T.muted}; text-align:left; transition:background 0.1s,color 0.1s; }
        .gddi:hover { background:rgba(255,255,255,0.04); color:${T.text}; }
        .gddi svg { opacity:0.45; flex-shrink:0; transition:opacity 0.1s; }
        .gddi:hover svg { opacity:0.8; }
        .gddi-red:hover { background:rgba(192,57,43,0.08) !important; color:#D87070 !important; }
        .noise-bg { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.028; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size:256px 256px; }
        .platform-cards { display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start; }
        @media (max-width:640px) { .gen-main { padding: 40px 20px 80px !important; } }
      `}</style>

      <div className="noise-bg" />
      <div style={{ position:"fixed", top:-200, left:"30%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(77,142,255,0.08) 0%, transparent 70%)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob1 22s ease-in-out infinite" }} />

      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:100, borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(10,13,18,0.88)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", padding:"0 56px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/dashboard" style={{ fontFamily:"'Manrope',sans-serif", fontSize:20, fontWeight:600, color:T.text, textDecoration:"none", letterSpacing:-0.5 }}>
          Pervasive<span style={{ color:T.blue }}>ly</span>
        </a>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:T.blueDim, border:`1px solid ${T.blueBorder}`, borderRadius:100, padding:"5px 14px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: credits > 0 ? T.blue : T.muted2, boxShadow: credits > 0 ? "0 0 6px rgba(77,142,255,0.7)" : "none" }} />
            <span style={{ fontSize:12, fontWeight:500, color: credits > 0 ? "#A8C4FF" : T.muted2, fontFamily:"'Inter',sans-serif" }}>
              {credits} {credits === 1 ? "credit" : "credits"}
            </span>
          </div>
          <div ref={avatarRef} style={{ position:"relative" }}>
            <button onClick={() => setAvatarOpen(o => !o)} style={{ width:32, height:32, borderRadius:"50%", background:T.blueDim, border: avatarOpen ? "1.5px solid rgba(77,142,255,0.7)" : "1.5px solid rgba(77,142,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"#A8C4FF", fontFamily:"'Manrope',sans-serif", cursor:"pointer", outline:"none", transition:"border-color 0.15s" }}>{initials}</button>
            {avatarOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:236, background:"rgba(10,13,18,0.97)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:16, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", animation:"ddIn 0.15s cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ padding:"14px 15px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:-0.2, marginBottom:3, fontFamily:"'Manrope',sans-serif" }}>{fullName}</div>
                  <div style={{ fontSize:11, color:T.muted2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif" }}>{userEmail}</div>
                </div>
                <div style={{ padding:"6px 0" }}>
                  {NAV_ITEMS.map(({ label, path, icon }) => (
                    <button key={label} className="gddi" onClick={() => { router.push(path); setAvatarOpen(false); }}>{icon}{label}</button>
                  ))}
                </div>
                <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"2px 0" }} />
                <div style={{ padding:"5px 0 7px" }}>
                  <button className="gddi gddi-red" onClick={() => signOut(() => router.replace("/sign-in"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="gen-main" style={{ maxWidth:900, margin:"0 auto", padding:"56px 56px 100px", position:"relative", zIndex:1, animation:"fadeUp 0.5s ease-out both" }}>

        {/* Page header */}
        <div style={{ marginBottom:36 }}>
          <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:T.blue, marginBottom:10 }}>Content generation</div>
          <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(26px,4vw,40px)", fontWeight:600, letterSpacing:-1.2, color:T.text, lineHeight:1.05, marginBottom:8 }}>
            {generated ? "Your posts" : "Generate content"}
          </h1>
          <p style={{ fontSize:14, color:T.muted, fontWeight:300 }}>
            {generated
              ? generated.mode === "single"
                ? `1 post · ${PLATFORM_LABELS[generated.result.platform]} · ${generated.result.topic}`
                : `${generated.batches.length} batch${generated.batches.length > 1 ? "es" : ""} · ${batchPlatforms.length} platform${batchPlatforms.length !== 1 ? "s" : ""} · ${generated.batches.length * batchPlatforms.length} posts`
              : "Single post or full batch — you choose."}
          </p>
        </div>

        {/* Config card (shown when not yet generated) */}
        {!generated && (
          <div style={{ borderRadius:20, padding:32, background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px) saturate(1.6)", WebkitBackdropFilter:"blur(20px) saturate(1.6)", border:`1px solid ${T.border}`, boxShadow:"0 4px 32px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.06) inset", display:"flex", flexDirection:"column", gap:28 }}>

            {/* Mode toggle */}
            <div>
              <SectionLabel>Mode</SectionLabel>
              <SegmentedControl
                value={mode}
                onChange={v => { setMode(v as any); setGenerated(null); setError(""); }}
                options={[{ value:"single", label:"Single post" }, { value:"batch", label:"Batch" }]}
              />
              {/* <p style={{ fontSize:11, color:T.muted2, marginTop:8, fontFamily:"'Inter',sans-serif" }}>
                {mode === "single" ? "Generate 1 post for 1 platform — costs 1 credit." : `Generate ${batchTopics.length} batch${batchTopics.length > 1 ? "es" : ""} × ${batchPlatforms.length} platform${batchPlatforms.length !== 1 ? "s" : ""} = ${batchTopics.length * batchPlatforms.length} posts — costs ${batchTopics.length} credit${batchTopics.length > 1 ? "s" : ""}.`}
              </p> */}
            </div>

            <div style={{ height:1, background:T.border }} />

            {/* ── SINGLE CONFIG ── */}
            {mode === "single" && (
              <>
                {/* Platform */}
                <div>
                  <SectionLabel>Platform</SectionLabel>
                  <div style={{ display:"flex", gap:8 }}>
                    {["twitter","instagram","linkedin"].filter(p => product.platforms.includes(p)).map(p => {
                      const sel = singlePlatform === p;
                      return (
                        <button key={p} onClick={() => setSinglePlatform(p)} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, fontSize:12, fontWeight:600, fontFamily:"'Manrope',sans-serif", cursor:"pointer", border:`1px solid ${sel ? T.blueBorder : T.border}`, background: sel ? T.blueDim : "rgba(255,255,255,0.02)", color: sel ? T.blue : T.muted, transition:"all 0.14s" }}>
                          {PLATFORM_ICONS[p]}{PLATFORM_LABELS[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Length */}
                <div>
                  <SectionLabel>Post length</SectionLabel>
                  <SegmentedControl
                    value={postLength}
                    onChange={v => setPostLength(v as any)}
                    options={[{ value:"short", label:"Short" }, { value:"medium", label:"Medium" }, { value:"long", label:"Long" }]}
                  />
                  <p style={{ fontSize:11, color:T.muted2, marginTop:6, fontFamily:"'Inter',sans-serif" }}>
                    {postLength === "short" && "Punchy and minimal — Ryanair energy"}
                    {postLength === "medium" && "Balanced — the default sweet spot"}
                    {postLength === "long" && "More context, more depth"}
                  </p>
                </div>

                {/* Topic */}
                <div>
                  <SectionLabel>Topic</SectionLabel>
                  <TopicSelector value={singleTopic} onChange={setSingleTopic} />
                </div>
              </>
            )}

            {/* ── BATCH CONFIG ── */}
            {mode === "batch" && (
              <>
                {/* Platforms */}
                <div>
                  <SectionLabel>Platforms</SectionLabel>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {["twitter","instagram","linkedin"].filter(p => product.platforms.includes(p)).map(p => {
                      const sel = batchPlatforms.includes(p);
                      return (
                        <button key={p} onClick={() => toggleBatchPlatform(p)} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, fontSize:12, fontWeight:600, fontFamily:"'Manrope',sans-serif", cursor:"pointer", border:`1px solid ${sel ? T.blueBorder : T.border}`, background: sel ? T.blueDim : "rgba(255,255,255,0.02)", color: sel ? T.blue : T.muted, transition:"all 0.14s" }}>
                          {PLATFORM_ICONS[p]}{PLATFORM_LABELS[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Length */}
                <div>
                  <SectionLabel>Post length</SectionLabel>
                  <SegmentedControl
                    value={postLength}
                    onChange={v => setPostLength(v as any)}
                    options={[{ value:"short", label:"Short" }, { value:"medium", label:"Medium" }, { value:"long", label:"Long" }]}
                  />
                  <p style={{ fontSize:11, color:T.muted2, marginTop:6, fontFamily:"'Inter',sans-serif" }}>
                    {postLength === "short" && "Punchy and minimal"}
                    {postLength === "medium" && "Balanced — the default sweet spot"}
                    {postLength === "long" && "More context, more depth"}
                  </p>
                </div>

                {/* Batches */}
                <div>
                  <SectionLabel>Batches — pick a topic per batch</SectionLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {batchTopics.map((topic, i) => (
                      <div key={i} style={{ borderRadius:14, border:`1px solid ${T.border}`, background:"rgba(255,255,255,0.02)", overflow:"hidden" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderBottom:`1px solid ${T.border}` }}>
                          <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.10em", textTransform:"uppercase" as const, color:T.muted2, fontFamily:"'Manrope',sans-serif" }}>Batch {i + 1}</span>
                          {batchTopics.length > 1 && (
                            <button onClick={() => removeBatch(i)} style={{ background:"none", border:"none", cursor:"pointer", color:T.muted2, display:"flex", alignItems:"center", transition:"color 0.14s" }} onMouseEnter={e => (e.currentTarget.style.color = "#E07070")} onMouseLeave={e => (e.currentTarget.style.color = T.muted2)}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <div style={{ padding:12 }}>
                          <TopicSelector value={topic} onChange={v => updateBatchTopic(i, v)} />
                        </div>
                      </div>
                    ))}

                    {batchTopics.length < 4 && (
                      <button
                        onClick={addBatch}
                        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, width:"100%", padding:"11px", background:"none", border:`1px dashed ${T.blueBorder}`, borderRadius:12, fontSize:12, fontWeight:500, color:"rgba(77,142,255,0.5)", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.14s, border-color 0.14s" }}
                        onMouseEnter={e => { (e.currentTarget.style.color = T.blue); (e.currentTarget.style.borderColor = T.blue); }}
                        onMouseLeave={e => { (e.currentTarget.style.color = "rgba(77,142,255,0.5)"); (e.currentTarget.style.borderColor = T.blueBorder); }}
                      >
                        <Plus size={13} /> Add batch
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            <div style={{ height:1, background:T.border }} />

            {/* Generate button */}
            {error && (
              <div style={{ borderRadius:10, padding:"10px 14px", background:"rgba(224,90,90,0.07)", border:"1px solid rgba(224,90,90,0.18)" }}>
                <p style={{ fontSize:13, color:"#E07070", fontFamily:"'Inter',sans-serif" }}>{error}</p>
              </div>
            )}

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <p style={{ fontSize:12, color: credits < creditCost ? "#E07070" : T.muted2, fontFamily:"'Inter',sans-serif" }}>
                {credits < creditCost
                  ? `Not enough credits — you need ${creditCost}, you have ${credits}.`
                  : `${creditCost} credit${creditCost > 1 ? "s" : ""} will be used`}
              </p>
              <button
                onClick={credits < creditCost ? () => router.push("/billing") : handleGenerate}
                disabled={generating}
                style={{
                  display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px",
                  background: credits < creditCost ? "rgba(255,255,255,0.04)" : "linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)",
                  border: credits < creditCost ? `1px solid ${T.border}` : "1px solid rgba(160,200,255,0.50)",
                  borderRadius:10, color: credits < creditCost ? T.muted : "#ffffff",
                  fontSize:13, fontWeight:600, cursor: generating ? "wait" : credits < creditCost ? "pointer" : "pointer",
                  backdropFilter:"blur(24px) saturate(2)",
                  WebkitBackdropFilter:"blur(24px) saturate(2)",
                  boxShadow: credits < creditCost ? "none" : "0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 4px 20px rgba(77,142,255,0.20)",
                  transition:"transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s ease",
                  opacity: generating ? 0.7 : 1, fontFamily:"'Manrope',sans-serif",
                }}
                onMouseEnter={e => { if (canGenerate && credits >= creditCost) { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(160deg, rgba(140,185,255,0.55) 0%, rgba(70,125,250,0.70) 50%, rgba(45,100,220,0.80) 100%)"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; if (credits >= creditCost) (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)"; }}
              >
                {generating ? (
                  <><div style={{ width:13, height:13, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }} />Generating…</>
                ) : credits < creditCost ? (
                  <>Add credits <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>
                ) : (
                  <>Generate <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {generated && (
          <>
            {/* Top bar */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:T.blue, boxShadow:"0 0 8px rgba(77,142,255,0.7)" }} />
                <span style={{ fontSize:12, fontWeight:500, color:T.muted, fontFamily:"'Inter',sans-serif" }}>
                  {generated.mode === "single" ? "1 post ready" : `${generated.batches.length * batchPlatforms.length} posts ready`}
                </span>
              </div>
              <button
                onClick={() => { setGenerated(null); setError(""); }}
                style={{ fontSize:12, fontWeight:600, color:T.blue, background:T.blueDim, border:`1px solid ${T.blueBorder}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily:"'Manrope',sans-serif", transition:"background 0.14s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(77,142,255,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.background = T.blueDim)}
              >
                New generation
              </button>
            </div>

            {/* SINGLE result */}
            {generated.mode === "single" && (
              <div style={{ borderRadius:20, padding:28, background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, backdropFilter:"blur(20px)" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:20 }}>
                  <span style={{ fontSize:15, fontWeight:600, color:T.text, fontFamily:"'Manrope',sans-serif" }}>{generated.result.topic}</span>
                  <span style={{ fontSize:11, color:T.muted2, fontFamily:"'Inter',sans-serif" }}>{PLATFORM_LABELS[generated.result.platform]}</span>
                </div>
                <PlatformCard platform={generated.result.platform} content={generated.result.post} />
              </div>
            )}

            {/* BATCH result */}
            {generated.mode === "batch" && (
              <>
                {/* Batch tab strip */}
                <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", scrollbarWidth:"none" as any, paddingBottom:4 }}>
                  {generated.batches.map((batch, i) => {
                    const active = i === activeIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        style={{
                          display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                          borderRadius:12, flexShrink:0, padding:"10px 18px",
                          background: active ? T.blueDim : "rgba(255,255,255,0.03)",
                          border: active ? `1px solid ${T.blueBorder}` : `1px solid ${T.border}`,
                          cursor:"pointer", outline:"none", transition:"all 0.14s",
                        }}
                      >
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.10em", color: active ? T.blue : T.muted2, fontFamily:"'Manrope',sans-serif" }}>BATCH {i + 1}</span>
                        <span style={{ fontSize:11, fontWeight:500, whiteSpace:"nowrap", color: active ? T.muted : T.muted2, fontFamily:"'Inter',sans-serif" }}>{batch.topic.split(" / ")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active batch content */}
                {generated.batches[activeIndex] && (
                  <>
                    <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:16 }}>
                      <span style={{ fontSize:16, fontWeight:600, color:T.text, fontFamily:"'Manrope',sans-serif" }}>Batch {activeIndex + 1}</span>
                      <span style={{ fontSize:12, color:T.muted2, fontFamily:"'Inter',sans-serif" }}>{generated.batches[activeIndex].topic}</span>
                    </div>
                    <div className="platform-cards">
                      {batchPlatforms.map(platform => {
                        const content = generated.batches[activeIndex].posts[platform as keyof Post];
                        if (!content) return null;
                        return <PlatformCard key={platform} platform={platform} content={content} />;
                      })}
                    </div>

                    {/* Prev / Next */}
                    {generated.batches.length > 1 && (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:24 }}>
                        <button
                          onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
                          disabled={activeIndex === 0}
                          style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: activeIndex === 0 ? "rgba(74,88,112,0.4)" : T.muted2, background:"none", border:"none", cursor: activeIndex === 0 ? "default" : "pointer", transition:"color 0.15s", fontFamily:"'Inter',sans-serif" }}
                        >
                          <ChevronLeft size={13} /> Previous batch
                        </button>
                        <span style={{ fontSize:12, fontWeight:500, color:T.muted2, fontFamily:"'Manrope',sans-serif" }}>{activeIndex + 1} / {generated.batches.length}</span>
                        <button
                          onClick={() => setActiveIndex(i => Math.min(generated.batches.length - 1, i + 1))}
                          disabled={activeIndex === generated.batches.length - 1}
                          style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: activeIndex === generated.batches.length - 1 ? "rgba(74,88,112,0.4)" : T.muted2, background:"none", border:"none", cursor: activeIndex === generated.batches.length - 1 ? "default" : "pointer", transition:"color 0.15s", fontFamily:"'Inter',sans-serif" }}
                        >
                          Next batch <ChevronRight size={13} />
                        </button>
                      </div>
                    )}
                  </>
                )}
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
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#0A0D12" }} />}>
      <GenerateInner />
    </Suspense>
  );
}