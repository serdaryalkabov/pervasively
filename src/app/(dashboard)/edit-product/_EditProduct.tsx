"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { api } from "../../../../convex/_generated/api";
import { ChevronLeft } from "lucide-react";

type FormData = {
  name:           string;
  tagline:        string;
  targetAudience: string;
  keyFeatures:    string;
  tone:           string;
  platforms:      string[];
};

const TONES = [
  { value: "casual",         label: "Casual",         desc: "Friendly and relaxed" },
  { value: "professional",   label: "Professional",   desc: "Polished and formal" },
  { value: "technical",      label: "Technical",      desc: "Precise, developer-focused" },
  { value: "conversational", label: "Conversational", desc: "Natural, like talking to a friend" },
  { value: "genz",           label: "Gen Z",           desc: "Chronically online. Uncomfortably specific. Actually funny." },
];

const PLATFORMS = [
  { value: "twitter",   label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin",  label: "LinkedIn" },
];

const TOTAL_STEPS = 5;

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium tracking-widest text-[#1E7A91] uppercase mb-3">Edit · Step {step} of {TOTAL_STEPS}</p>
      <h2 className="text-2xl font-medium text-[#F0F4F5] tracking-tight mb-2">{title}</h2>
      <p className="text-sm text-[#6B8A92] leading-relaxed">{subtitle}</p>
    </div>
  );
}

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

  const [step, setStep]         = useState(1);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [initialised, setInitialised] = useState(false);
  const [form, setForm] = useState<FormData>({ name: "", tagline: "", targetAudience: "", keyFeatures: "", tone: "", platforms: [] });

  if (product && !initialised) {
    setForm({ name: product.name ?? "", tagline: product.tagline ?? "", targetAudience: product.targetAudience ?? "", keyFeatures: product.keyFeatures ?? "", tone: product.tone ?? "", platforms: product.platforms ?? [] });
    setInitialised(true);
  }

  const isLoading = products === undefined;

  const update = (field: keyof FormData, value: string | string[]) => setForm(prev => ({ ...prev, [field]: value }));
  const togglePlatform = (value: string) => setForm(prev => ({ ...prev, platforms: prev.platforms.includes(value) ? prev.platforms.filter(p => p !== value) : [...prev.platforms, value] }));

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.tagline.trim();
    if (step === 2) return form.targetAudience.trim();
    if (step === 3) return form.keyFeatures.trim();
    if (step === 4) return form.tone;
    if (step === 5) return form.platforms.length > 0;
    return false;
  };

  const handleNext = () => { setError(""); if (step < TOTAL_STEPS) { setStep(s => s + 1); return; } handleSubmit(); };

  const handleSubmit = async () => {
    if (!user || !product) return;
    setSaving(true); setError("");
    try {
      await updateProduct({ productId: product._id as Id<"products">, name: form.name, tagline: form.tagline, targetAudience: form.targetAudience, keyFeatures: form.keyFeatures, tone: form.tone, platforms: form.platforms });
      router.replace("/dashboard");
    } catch { setError("Something went wrong. Please try again."); setSaving(false); }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  if (isLoading) return (
    <div className="min-h-screen bg-[#080D10] flex items-center justify-center">
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(25,97,117,0.2)", borderTopColor: "#2AA5C0", animation: "spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!product) { router.replace("/onboarding"); return null; }

  return (
    <div className="min-h-screen bg-[#080D10] flex flex-col items-center justify-center px-4 py-12">

      {/* Top bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-10">
        {/* <div className="flex items-center gap-2.5">
          <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover", }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#F0F4F5", letterSpacing: -0.4 }}>Pervasively</span>
        </div> */}
        {/* <button onClick={() => router.push("/dashboard")} style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 500, color: "#3D5A62", background: "none", border: "none", cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")} onMouseLeave={e => (e.currentTarget.style.color = "#3D5A62")}><ChevronLeft style={{marginRight: 4}} size={13} /> Dashboard</button> */}
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-[#0C1417] border border-white/[0.07] rounded-2xl p-8">

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-[#196175] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {step === 1 && (
          <>
            <StepHeader step={1} title="What's your product called?" subtitle="Give your product a name and a one-line pitch that captures what it does." />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium tracking-widest text-[#6B8A92] uppercase mb-2">Product Name</label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Pervasively" className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition" />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-widest text-[#6B8A92] uppercase mb-2">Tagline</label>
                <input type="text" value={form.tagline} onChange={e => update("tagline", e.target.value)} placeholder="e.g. Content engine for solopreneurs" className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition" />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader step={2} title="Who is it for?" subtitle="Describe your target audience — who they are and what problem they have that your product solves." />
            <textarea value={form.targetAudience} onChange={e => update("targetAudience", e.target.value)} placeholder="e.g. Developer solopreneurs who build side projects but struggle to find time to market them consistently on social media." rows={5} className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition resize-none" />
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader step={3} title="What does it do?" subtitle="List your key features. One per line works great — be specific, not generic." />
            <textarea value={form.keyFeatures} onChange={e => update("keyFeatures", e.target.value)} placeholder={`e.g.\n- Generates a week of social posts in one click\n- Platform-native content for Twitter, Instagram, LinkedIn\n- Learns your brand voice over time\n- Usage-based credits, no monthly lock-in`} rows={7} className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition resize-none" />
          </>
        )}

        {step === 4 && (
          <>
            <StepHeader step={4} title="What's your tone?" subtitle="This shapes how every post sounds. Pick the one that feels most like you." />
            <div className="grid grid-cols-2 gap-3">
              {TONES.map(t => (
                <button key={t.value} onClick={() => update("tone", t.value)} className={`p-4 rounded-xl border text-left transition-all ${form.tone === t.value ? "border-[#196175] bg-[#196175]/10" : "border-white/[0.07] bg-[#101C20] hover:border-[#196175]/50"}`}>
                  <p className={`text-sm font-medium mb-1 ${form.tone === t.value ? "text-[#1E7A91]" : "text-[#F0F4F5]"}`}>{t.label}</p>
                  <p className="text-xs text-[#6B8A92]">{t.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <StepHeader step={5} title="Where do you post?" subtitle="Select all the platforms you want content generated for. You can change this later." />
            <div className="space-y-3">
              {PLATFORMS.map(p => {
                const selected = form.platforms.includes(p.value);
                return (
                  <button key={p.value} onClick={() => togglePlatform(p.value)} className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${selected ? "border-[#196175] bg-[#196175]/10" : "border-white/[0.07] bg-[#101C20] hover:border-[#196175]/50"}`}>
                    <span className={`text-sm font-medium ${selected ? "text-[#1E7A91]" : "text-[#F0F4F5]"}`}>{p.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-[#196175] bg-[#196175]" : "border-[#3D5A62]"}`}>
                      {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {error && <p className="mt-4 text-sm text-[#E05A5A] text-center">{error}</p>}

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 1} style={{display: 'flex', alignItems: 'center'}} className="text-sm text-[#6B8A92] hover:text-[#F0F4F5] disabled:opacity-0 transition"><ChevronLeft style={{marginRight: 4}} size={16} /> Back</button>
          <button onClick={handleNext} disabled={!canProceed() || saving} className="px-6 py-2.5 bg-[#196175] text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:bg-[#1E7A91] transition">
            {saving ? "Saving…" : step === TOTAL_STEPS ? "Save changes" : "Continue"}
          </button>
        </div>

      </div>
    </div>
  );
}

export function EditProductClient() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#080D10" }} />}>
      <EditProductInner />
    </Suspense>
  );
}