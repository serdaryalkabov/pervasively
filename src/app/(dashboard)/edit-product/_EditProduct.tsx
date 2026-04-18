"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { api } from "../../../../convex/_generated/api";

type FormData = {
  name:           string;
  tagline:        string;
  targetAudience: string;
  keyFeatures:    string;
  platforms:      string[];
};

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

const PLATFORMS = [
  { value: "twitter",   label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin",  label: "LinkedIn" },
];

const TOTAL_STEPS = 4;

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom:32 }}>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:T.blue, marginBottom:10, fontFamily:"'Manrope',sans-serif" }}>
        Edit · Step {step} of {TOTAL_STEPS}
      </p>
      <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(20px,3vw,26px)", fontWeight:600, color:T.text, letterSpacing:-0.8, marginBottom:8, lineHeight:1.15 }}>{title}</h2>
      <p style={{ fontSize:14, color:T.muted, lineHeight:1.7, fontFamily:"'Inter',sans-serif", fontWeight:300 }}>{subtitle}</p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:"100%",
  background:"rgba(255,255,255,0.04)",
  border:`1px solid ${T.border}`,
  borderRadius:12, padding:"13px 16px",
  fontSize:14, color:T.text, fontWeight:300,
  fontFamily:"'Inter',sans-serif",
  outline:"none",
  transition:"border-color 0.15s, box-shadow 0.15s",
  boxSizing:"border-box",
};

function EditProductInner() {
  const { user } = useUser();
  const router   = useRouter();
  const updateProduct = useMutation(api.products.updateProduct);
  const searchParams  = useSearchParams();
  const productId     = searchParams.get("id");
  const products      = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");
  const product       = productId
    ? products?.find((p: any) => p._id === productId) ?? products?.[0]
    : products?.[0];

  const [step, setStep]             = useState(1);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [initialised, setInitialised] = useState(false);
  const [form, setForm] = useState<FormData>({ name:"", tagline:"", targetAudience:"", keyFeatures:"", platforms:[] });

  if (product && !initialised) {
    setForm({ name: product.name ?? "", tagline: product.tagline ?? "", targetAudience: product.targetAudience ?? "", keyFeatures: product.keyFeatures ?? "", platforms: product.platforms ?? [] });
    setInitialised(true);
  }

  const isLoading = products === undefined;
  const update = (field: keyof FormData, value: string | string[]) => setForm(prev => ({ ...prev, [field]: value }));
  const togglePlatform = (value: string) => setForm(prev => ({ ...prev, platforms: prev.platforms.includes(value) ? prev.platforms.filter(p => p !== value) : [...prev.platforms, value] }));

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.tagline.trim();
    if (step === 2) return form.targetAudience.trim();
    if (step === 3) return form.keyFeatures.trim();
    if (step === 4) return form.platforms.length > 0;
    return false;
  };

  const handleNext = () => { setError(""); if (step < TOTAL_STEPS) { setStep(s => s + 1); return; } handleSubmit(); };

  const handleSubmit = async () => {
    if (!user || !product) return;
    setSaving(true); setError("");
    try {
      await updateProduct({ productId: product._id as Id<"products">, name: form.name, tagline: form.tagline, targetAudience: form.targetAudience, keyFeatures: form.keyFeatures, tone: "genz", platforms: form.platforms });
      router.replace("/dashboard");
    } catch { setError("Something went wrong. Please try again."); setSaving(false); }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  if (isLoading) return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:22, height:22, borderRadius:"50%", border:"2px solid rgba(77,142,255,0.15)", borderTopColor:T.blue, animation:"spin 0.75s linear infinite" }} />
    </div>
  );
  if (!product) { router.replace("/onboarding"); return null; }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", fontFamily:"'Inter',sans-serif", color:T.text, overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)}25%{transform:translate(80px,60px) scale(1.05)}50%{transform:translate(40px,120px) scale(0.95)}75%{transform:translate(-60px,50px) scale(1.08)}100%{transform:translate(0,0) scale(1)} }
        .noise-bg { position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.028; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-size:256px 256px; }
        input::placeholder, textarea::placeholder { color:${T.muted2}; }
        input:focus, textarea:focus { outline:none; border-color:rgba(77,142,255,0.45) !important; box-shadow:0 0 0 3px rgba(77,142,255,0.08) !important; }
        input, textarea { font-family:'Inter',sans-serif; }
      `}</style>

      <div className="noise-bg" />
      <div style={{ position:"fixed", top:-200, left:"30%", width:460, height:460, borderRadius:"50%", background:"radial-gradient(circle, rgba(77,142,255,0.07) 0%, transparent 70%)", filter:"blur(80px)", pointerEvents:"none", zIndex:0, animation:"blob1 22s ease-in-out infinite" }} />

      <a href="/dashboard" style={{ fontFamily:"'Manrope',sans-serif", fontSize:20, fontWeight:600, color:T.text, textDecoration:"none", letterSpacing:-0.5, marginBottom:32, position:"relative", zIndex:1 }}>
        Pervasive<span style={{ color:T.blue }}>ly</span>
      </a>

      <div style={{ width:"100%", maxWidth:520, background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px) saturate(1.6)", WebkitBackdropFilter:"blur(20px) saturate(1.6)", border:`1px solid ${T.border}`, borderRadius:24, padding:36, boxShadow:"0 4px 40px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset", position:"relative", zIndex:1, animation:"fadeUp 0.4s ease-out both" }}>

        <div style={{ width:"100%", height:2, background:"rgba(255,255,255,0.05)", borderRadius:2, marginBottom:32, overflow:"hidden" }}>
          <div style={{ height:"100%", background:T.blue, borderRadius:2, transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)", width:`${progress}%`, boxShadow:"0 0 8px rgba(77,142,255,0.6)" }} />
        </div>

        {step === 1 && (
          <>
            <StepHeader step={1} title="What's your product called?" subtitle="Give your product a name and a one-line pitch that captures what it does." />
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:T.muted2, marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>Product Name</label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Pervasively" style={inputStyle} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:10, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", color:T.muted2, marginBottom:8, fontFamily:"'Manrope',sans-serif" }}>Tagline</label>
                <input type="text" value={form.tagline} onChange={e => update("tagline", e.target.value)} placeholder="e.g. Content engine for solopreneurs" style={inputStyle} />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader step={2} title="Who is it for?" subtitle="Describe your target audience — who they are and what problem they have that your product solves." />
            <textarea value={form.targetAudience} onChange={e => update("targetAudience", e.target.value)} placeholder="e.g. Developer solopreneurs who build side projects but struggle to find time to market them consistently on social media." rows={5} style={{ ...inputStyle, resize:"none", lineHeight:1.65 }} />
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader step={3} title="What does it do?" subtitle="List your key features. One per line works great — be specific, not generic." />
            <textarea value={form.keyFeatures} onChange={e => update("keyFeatures", e.target.value)} placeholder={`e.g.\n- Generates a week of social posts in one click\n- Platform-native content for Twitter, Instagram, LinkedIn\n- Learns your brand voice over time\n- Usage-based credits, no monthly lock-in`} rows={7} style={{ ...inputStyle, resize:"none", lineHeight:1.65 }} />
          </>
        )}

        {step === 4 && (
          <>
            <StepHeader step={4} title="Where do you post?" subtitle="Select all the platforms you want content generated for. You can change this later." />
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {PLATFORMS.map(p => {
                const selected = form.platforms.includes(p.value);
                return (
                  <button
                    key={p.value}
                    onClick={() => togglePlatform(p.value)}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"16px 20px", borderRadius:14,
                      border:`1px solid ${selected ? "rgba(255,255,255,0.18)" : T.border}`,
                      background: selected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                      cursor:"pointer", transition:"border-color 0.14s, background 0.14s",
                    }}
                    onMouseEnter={e => { if (!selected) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.16)"; } }}
                    onMouseLeave={e => { if (!selected) { (e.currentTarget as HTMLButtonElement).style.borderColor = T.border; } }}
                  >
                    <span style={{ fontSize:14, fontWeight:600, color: selected ? T.text : T.muted, fontFamily:"'Manrope',sans-serif", letterSpacing:-0.2 }}>{p.label}</span>
                    <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${selected ? "rgba(255,255,255,0.70)" : T.muted2}`, background: selected ? "rgba(255,255,255,0.70)" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.14s", flexShrink:0 }}>
                      {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {error && <p style={{ marginTop:16, fontSize:13, color:"#E05A5A", textAlign:"center", fontFamily:"'Inter',sans-serif" }}>{error}</p>}

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:32 }}>
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            style={{
              display:"flex", alignItems:"center", gap:5,
              fontSize:13, fontWeight:500, color:T.muted2,
              background:"none", border:"none", cursor: step === 1 ? "default" : "pointer",
              opacity: step === 1 ? 0 : 1, transition:"color 0.15s",
              fontFamily:"'Inter',sans-serif",
            }}
            onMouseEnter={e => { if (step > 1) (e.currentTarget as HTMLButtonElement).style.color = T.muted; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = T.muted2; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"11px 24px",
              background: canProceed() && !saving
                ? "linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)"
                : "rgba(255,255,255,0.04)",
              border: canProceed() && !saving
                ? "1px solid rgba(160,200,255,0.50)"
                : `1px solid ${T.border}`,
              borderRadius:10,
              color: canProceed() && !saving ? "#ffffff" : T.muted2,
              fontSize:13, fontWeight:600,
              cursor: !canProceed() || saving ? "not-allowed" : "pointer",
              backdropFilter:"blur(24px) saturate(2)",
              WebkitBackdropFilter:"blur(24px) saturate(2)",
              boxShadow: canProceed() && !saving
                ? "0 1px 0 rgba(255,255,255,0.35) inset, 0 -1px 0 rgba(0,0,0,0.15) inset, 0 4px 20px rgba(77,142,255,0.20)"
                : "none",
              transition:"transform 0.15s ease-out, box-shadow 0.15s ease-out, background 0.15s ease",
              opacity: saving ? 0.7 : 1,
              fontFamily:"'Manrope',sans-serif",
            }}
            onMouseEnter={e => { if (canProceed() && !saving) { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(160deg, rgba(140,185,255,0.55) 0%, rgba(70,125,250,0.70) 50%, rgba(45,100,220,0.80) 100%)"; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; if (canProceed() && !saving) (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.62) 50%, rgba(37,90,210,0.72) 100%)"; }}
          >
            {saving ? (
              <>
                <div style={{ width:13, height:13, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", animation:"spin 0.7s linear infinite" }} />
                Saving\u2026
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                Save changes
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </>
            ) : (
              <>
                Continue
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditProductClient() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#0A0D12" }} />}>
      <EditProductInner />
    </Suspense>
  );
}