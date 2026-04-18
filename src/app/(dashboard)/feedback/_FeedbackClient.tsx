"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";

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

const NAV_ITEMS = [
  { label: "Dashboard",         path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { label: "Settings",          path: "/settings",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { label: "Billing & credits",  path: "/billing",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { label: "History",            path: "/history",   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: "Feedback",           path: "/feedback",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

export function FeedbackClient() {
  const { user }    = useUser();
  const { signOut } = useClerk();
  const router      = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<"idle" | "sending" | "sent" | "error">("idle");

  const convexUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const credits    = convexUser?.credits ?? 0;
  const initials   = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName   = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const userEmail  = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const handleSubmit = async () => {
    if (!rating || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/mreybzav", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ rating, message, email: userEmail || "anonymous", name: fullName }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch { setStatus("error"); }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  const activeRating = hovered || rating;
  const canSubmit    = !!rating && !!message.trim() && status !== "sending";

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Inter',sans-serif", color:T.text, overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes ddIn  { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)}25%{transform:translate(80px,60px) scale(1.05)}50%{transform:translate(40px,120px) scale(0.95)}75%{transform:translate(-60px,50px) scale(1.08)}100%{transform:translate(0,0) scale(1)} }
        .fddi {
          display:flex; align-items:center; gap:10px;
          padding:9px 15px; width:100%;
          background:none; border:none; cursor:pointer;
          font-family:'Inter',sans-serif; font-size:13px; font-weight:400;
          color:${T.muted}; text-align:left;
          transition:background 0.1s,color 0.1s;
        }
        .fddi:hover { background:rgba(255,255,255,0.04); color:${T.text}; }
        .fddi svg { opacity:0.45; flex-shrink:0; transition:opacity 0.1s; }
        .fddi:hover svg { opacity:0.8; }
        .fddi-red:hover { background:rgba(192,57,43,0.08) !important; color:#D87070 !important; }
        .noise-bg { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.028; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size:256px 256px; }
        textarea { font-family:'Inter',sans-serif; }
        textarea::placeholder { color:${T.muted2}; }
        textarea:focus { outline:none; }
      `}</style>

      <div className="noise-bg" />
      <div style={{ position:"fixed", top:-200, left:"30%", width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle, rgba(77,142,255,0.07) 0%, transparent 70%)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob1 22s ease-in-out infinite" }} />

      {/* Nav */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        background:"rgba(10,13,18,0.88)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        padding:"0 56px", height:58,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
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
            <button
              onClick={() => setAvatarOpen(o => !o)}
              style={{
                width:32, height:32, borderRadius:"50%",
                background:T.blueDim,
                border: avatarOpen ? "1.5px solid rgba(77,142,255,0.7)" : "1.5px solid rgba(77,142,255,0.25)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:600, color:"#A8C4FF",
                fontFamily:"'Manrope',sans-serif",
                cursor:"pointer", outline:"none", transition:"border-color 0.15s",
              }}
            >{initials}</button>

            {avatarOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:236, background:"rgba(10,13,18,0.97)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:16, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", animation:"ddIn 0.15s cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ padding:"14px 15px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:-0.2, marginBottom:3, fontFamily:"'Manrope',sans-serif" }}>{fullName}</div>
                  <div style={{ fontSize:11, color:T.muted2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Inter',sans-serif" }}>{userEmail}</div>
                </div>
                <div style={{ padding:"6px 0" }}>
                  {NAV_ITEMS.map(({ label, path, icon }) => (
                    <button key={label} className="fddi" onClick={() => { router.push(path); setAvatarOpen(false); }}>{icon}{label}</button>
                  ))}
                </div>
                <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"2px 0" }} />
                <div style={{ padding:"5px 0 7px" }}>
                  <button className="fddi fddi-red" onClick={() => signOut(() => router.replace("/sign-in"))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth:600, margin:"0 auto", padding:"56px 24px 100px", position:"relative", zIndex:1, animation:"fadeUp 0.5s ease-out both" }}>

        {/* Header */}
        <div style={{ marginBottom:44 }}>
          <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:T.blue, marginBottom:10 }}>Feedback</div>
          <h1 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:600, letterSpacing:-1.5, color:T.text, lineHeight:1.05, marginBottom:10 }}>
            Tell us what you think.
          </h1>
          <p style={{ fontSize:15, color:T.muted, lineHeight:1.7, fontWeight:300 }}>
            Help us improve Pervasively. <span style={{ color:T.blue }}>Every submission shapes what we build next.</span>
          </p>
        </div>

        {status === "sent" ? (
          /* Success */
          <div style={{ background:"rgba(77,142,255,0.06)", border:`1px solid rgba(77,142,255,0.22)`, borderRadius:20, padding:"60px 32px", textAlign:"center", backdropFilter:"blur(20px)", boxShadow:"0 4px 32px rgba(77,142,255,0.10), 0 1px 0 rgba(255,255,255,0.06) inset" }}>
            <div style={{ width:56, height:56, borderRadius:16, background:T.blueDim, border:`1px solid ${T.blueBorder}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:22, fontWeight:600, color:T.text, letterSpacing:-0.5, marginBottom:10 }}>Thank you.</h2>
            <p style={{ fontSize:15, color:T.muted, lineHeight:1.7, marginBottom:32, fontWeight:300 }}>Your feedback has been received. We read every single submission.</p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"12px 28px",
                background:"linear-gradient(135deg, rgba(77,142,255,0.90), rgba(55,110,240,0.95))",
                border:"1px solid rgba(120,170,255,0.35)",
                borderRadius:10, color:"#ffffff",
                fontSize:13, fontWeight:600, cursor:"pointer",
                boxShadow:"0 2px 16px rgba(77,142,255,0.30)",
                fontFamily:"'Manrope',sans-serif",
              }}
            >
              Back to dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        ) : (
          /* Form */
          <div style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px) saturate(1.6)", WebkitBackdropFilter:"blur(20px) saturate(1.6)", border:`1px solid ${T.border}`, borderRadius:20, padding:32, boxShadow:"0 4px 24px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.06) inset" }}>

            {/* Star rating */}
            <div style={{ marginBottom:32 }}>
              <label style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:T.muted2, marginBottom:14, fontFamily:"'Manrope',sans-serif" }}>
                How would you rate Pervasively?
              </label>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:2, transition:"transform 0.12s", transform: hovered === star ? "scale(1.2)" : "scale(1)" }}
                  >
                    <svg width="30" height="30" viewBox="0 0 24 24" fill={star <= activeRating ? T.blue : "none"} stroke={star <= activeRating ? T.blue : T.muted2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
                {activeRating > 0 && (
                  <span style={{ fontSize:13, fontWeight:600, color:T.blue, marginLeft:6, fontFamily:"'Manrope',sans-serif" }}>
                    {ratingLabels[activeRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:T.muted2, marginBottom:10, fontFamily:"'Manrope',sans-serif" }}>
                Your feedback
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What's working well? What could be better? Any features you'd love to see?"
                rows={5}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(77,142,255,0.40)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.08)"; }}
                onBlur={e =>  { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
                style={{
                  width:"100%", padding:"14px 16px",
                  background:"rgba(255,255,255,0.03)", border:`1px solid ${T.border}`,
                  borderRadius:12, color:T.text, fontSize:14, fontWeight:300,
                  resize:"none", lineHeight:1.65,
                  transition:"border-color 0.15s, box-shadow 0.15s", boxSizing:"border-box",
                }}
              />
              <p style={{ fontSize:11, color:T.muted2, marginTop:6, textAlign:"right", fontFamily:"'Inter',sans-serif" }}>{message.length} chars</p>
            </div>

            {/* Error */}
            {status === "error" && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(224,90,90,0.07)", border:"1px solid rgba(224,90,90,0.18)", borderRadius:10, padding:"10px 14px", marginBottom:20 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize:12, color:"#E05A5A", fontFamily:"'Inter',sans-serif" }}>Something went wrong. Please try again.</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width:"100%", padding:"14px 24px",
                background: canSubmit
                  ? "linear-gradient(135deg, rgba(77,142,255,0.90), rgba(55,110,240,0.95))"
                  : "rgba(255,255,255,0.04)",
                border: canSubmit
                  ? "1px solid rgba(120,170,255,0.35)"
                  : `1px solid ${T.border}`,
                borderRadius:12,
                color: canSubmit ? "#ffffff" : T.muted2,
                fontSize:14, fontWeight:600, cursor: canSubmit ? "pointer" : "not-allowed",
                transition:"all 0.16s", letterSpacing:0,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                boxShadow: canSubmit ? "0 2px 16px rgba(77,142,255,0.25)" : "none",
                fontFamily:"'Manrope',sans-serif",
              }}
            >
              {status === "sending" ? (
                <>
                  <div style={{ width:14, height:14, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }} />
                  Sending…
                </>
              ) : "Send feedback"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}