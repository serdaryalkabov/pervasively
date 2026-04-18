"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { MoveRight } from "lucide-react";

/* ─────────────────────────────────────────────
   Shared nav
───────────────────────────────────────────── */
function AppNav({ credits, user, signOut }: { credits: number; user: any; signOut: (cb: () => void) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email    = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, height:54, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background:"rgba(10,13,18,0.80)", backdropFilter:"blur(24px) saturate(1.8)", borderBottom:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 1px 0 rgba(255,255,255,0.04) inset" }}>
      <a href="/dashboard" style={{ fontFamily:"'Manrope',sans-serif", fontSize:19, fontWeight:700, color:"#F0F4FF", textDecoration:"none", letterSpacing:-0.5 }}>Pervasive<span style={{ color:"#4D8EFF" }}>ly</span></a>

      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {/* Credits pill */}
        <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:100, padding:"5px 13px" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background: credits > 0 ? "#4D8EFF" : "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize:12, fontWeight:500, color: credits > 0 ? "#F0F4FF" : "rgba(255,255,255,0.28)", fontFamily:"'Inter',sans-serif" }}>{credits} {credits === 1 ? "credit" : "credits"}</span>
        </div>

        {/* Avatar */}
        <div ref={ref} style={{ position:"relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{ width:30, height:30, borderRadius:"50%", background:"rgba(77,142,255,0.12)", border: open ? "1.5px solid rgba(77,142,255,0.7)" : "1.5px solid rgba(77,142,255,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, color:"#F0F4FF", cursor:"pointer", transition:"all 0.15s", outline:"none", fontFamily:"'Manrope',sans-serif" }}>
            {initials}
          </button>
          {open && (
            <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:232, background:"rgba(10,13,18,0.97)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, overflow:"hidden", backdropFilter:"blur(28px)", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", animation:"ddIn 0.14s cubic-bezier(0.16,1,0.3,1)" }}>
              <style>{`@keyframes ddIn{from{opacity:0;transform:translateY(-5px) scale(0.97)}to{opacity:1;transform:none}} .ndd{display:flex;align-items:center;gap:9px;padding:9px 14px;width:100%;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;font-weight:450;color:rgba(255,255,255,0.45);text-align:left;transition:background 0.1s,color 0.1s;} .ndd:hover{background:rgba(255,255,255,0.05);color:#F0F4FF;} .ndd svg{opacity:0.45;flex-shrink:0;transition:opacity 0.1s;} .ndd:hover svg{opacity:0.85;} .ndd-r:hover{background:rgba(200,65,65,0.09)!important;color:#D87070!important;}`}</style>
              <div style={{ padding:"13px 14px 11px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#F0F4FF", marginBottom:2, fontFamily:"'Manrope',sans-serif" }}>{fullName}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.22)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif" }}>{email}</div>
              </div>
              <div style={{ padding:"5px 0" }}>
                {([
                  { label:"Dashboard",       path:"/dashboard", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                  { label:"Billing",         path:"/billing",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                  { label:"History",         path:"/history",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                  { label:"Settings",        path:"/settings",  icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { label:"Feedback",        path:"/feedback",  icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                ] as {label:string;path:string;icon:React.ReactNode}[]).map(({label,path,icon}) => (
                  <button key={label} className="ndd" onClick={() => { window.location.href = path; setOpen(false); }}>{icon}{label}</button>
                ))}
              </div>
              <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"2px 0" }} />
              <div style={{ padding:"5px 0 7px" }}>
                <button className="ndd ndd-r" onClick={() => signOut(() => window.location.href = "/sign-in")}>
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

/* ─────────────────────────────────────────────
   Glass section wrapper
───────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:28 }}>
      <h2 style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.28)", marginBottom:10, fontFamily:"'Manrope',sans-serif" }}>{title}</h2>
      <div style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px) saturate(1.6)", WebkitBackdropFilter:"blur(20px) saturate(1.6)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:16, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset" }}>
        {children}
      </div>
    </div>
  );
}

/* Row */
function EditableRow({ label, value, onSave, editable = true, last = false }: { label:string; value:string; onSave?: (v:string) => Promise<void>; editable?: boolean; last?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput]     = useState(value);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    if (!onSave || input.trim() === value) { setEditing(false); return; }
    setSaving(true); setError("");
    try { await onSave(input.trim()); setEditing(false); }
    catch (e: any) { setError(e?.errors?.[0]?.longMessage ?? e?.message ?? "Failed to save."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding:"13px 20px", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.30)", fontWeight:500, fontFamily:"'Inter',sans-serif", flexShrink:0 }}>{label}</span>
        {editing ? (
          <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"flex-end" }}>
            <input autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key==="Enter") handleSave(); if (e.key==="Escape") { setInput(value); setEditing(false); setError(""); } }} style={{ padding:"6px 11px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(77,142,255,0.35)", borderRadius:8, color:"#F0F4FF", fontSize:13, outline:"none", width:200, fontFamily:"'Inter',sans-serif", boxShadow:"0 0 0 3px rgba(77,142,255,0.08)" }} />
            <button onClick={handleSave} disabled={saving} style={{ position:"relative", overflow:"hidden", fontSize:12, fontWeight:600, color:"#fff", background:"linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)", border:"1px solid rgba(160,200,255,0.50)", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontFamily:"'Manrope',sans-serif", backdropFilter:"blur(24px) saturate(2)", boxShadow:"0 1px 0 rgba(255,255,255,0.35) inset, 0 4px 16px rgba(77,142,255,0.18)", transition:"transform 0.15s ease-out", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving…" : "Save"}</button>
            <button onClick={() => { setInput(value); setEditing(false); setError(""); }} style={{ fontSize:12, color:"rgba(255,255,255,0.28)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif" }}>Cancel</button>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.60)", fontFamily:"'Inter',sans-serif" }}>{value}</span>
            {editable && onSave && (
              <button onClick={() => { setInput(value); setEditing(true); }} style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,0.22)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.13s" }} onMouseEnter={e => (e.currentTarget.style.color = "#4D8EFF")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}>Edit</button>
            )}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize:11, color:"#E05A5A", marginTop:6, textAlign:"right", fontFamily:"'Inter',sans-serif" }}>{error}</p>}
    </div>
  );
}

const PLATFORM_ICONS: Record<string,React.ReactNode> = {
  twitter:  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></svg>,
  linkedin: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
};
const PLATFORM_LABELS: Record<string,string> = { twitter:"Twitter / X", instagram:"Instagram", linkedin:"LinkedIn" };

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export function SettingsClient() {
  const { user }   = useUser();
  const { signOut } = useClerk();
  const router     = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const convexUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const products   = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");
  const product    = products?.[0];
  const credits    = convexUser?.credits ?? 0;
  const updateExamplePosts = useMutation(api.users.updateExamplePosts);

  const [examplePosts,   setExamplePosts]   = useState<string[]>([""]);
  const [examplesSaving, setExamplesSaving] = useState(false);
  const [examplesSaved,  setExamplesSaved]  = useState(false);
  const [examplesError,  setExamplesError]  = useState("");

  const isLoading = convexUser === undefined || products === undefined;

  useEffect(() => {
    if (convexUser?.examplePosts !== undefined) {
      const posts = convexUser.examplePosts as string[];
      setExamplePosts(posts.length > 0 ? posts : [""]);
    }
  }, [convexUser?.examplePosts]);

  if (isLoading) return (
    <div style={{ minHeight:"100vh", background:"#0A0D12", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:20, height:20, borderRadius:"50%", border:"1.5px solid rgba(77,142,255,0.15)", borderTopColor:"#4D8EFF", animation:"spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";
  const email    = user?.emailAddresses?.[0]?.emailAddress ?? "—";
  const joinedAt = convexUser?.createdAt ? new Date(convexUser.createdAt).toLocaleDateString("en-US", { month:"long", year:"numeric" }) : "—";

  const taStyle: React.CSSProperties = { width:"100%", padding:"11px 13px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, color:"#F0F4FF", fontSize:13, fontFamily:"'Inter',sans-serif", fontWeight:300, outline:"none", resize:"none", lineHeight:1.65, transition:"border-color 0.15s, box-shadow 0.15s" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0D12; }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)} 25%{transform:translate(80px,60px) scale(1.05)} 50%{transform:translate(40px,120px) scale(.95)} 75%{transform:translate(-60px,50px) scale(1.08)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 20%{transform:translate(-90px,40px) scale(1.06)} 45%{transform:translate(-50px,-80px) scale(.96)} 70%{transform:translate(70px,-40px) scale(1.04)} 100%{transform:translate(0,0) scale(1)} }
        textarea { font-family:'Inter',sans-serif; }
        textarea::placeholder { color:rgba(255,255,255,0.18); }
        .settings-save-btn {
          position:relative; overflow:hidden;
          display:inline-flex; align-items:center; justify-content:center; gap:7px;
          padding:10px 24px; font-family:'Manrope',sans-serif; font-size:13px; font-weight:600;
          background:linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%);
          color:#fff; border-radius:10px; border:1px solid rgba(160,200,255,0.50); cursor:pointer;
          backdrop-filter:blur(24px) saturate(2); -webkit-backdrop-filter:blur(24px) saturate(2);
          box-shadow:0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 4px 20px rgba(77,142,255,0.20);
          transition:transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s ease, opacity 0.15s ease;
          letter-spacing:0.01em;
        }
        .settings-save-btn::before { content:''; position:absolute; top:0; left:10%; right:10%; height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); transition:opacity 0.2s ease; pointer-events:none; }
        .settings-save-btn:hover:not(:disabled) { transform:scale(1.03); background:linear-gradient(160deg, rgba(140,185,255,0.55) 0%, rgba(70,125,250,0.70) 50%, rgba(45,100,220,0.80) 100%); box-shadow:0 1px 0 rgba(255,255,255,0.40) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 2px 8px rgba(77,142,255,0.20), 0 8px 24px rgba(77,142,255,0.22), 0 20px 48px rgba(77,142,255,0.10); }
        .settings-save-btn:hover::before { opacity:0; }
        .settings-save-btn:disabled { opacity:0.4; cursor:not-allowed; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#0A0D12", fontFamily:"'Inter',sans-serif", color:"#F0F4FF" }}>

        {/* Blobs */}
        <div style={{ position:"fixed", width:600, height:600, top:-150, left:-150, borderRadius:"50%", background:"rgba(77,142,255,0.12)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob1 18s ease-in-out infinite", willChange:"transform" }} />
        <div style={{ position:"fixed", width:500, height:500, bottom:-100, right:-100, borderRadius:"50%", background:"rgba(139,92,246,0.09)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob2 22s ease-in-out infinite", willChange:"transform" }} />
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.025, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize:"256px 256px" }} />

        <AppNav credits={credits} user={user} signOut={signOut} />

        <main style={{ maxWidth:640, margin:"0 auto", padding:"48px 24px 80px", position:"relative", zIndex:1 }}>
          <div style={{ marginBottom:36 }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:"rgba(77,142,255,0.7)", marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>Account</div>
            <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:26, fontWeight:700, letterSpacing:-0.8, color:"#F0F4FF" }}>Settings</h1>
          </div>

          {/* Account info */}
          <Section title="Profile">
            <EditableRow label="First name"   value={user?.firstName ?? "—"} onSave={async v => { await user?.update({ firstName: v }); }} />
            <EditableRow label="Last name"    value={user?.lastName  ?? "—"} onSave={async v => { await user?.update({ lastName:  v }); }} />
            <EditableRow label="Email"        value={email}   editable={false} />
            <EditableRow label="Member since" value={joinedAt} editable={false} last />
          </Section>

          {/* Platforms */}
          <Section title="Connected platforms">
            {product?.platforms && product.platforms.length > 0 ? (
              <>
                {product.platforms.map((p: string, i: number) => (
                  <div key={p} style={{ padding:"13px 20px", borderBottom: i < product.platforms.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.50)" }}>{PLATFORM_ICONS[p]}</div>
                      <span style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.60)", fontFamily:"'Inter',sans-serif" }}>{PLATFORM_LABELS[p] ?? p}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.60)" }} />
                      <span style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,0.25)", fontFamily:"'Inter',sans-serif" }}>Active</span>
                    </div>
                  </div>
                ))}
                <div style={{ padding:"11px 20px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                  <button onClick={() => router.push("/edit-product")} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.40)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.14s" }} onMouseEnter={e => (e.currentTarget.style.color = "#F0F4FF")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.40)")}>
                    Edit product brief <MoveRight size={13} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding:"24px 20px", textAlign:"center" }}>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.20)", fontFamily:"'Inter',sans-serif" }}>No platforms connected yet.</p>
              </div>
            )}
          </Section>

          {/* Voice samples */}
          <Section title="Voice samples">
            <div style={{ padding:"20px 20px 0" }}>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.30)", lineHeight:1.65, marginBottom:16, fontFamily:"'Inter',sans-serif", fontWeight:300 }}>
                Paste 1–3 real posts you've written. Pervasively studies your sentence length, word choice, and topics to mirror your voice in every generation.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:12 }}>
                {examplePosts.map((post, i) => (
                  <div key={i}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.10em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.22)", fontFamily:"'Manrope',sans-serif" }}>Example {i + 1}</span>
                      {examplePosts.length > 1 && (
                        <button onClick={() => setExamplePosts(prev => prev.filter((_,idx) => idx !== i))} style={{ fontSize:11, color:"rgba(255,255,255,0.20)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.13s" }} onMouseEnter={e => (e.currentTarget.style.color = "#E05A5A")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.20)")}>Remove</button>
                      )}
                    </div>
                    <textarea value={post} onChange={e => setExamplePosts(prev => { const next=[...prev]; next[i]=e.target.value; return next; })} placeholder={i === 0 ? "Paste a post you're proud of..." : "Another example (optional)..."} rows={4} style={taStyle} onFocus={e => { e.currentTarget.style.borderColor="rgba(77,142,255,0.45)"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(77,142,255,0.10)"; }} onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow="none"; }} />
                  </div>
                ))}
              </div>
              {examplePosts.length < 3 && (
                <button onClick={() => setExamplePosts(prev => [...prev, ""])} style={{ width:"100%", padding:"10px", marginBottom:12, background:"none", border:"1px dashed rgba(255,255,255,0.14)", borderRadius:10, fontSize:12, color:"rgba(255,255,255,0.25)", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.14s, border-color 0.14s" }} onMouseEnter={e => { e.currentTarget.style.color="rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.30)"; }} onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,0.25)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"; }}>
                  + Add another example
                </button>
              )}
              {examplesError && <p style={{ fontSize:12, color:"#E05A5A", marginBottom:10, fontFamily:"'Inter',sans-serif" }}>{examplesError}</p>}
            </div>
            <div style={{ padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color: examplesSaved ? "#4D8EFF" : "transparent", fontFamily:"'Inter',sans-serif", transition:"color 0.2s" }}>✓ Saved</span>
              <button onClick={async () => {
                if (!user) return;
                setExamplesSaving(true); setExamplesError(""); setExamplesSaved(false);
                try {
                  await updateExamplePosts({ clerkId: user.id, examplePosts: examplePosts.filter(p => p.trim()) });
                  setExamplesSaved(true);
                  setTimeout(() => setExamplesSaved(false), 2500);
                } catch (e: any) { setExamplesError(e?.message ?? "Failed to save."); }
                finally { setExamplesSaving(false); }
              }} disabled={examplesSaving} className="settings-save-btn">
                {examplesSaving ? "Saving…" : "Save voice samples"}
              </button>
            </div>
          </Section>

          {/* Danger zone */}
          <Section title="Danger zone">
            <div style={{ padding:"18px 20px" }}>
              {!showDeleteConfirm ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.45)", marginBottom:3, fontFamily:"'Inter',sans-serif" }}>Delete account</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.20)", lineHeight:1.5, fontFamily:"'Inter',sans-serif" }}>Permanently remove your account and all data. This cannot be undone.</p>
                  </div>
                  <button onClick={() => setShowDeleteConfirm(true)} style={{ fontSize:12, fontWeight:500, color:"#C07070", background:"rgba(200,65,65,0.07)", border:"1px solid rgba(200,65,65,0.18)", borderRadius:8, padding:"7px 14px", cursor:"pointer", flexShrink:0, marginLeft:16, fontFamily:"'Manrope',sans-serif", transition:"all 0.14s" }} onMouseEnter={e => { e.currentTarget.style.background="rgba(200,65,65,0.13)"; e.currentTarget.style.borderColor="rgba(200,65,65,0.30)"; }} onMouseLeave={e => { e.currentTarget.style.background="rgba(200,65,65,0.07)"; e.currentTarget.style.borderColor="rgba(200,65,65,0.18)"; }}>
                    Delete account
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize:13, fontWeight:500, color:"#C07070", marginBottom:6, fontFamily:"'Manrope',sans-serif" }}>Are you sure?</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)", marginBottom:14, lineHeight:1.5, fontFamily:"'Inter',sans-serif" }}>
                    Type <span style={{ color:"rgba(255,255,255,0.50)", fontFamily:"monospace" }}>delete my account</span> to confirm.
                  </p>
                  <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="delete my account" style={{ width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(200,65,65,0.25)", borderRadius:10, color:"#F0F4FF", fontSize:13, outline:"none", marginBottom:12, fontFamily:"'Inter',sans-serif" }} />
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }} style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontFamily:"'Manrope',sans-serif" }}>Cancel</button>
                    <button disabled={deleteInput !== "delete my account"} onClick={() => signOut(() => router.replace("/"))} style={{ fontSize:12, fontWeight:500, color:"#fff", background: deleteInput === "delete my account" ? "rgba(200,65,65,0.75)" : "rgba(200,65,65,0.20)", border:"1px solid rgba(200,65,65,0.30)", borderRadius:8, padding:"8px 16px", cursor: deleteInput === "delete my account" ? "pointer" : "default", transition:"background 0.14s", fontFamily:"'Manrope',sans-serif" }}>
                      Permanently delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </main>
      </div>
    </>
  );
}