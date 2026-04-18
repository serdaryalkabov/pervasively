"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ArrowLeft, ArrowRight, MoveRight } from "lucide-react";

type FormData = {
  name:           string;
  tagline:        string;
  targetAudience: string;
  keyFeatures:    string;
  platforms:      string[];
  examplePosts:   string[];
};

const PLATFORMS = [
  { value: "twitter",   label: "Twitter / X",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Z"/></svg> },
  { value: "instagram", label: "Instagram",    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></svg> },
  { value: "linkedin",  label: "LinkedIn",     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg> },
];

const TOTAL_STEPS = 5;

export function OnboardingClient() {
  const { user } = useUser();
  const router   = useRouter();
  const createProduct = useMutation(api.products.createProduct);
  const upsertUser    = useMutation(api.users.upsertUser);

  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState<FormData>({ name: "", tagline: "", targetAudience: "", keyFeatures: "", platforms: [], examplePosts: [""] });

  const update         = (field: keyof FormData, value: string | string[]) => setForm(prev => ({ ...prev, [field]: value }));
  const togglePlatform = (value: string) => setForm(prev => ({ ...prev, platforms: prev.platforms.includes(value) ? prev.platforms.filter(p => p !== value) : [...prev.platforms, value] }));
  const updatePost     = (i: number, val: string) => setForm(prev => { const posts = [...prev.examplePosts]; posts[i] = val; return { ...prev, examplePosts: posts }; });
  const addPost        = () => setForm(prev => prev.examplePosts.length < 3 ? { ...prev, examplePosts: [...prev.examplePosts, ""] } : prev);
  const removePost     = (i: number) => setForm(prev => ({ ...prev, examplePosts: prev.examplePosts.filter((_, idx) => idx !== i) }));

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.tagline.trim();
    if (step === 2) return form.targetAudience.trim();
    if (step === 3) return form.keyFeatures.trim();
    if (step === 4) return form.platforms.length > 0;
    return true;
  };

  const handleNext = () => { setError(""); if (step < TOTAL_STEPS) { setStep(s => s + 1); return; } handleSubmit(); };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true); setError("");
    try {
      const filledPosts = form.examplePosts.filter(p => p.trim());
      await upsertUser({ clerkId: user.id, email: user.emailAddresses[0]?.emailAddress ?? "", examplePosts: filledPosts });
      await createProduct({ userId: user.id, name: form.name, tagline: form.tagline, targetAudience: form.targetAudience, keyFeatures: form.keyFeatures, tone: "genz", platforms: form.platforms });
      router.replace("/dashboard");
    } catch { setError("Something went wrong. Please try again."); setSaving(false); }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, color: "#F0F4FF", fontSize: 13, fontFamily: "'Inter',sans-serif", fontWeight: 300,
    outline: "none",
  };
  const taStyle: React.CSSProperties = { ...inputStyle, resize: "none" as const };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "rgba(77,142,255,0.45)";
    e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(77,142,255,0.10)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
    e.currentTarget.style.boxShadow   = "none";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0D12; }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)} 25%{transform:translate(80px,60px) scale(1.05)} 50%{transform:translate(40px,120px) scale(.95)} 75%{transform:translate(-60px,50px) scale(1.08)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 20%{transform:translate(-90px,40px) scale(1.06)} 45%{transform:translate(-50px,-80px) scale(.96)} 70%{transform:translate(70px,-40px) scale(1.04)} 100%{transform:translate(0,0) scale(1)} }
        input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.18); }
        textarea { font-family:'Inter',sans-serif; }

        .glassy-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%);
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border-radius: 10px;
          border: 1px solid rgba(160,200,255,0.50);
          cursor: pointer;
          backdrop-filter: blur(24px) saturate(2);
          -webkit-backdrop-filter: blur(24px) saturate(2);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.35) inset,
            0 -1px 0 rgba(0,0,0,0.15) inset,
            0 4px 20px rgba(77,142,255,0.20);
          transition:
            transform 0.15s ease-out,
            box-shadow 0.15s ease-out,
            background 0.15s ease,
            opacity 0.15s ease;
        }
        .glassy-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .glassy-btn:hover:not(:disabled) {
          transform: scale(1.03);
          background: linear-gradient(160deg, rgba(140,185,255,0.55) 0%, rgba(70,125,250,0.70) 50%, rgba(45,100,220,0.80) 100%);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.40) inset,
            0 -1px 0 rgba(0,0,0,0.15) inset,
            0 2px 8px rgba(77,142,255,0.20),
            0 8px 24px rgba(77,142,255,0.22),
            0 20px 48px rgba(77,142,255,0.10);
        }
        .glassy-btn:hover::before { opacity: 0; }
        .glassy-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .platform-card {
          width:100%; display:flex; align-items:center; justify-content:space-between;
          padding:14px 18px; border-radius:12px; cursor:pointer; text-align:left;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          backdrop-filter:blur(12px);
          transition:background .15s, border-color .15s;
        }
        .platform-card:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.16); }
        .platform-card.active { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.20); box-shadow:none; }
        .add-example-btn {
          width:100%; padding:11px;
          background:none; border:1px dashed rgba(255,255,255,0.14);
          border-radius:10px; font-size:12px; color:rgba(255,255,255,0.25);
          cursor:pointer; transition:color 0.14s, border-color 0.14s;
          font-family:'Inter',sans-serif;
        }
        .add-example-btn:hover { color:rgba(255,255,255,0.65); border-color:rgba(255,255,255,0.30); }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0A0D12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "48px 16px" }}>

        <div style={{ position:"fixed", width:600, height:600, top:-150, left:-150, borderRadius:"50%", background:"rgba(77,142,255,0.14)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob1 18s ease-in-out infinite", willChange:"transform" }} />
        <div style={{ position:"fixed", width:500, height:500, bottom:-100, right:-100, borderRadius:"50%", background:"rgba(139,92,246,0.10)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob2 22s ease-in-out infinite", willChange:"transform" }} />
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.028, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize:"256px 256px" }} />

        <div style={{ position:"relative", zIndex:10, marginBottom:28 }}>
          <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:20, fontWeight:700, color:"#F0F4FF", letterSpacing:-0.5 }}>Pervasive<span style={{ color:"#4D8EFF" }}>ly</span></span>
        </div>

        <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:520 }}>
          <div style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(32px) saturate(1.8)", WebkitBackdropFilter:"blur(32px) saturate(1.8)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:24, padding:"36px 36px 32px", boxShadow:"0 8px 48px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.07) inset" }}>

            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"rgba(77,142,255,0.7)", fontFamily:"'Manrope',sans-serif" }}>Step {step} of {TOTAL_STEPS}</span>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.22)", fontFamily:"'Inter',sans-serif" }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height:2, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg, rgba(77,142,255,0.8), rgba(120,170,255,0.9))", borderRadius:2, transition:"width 0.5s cubic-bezier(0.25,0.46,0.45,0.94)" }} />
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:22, fontWeight:700, letterSpacing:-0.8, color:"#F0F4FF", marginBottom:6 }}>
                {step === 1 && "What's your product called?"}
                {step === 2 && "Who is it for?"}
                {step === 3 && "What does it do?"}
                {step === 4 && "Where do you post?"}
                {step === 5 && "Show us how you write"}
              </h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", lineHeight:1.65, fontFamily:"'Inter',sans-serif", fontWeight:300 }}>
                {step === 1 && "Give your product a name and a one-line pitch that captures what it does."}
                {step === 2 && "Describe your target audience: who they are and what problem your product solves."}
                {step === 3 && "List your key features. One per line works great — be specific, not generic."}
                {step === 4 && "Select all the platforms you want content generated for. You can change this later."}
                {step === 5 && "Paste 1\u20133 real posts you've written. We'll mirror your voice in every generation. Skip if you'd rather start fresh."}
              </p>
            </div>

            {step === 1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.35)", marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>Product Name</label>
                  <input type="text" value={form.name} onChange={e => update("name", e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Pervasively" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.35)", marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>Tagline</label>
                  <input type="text" value={form.tagline} onChange={e => update("tagline", e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Content engine for solopreneurs" style={inputStyle} />
                </div>
              </div>
            )}

            {step === 2 && (
              <textarea value={form.targetAudience} onChange={e => update("targetAudience", e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="e.g. Developer solopreneurs who build side projects but struggle to find time to market them consistently." rows={5} style={taStyle} />
            )}

            {step === 3 && (
              <textarea value={form.keyFeatures} onChange={e => update("keyFeatures", e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder={`e.g.\n- Generates a week of social posts in one click\n- Platform-native content for Twitter, Instagram, LinkedIn\n- Learns your brand voice over time\n- Usage-based credits, no monthly lock-in`} rows={7} style={taStyle} />
            )}

            {step === 4 && (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {PLATFORMS.map(p => {
                  const sel = form.platforms.includes(p.value);
                  return (
                    <button key={p.value} onClick={() => togglePlatform(p.value)} className={`platform-card${sel ? " active" : ""}`}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, color: sel ? "#F0F4FF" : "rgba(255,255,255,0.40)" }}>
                        <div style={{ width:30, height:30, borderRadius:8, background: sel ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)", border:`1px solid ${sel ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.08)"}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {p.icon}
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, fontFamily:"'Manrope',sans-serif" }}>{p.label}</span>
                      </div>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${sel ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.18)"}`, background: sel ? "rgba(255,255,255,0.70)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                        {sel && <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 5 && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {form.examplePosts.map((post, i) => (
                  <div key={i}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.10em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.28)", fontFamily:"'Manrope',sans-serif" }}>Example {i + 1}</span>
                      {form.examplePosts.length > 1 && (
                        <button onClick={() => removePost(i)} style={{ fontSize:11, color:"rgba(255,255,255,0.22)", background:"none", border:"none", cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.14s" }} onMouseEnter={e => (e.currentTarget.style.color = "#E05A5A")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}>Remove</button>
                      )}
                    </div>
                    <textarea value={post} onChange={e => updatePost(i, e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder={i === 0 ? "Paste a post you're proud of: anything from any platform..." : "Another example (optional)..."} rows={4} style={taStyle} />
                  </div>
                ))}
                {form.examplePosts.length < 3 && (
                  <button onClick={addPost} className="add-example-btn">+ Add another example</button>
                )}
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", textAlign:"center", fontFamily:"'Inter',sans-serif", paddingTop:4 }}>Optional — you can add or update examples later in Settings.</p>
              </div>
            )}

            {error && (
              <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:8, background:"rgba(224,90,90,0.07)", border:"1px solid rgba(224,90,90,0.20)", borderRadius:10, padding:"10px 14px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E05A5A" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize:12, color:"#E05A5A", fontFamily:"'Inter',sans-serif" }}>{error}</span>
              </div>
            )}

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:28 }}>
              <button onClick={() => setStep(s => s - 1)} disabled={step === 1} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:500, color: step === 1 ? "transparent" : "rgba(255,255,255,0.30)", background:"none", border:"none", cursor: step === 1 ? "default" : "pointer", fontFamily:"'Inter',sans-serif", transition:"color 0.14s", pointerEvents: step === 1 ? "none" : "auto" }} onMouseEnter={e => { if (step > 1) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }} onMouseLeave={e => { if (step > 1) e.currentTarget.style.color = "rgba(255,255,255,0.30)"; }}>
                <ArrowLeft size={13} /> Back
              </button>
              <button onClick={handleNext} disabled={!canProceed() || saving} className="glassy-btn">
                {saving ? "Saving\u2026" : step === TOTAL_STEPS ? <>Finish setup <MoveRight size={13} /></> : <>Continue <ArrowRight size={13} /></>}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}