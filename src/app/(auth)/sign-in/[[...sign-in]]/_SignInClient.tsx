"use client";

import { useClerk, useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function SignInClient() {
  const { isLoaded, signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "verify">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  useEffect(() => { setMounted(true); }, []);

  // Step 1: sign in with email + password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/dashboard");
      } else if (result.status === "needs_second_factor" || (result as any)._status === "needs_client_trust") {
        // Send email verification code
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setStep("verify");
      } else {
        setError("Sign in incomplete. Please try again.");
      }
    } catch (err: any) {
      // needs_client_trust surfaces as an error in some Clerk versions
      if (err?.errors?.[0]?.code === "needs_client_trust" || (err as any)._status === "needs_client_trust") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setStep("verify");
      } else {
        setError(err?.errors?.[0]?.message ?? "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the email code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.attemptSecondFactor({ strategy: "email_code", code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/dashboard");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    position: "relative" as const,
    border: `1px solid ${focusedField === field ? "rgba(25,97,117,0.6)" : "rgba(255,255,255,0.06)"}`,
    borderRadius: 12,
    background: focusedField === field ? "rgba(25,97,117,0.06)" : "rgba(255,255,255,0.02)",
    transition: "all 0.2s",
  });

  const labelStyle = (field: string) => ({
    display: "block" as const, fontSize: 10, fontWeight: 500,
    letterSpacing: "0.14em", textTransform: "uppercase" as const,
    color: focusedField === field ? "#1E7A91" : "#3D5A62",
    marginBottom: 8, fontFamily: "'Inter', -apple-system, sans-serif", transition: "color 0.2s",
  });

  return (
    <div className="relative min-h-screen bg-[#060A0D] flex items-center justify-center overflow-hidden">

      {/* Card */}
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div style={{ background: "rgba(10,16,20,0.97)", border: "1px solid rgba(25,97,117,0.2)", borderRadius: 24, padding: "40px 40px 36px", backdropFilter: "blur(20px)" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ height: 1, flex: 1, background: "rgba(25,97,117,0.25)" }} />
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.18em", color: "#1E7A91", textTransform: "uppercase", fontFamily: "'Inter', -apple-system, sans-serif" }}>
                {step === "verify" ? "Verify your device" : "Welcome back"}
              </span>
              <div style={{ height: 1, flex: 1, background: "rgba(25,97,117,0.25)" }} />
            </div>
            <h1 style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 28, fontWeight: 500, color: "#F0F4F5", letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
              {step === "verify" ? (
                <>Check your<br /><span style={{ color: "#2AA5C0" }}>email</span></>
              ) : (
                <>Continue building<br /><span style={{ color: "#2AA5C0" }}>your audience</span></>
              )}
            </h1>
            <p style={{ fontSize: 13, color: "#4A6B75", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
              {step === "verify"
                ? `We sent a verification code to ${email}. Enter it below to continue.`
                : "Sign in to your Pervasively account to keep creating."}
            </p>
          </div>

          {/* ── Step 1: credentials ── */}
          {step === "credentials" && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle("email")}>Email address</label>
                <div style={inputStyle("email")}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E7A91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  </div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} placeholder="you@example.com" required autoComplete="email" style={{ width: "100%", padding: "13px 14px 13px 38px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12 }} />
                </div>
              </div>

              <div>
                <div style={inputStyle("password")}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E7A91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} placeholder="••••••••••••" required autoComplete="current-password" style={{ width: "100%", padding: "13px 14px 13px 38px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12 }} />
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(224,90,90,0.08)", border: "1px solid rgba(224,90,90,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span style={{ fontSize: 12, color: "#E05A5A", fontFamily: "'Inter', -apple-system, sans-serif" }}>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: 4, padding: "14px 24px", background: loading ? "rgba(25,97,117,0.3)" : "#196175", border: "1px solid rgba(25,97,117,0.4)", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", letterSpacing: 0.2 }}>
                {loading ? (<><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Signing in…</>) : (<>Sign in <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>)}
              </button>
            </form>
          )}

          {/* ── Step 2: email verification code ── */}
          {step === "verify" && (
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle("code")}>Verification code</label>
                <div style={inputStyle("code")}>
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E7A91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onFocus={() => setFocusedField("code")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter 6-digit code"
                    required
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                    style={{ width: "100%", padding: "13px 14px 13px 38px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12, letterSpacing: "0.2em" }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(224,90,90,0.08)", border: "1px solid rgba(224,90,90,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span style={{ fontSize: 12, color: "#E05A5A", fontFamily: "'Inter', -apple-system, sans-serif" }}>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: 4, padding: "14px 24px", background: loading ? "rgba(25,97,117,0.3)" : "#196175", border: "1px solid rgba(25,97,117,0.4)", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", letterSpacing: 0.2 }}>
                {loading ? (<><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Verifying…</>) : (<>Verify & sign in <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>)}
              </button>

              <button type="button" onClick={() => { setStep("credentials"); setError(""); setCode(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#3D5A62", fontFamily: "'Inter', -apple-system, sans-serif", textAlign: "center" }}>
                Back to sign in
              </button>
            </form>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            <span style={{ fontSize: 11, color: "#2D4A52", fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.08em" }}>New here?</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          </div>
          <Link href="/sign-up" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, color: "#6B8A92", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", textDecoration: "none" }}>
            Create an account
          </Link>
          <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#2D4A52", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
            By continuing you agree to our <span style={{ color: "#3D6B75" }}>Terms</span> and <span style={{ color: "#3D6B75" }}>Privacy Policy</span>
          </p>
        </div>

        {[["top", "left", "24px 0 0 0", "borderTop", "borderLeft"], ["top", "right", "0 24px 0 0", "borderTop", "borderRight"], ["bottom", "left", "0 0 0 24px", "borderBottom", "borderLeft"], ["bottom", "right", "0 0 24px 0", "borderBottom", "borderRight"]].map(([v, h, r, b1, b2]) => (
          <div key={`${v}${h}`} style={{ position: "absolute", [v]: -1, [h]: -1, width: 20, height: 20, borderRadius: r, [b1]: "2px solid rgba(25,97,117,0.5)", [b2]: "2px solid rgba(25,97,117,0.5)", pointerEvents: "none" }} />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #2D4A52; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}