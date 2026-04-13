"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";

export function FeedbackClient() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router   = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef  = useRef<HTMLDivElement>(null);
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<"idle" | "sending" | "sent" | "error">("idle");
  const convexUser = useQuery(api.users.getUser,            user ? { clerkId: user.id } : "skip");
  const credits   = convexUser?.credits ?? 0;
  const initials  = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName  = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";

  const handleSubmit = async () => {
    if (!rating || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/mreybzav", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          rating,
          message,
          email: user?.emailAddresses?.[0]?.emailAddress ?? "anonymous",
          name:  [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous",
        }),
      });
      if (res.ok) setStatus("sent");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  const activeRating = hovered || rating;

  return (
    <div style={{ minHeight: "100vh", background: "#080D10", fontFamily: "'Inter', -apple-system, sans-serif", color: "#F0F4F5" }}>

      {/* Ambient */}

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(8,13,16,0.85)", backdropFilter: "blur(20px)", padding: "0 28px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <a href="#" style={{ fontFamily: "'Manrope',sans-serif", fontSize: 19, fontWeight: 500, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>Pervasive<span style={{ color: "#2AA5C0" }}>ly</span></a>
            {/* <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "cover" }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#EDF2F4", letterSpacing: -0.3 }}>Pervasively</span> */}
          </div>
          {/* <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)" }} /> */}
          {/* <button onClick={() => router.push("/dashboard")} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#2E4A55", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", letterSpacing: -0.1 }} onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")} onMouseLeave={e => (e.currentTarget.style.color = "#2E4A55")}>
            <ChevronLeft size={13} /> Dashboard
          </button> */}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(12,20,23,0.9)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 100, padding: "5px 13px" }}>
            {/* <div style={{ width: 6, height: 6, borderRadius: "50%", background: credits > 0 ? "#2AA5C0" : "#2E4A55", boxShadow: "none" }} /> */}
            <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#C5D8DC" : "#3D5A62" }}>{credits} {credits === 1 ? "credit" : "credits"}</span>
          </div>
          <div ref={avatarRef} style={{ position: "relative" }}>
            <button onClick={() => setAvatarOpen(o => !o)} style={{ width: 30, height: 30, borderRadius: "50%", background: "#0e2028", border: avatarOpen ? "1.5px solid rgba(42,165,192,0.7)" : "1.5px solid rgba(25,97,117,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: "pointer", boxShadow: "none", transition: "all 0.16s", outline: "none" }}>
              {initials}
            </button>
            {avatarOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 228, background: "rgba(10,16,20,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", backdropFilter: "blur(28px)", animation: "ddIn 0.14s cubic-bezier(0.16,1,0.3,1)" }}>
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

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          {/* <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#196175", marginBottom: 8 }}>Feedback</p> */}
          <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.7, color: "#EDF2F4", marginBottom: 6 }}>Feedback</h1>
          <p style={{ fontSize: 14, color: "#3D5A62", lineHeight: 1.6 }}>Help us improve Pervasively. Every bit of feedback shapes what we build next.</p>
        </div>

        {status === "sent" ? (
          /* ── Success state ── */
          <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(42,165,192,0.2)", borderRadius: 20, padding: "56px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(25,97,117,0.12)", border: "1px solid rgba(42,165,192,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "#EDF2F4", letterSpacing: -0.4, marginBottom: 8 }}>Thank you!</h2>
            <p style={{ fontSize: 14, color: "#3D5A62", lineHeight: 1.6, marginBottom: 28 }}>Your feedback has been received. We read every single submission.</p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{ fontSize: 13, fontWeight: 500, color: "#fff", background: "#196175", border: "1px solid rgba(42,165,192,0.28)", borderRadius: 11, padding: "10px 24px", cursor: "pointer" }}
            >
              Back to dashboard
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(255,255,255,0.062)", borderRadius: 20, padding: "32px", backdropFilter: "blur(20px)" }}>

            {/* Star rating */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 14 }}>
                How would you rate Pervasively?
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transition: "transform 0.1s", transform: hovered === star ? "scale(1.2)" : "scale(1)" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={star <= activeRating ? "#2AA5C0" : "none"} stroke={star <= activeRating ? "#2AA5C0" : "#2E4A55"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </button>
                ))}
                {activeRating > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#2AA5C0", marginLeft: 6, transition: "opacity 0.15s" }}>
                    {ratingLabels[activeRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 10 }}>
                Your feedback
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What's working well? What could be better? Any features you'd love to see?"
                rows={5}
                style={{
                  width: "100%", padding: "13px 14px",
                  background: "rgba(8,13,16,0.7)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, color: "#EDF2F4", fontSize: 13, outline: "none",
                  resize: "none", lineHeight: 1.65, fontFamily: "'Inter', sans-serif",
                  transition: "border-color 0.15s", boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(42,165,192,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              />
              <p style={{ fontSize: 11, color: "#1E2E33", marginTop: 6, textAlign: "right" }}>{message.length} chars</p>
            </div>

            {/* Error */}
            {status === "error" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(224,90,90,0.07)", border: "1px solid rgba(224,90,90,0.18)", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize: 12, color: "#E05A5A" }}>Something went wrong. Please try again.</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!rating || !message.trim() || status === "sending"}
              style={{
                width: "100%", padding: "13px 24px",
                background: !rating || !message.trim() ? "rgba(25,97,117,0.15)" : "#196175",
                border: "1px solid rgba(42,165,192,0.25)", borderRadius: 12,
                color: !rating || !message.trim() ? "#2E4A55" : "#fff",
                fontSize: 14, fontWeight: 500, cursor: !rating || !message.trim() ? "not-allowed" : "pointer",
                transition: "all 0.16s", letterSpacing: -0.1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {status === "sending" ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  Sending…
                </>
              ) : "Send feedback"}
            </button>
          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } textarea::placeholder { color: #2E4A55; }`}</style>
    </div>
  );
}