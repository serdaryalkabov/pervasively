"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

function NavBar({ credits, onBack }: { credits: number; onBack: () => void }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(8,13,16,0.85)", backdropFilter: "blur(20px)",
      padding: "0 28px", height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "cover", boxShadow: "0 0 12px rgba(25,97,117,0.35)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#EDF2F4", letterSpacing: -0.3 }}>Pervasively</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(12,20,23,0.9)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 100, padding: "5px 13px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: credits > 0 ? "#2AA5C0" : "#2E4A55", boxShadow: credits > 0 ? "0 0 6px rgba(42,165,192,0.6)" : "none" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#C5D8DC" : "#3D5A62" }}>{credits} {credits === 1 ? "credit" : "credits"}</span>
        </div>
        <button onClick={onBack} style={{ fontSize: 12, fontWeight: 500, color: "#3D5A62", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")}
          onMouseLeave={e => (e.currentTarget.style.color = "#3D5A62")}>
          ← Dashboard
        </button>
      </div>
    </nav>
  );
}

const PACKS = [
  { name: "Starter",  price: 12, credits: 5,  perCredit: "2.40", desc: "~5 weeks of content" },
  { name: "Builder",  price: 24, credits: 12, perCredit: "2.00", desc: "~3 months of content", featured: true },
  { name: "Growth",   price: 45, credits: 28, perCredit: "1.60", desc: "~7 months of content" },
];

export default function BillingPage() {
  const { user }   = useUser();
  const router     = useRouter();
  const convexUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const credits    = convexUser?.credits ?? 0;

  const isLoading = convexUser === undefined;

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#080D10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(25,97,117,0.2)", borderTopColor: "#2AA5C0", animation: "spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080D10", fontFamily: "'Inter', -apple-system, sans-serif", color: "#F0F4F5" }}>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(rgba(25,97,117,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: -180, left: "50%", transform: "translateX(-50%)", width: 900, height: 460, background: "radial-gradient(ellipse at 50% 0%, rgba(25,97,117,0.12) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />

      <NavBar credits={credits} onBack={() => router.push("/dashboard")} />

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#196175", marginBottom: 8 }}>Billing</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.7, color: "#EDF2F4", marginBottom: 6 }}>Credits & billing</h1>
          <p style={{ fontSize: 14, color: "#3D5A62" }}>Pay once, generate whenever. Credits never expire.</p>
        </div>

        {/* Current balance */}
        <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(255,255,255,0.062)", borderRadius: 16, padding: "20px 22px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 6 }}>Current balance</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 600, color: "#EDF2F4", letterSpacing: -1 }}>{credits}</span>
              <span style={{ fontSize: 14, color: "#3D5A62", fontWeight: 500 }}>{credits === 1 ? "credit" : "credits"}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: credits > 0 ? "#2AA5C0" : "#2E4A55", boxShadow: credits > 0 ? "0 0 8px rgba(42,165,192,0.6)" : "none" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#2AA5C0" : "#2E4A55" }}>
              {credits > 0 ? `~${credits} week${credits !== 1 ? "s" : ""} of content` : "No credits remaining"}
            </span>
          </div>
        </div>

        {/* Coming soon banner */}
        <div style={{ background: "rgba(25,97,117,0.07)", border: "1px solid rgba(42,165,192,0.15)", borderRadius: 14, padding: "16px 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: 13, color: "#3D6672", lineHeight: 1.5 }}>
            Payments are coming soon. During early access, credits are added manually.{" "}
            <a href="mailto:support@pervasively.co" style={{ color: "#2AA5C0", textDecoration: "none", fontWeight: 500 }}>Contact us</a>{" "}
            if you need a top-up.
          </p>
        </div>

        {/* Credit packs */}
        <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 14 }}>Credit packs</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {PACKS.map(pack => (
            <div key={pack.name} style={{
              background: pack.featured ? "rgba(16,28,32,0.85)" : "rgba(12,20,23,0.65)",
              border: pack.featured ? "1px solid rgba(42,165,192,0.28)" : "1px solid rgba(255,255,255,0.062)",
              borderRadius: 16, padding: "20px 18px",
              position: "relative", overflow: "hidden",
              boxShadow: pack.featured ? "0 0 32px rgba(25,97,117,0.1)" : "none",
            }}>
              {pack.featured && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #196175, #2AA5C0)", color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 12px", borderRadius: "0 0 8px 8px" }}>
                  Most popular
                </div>
              )}
              {pack.featured && <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "radial-gradient(circle, rgba(42,165,192,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />}

              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2AA5C0", marginBottom: 10, marginTop: pack.featured ? 10 : 0 }}>{pack.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#3D5A62" }}>$</span>
                <span style={{ fontSize: 30, fontWeight: 700, color: "#EDF2F4", letterSpacing: -1, lineHeight: 1 }}>{pack.price}</span>
              </div>
              <p style={{ fontSize: 12, color: "#3D5A62", marginBottom: 12 }}>
                <span style={{ color: "#8AABB5", fontWeight: 500 }}>{pack.credits} credits</span> · ${pack.perCredit}/credit
              </p>
              <p style={{ fontSize: 11.5, color: "#2E4A55", marginBottom: 16 }}>{pack.desc}</p>
              <button
                disabled
                style={{
                  width: "100%", padding: "10px 0",
                  background: pack.featured ? "rgba(25,97,117,0.2)" : "rgba(255,255,255,0.04)",
                  border: pack.featured ? "1px solid rgba(42,165,192,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, color: "#2E4A55", fontSize: 12, fontWeight: 600,
                  cursor: "not-allowed", letterSpacing: -0.1,
                }}
              >
                Coming soon
              </button>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "#2E4A55", textAlign: "center" }}>
          1 credit = 7 days × {" "}3 platforms = 21 posts · Credits never expire
        </p>

      </main>
    </div>
  );
}