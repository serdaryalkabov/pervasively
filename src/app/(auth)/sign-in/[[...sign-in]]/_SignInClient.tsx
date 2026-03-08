"use client";

import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function SignInClient() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn]);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const dots: { x: number; y: number; ox: number; oy: number; v: number; phase: number }[] = [];
    const SPACING = 52;
    const init = () => {
      dots.length = 0;
      const cols = Math.ceil(canvas.width / SPACING) + 1;
      const rows = Math.ceil(canvas.height / SPACING) + 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          dots.push({ x: c * SPACING, y: r * SPACING, ox: c * SPACING, oy: r * SPACING, v: Math.random() * 0.4 + 0.1, phase: Math.random() * Math.PI * 2 });
    };
    init();
    window.addEventListener("resize", init);
    let t = 0, raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;
      dots.forEach(d => {
        d.x = d.ox + Math.sin(t * d.v + d.phase) * 3;
        d.y = d.oy + Math.cos(t * d.v + d.phase + 1) * 3;
        const dist = Math.hypot(d.x - canvas.width / 2, d.y - canvas.height / 2);
        const max = Math.hypot(canvas.width / 2, canvas.height / 2);
        const alpha = 0.03 + (1 - dist / max) * 0.09;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(25, 97, 117, ${alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("resize", init); };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060A0D] flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(25,97,117,0.13) 0%, transparent 70%)" }} />
      </div>

      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", boxShadow: "0 0 12px rgba(25,97,117,0.35)" }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: "#F0F4F5", letterSpacing: -0.5 }}>
            Pervasively
          </span>
        </Link>
        <div style={{ fontSize: 12, color: "#4A6B75", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
          Sign In
        </div>
      </div>

      {/* Card */}
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div style={{ background: "linear-gradient(145deg, rgba(12,20,23,0.95) 0%, rgba(8,13,16,0.98) 100%)", border: "1px solid rgba(25,97,117,0.2)", borderRadius: 24, padding: "40px 40px 36px", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderRadius: 24 }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, rgba(25,97,117,0.4))" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#1E7A91", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Welcome back</span>
              <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, rgba(25,97,117,0.4), transparent)" }} />
            </div>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: "#F0F4F5", letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
              Continue building<br />
              <span style={{ background: "linear-gradient(135deg, #1E7A91, #4AACBF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>your audience</span>
            </h1>
            <p style={{ fontSize: 13, color: "#4A6B75", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              Sign in to your Pervasively account to keep creating.
            </p>
          </div>

          {/* Clerk SignIn — constrained wrapper forces full width */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <SignIn
              routing="hash"
              afterSignInUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "#196175",
                  colorBackground: "transparent",
                  colorInputBackground: "rgba(255,255,255,0.02)",
                  colorInputText: "#F0F4F5",
                  colorText: "#F0F4F5",
                  colorTextSecondary: "#4A6B75",
                  colorNeutral: "#4A6B75",
                  borderRadius: "12px",
                  fontFamily: "'DM Sans', sans-serif",
                  spacingUnit: "16px",
                },
                elements: {
                  rootBox: {
                    width: "100%",
                    minWidth: "0",
                  },
                  cardBox: {
                    width: "100%",
                    minWidth: "0",
                    boxShadow: "none",
                  },
                  card: {
                    background: "transparent",
                    boxShadow: "none",
                    border: "none",
                    padding: 0,
                    width: "100%",
                    minWidth: "0",
                  },
                  headerTitle: { display: "none" },
                  headerSubtitle: { display: "none" },
                  header: { display: "none" },
                  socialButtonsBlockButton: {
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#6B8A92",
                  },
                  dividerLine: { background: "rgba(255,255,255,0.05)" },
                  dividerText: { color: "#2D4A52" },
                  formFieldLabel: {
                    color: "#3D5A62",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  },
                  formFieldInput: {
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#F0F4F5",
                    borderRadius: "12px",
                  },
                  formButtonPrimary: {
                    background: "linear-gradient(135deg, #196175 0%, #1a6e82 100%)",
                    border: "1px solid rgba(25,97,117,0.4)",
                    boxShadow: "0 4px 20px rgba(25,97,117,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "12px",
                  },
                  footerAction: { display: "none" },
                  footer: { display: "none" },
                  identityPreviewText: { color: "#C5D8DC" },
                  identityPreviewEditButton: { color: "#2AA5C0" },
                  alert: { borderRadius: "10px" },
                },
              }}
            />
          </div>

          {/* Custom footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            <span style={{ fontSize: 11, color: "#2D4A52", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}>NEW HERE?</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          </div>
          <Link href="/sign-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, color: "#6B8A92", fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
            Create an account
          </Link>
          <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#2D4A52", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
            By continuing you agree to our <span style={{ color: "#3D6B75" }}>Terms</span> and <span style={{ color: "#3D6B75" }}>Privacy Policy</span>
          </p>
        </div>

        {[["top", "left", "24px 0 0 0", "borderTop", "borderLeft"], ["top", "right", "0 24px 0 0", "borderTop", "borderRight"], ["bottom", "left", "0 0 0 24px", "borderBottom", "borderLeft"], ["bottom", "right", "0 0 24px 0", "borderBottom", "borderRight"]].map(([v, h, r, b1, b2]) => (
          <div key={`${v}${h}`} style={{ position: "absolute", [v]: -1, [h]: -1, width: 20, height: 20, borderRadius: r, [b1]: "2px solid rgba(25,97,117,0.5)", [b2]: "2px solid rgba(25,97,117,0.5)", pointerEvents: "none" }} />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .cl-rootBox, .cl-cardBox, .cl-card { width: 100% !important; min-width: 0 !important; }
      `}</style>
    </div>
  );
}