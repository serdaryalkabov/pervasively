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
  tone:           string;
  platforms:      string[];
  examplePosts:   string[];
};

const TONES = [
  { value: "casual",         label: "Casual",         desc: "Friendly and relaxed" },
  { value: "professional",   label: "Professional",   desc: "Polished and formal" },
  { value: "technical",      label: "Technical",      desc: "Precise, developer-focused" },
  { value: "conversational", label: "Conversational", desc: "Natural, like talking to a friend" },
];

const PLATFORMS = [
  { value: "twitter",   label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin",  label: "LinkedIn" },
];

const TOTAL_STEPS = 6;

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold tracking-widest text-[#1E7A91] uppercase mb-3">Step {step} of {TOTAL_STEPS}</p>
      <h2 className="text-2xl font-bold text-[#F0F4F5] tracking-tight mb-2">{title}</h2>
      <p className="text-sm text-[#6B8A92] leading-relaxed">{subtitle}</p>
    </div>
  );
}

export function OnboardingClient() {
  const { user } = useUser();
  const router   = useRouter();
  const createProduct = useMutation(api.products.createProduct);
  const upsertUser    = useMutation(api.users.upsertUser);

  const [step, setStep]     = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm] = useState<FormData>({ name: "", tagline: "", targetAudience: "", keyFeatures: "", tone: "", platforms: [], examplePosts: [""] });

  const update = (field: keyof FormData, value: string | string[]) => setForm(prev => ({ ...prev, [field]: value }));
  const togglePlatform = (value: string) => setForm(prev => ({ ...prev, platforms: prev.platforms.includes(value) ? prev.platforms.filter(p => p !== value) : [...prev.platforms, value] }));
  const updateExamplePost = (index: number, value: string) => setForm(prev => { const posts = [...prev.examplePosts]; posts[index] = value; return { ...prev, examplePosts: posts }; });
  const addExamplePost = () => setForm(prev => prev.examplePosts.length < 3 ? { ...prev, examplePosts: [...prev.examplePosts, ""] } : prev);
  const removeExamplePost = (index: number) => setForm(prev => ({ ...prev, examplePosts: prev.examplePosts.filter((_, i) => i !== index) }));

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.tagline.trim();
    if (step === 2) return form.targetAudience.trim();
    if (step === 3) return form.keyFeatures.trim();
    if (step === 4) return form.tone;
    if (step === 5) return form.platforms.length > 0;
    if (step === 6) return true; // example posts are optional
    return false;
  };

  const handleNext = () => { setError(""); if (step < TOTAL_STEPS) { setStep(s => s + 1); return; } handleSubmit(); };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true); setError("");
    try {
      const filledPosts = form.examplePosts.filter(p => p.trim());
      await upsertUser({ clerkId: user.id, email: user.emailAddresses[0]?.emailAddress ?? "", examplePosts: filledPosts });
      await createProduct({ userId: user.id, name: form.name, tagline: form.tagline, targetAudience: form.targetAudience, keyFeatures: form.keyFeatures, tone: form.tone, platforms: form.platforms });
      router.replace("/dashboard");
    } catch { setError("Something went wrong. Please try again."); setSaving(false); }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#080D10] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 15, color: "#F0F4F5", letterSpacing: -0.4 }}>Pervasively</span>
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
                <label className="block text-xs font-semibold tracking-widest text-[#6B8A92] uppercase mb-2">Product Name</label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Pervasively" className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest text-[#6B8A92] uppercase mb-2">Tagline</label>
                <input type="text" value={form.tagline} onChange={e => update("tagline", e.target.value)} placeholder="e.g. Content engine for solopreneurs" className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition" />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader step={2} title="Who is it for?" subtitle="Describe your target audience: who they are and what problem they have that your product solves." />
            <textarea value={form.targetAudience} onChange={e => update("targetAudience", e.target.value)} placeholder="e.g. Developer solopreneurs who build side projects but struggle to find time to market them consistently on social media." rows={5} className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition resize-none" />
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader step={3} title="What does it do?" subtitle="List your key features. One per line works great: be specific, not generic." />
            <textarea value={form.keyFeatures} onChange={e => update("keyFeatures", e.target.value)} placeholder={`e.g.\n- Generates a week of social posts in one click\n- Platform-native content for Twitter, Instagram, LinkedIn\n- Learns your brand voice over time\n- Usage-based credits, no monthly lock-in`} rows={7} className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition resize-none" />
          </>
        )}

        {step === 4 && (
          <>
            <StepHeader step={4} title="What's your tone?" subtitle="This shapes how every post sounds. Pick the one that feels most like you." />
            <div className="grid grid-cols-2 gap-3">
              {TONES.map(t => (
                <button key={t.value} onClick={() => update("tone", t.value)} className={`p-4 rounded-xl border text-left transition-all ${form.tone === t.value ? "border-[#196175] bg-[#196175]/10" : "border-white/[0.07] bg-[#101C20] hover:border-[#196175]/50"}`}>
                  <p className={`text-sm font-semibold mb-1 ${form.tone === t.value ? "text-[#1E7A91]" : "text-[#F0F4F5]"}`}>{t.label}</p>
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
                    <span className={`text-sm font-semibold ${selected ? "text-[#1E7A91]" : "text-[#F0F4F5]"}`}>{p.label}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "border-[#196175] bg-[#196175]" : "border-[#3D5A62]"}`}>
                      {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <StepHeader step={6} title="Show us how you write" subtitle="Paste 1–3 real posts you've written. We'll study your voice: word choice, sentence length, what you tend to talk about — and mirror it in every generation. Skip if you'd rather start fresh." />
            <div className="space-y-4">
              {form.examplePosts.map((post, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold tracking-widest text-[#6B8A92] uppercase">Example Post {i + 1}</label>
                    {form.examplePosts.length > 1 && (
                      <button onClick={() => removeExamplePost(i)} className="text-xs text-[#3D5A62] hover:text-[#E05A5A] transition">Remove</button>
                    )}
                  </div>
                  <textarea
                    value={post}
                    onChange={e => updateExamplePost(i, e.target.value)}
                    placeholder={i === 0 ? "Paste a post you're proud of: anything from any platform..." : "Another example (optional)..."}
                    rows={4}
                    className="w-full bg-[#101C20] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-[#F0F4F5] placeholder-[#3D5A62] outline-none focus:border-[#196175] focus:ring-1 focus:ring-[#196175]/30 transition resize-none"
                  />
                </div>
              ))}
              {form.examplePosts.length < 3 && (
                <button onClick={addExamplePost} className="w-full py-3 rounded-xl border border-dashed border-[#196175]/40 text-sm text-[#6B8A92] hover:border-[#196175] hover:text-[#1E7A91] transition">
                  + Add another example
                </button>
              )}
              <p className="text-xs text-[#3D5A62] text-center pt-1">This step is optional: you can add or update examples later in Settings.</p>
            </div>
          </>
        )}

        {error && <p className="mt-4 text-sm text-[#E05A5A] text-center">{error}</p>}

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="flex items-center gap-1.5 text-sm text-[#6B8A92] hover:text-[#F0F4F5] disabled:opacity-0 transition"><ArrowLeft size={14} />Back</button>
          <button onClick={handleNext} disabled={!canProceed() || saving} className="flex items-center gap-1.5 px-6 py-2.5 bg-[#196175] text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-[#1E7A91] transition">
            {saving ? "Saving…" : step === TOTAL_STEPS ? <>Finish setup <MoveRight size={14} /></> : <>Continue <ArrowRight size={14} /></>}
          </button>
        </div>

      </div>
    </div>
  );
}