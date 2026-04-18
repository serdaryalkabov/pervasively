"use client";

import { useClerk, useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const requirements = [
  { key: "upper",  label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lower",  label: "Lowercase", test: (p: string) => /[a-z]/.test(p) },
  { key: "digit",  label: "Number",    test: (p: string) => /[0-9]/.test(p) },
  { key: "length", label: "6+ chars",  test: (p: string) => p.length >= 6 },
];
const strengthColors = ["", "#E05A5A", "#E08A3D", "#D4C040", "#3DAB7A"];

export function SignUpClient() {
  const { isLoaded, signUp } = useSignUp();
  const { setActive } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => { if (isSignedIn) router.replace("/dashboard"); }, [isSignedIn]);

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [passwordC, setPasswordC]   = useState("");
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep]             = useState<"form" | "verify">("form");
  const [code, setCode]             = useState("");
  useEffect(() => { setMounted(true); }, []);

  const strength   = password ? requirements.filter(r => r.test(password)).length : 0;
  const isValid    = strength === 4;
  const matches    = passwordC.length > 0 && password === passwordC;
  const mismatches = passwordC.length > 0 && password !== passwordC;
  const canSubmit  = isValid && matches && firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    if (!isValid) { setError("Please meet all password requirements."); return; }
    if (password !== passwordC) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    try {
      await signUp.create({ emailAddress: email, password, firstName, lastName });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "Something went wrong.");
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;
    setLoading(true); setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/onboarding");
      } else { setError("Verification incomplete. Please try again."); }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "Invalid code.");
    } finally { setLoading(false); }
  };

  const inputWrap = (field: string, override?: string): React.CSSProperties => ({
    position: "relative",
    borderRadius: 12,
    background: focusedField === field ? "rgba(77,142,255,0.07)" : "rgba(255,255,255,0.03)",
    border: override ?? `1px solid ${focusedField === field ? "rgba(77,142,255,0.45)" : "rgba(255,255,255,0.08)"}`,
    backdropFilter: "blur(12px)",
    transition: "all 0.15s ease-out",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(77,142,255,0.10)" : "none",
  });

  const labelStyle = (field: string): React.CSSProperties => ({
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: focusedField === field ? "rgba(77,142,255,0.9)" : "rgba(255,255,255,0.35)",
    marginBottom: 8,
    fontFamily: "'Manrope', sans-serif",
    transition: "color 0.15s",
  });

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px 13px 40px",
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#F0F4FF",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    borderRadius: 12,
  };

  const inputBaseNoPad: React.CSSProperties = {
    ...inputBase,
    padding: "13px 14px",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0D12; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blob1 {
          0%   { transform: translate(0px,0px) scale(1); }
          25%  { transform: translate(80px,60px) scale(1.05); }
          50%  { transform: translate(40px,120px) scale(0.95); }
          75%  { transform: translate(-60px,50px) scale(1.08); }
          100% { transform: translate(0px,0px) scale(1); }
        }
        @keyframes blob2 {
          0%   { transform: translate(0px,0px) scale(1); }
          20%  { transform: translate(-90px,40px) scale(1.06); }
          45%  { transform: translate(-50px,-80px) scale(0.96); }
          70%  { transform: translate(70px,-40px) scale(1.04); }
          100% { transform: translate(0px,0px) scale(1); }
        }
        @keyframes blob3 {
          0%   { transform: translate(0px,0px) scale(1); }
          30%  { transform: translate(60px,-70px) scale(1.07); }
          60%  { transform: translate(-40px,-50px) scale(0.94); }
          100% { transform: translate(0px,0px) scale(1); }
        }
        input::placeholder { color: rgba(255,255,255,0.18); font-family: 'Inter', sans-serif; }
        .auth-btn {
          position: relative; overflow: hidden;
          width: 100%; padding: 14px 24px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.60) 50%, rgba(37,90,210,0.70) 100%);
          color: #fff; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 600;
          border-radius: 12px; border: 1px solid rgba(160,200,255,0.50); cursor: pointer;
          backdrop-filter: blur(24px) saturate(2);
          box-shadow: 0 1px 0 rgba(255,255,255,0.30) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 4px 20px rgba(77,142,255,0.20);
          transition: transform .15s ease-out, box-shadow .15s ease-out;
          letter-spacing: 0.01em;
        }
        .auth-btn::before {
          content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          transition: opacity .15s;
        }
        .auth-btn:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 2px 8px rgba(77,142,255,0.20), 0 8px 24px rgba(77,142,255,0.22); }
        .auth-btn:hover::before { opacity: 0; }
        .auth-btn:disabled { opacity: 0.40; cursor: not-allowed; }
        .secondary-btn {
          width: 100%; padding: 13px 24px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.45);
          font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 500;
          border-radius: 12px; border: 1px solid rgba(255,255,255,0.09);
          text-decoration: none; backdrop-filter: blur(16px);
          box-shadow: 0 2px 0 rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.06) inset;
          transition: transform .15s ease-out, box-shadow .15s ease-out, background .15s;
        }
        .secondary-btn:hover { transform: scale(1.02); background: rgba(255,255,255,0.07); box-shadow: 0 4px 16px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.08) inset; }
        .back-btn { background: none; border: none; cursor: pointer; font-size: 12px; color: rgba(255,255,255,0.25); font-family: 'Inter', sans-serif; text-align: center; padding: 8px; transition: color 0.15s; }
        .back-btn:hover { color: rgba(255,255,255,0.55); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0D12", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", padding: "40px 0" }}>

        {/* Animated blobs */}
        <div style={{ position: "fixed", width: 600, height: 600, top: -150, left: -150, borderRadius: "50%", background: "rgba(77,142,255,0.15)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0, animation: "blob1 18s ease-in-out infinite", willChange: "transform" }} />
        <div style={{ position: "fixed", width: 500, height: 500, bottom: -100, right: -100, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0, animation: "blob2 22s ease-in-out infinite", willChange: "transform" }} />
        <div style={{ position: "fixed", width: 400, height: 400, top: "40%", right: "10%", borderRadius: "50%", background: "rgba(77,142,255,0.08)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0, animation: "blob3 26s ease-in-out infinite", willChange: "transform" }} />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.028, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px" }} />

        {/* Card */}
        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 460, margin: "0 16px", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(32px) saturate(1.8)", WebkitBackdropFilter: "blur(32px) saturate(1.8)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: "40px 40px 36px", boxShadow: "0 8px 48px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.07) inset" }}>

            {/* Logo */}
            <div style={{ marginBottom: 32 }}>
              <Link href="/" style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 700, color: "#F0F4FF", textDecoration: "none", letterSpacing: -0.5 }}>
                Pervasive<span style={{ color: "#4D8EFF" }}>ly</span>
              </Link>
            </div>

            {step === "form" ? (
              <>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(77,142,255,0.7)", marginBottom: 10, fontFamily: "'Manrope', sans-serif" }}>
                    Get started free
                  </div>
                  <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.05, marginBottom: 8, color: "#F0F4FF" }}>
                    Be everywhere.<br /><span style={{ color: "#4D8EFF" }}>Pervasively.</span>
                  </h1>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                    Join solopreneurs generating a week of content in 10 minutes.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Name row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle("firstName")}>First name</label>
                      <div style={inputWrap("firstName")}>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} onFocus={() => setFocusedField("firstName")} onBlur={() => setFocusedField(null)} placeholder="Alex" required style={inputBaseNoPad} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle("lastName")}>Last name</label>
                      <div style={inputWrap("lastName")}>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} onFocus={() => setFocusedField("lastName")} onBlur={() => setFocusedField(null)} placeholder="Johnson" required style={inputBaseNoPad} />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle("email")}>Email address</label>
                    <div style={inputWrap("email")}>
                      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4D8EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} placeholder="you@example.com" required style={inputBase} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={labelStyle("password")}>Password</label>
                    <div style={inputWrap("password")}>
                      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4D8EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} placeholder="••••••••••••" required style={inputBase} />
                    </div>
                    {password.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                          {[1,2,3,4].map(i => (
                            <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: strength >= i ? strengthColors[strength] : "rgba(255,255,255,0.06)", transition: "background 0.3s" }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {requirements.map(r => {
                            const met = r.test(password);
                            return (
                              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: met ? "#3DAB7A" : "rgba(255,255,255,0.15)", transition: "background 0.2s" }} />
                                <span style={{ fontSize: 10, color: met ? "rgba(61,171,122,0.9)" : "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{r.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={labelStyle("confirm")}>Confirm password</label>
                    <div style={inputWrap("confirm", `1px solid ${mismatches ? "rgba(224,90,90,0.4)" : matches ? "rgba(61,171,122,0.4)" : focusedField === "confirm" ? "rgba(77,142,255,0.45)" : "rgba(255,255,255,0.08)"}`)}>
                      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={mismatches ? "#E05A5A" : matches ? "#3DAB7A" : "#4D8EFF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <input type="password" value={passwordC} onChange={e => setPasswordC(e.target.value)} onFocus={() => setFocusedField("confirm")} onBlur={() => setFocusedField(null)} placeholder="••••••••••••" required style={inputBase} />
                      {matches && (
                        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3DAB7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(224,90,90,0.07)", border: "1px solid rgba(224,90,90,0.20)", borderRadius: 10, padding: "10px 14px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span style={{ fontSize: 12, color: "#E05A5A", fontFamily: "'Inter', sans-serif" }}>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={loading || !canSubmit} className="auth-btn" style={{ marginTop: 4 }}>
                    {loading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Creating account…</> : <>Create account <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>}
                  </button>
                </form>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}>Have an account?</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                </div>
                <Link href="/sign-in" className="secondary-btn">Sign in instead</Link>
              </>
            ) : (
              <>
                {/* Verify step */}
                <div style={{ marginBottom: 28, textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px", background: "rgba(77,142,255,0.08)", border: "1px solid rgba(77,142,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4D8EFF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(77,142,255,0.7)", marginBottom: 10, fontFamily: "'Manrope', sans-serif" }}>Check your inbox</div>
                  <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, marginBottom: 8, color: "#F0F4FF" }}>
                    Almost there
                  </h1>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65, fontWeight: 300 }}>
                    We sent a 6-digit code to<br />
                    <span style={{ color: "#4D8EFF", fontWeight: 500 }}>{email}</span>
                  </p>
                </div>
                <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={labelStyle("code")}>Verification code</label>
                    <div style={inputWrap("code")}>
                      <input type="text" value={code} onChange={e => setCode(e.target.value)} onFocus={() => setFocusedField("code")} onBlur={() => setFocusedField(null)} placeholder="000000" maxLength={6} required autoComplete="one-time-code" inputMode="numeric" style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", outline: "none", fontSize: 26, color: "#F0F4FF", fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: "0.35em", textAlign: "center", borderRadius: 12 }} />
                    </div>
                  </div>
                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(224,90,90,0.07)", border: "1px solid rgba(224,90,90,0.20)", borderRadius: 10, padding: "10px 14px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span style={{ fontSize: 12, color: "#E05A5A", fontFamily: "'Inter', sans-serif" }}>{error}</span>
                    </div>
                  )}
                  <button type="submit" disabled={loading || code.length < 6} className="auth-btn" style={{ marginTop: 4 }}>
                    {loading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Verifying…</> : "Verify & continue"}
                  </button>
                  <button type="button" onClick={() => setStep("form")} className="back-btn">← Back to sign up</button>
                </form>
              </>
            )}

            <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.18)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
              By continuing you agree to our{" "}
              <Link href="/terms" style={{ color: "rgba(77,142,255,0.6)", textDecoration: "none" }}>Terms</Link>
              {" "}and{" "}
              <span style={{ color: "rgba(77,142,255,0.6)" }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}