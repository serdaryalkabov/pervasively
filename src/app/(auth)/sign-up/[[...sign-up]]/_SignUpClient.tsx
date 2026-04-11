"use client";

import { useClerk, useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const requirements = [
  { key: "upper", label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lower", label: "Lowercase", test: (p: string) => /[a-z]/.test(p) },
  { key: "digit", label: "Number",    test: (p: string) => /[0-9]/.test(p) },
  { key: "length", label: "6+ chars", test: (p: string) => p.length >= 6 },
];
const strengthColors = ["", "#E05A5A", "#E08A3D", "#D4C040", "#3DAB7A"];

export function SignUpClient() {
  const { isLoaded, signUp } = useSignUp();
  const { setActive } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn]);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [passwordC, setPasswordC] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep]         = useState<"form" | "verify">("form");
  const [code, setCode]         = useState("");
  useEffect(() => { setMounted(true); }, []);

  const strength  = password ? requirements.filter(r => r.test(password)).length : 0;
  const isValid   = strength === 4;
  const matches   = passwordC.length > 0 && password === passwordC;
  const mismatches = passwordC.length > 0 && password !== passwordC;

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
    <div className="relative min-h-screen bg-[#060A0D] flex items-center justify-center overflow-hidden py-10">

      {/* Card */}
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div style={{ background: "rgba(10,16,20,0.97)", border: "1px solid rgba(25,97,117,0.2)", borderRadius: 24, padding: "40px 40px 36px", backdropFilter: "blur(20px)" }}>

          {step === "form" ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ height: 1, flex: 1, background: "rgba(25,97,117,0.25)" }} />
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.18em", color: "#1E7A91", textTransform: "uppercase", fontFamily: "'Inter', -apple-system, sans-serif" }}>Get started</span>
                  <div style={{ height: 1, flex: 1, background: "rgba(25,97,117,0.25)" }} />
                </div>
                <h1 style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 28, fontWeight: 500, color: "#F0F4F5", letterSpacing: -1, lineHeight: 1.1, marginBottom: 8 }}>
                  Be everywhere<br />
                  <span style={{ color: "#2AA5C0" }}>pervasively</span>
                </h1>
                <p style={{ fontSize: 13, color: "#4A6B75", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
                  Join solopreneurs generating a week of content in 10 minutes.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Name row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle("firstName")}>First name</label>
                    <div style={inputStyle("firstName")}>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} onFocus={() => setFocusedField("firstName")} onBlur={() => setFocusedField(null)} placeholder="Alex" required style={{ width: "100%", padding: "13px 14px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12 }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle("lastName")}>Last name</label>
                    <div style={inputStyle("lastName")}>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} onFocus={() => setFocusedField("lastName")} onBlur={() => setFocusedField(null)} placeholder="Johnson" required style={{ width: "100%", padding: "13px 14px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12 }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={labelStyle("email")}>Email address</label>
                  <div style={inputStyle("email")}>
                    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E7A91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} placeholder="you@example.com" required style={{ width: "100%", padding: "13px 14px 13px 38px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12 }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle("password")}>Password</label>
                  <div style={inputStyle("password")}>
                    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E7A91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} placeholder="••••••••••••" required style={{ width: "100%", padding: "13px 14px 13px 38px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12 }} />
                  </div>
                  {password.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                        {[1,2,3,4].map(i => (<div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: strength >= i ? strengthColors[strength] : "rgba(255,255,255,0.06)", transition: "background 0.3s" }} />))}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {requirements.map(r => { const met = r.test(password); return (
                          <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 100, border: `1px solid ${met ? "rgba(61,171,122,0.35)" : "rgba(255,255,255,0.06)"}`, background: met ? "rgba(61,171,122,0.08)" : "rgba(255,255,255,0.02)", transition: "all 0.2s" }}>
                            <div style={{ width: 5, height: 5, borderRadius: 3, background: met ? "#3DAB7A" : "#2D4A52", transition: "background 0.2s" }} />
                            <span style={{ fontSize: 10, color: met ? "#3DAB7A" : "#2D4A52", fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500, letterSpacing: "0.04em" }}>{r.label}</span>
                          </div>
                        );})}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={labelStyle("confirm")}>Confirm Password</label>
                  <div style={{ ...inputStyle("confirm"), border: `1px solid ${mismatches ? "rgba(224,90,90,0.4)" : matches ? "rgba(61,171,122,0.4)" : focusedField === "confirm" ? "rgba(25,97,117,0.6)" : "rgba(255,255,255,0.06)"}` }}>
                    <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={mismatches ? "#E05A5A" : matches ? "#3DAB7A" : "#1E7A91"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <input type="password" value={passwordC} onChange={e => setPasswordC(e.target.value)} onFocus={() => setFocusedField("confirm")} onBlur={() => setFocusedField(null)} placeholder="••••••••••••" required style={{ width: "100%", padding: "13px 14px 13px 38px", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#F0F4F5", fontFamily: "'Inter', -apple-system, sans-serif", borderRadius: 12 }} />
                    {matches && (<div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3DAB7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>)}
                  </div>
                </div>

                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(224,90,90,0.08)", border: "1px solid rgba(224,90,90,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span style={{ fontSize: 12, color: "#E05A5A", fontFamily: "'Inter', -apple-system, sans-serif" }}>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading || !isValid || !matches || !firstName.trim() || !lastName.trim()} style={{ marginTop: 6, padding: "14px 24px", background: loading || !isValid || !matches || !firstName.trim() || !lastName.trim() ? "rgba(25,97,117,0.3)" : "#196175", border: "1px solid rgba(25,97,117,0.4)", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", cursor: loading || !isValid || !matches || !firstName.trim() || !lastName.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", letterSpacing: 0.2 }}>
                  {loading ? (<><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Creating account…</>) : (<>Create account<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>)}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                <span style={{ fontSize: 11, color: "#2D4A52", fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.08em" }}>Have an account?</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
              </div>
              <Link href="/sign-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, color: "#6B8A92", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", textDecoration: "none" }}>
                Sign in instead
              </Link>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 28, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px", background: "linear-gradient(135deg, rgba(25,97,117,0.2), rgba(25,97,117,0.05))", border: "1px solid rgba(25,97,117,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E7A91" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </div>
                <h1 style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 24, fontWeight: 500, color: "#F0F4F5", letterSpacing: -0.8, marginBottom: 8 }}>Check your inbox</h1>
                <p style={{ fontSize: 13, color: "#4A6B75", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
                  We sent a 6-digit code to<br /><span style={{ color: "#1E7A91", fontWeight: 500 }}>{email}</span>
                </p>
              </div>
              <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle("code")}>Verification code</label>
                  <div style={inputStyle("code")}>
                    <input type="text" value={code} onChange={e => setCode(e.target.value)} onFocus={() => setFocusedField("code")} onBlur={() => setFocusedField(null)} placeholder="000000" maxLength={6} required style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", outline: "none", fontSize: 24, color: "#F0F4F5", fontFamily: "'DM Mono','Courier New',monospace", letterSpacing: "0.3em", textAlign: "center", borderRadius: 12 }} />
                  </div>
                </div>
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(224,90,90,0.08)", border: "1px solid rgba(224,90,90,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span style={{ fontSize: 12, color: "#E05A5A", fontFamily: "'Inter', -apple-system, sans-serif" }}>{error}</span>
                  </div>
                )}
                <button type="submit" disabled={loading || code.length < 6} style={{ marginTop: 6, padding: "14px 24px", background: loading || code.length < 6 ? "rgba(25,97,117,0.3)" : "#196175", border: "1px solid rgba(25,97,117,0.4)", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', -apple-system, sans-serif", cursor: loading || code.length < 6 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
                  {loading ? (<><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Verifying…</>) : "Verify & continue"}
                </button>
                <button type="button" onClick={() => setStep("form")} style={{ background: "none", border: "none", color: "#3D5A62", fontSize: 12, fontFamily: "'Inter', -apple-system, sans-serif", cursor: "pointer", textAlign: "center", padding: 8 }}>Back to sign up</button>
              </form>
            </>
          )}

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "#2D4A52", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
            By continuing you agree to our <span style={{ color: "#3D6B75" }}>Terms</span> and <span style={{ color: "#3D6B75" }}>Privacy Policy</span>
          </p>
        </div>
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