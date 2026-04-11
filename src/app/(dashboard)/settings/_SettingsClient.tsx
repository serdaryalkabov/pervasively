"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { ChevronLeft, MoveRight } from "lucide-react";

function AppNav({ credits, backLabel = "Dashboard", onBack, user, signOut }: {
  credits: number; backLabel?: string; onBack: () => void;
  user: any; signOut: (cb: () => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router_inner = useRef<any>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email    = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(8,13,16,0.85)", backdropFilter: "blur(20px)",
      padding: "0 28px", height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* Left: logo + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img src="/pervasively.jpg" alt="Pervasively" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "cover" }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#EDF2F4", letterSpacing: -0.3 }}>Pervasively</span>
        </div>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)" }} />
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#2E4A55", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s", letterSpacing: -0.1 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#8AABB5")}
          onMouseLeave={e => (e.currentTarget.style.color = "#2E4A55")}>
          <ChevronLeft size={13} />{backLabel}
        </button>
      </div>

      {/* Right: credits + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(12,20,23,0.9)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 100, padding: "5px 13px" }}>
          {/* <div style={{ width: 6, height: 6, borderRadius: "50%", background: credits > 0 ? "#2AA5C0" : "#2E4A55", boxShadow: "none" }} /> */}
          <span style={{ fontSize: 12, fontWeight: 500, color: credits > 0 ? "#C5D8DC" : "#3D5A62", letterSpacing: -0.1 }}>{credits} {credits === 1 ? "credit" : "credits"}</span>
        </div>

        <div ref={ref} style={{ position: "relative" }}>
          <button onClick={() => setOpen(o => !o)} style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#0e2028",
            border: open ? "1.5px solid rgba(42,165,192,0.7)" : "1.5px solid rgba(25,97,117,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.9)", cursor: "pointer",
            boxShadow: "none",
            transition: "all 0.16s", outline: "none",
          }}>{initials}</button>

          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, width: 228,
              background: "rgba(10,16,20,0.97)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, overflow: "hidden",
              backdropFilter: "blur(28px)", animation: "ddIn 0.14s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <style>{`
                @keyframes ddIn { from { opacity:0; transform:translateY(-5px) scale(0.97); } to { opacity:1; transform:none; } }
                .ddi { display:flex; align-items:center; gap:9px; padding:9px 14px; width:100%; background:none; border:none; cursor:pointer; font-family:'Inter',-apple-system,sans-serif; font-size:13px; font-weight:450; color:#7A9EAA; text-align:left; transition:background 0.1s,color 0.1s; }
                .ddi:hover { background:rgba(255,255,255,0.04); color:#E0EAED; }
                .ddi svg { opacity:0.5; flex-shrink:0; transition:opacity 0.1s; }
                .ddi:hover svg { opacity:0.85; }
                .ddi-red:hover { background:rgba(200,65,65,0.08) !important; color:#D87070 !important; }
              `}</style>
              <div style={{ padding: "13px 14px 11px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#E0EAED", letterSpacing: -0.1, marginBottom: 2 }}>{fullName}</div>
                <div style={{ fontSize: 11, color: "#2E4A55", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>
              </div>
              <div style={{ padding: "5px 0" }}>
                {([
                  { label: "Dashboard",        path: "/dashboard", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                  { label: "Billing & credits", path: "/billing",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
                  { label: "History",           path: "/history",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                  { label: "Settings",          path: "/settings", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { label: "Feedback",           path: "/feedback",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                ] as { label: string; path: string; icon: React.ReactNode }[]).map(({ label, path, icon }) => (
                  <button key={label} className="ddi" onClick={() => { (window.location.href = path); setOpen(false); }}>
                    {icon}{label}
                  </button>
                ))}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />
              <div style={{ padding: "5px 0 7px" }}>
                <button className="ddi ddi-red" onClick={() => signOut(() => window.location.href = "/sign-in")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E4A55", marginBottom: 12 }}>{title}</h2>
      <div style={{ background: "rgba(12,20,23,0.65)", border: "1px solid rgba(255,255,255,0.062)", borderRadius: 16, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function EditableRow({
  label, value, onSave, editable = true, last = false,
}: {
  label: string; value: string; onSave?: (val: string) => Promise<void>; editable?: boolean; last?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [input,   setInput]   = useState(value);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    if (!onSave || input.trim() === value) { setEditing(false); return; }
    setSaving(true); setError("");
    try {
      await onSave(input.trim());
      setEditing(false);
    } catch (e: any) {
      setError(e?.errors?.[0]?.longMessage ?? e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setInput(value); setEditing(false); setError(""); };

  return (
    <div style={{ padding: "14px 20px", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#3D5A62", fontWeight: 500, flexShrink: 0 }}>{label}</span>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              style={{ padding: "6px 11px", background: "rgba(8,13,16,0.8)", border: "1px solid rgba(42,165,192,0.3)", borderRadius: 8, color: "#EDF2F4", fontSize: 13, outline: "none", width: 200, fontFamily: "'Inter', sans-serif" }}
            />
            <button onClick={handleSave} disabled={saving} style={{ fontSize: 12, fontWeight: 500, color: "#fff", background: "rgba(25,97,117,0.5)", border: "1px solid rgba(42,165,192,0.3)", borderRadius: 7, padding: "6px 12px", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={handleCancel} style={{ fontSize: 12, fontWeight: 500, color: "#3D5A62", background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#8AABB5" }}>{value}</span>
            {editable && onSave && (
              <button
                onClick={() => { setInput(value); setEditing(true); }}
                style={{ fontSize: 11, fontWeight: 500, color: "#2E4A55", background: "none", border: "none", cursor: "pointer", transition: "color 0.13s", padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#2AA5C0")}
                onMouseLeave={e => (e.currentTarget.style.color = "#2E4A55")}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "#E07070", marginTop: 6, textAlign: "right" }}>{error}</p>}
    </div>
  );
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  instagram: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/></svg>,
  linkedin: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

export function SettingsClient() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const convexUser = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const products   = useQuery(api.products.getUserProducts, user ? { userId: user.id } : "skip");
  const product    = products?.[0];
  const credits    = convexUser?.credits ?? 0;
  const updateExamplePosts = useMutation(api.users.updateExamplePosts);

  const [examplePosts,    setExamplePosts]    = useState<string[]>([""]);
  const [examplesSaving,  setExamplesSaving]  = useState(false);
  const [examplesSaved,   setExamplesSaved]   = useState(false);
  const [examplesError,   setExamplesError]   = useState("");

  const isLoading = convexUser === undefined || products === undefined;

  // Seed example posts from DB once loaded
  useEffect(() => {
    if (convexUser?.examplePosts !== undefined) {
      const posts = convexUser.examplePosts as string[];
      setExamplePosts(posts.length > 0 ? posts : [""]);
    }
  }, [convexUser?.examplePosts]);

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "#080D10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid rgba(25,97,117,0.2)", borderTopColor: "#2AA5C0", animation: "spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";
  const email    = user?.emailAddresses[0]?.emailAddress ?? "—";
  const joinedAt = convexUser?.createdAt ? new Date(convexUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#080D10", fontFamily: "'Inter', -apple-system, sans-serif", color: "#F0F4F5" }}>

      {/* Ambient */}

      <AppNav credits={credits} onBack={() => router.push("/dashboard")} user={user} signOut={signOut} />

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          {/* <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#196175", marginBottom: 8 }}>Settings</p> */}
          <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.7, color: "#EDF2F4", marginBottom: 6 }}>Settings</h1>
          {/* <p style={{ fontSize: 14, color: "#3D5A62" }}>Manage your profile, platforms, and account.</p> */}
        </div>

        {/* ── Account info ── */}
        <Section title="Account">
          <EditableRow
            label="First name"
            value={user?.firstName ?? "—"}
            onSave={async val => { await user?.update({ firstName: val }); }}
          />
          <EditableRow
            label="Last name"
            value={user?.lastName ?? "—"}
            onSave={async val => { await user?.update({ lastName: val }); }}
          />
          <EditableRow
            label="Email"
            value={email}
            editable={false}
          />
          <EditableRow
            label="Member since"
            value={joinedAt}
            editable={false}
            last
          />
        </Section>

        {/* ── Connected platforms ── */}
        <Section title="Connected platforms">
          {product?.platforms && product.platforms.length > 0 ? (
            <>
              {product.platforms.map((p: string, i: number) => (
                <div key={p} style={{ padding: "14px 20px", borderBottom: i < product.platforms.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(25,97,117,0.12)", border: "1px solid rgba(42,165,192,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2AA5C0" }}>
                      {PLATFORM_ICONS[p]}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#8AABB5" }}>{PLATFORM_LABELS[p] ?? p}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2AA5C0" }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: "#2E4A55" }}>Active</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <button
                  onClick={() => router.push("/edit-product")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#2AA5C0", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.14s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#EDF2F4")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#2AA5C0")}
                >
                  Edit product brief <MoveRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#2E4A55" }}>No platforms connected yet.</p>
            </div>
          )}
        </Section>

        {/* ── Voice samples ── */}
        <Section title="Voice samples">
          <div style={{ padding: "20px 20px 8px" }}>
            <p style={{ fontSize: 13, color: "#3D5A62", lineHeight: 1.65, marginBottom: 20 }}>
              Paste 1–3 real posts you've written. Pervasively studies your sentence length, word choice, and topics to mirror your voice in every generation.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {examplePosts.map((post, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#2E4A55" }}>
                      Example {i + 1}
                    </span>
                    {examplePosts.length > 1 && (
                      <button
                        onClick={() => setExamplePosts(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ fontSize: 11, color: "#2E4A55", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.13s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#E07070")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#2E4A55")}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    value={post}
                    onChange={e => setExamplePosts(prev => { const next = [...prev]; next[i] = e.target.value; return next; })}
                    placeholder={i === 0 ? "Paste a post you're proud of: anything from any platform..." : "Another example (optional)..."}
                    rows={4}
                    style={{
                      width: "100%", padding: "11px 13px", boxSizing: "border-box",
                      background: "rgba(8,13,16,0.6)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10, color: "#EDF2F4", fontSize: 13, lineHeight: 1.65,
                      fontFamily: "'Inter', sans-serif", fontWeight: 300,
                      resize: "none", outline: "none", transition: "border-color 0.15s",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(42,165,192,0.35)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                  />
                </div>
              ))}
            </div>

            {examplePosts.length < 3 && (
              <button
                onClick={() => setExamplePosts(prev => [...prev, ""])}
                style={{
                  marginTop: 10, width: "100%", padding: "10px",
                  background: "none", border: "1px dashed rgba(255,255,255,0.08)",
                  borderRadius: 10, fontSize: 12, color: "#2E4A55",
                  cursor: "pointer", transition: "color 0.13s, border-color 0.13s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#2AA5C0"; e.currentTarget.style.borderColor = "rgba(42,165,192,0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#2E4A55"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                + Add another example
              </button>
            )}

            {examplesError && (
              <p style={{ fontSize: 12, color: "#E07070", marginTop: 10 }}>{examplesError}</p>
            )}
          </div>

          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: examplesSaved ? "#2AA5C0" : "transparent", transition: "color 0.2s" }}>
              Saved
            </span>
            <button
              onClick={async () => {
                if (!user) return;
                setExamplesSaving(true); setExamplesError(""); setExamplesSaved(false);
                try {
                  await updateExamplePosts({
                    clerkId: user.id,
                    examplePosts: examplePosts.filter(p => p.trim()),
                  });
                  setExamplesSaved(true);
                  setTimeout(() => setExamplesSaved(false), 2500);
                } catch (e: any) {
                  setExamplesError(e?.message ?? "Failed to save.");
                } finally {
                  setExamplesSaving(false);
                }
              }}
              disabled={examplesSaving}
              style={{
                fontSize: 13, fontWeight: 500, color: "#fff",
                background: "rgba(25,97,117,0.5)", border: "1px solid rgba(42,165,192,0.25)",
                borderRadius: 8, padding: "8px 20px", cursor: examplesSaving ? "not-allowed" : "pointer",
                opacity: examplesSaving ? 0.6 : 1, transition: "opacity 0.15s",
              }}
            >
              {examplesSaving ? "Saving…" : "Save voice samples"}
            </button>
          </div>
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Danger zone">
          <div style={{ padding: "18px 20px" }}>
            {!showDeleteConfirm ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#8AABB5", marginBottom: 3 }}>Delete account</p>
                  <p style={{ fontSize: 12, color: "#2E4A55", lineHeight: 1.5 }}>Permanently remove your account and all data. This cannot be undone.</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ fontSize: 12, fontWeight: 500, color: "#C07070", background: "rgba(200,65,65,0.07)", border: "1px solid rgba(200,65,65,0.18)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", flexShrink: 0, marginLeft: 16, transition: "all 0.14s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,65,65,0.13)"; (e.currentTarget.style.borderColor = "rgba(200,65,65,0.3)"); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = "rgba(200,65,65,0.07)"); (e.currentTarget.style.borderColor = "rgba(200,65,65,0.18)"); }}
                >
                  Delete account
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#C07070", marginBottom: 6 }}>Are you sure?</p>
                <p style={{ fontSize: 12, color: "#2E4A55", marginBottom: 14, lineHeight: 1.5 }}>
                  Type <span style={{ color: "#8AABB5", fontFamily: "monospace" }}>delete my account</span> to confirm.
                </p>
                <input
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="delete my account"
                  style={{ width: "100%", padding: "10px 14px", background: "rgba(8,13,16,0.7)", border: "1px solid rgba(200,65,65,0.25)", borderRadius: 10, color: "#EDF2F4", fontSize: 13, outline: "none", marginBottom: 12, fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                    style={{ fontSize: 12, fontWeight: 500, color: "#3D5A62", background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteInput !== "delete my account"}
                    onClick={() => signOut(() => router.replace("/"))}
                    style={{ fontSize: 12, fontWeight: 500, color: "#fff", background: deleteInput === "delete my account" ? "rgba(200,65,65,0.75)" : "rgba(200,65,65,0.2)", border: "1px solid rgba(200,65,65,0.3)", borderRadius: 8, padding: "8px 16px", cursor: deleteInput === "delete my account" ? "pointer" : "default", transition: "background 0.14s" }}
                  >
                    Permanently delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>

      </main>
    </div>
  );
}