"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";

/* ─── Types ─── */
type Post = { twitter?: string; instagram?: string; linkedin?: string };

// Legacy batch (7-day) shape
type Day  = { day: number; type: string; posts: Post };

// New shapes
type SingleResult = { platform: string; topic: string; post: string };
type BatchResult  = { batchIndex: number; topic: string; posts: Post };

type GenerationPosts =
  | { mode: "single"; result: SingleResult }
  | { mode: "batch";  batches: BatchResult[] }
  | { days: Day[] }; // legacy

type Generation = {
  _id: string;
  createdAt: number;
  windowDays: number;
  creditsUsed: number;
  posts: GenerationPosts;
};

/* ─── Helpers ─── */
function isLegacy(posts: GenerationPosts): posts is { days: Day[] } {
  return "days" in posts;
}
function isSingle(posts: GenerationPosts): posts is { mode: "single"; result: SingleResult } {
  return (posts as any).mode === "single";
}
function isBatch(posts: GenerationPosts): posts is { mode: "batch"; batches: BatchResult[] } {
  return (posts as any).mode === "batch";
}

function getPostCount(gen: Generation, platforms: string[]): number {
  const p = gen.posts;
  if (isLegacy(p)) return (p.days?.length ?? 0) * platforms.length;
  if (isSingle(p)) return 1;
  if (isBatch(p))  return (p.batches?.length ?? 0) * platforms.length;
  return 0;
}

function getLabel(gen: Generation): string {
  const p = gen.posts;
  if (isLegacy(p)) return `${p.days?.length ?? 0}-day batch`;
  if (isSingle(p)) return `Single · ${p.result.topic}`;
  if (isBatch(p))  return `${p.batches?.length ?? 0} batch${(p.batches?.length ?? 0) !== 1 ? "es" : ""}`;
  return "Generation";
}

function getPlatforms(gen: Generation, productPlatforms: string[]): string[] {
  const p = gen.posts;
  if (isSingle(p)) return [p.result.platform];
  return productPlatforms;
}

/* ─── Constants ─── */
const PLATFORM_LABELS: Record<string,string> = { twitter:"Twitter / X", instagram:"Instagram", linkedin:"LinkedIn" };
const PLATFORM_ICONS: Record<string,React.ReactNode> = {
  twitter:  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></svg>,
  linkedin: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
};

const DAY_TYPE_SHORT: Record<string,string> = {
  "Value Post":"Value","Product Post":"Product","Product / feature post":"Feature",
  "Story Post":"Story","Story / founder post":"Founder","Hot Take Post":"Opinion",
  "Hot take / opinion post":"Opinion","Behind the Scenes Post":"BTS","Behind the scenes post":"BTS",
  "Social Proof Post":"Social","Social proof / milestone post":"Milestone","CTA Post":"CTA","CTA / engagement post":"CTA",
};
const shortType = (t: string) => DAY_TYPE_SHORT[t] ?? t.split(/[\s/]/)[0];

function splitIG(content: string) {
  const m = content.match(/^([\s\S]*?)(\[([^\]]+)\])\s*$/);
  return m ? { body: m[1].trimEnd(), visual: m[3].trim() } : { body: content, visual: null };
}

/* ─── Copy button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={handle} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, fontWeight:500, color: copied ? "#4D8EFF" : "rgba(255,255,255,0.22)", background:"none", border:"none", cursor:"pointer", transition:"color 0.15s", fontFamily:"'Inter',sans-serif" }}>
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
    </button>
  );
}

/* ─── Platform card ─── */
function PlatformCard({ platform, content }: { platform: string; content: string }) {
  const isIG  = platform === "instagram";
  const isTW  = platform === "twitter";
  const { body, visual } = isIG ? splitIG(content) : { body: content, visual: null };
  const over  = isTW && content.length > 280;
  return (
    <div style={{ flex:1, minWidth:200, background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px) saturate(1.6)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, padding:"16px 18px", display:"flex", flexDirection:"column", gap:12, boxShadow:"0 4px 20px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, color:"rgba(255,255,255,0.55)" }}>
          <div style={{ width:26, height:26, borderRadius:7, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", display:"flex", alignItems:"center", justifyContent:"center" }}>{PLATFORM_ICONS[platform]}</div>
          <span style={{ fontSize:11.5, fontWeight:500, fontFamily:"'Manrope',sans-serif" }}>{PLATFORM_LABELS[platform] ?? platform}</span>
        </div>
        <CopyButton text={content} />
      </div>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.7, whiteSpace:"pre-wrap", flex:1, fontFamily:"'Inter',sans-serif", fontWeight:300 }}>{body}</p>
      {isIG && visual && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:1, flexShrink:0 }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.30)", fontStyle:"italic", lineHeight:1.5, fontFamily:"'Inter',sans-serif" }}>{visual}</span>
        </div>
      )}
      {isTW && (
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <span style={{ fontSize:11, fontWeight:500, color: over ? "#E05A5A" : "rgba(255,255,255,0.18)", fontFamily:"'Inter',sans-serif" }}>{content.length} / 280</span>
        </div>
      )}
    </div>
  );
}

/* ─── Generation viewer modal ─── */
function GenerationViewer({ generation, productPlatforms, onClose }: {
  generation: Generation;
  productPlatforms: string[];
  onClose: () => void;
}) {
  const p    = generation.posts;
  const date = new Date(generation.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

  // ── SINGLE viewer ──
  if (isSingle(p)) {
    return (
      <ViewerShell date={date} subtitle={`Single post · ${PLATFORM_LABELS[p.result.platform] ?? p.result.platform}`} onClose={onClose}>
        <div style={{ marginBottom:16 }}>
          <span style={{ fontSize:14, fontWeight:600, color:"#F0F4FF", fontFamily:"'Manrope',sans-serif" }}>{p.result.topic}</span>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <PlatformCard platform={p.result.platform} content={p.result.post} />
        </div>
      </ViewerShell>
    );
  }

  // ── BATCH viewer ──
  if (isBatch(p)) {
    return <BatchViewer date={date} batches={p.batches} productPlatforms={productPlatforms} onClose={onClose} />;
  }

  // ── LEGACY (days) viewer ──
  return <LegacyViewer date={date} days={p.days ?? []} productPlatforms={productPlatforms} onClose={onClose} />;
}

/* ─── Viewer shell (shared modal wrapper) ─── */
function ViewerShell({ date, subtitle, onClose, children }: { date: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(5,8,12,0.92)", backdropFilter:"blur(20px)", overflowY:"auto" }}>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px 80px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"rgba(77,142,255,0.7)", marginBottom:6, fontFamily:"'Manrope',sans-serif" }}>Generation</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#F0F4FF", letterSpacing:-0.5, marginBottom:3, fontFamily:"'Manrope',sans-serif" }}>{date}</h2>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)", fontFamily:"'Inter',sans-serif" }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"8px 16px", cursor:"pointer", fontFamily:"'Manrope',sans-serif", transition:"color 0.14s, background 0.14s" }} onMouseEnter={e => { e.currentTarget.style.color="#F0F4FF"; e.currentTarget.style.background="rgba(255,255,255,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.35)"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Batch viewer ─── */
function BatchViewer({ date, batches, productPlatforms, onClose }: { date: string; batches: BatchResult[]; productPlatforms: string[]; onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = batches[activeIndex];
  const subtitle = `${batches.length} batch${batches.length !== 1 ? "es" : ""} · ${productPlatforms.length} platform${productPlatforms.length !== 1 ? "s" : ""} · ${batches.length * productPlatforms.length} posts`;

  return (
    <ViewerShell date={date} subtitle={subtitle} onClose={onClose}>
      {/* Batch strip */}
      <div style={{ display:"flex", gap:6, marginBottom:24, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
        {batches.map((batch, i) => {
          const active = i === activeIndex;
          return (
            <button key={i} onClick={() => setActiveIndex(i)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 16px", borderRadius:12, flexShrink:0, background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.08)", cursor:"pointer", outline:"none", transition:"all 0.15s", backdropFilter:"blur(12px)" }}>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.09em", color: active ? "#F0F4FF" : "rgba(255,255,255,0.25)", fontFamily:"'Manrope',sans-serif" }}>BATCH {i + 1}</span>
              <span style={{ fontSize:11, fontWeight:500, color: active ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.22)", whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif" }}>{shortType(batch.topic)}</span>
            </button>
          );
        })}
      </div>

      {current && (
        <>
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:14 }}>
            <span style={{ fontSize:14, fontWeight:600, color:"#F0F4FF", fontFamily:"'Manrope',sans-serif" }}>Batch {activeIndex + 1}</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.28)", fontFamily:"'Inter',sans-serif" }}>{current.topic}</span>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-start" }}>
            {productPlatforms.map(platform => {
              const content = current.posts[platform as keyof Post];
              if (!content) return null;
              return <PlatformCard key={platform} platform={platform} content={content} />;
            })}
          </div>
          {batches.length > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:20 }}>
              <button onClick={() => setActiveIndex(i => Math.max(0, i - 1))} disabled={activeIndex === 0} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: activeIndex === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)", background:"none", border:"none", cursor: activeIndex === 0 ? "default" : "pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.13s" }} onMouseEnter={e => { if (activeIndex !== 0) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }} onMouseLeave={e => { if (activeIndex !== 0) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
                <ChevronLeft size={13}/> Previous batch
              </button>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.20)", fontFamily:"'Inter',sans-serif" }}>{activeIndex + 1} / {batches.length}</span>
              <button onClick={() => setActiveIndex(i => Math.min(batches.length - 1, i + 1))} disabled={activeIndex === batches.length - 1} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: activeIndex === batches.length - 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)", background:"none", border:"none", cursor: activeIndex === batches.length - 1 ? "default" : "pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.13s" }} onMouseEnter={e => { if (activeIndex !== batches.length - 1) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }} onMouseLeave={e => { if (activeIndex !== batches.length - 1) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
                Next batch <ChevronRight size={13}/>
              </button>
            </div>
          )}
        </>
      )}
    </ViewerShell>
  );
}

/* ─── Legacy (7-day) viewer ─── */
function LegacyViewer({ date, days, productPlatforms, onClose }: { date: string; days: Day[]; productPlatforms: string[]; onClose: () => void }) {
  const [activeDay, setActiveDay] = useState(1);
  const currentDay = days.find(d => d.day === activeDay);
  const totalDays  = days.length;
  const subtitle   = `${totalDays} days · ${productPlatforms.length} platform${productPlatforms.length !== 1 ? "s" : ""} · ${totalDays * productPlatforms.length} posts`;

  return (
    <ViewerShell date={date} subtitle={subtitle} onClose={onClose}>
      <div style={{ display:"flex", gap:6, marginBottom:24, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
        {days.map(day => {
          const active = day.day === activeDay;
          return (
            <button key={day.day} onClick={() => setActiveDay(day.day)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 16px", borderRadius:12, flexShrink:0, background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.08)", cursor:"pointer", outline:"none", transition:"all 0.15s", backdropFilter:"blur(12px)" }}>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.09em", color: active ? "#F0F4FF" : "rgba(255,255,255,0.25)", fontFamily:"'Manrope',sans-serif" }}>DAY {day.day}</span>
              <span style={{ fontSize:11, fontWeight:500, color: active ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.22)", whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif" }}>{shortType(day.type)}</span>
            </button>
          );
        })}
      </div>
      {currentDay && (
        <>
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:14 }}>
            <span style={{ fontSize:14, fontWeight:600, color:"#F0F4FF", fontFamily:"'Manrope',sans-serif" }}>Day {currentDay.day}</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.28)", fontFamily:"'Inter',sans-serif" }}>{currentDay.type}</span>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-start" }}>
            {productPlatforms.map(platform => {
              const content = currentDay.posts[platform as keyof Post];
              if (!content) return null;
              return <PlatformCard key={platform} platform={platform} content={content} />;
            })}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:20 }}>
            <button onClick={() => setActiveDay(d => Math.max(1,d-1))} disabled={activeDay===1} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: activeDay===1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)", background:"none", border:"none", cursor: activeDay===1 ? "default":"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.13s" }} onMouseEnter={e => { if(activeDay!==1) e.currentTarget.style.color="rgba(255,255,255,0.65)"; }} onMouseLeave={e => { if(activeDay!==1) e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}>
              <ChevronLeft size={13}/> Previous day
            </button>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.20)", fontFamily:"'Inter',sans-serif" }}>{activeDay} / {totalDays}</span>
            <button onClick={() => setActiveDay(d => Math.min(totalDays,d+1))} disabled={activeDay===totalDays} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: activeDay===totalDays ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)", background:"none", border:"none", cursor: activeDay===totalDays ? "default":"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.13s" }} onMouseEnter={e => { if(activeDay!==totalDays) e.currentTarget.style.color="rgba(255,255,255,0.65)"; }} onMouseLeave={e => { if(activeDay!==totalDays) e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}>
              Next day <ChevronRight size={13}/>
            </button>
          </div>
        </>
      )}
    </ViewerShell>
  );
}

/* ─── Nav ─── */
function AppNav({ credits, user, signOut }: { credits:number; user:any; signOut:(cb:()=>void)=>void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email    = user?.emailAddresses?.[0]?.emailAddress ?? "";
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, height:54, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background:"rgba(10,13,18,0.80)", backdropFilter:"blur(24px) saturate(1.8)", borderBottom:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 1px 0 rgba(255,255,255,0.04) inset" }}>
      <a href="/dashboard" style={{ fontFamily:"'Manrope',sans-serif", fontSize:19, fontWeight:700, color:"#F0F4FF", textDecoration:"none", letterSpacing:-0.5 }}>Pervasive<span style={{ color:"#4D8EFF" }}>ly</span></a>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:100, padding:"5px 13px" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background: credits > 0 ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize:12, fontWeight:500, color: credits > 0 ? "#F0F4FF" : "rgba(255,255,255,0.28)", fontFamily:"'Inter',sans-serif" }}>{credits} {credits===1?"credit":"credits"}</span>
        </div>
        <div ref={ref} style={{ position:"relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{ width:30, height:30, borderRadius:"50%", background:"rgba(77,142,255,0.12)", border: open ? "1.5px solid rgba(77,142,255,0.7)" : "1.5px solid rgba(77,142,255,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color:"#F0F4FF", cursor:"pointer", transition:"all 0.15s", outline:"none", fontFamily:"'Manrope',sans-serif" }}>{initials}</button>
          {open && (
            <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:232, background:"rgba(10,13,18,0.97)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, overflow:"hidden", backdropFilter:"blur(28px)", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", animation:"ddIn 0.14s cubic-bezier(0.16,1,0.3,1)" }}>
              <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-5px) scale(0.97)}to{opacity:1;transform:none}} .hndd{display:flex;align-items:center;gap:9px;padding:9px 14px;width:100%;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;font-weight:450;color:rgba(255,255,255,0.45);text-align:left;transition:background 0.1s,color 0.1s;} .hndd:hover{background:rgba(255,255,255,0.05);color:#F0F4FF;} .hndd svg{opacity:0.45;flex-shrink:0;} .hndd:hover svg{opacity:0.85;} .hndd-r:hover{background:rgba(200,65,65,0.09)!important;color:#D87070!important;}`}</style>
              <div style={{ padding:"13px 14px 11px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#F0F4FF", marginBottom:2, fontFamily:"'Manrope',sans-serif" }}>{fullName}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif" }}>{email}</div>
              </div>
              <div style={{ padding:"5px 0" }}>
                {([
                  {label:"Dashboard",path:"/dashboard",icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>},
                  {label:"Settings",path:"/settings",icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>},
                  {label:"Billing",path:"/billing",icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>},
                  {label:"History",path:"/history",icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
                  {label:"Feedback",path:"/feedback",icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
                ] as {label:string;path:string;icon:React.ReactNode}[]).map(({label,path,icon}) => (
                  <button key={label} className="hndd" onClick={() => { router.push(path); setOpen(false); }}>{icon}{label}</button>
                ))}
              </div>
              <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"2px 0" }} />
              <div style={{ padding:"5px 0 7px" }}>
                <button className="hndd hndd-r" onClick={() => signOut(() => router.replace("/sign-in"))}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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

/* ─── Mode badge ─── */
function ModeBadge({ gen }: { gen: Generation }) {
  const p = gen.posts;
  let label = "Legacy";
  let color = "rgba(255,255,255,0.22)";
  let bg    = "rgba(255,255,255,0.06)";
  let border = "rgba(255,255,255,0.10)";

  if (isSingle(p)) { label = "Single"; color = "rgba(255,255,255,0.55)"; bg = "rgba(255,255,255,0.06)"; border = "rgba(255,255,255,0.12)"; }
  else if (isBatch(p)) { label = "Batch"; color = "#A78BFA"; bg = "rgba(139,92,246,0.10)"; border = "rgba(139,92,246,0.22)"; }
  else if (isLegacy(p)) { label = "Weekly"; color = "rgba(255,255,255,0.35)"; bg = "rgba(255,255,255,0.04)"; border = "rgba(255,255,255,0.08)"; }

  return (
    <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" as const, color, background:bg, border:`1px solid ${border}`, borderRadius:100, padding:"2px 8px", fontFamily:"'Manrope',sans-serif" }}>
      {label}
    </span>
  );
}

/* ─── Main ─── */
export function HistoryClient() {
  const { user }    = useUser();
  const { signOut } = useClerk();
  const router      = useRouter();
  const convexUser  = useQuery(api.users.getUser,            user ? { clerkId: user.id } : "skip");
  const products    = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");
  const generations = useQuery(api.products.getGenerations,  user ? { userId: user.id } : "skip") as Generation[] | undefined;

  const [viewing,           setViewing]           = useState<Generation | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const credits   = convexUser?.credits ?? 0;
  const isLoading = convexUser === undefined || products === undefined || generations === undefined;

  if (isLoading) return (
    <div style={{ minHeight:"100vh", background:"#0A0D12", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:20, height:20, borderRadius:"50%", border:"1.5px solid rgba(77,142,255,0.15)", borderTopColor:"#4D8EFF", animation:"spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const activeProductId = selectedProductId ?? products?.[0]?._id ?? null;
  const product  = products?.find((p: any) => p._id === activeProductId) ?? products?.[0];
  const sorted   = [...(generations ?? [])].filter((g: any) => !activeProductId || g.productId === activeProductId).sort((a,b) => b.createdAt - a.createdAt);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0D12; }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)} 25%{transform:translate(80px,60px) scale(1.05)} 50%{transform:translate(40px,120px) scale(.95)} 75%{transform:translate(-60px,50px) scale(1.08)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 20%{transform:translate(-90px,40px) scale(1.06)} 45%{transform:translate(-50px,-80px) scale(.96)} 70%{transform:translate(70px,-40px) scale(1.04)} 100%{transform:translate(0,0) scale(1)} }
        .gen-row { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:14px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; text-align:left; width:100%; backdrop-filter:blur(16px); box-shadow:0 4px 20px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.06) inset; transition:background .15s, border-color .15s, transform .15s, box-shadow .15s; }
        .gen-row:hover { background:rgba(255,255,255,0.07); border-color:rgba(255,255,255,0.16); transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.08) inset; }
        .gen-row.first { border-color:rgba(255,255,255,0.14); }
        .gen-row.first:hover { border-color:rgba(255,255,255,0.22); }
        .tab-pill { display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:100px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.14s; font-family:'Manrope',sans-serif; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.35); }
        .tab-pill:hover { border-color:rgba(255,255,255,0.18); color:rgba(255,255,255,0.65); }
        .tab-pill.active { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.18); color:#F0F4FF; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#0A0D12", fontFamily:"'Inter',sans-serif", color:"#F0F4FF" }}>
        <div style={{ position:"fixed", width:600, height:600, top:-150, left:-150, borderRadius:"50%", background:"rgba(77,142,255,0.12)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob1 18s ease-in-out infinite", willChange:"transform" }} />
        <div style={{ position:"fixed", width:500, height:500, bottom:-100, right:-100, borderRadius:"50%", background:"rgba(139,92,246,0.09)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob2 22s ease-in-out infinite", willChange:"transform" }} />
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.025, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize:"256px 256px" }} />

        <AppNav credits={credits} user={user} signOut={signOut} />

        <main style={{ maxWidth:720, margin:"0 auto", padding:"48px 24px 80px", position:"relative", zIndex:1 }}>

          <div style={{ marginBottom:32 }}>
            {/* <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:"rgba(77,142,255,0.7)", marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>Content</div> */}
            <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:26, fontWeight:700, letterSpacing:-0.8, color:"#F0F4FF", marginBottom:4 }}>History</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.28)", fontFamily:"'Inter',sans-serif" }}>
              {sorted.length > 0 ? `${sorted.length} generation${sorted.length !== 1 ? "s" : ""} for ${product?.name ?? "this product"}` : "No generations yet."}
            </p>
          </div>

          {/* Product tabs */}
          {products && products.length > 1 && (
            <div style={{ display:"flex", gap:6, marginBottom:24, flexWrap:"wrap" }}>
              {(products as any[]).map((p: any) => {
                const isActive = p._id === activeProductId;
                const count = (generations ?? []).filter((g:any) => g.productId === p._id).length;
                return (
                  <button key={p._id} onClick={() => { setSelectedProductId(p._id); setViewing(null); }} className={`tab-pill${isActive?" active":""}`}>
                    {p.name}
                    <span style={{ fontSize:10, padding:"1px 6px", borderRadius:100, background: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)", color: isActive ? "#F0F4FF" : "rgba(255,255,255,0.25)" }}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {sorted.length === 0 && (
            <div style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"56px 32px", textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset" }}>
              <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.40)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h2 style={{ fontSize:15, fontWeight:600, color:"#F0F4FF", marginBottom:6, fontFamily:"'Manrope',sans-serif" }}>No generations yet</h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.28)", marginBottom:20, lineHeight:1.6, fontFamily:"'Inter',sans-serif" }}>Head to the generate page to create your first post.</p>
              <button onClick={() => router.push("/generate")} style={{ position:"relative", overflow:"hidden", display:"inline-flex", alignItems:"center", gap:7, fontSize:13, fontWeight:600, color:"#fff", background:"linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)", border:"1px solid rgba(160,200,255,0.50)", borderRadius:10, padding:"10px 22px", cursor:"pointer", backdropFilter:"blur(24px) saturate(2)", WebkitBackdropFilter:"blur(24px) saturate(2)", boxShadow:"0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 4px 20px rgba(77,142,255,0.20)", transition:"transform 0.15s ease-out, box-shadow 0.15s ease-out", fontFamily:"'Manrope',sans-serif", letterSpacing:"0.01em" }}>
                Generate content <MoveRight size={13} />
              </button>
            </div>
          )}

          {/* Generation list */}
          {sorted.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {sorted.map((gen, i) => {
                const platforms  = getPlatforms(gen, product?.platforms ?? []);
                const postCount  = getPostCount(gen, product?.platforms ?? []);
                const label      = getLabel(gen);
                const date       = new Date(gen.createdAt).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric", year:"numeric" });
                const time       = new Date(gen.createdAt).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit" });
                const isFirst    = i === 0;

                return (
                  <button key={gen._id} onClick={() => setViewing(gen)} className={`gen-row${isFirst?" first":""}`}>
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.75)", letterSpacing:-0.1, fontFamily:"'Manrope',sans-serif" }}>{date}</span>
                        {isFirst && <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.60)", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:100, padding:"2px 8px", fontFamily:"'Manrope',sans-serif" }}>Latest</span>}
                        <ModeBadge gen={gen} />
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.22)", fontFamily:"'Inter',sans-serif" }}>{time}</span>
                        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.10)" }}>/</span>
                        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.22)", fontFamily:"'Inter',sans-serif" }}>{label}</span>
                        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.10)" }}>/</span>
                        <span style={{ fontSize:11.5, color:"rgba(255,255,255,0.22)", fontFamily:"'Inter',sans-serif" }}>{postCount} post{postCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {platforms.slice(0,3).map((p: string) => (
                        <div key={p} style={{ width:24, height:24, borderRadius:6, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.45)" }}>{PLATFORM_ICONS[p]}</div>
                      ))}
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft:4 }}><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {viewing && (
          <GenerationViewer
            generation={viewing}
            productPlatforms={product?.platforms ?? []}
            onClose={() => setViewing(null)}
          />
        )}
      </div>
    </>
  );
}