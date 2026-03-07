"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FeedbackClient() {
  const { user } = useUser();
  const router   = useRouter();

  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<"idle" | "sending" | "sent" | "error">("idle");

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
          <button onClick={() => router.push("/dashboard")} style={{ fontSize: 12, fontWeight: 500, color: "#2E4A55", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", letterSpacing: -0.1 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")}
            onMouseLeave={e => (e.currentTarget.style.color = "#2E4A55")}>
            ← Dashboard
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#196175", marginBottom: 8 }}>Feedback</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.7, color: "#EDF2F4", marginBottom: 6 }}>Share your thoughts</h1>
          <p style={{ fontSize: 14, color: "#3D5A62", lineHeight: 1.6 }}>Help us improve Pervasively. Every bit of feedback shapes what we build next.</p>
        </div>

        {status === "sent" ? (
          /* ── Success state ── */
          <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(42,165,192,0.2)", borderRadius: 20, padding: "56px 32px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(25,97,117,0.12)", border: "1px solid rgba(42,165,192,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#EDF2F4", letterSpacing: -0.4, marginBottom: 8 }}>Thank you!</h2>
            <p style={{ fontSize: 14, color: "#3D5A62", lineHeight: 1.6, marginBottom: 28 }}>Your feedback has been received. We read every single submission.</p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg, #1a6d85, #196175)", border: "1px solid rgba(42,165,192,0.28)", borderRadius: 11, padding: "10px 24px", cursor: "pointer", boxShadow: "0 4px 16px rgba(25,97,117,0.3)" }}
            >
              Back to dashboard →
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(255,255,255,0.062)", borderRadius: 20, padding: "32px", backdropFilter: "blur(20px)" }}>

            {/* Star rating */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 14 }}>
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
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 10 }}>
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
                background: !rating || !message.trim() ? "rgba(25,97,117,0.15)" : "linear-gradient(135deg, #1a6d85, #196175)",
                border: "1px solid rgba(42,165,192,0.25)", borderRadius: 12,
                color: !rating || !message.trim() ? "#2E4A55" : "#fff",
                fontSize: 14, fontWeight: 600, cursor: !rating || !message.trim() ? "not-allowed" : "pointer",
                transition: "all 0.16s", letterSpacing: -0.1,
                boxShadow: !rating || !message.trim() ? "none" : "0 4px 18px rgba(25,97,117,0.32), inset 0 1px 0 rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {status === "sending" ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  Sending…
                </>
              ) : "Send feedback →"}
            </button>
          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } textarea::placeholder { color: #2E4A55; }`}</style>
    </div>
  );
}