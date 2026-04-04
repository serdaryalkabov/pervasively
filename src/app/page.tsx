"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrolled, setScrolled]         = useState(false);
  const threeLoaded = useRef(false);

  // Nav scroll effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.10 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Three.js icosahedron
  const initThree = () => {
    if (threeLoaded.current) return;
    const canvas = canvasRef.current;
    if (!canvas || !(window as any).THREE) return;
    threeLoaded.current = true;
    const THREE = (window as any).THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(150, 150);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.5);
    const geo = new THREE.IcosahedronGeometry(1.35, 1);
    const mat = new THREE.MeshPhongMaterial({ color: 0x196175, emissive: 0x0a2f3a, specular: 0x2AA5C0, shininess: 100, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x2AA5C0, wireframe: true, transparent: true, opacity: 0.38 });
    const wire = new THREE.Mesh(geo, wireMat);
    scene.add(wire);
    const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x2AA5C0, transparent: true, opacity: 0.15 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);
    scene.add(new THREE.AmbientLight(0x196175, 1.2));
    const p1 = new THREE.PointLight(0x2AA5C0, 2.5, 10); p1.position.set(3, 3, 3); scene.add(p1);
    const p2 = new THREE.PointLight(0x196175, 1.5, 10); p2.position.set(-3, -2, -2); scene.add(p2);
    let t = 0;
    (function animate() {
      requestAnimationFrame(animate);
      t += 0.011;
      mesh.rotation.x = t * 0.38; mesh.rotation.y = t * 0.58;
      wire.rotation.x = t * 0.38; wire.rotation.y = t * 0.58;
      mesh.position.y = Math.sin(t * 0.75) * 0.09;
      wire.position.y = mesh.position.y;
      core.rotation.y = -t * 0.28;
      renderer.render(scene, camera);
    })();
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" onLoad={initThree} />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --teal: #196175; --teal-light: #1E7A91; --teal-bright: #2AA5C0;
          --teal-dim: rgba(25,97,117,0.08); --teal-dim2: rgba(25,97,117,0.14);
          --bg: #080D10; --bg2: #0C1417; --bg3: #101C20; --bg4: #0E1A1E;
          --border: rgba(255,255,255,0.06); --border-teal: rgba(25,97,117,0.30); --border-teal2: rgba(42,165,192,0.25);
          --text: #F0F4F5; --muted: #6B8A92; --muted2: #3D5A62;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-weight: 300; overflow-x: hidden; }
        body::before { content:''; position:fixed; inset:0; background-image:radial-gradient(rgba(25,97,117,0.18) 1px,transparent 1px); background-size:28px 28px; pointer-events:none; z-index:0; }
        body::after { content:''; position:fixed; top:-100px; left:50%; transform:translateX(-50%); width:900px; height:700px; background:radial-gradient(ellipse at 50% 0%,rgba(25,97,117,0.22) 0%,transparent 65%); pointer-events:none; z-index:0; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .reveal { opacity:0; transform:translateY(28px); transition:opacity .65s,transform .65s; }
        .reveal.visible { opacity:1; transform:none; }
        .reveal-d1 { transition-delay:.1s; }
        .reveal-d2 { transition-delay:.2s; }
        .reveal-d3 { transition-delay:.3s; }
        h1 { font-family:'Manrope',sans-serif; font-size:clamp(36px,4.8vw,64px); font-weight:800; line-height:1.0; letter-spacing:-3px; color:var(--text); text-align:center; }
        h2 { font-family:'Manrope',sans-serif; font-size:clamp(32px,4vw,52px); font-weight:800; letter-spacing:-1.8px; line-height:1.1; color:var(--text); margin-bottom:56px; }
        .accent { color:var(--teal-bright); }
        .stat-bar-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,var(--teal),var(--teal-bright)); transform:scaleX(0); transform-origin:left; transition:transform 1.2s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible .stat-bar-fill { transform:scaleX(1); }
        .step::after { content:attr(data-num); position:absolute; right:-10px; bottom:-20px; font-family:'Manrope',sans-serif; font-size:120px; font-weight:800; color:rgba(25,97,117,0.04); letter-spacing:-4px; pointer-events:none; line-height:1; }
        .faq-a { font-size:14px; color:var(--muted); line-height:1.75; max-height:0; overflow:hidden; transition:max-height .4s ease,padding .3s; }
        .faq-open .faq-a { max-height:200px; padding-top:14px; }
        .faq-icon { transition:transform .3s; }
        .faq-open .faq-icon { transform:rotate(45deg); }
        .platform-card:hover::after { transform:scale(1.5); }
        .feature-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(25,97,117,0.05) 0%,transparent 60%); opacity:0; transition:opacity .3s; }
        .feature-card:hover::before { opacity:1; }
        @media(max-width:768px){
          .nav-links-wrap { display:none !important; }
          .stats-grid { grid-template-columns:1fr !important; }
          .stat { border-right:none !important; border-bottom:1px solid var(--border) !important; padding:40px 24px !important; }
          .section { padding:64px 24px !important; }
          .steps-grid,.platforms-grid,.testimonials-grid { grid-template-columns:1fr !important; }
          .pricing-header,.pricing-cta-row { grid-template-columns:1fr !important; }
          .pt-col,.pt-cta-cell { border-right:none !important; border-bottom:1px solid var(--border) !important; }
          .pt-cta-row-wrap { display:none !important; }
          .mobile-cta-row { display:block !important; }
          .cta-banner-inner { flex-direction:column !important; }
          .cta-right { min-width:0 !important; width:100% !important; }
          footer { flex-direction:column !important; gap:16px !important; padding:24px !important; text-align:center !important; }
          .footer-right { align-items:center !important; }
          .problem-banner { grid-template-columns:1fr !important; margin:0 24px !important; gap:32px !important; padding:40px 32px !important; }
          .problem-divider { display:none !important; }
          .form-row { flex-direction:column !important; }
          .form-row input { border-bottom:1px solid var(--border-teal2) !important; border-radius:12px 12px 0 0 !important; }
          .form-row button { border-radius:0 0 12px 12px !important; text-align:center !important; }
          .features-grid { grid-template-columns:1fr !important; }
          .feature-large { grid-column:span 1 !important; grid-template-columns:1fr !important; }
          .hero-section { padding:80px 24px 40px !important; }
          nav { padding:0 24px !important; }
        }
      `}</style>

      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 56px", height:68, borderBottom:`1px solid ${scrolled ? "rgba(255,255,255,0.06)" : "transparent"}`, background: scrolled ? "rgba(8,13,16,0.85)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", transition:"all .3s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:40 }}>
          <a href="#" style={{ fontFamily:"'Manrope',sans-serif", fontSize:19, fontWeight:800, color:"var(--text)", textDecoration:"none", letterSpacing:-0.5 }}>Pervasive<span style={{ color:"var(--teal-bright)" }}>ly</span></a>
          <ul className="nav-links-wrap" style={{ display:"flex", alignItems:"center", gap:28, listStyle:"none" }}>
            <li><a onClick={() => scrollTo("how")} style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:400, color:"var(--muted)", textDecoration:"none", cursor:"pointer" }}>How it works</a></li>
            <li><a onClick={() => scrollTo("platforms")} style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:400, color:"var(--muted)", textDecoration:"none", cursor:"pointer" }}>Platforms</a></li>
            <li><a onClick={() => scrollTo("pricing")} style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:400, color:"var(--muted)", textDecoration:"none", cursor:"pointer" }}>Pricing</a></li>
          </ul>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/sign-in" style={{ fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:700, color:"#fff", background:"var(--teal)", border:"none", borderRadius:8, padding:"9px 20px", cursor:"pointer", textDecoration:"none" }}>Sign in →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"88px 56px 40px", overflow:"hidden", zIndex:1, textAlign:"center" }}>
        <div style={{ maxWidth:760, position:"relative", display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div style={{ opacity:0, animation:"fadeUp .6s .22s forwards", display:"flex", flexDirection:"column", alignItems:"center", gap:4, marginBottom:18 }}>
            <canvas ref={canvasRef} style={{ width:150, height:150, filter:"drop-shadow(0 0 40px rgba(42,165,192,0.25))" }} />
            <h1>Your product<br />deserves to be<br /><span className="accent">seen.</span></h1>
          </div>
          <p style={{ fontSize:16, fontWeight:300, lineHeight:1.65, color:"var(--muted)", maxWidth:500, marginBottom:28, opacity:0, animation:"fadeUp .6s .36s forwards", textAlign:"center" }}>
            Pervasively turns your product knowledge into a full week of platform-ready content — Twitter/X, Instagram, LinkedIn — in under 10 minutes. No prompting. No guessing. Just post.
          </p>
          <div style={{ opacity:0, animation:"fadeUp .6s .5s forwards", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
            <Link href="/sign-up" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", background:"var(--teal)", color:"#fff", textDecoration:"none", fontFamily:"'Manrope',sans-serif", fontSize:14, fontWeight:700, borderRadius:12, letterSpacing:0.02, boxShadow:"0 4px 24px rgba(25,97,117,0.4), inset 0 1px 0 rgba(255,255,255,0.1)", transition:"background .2s,transform .15s" }}>
              Start for free →
            </Link>
            <p style={{ fontSize:12, color:"var(--muted2)", display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>3 free credits · No card required</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-grid" style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"repeat(3,1fr)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        {[
          { num:"10", unit:"min", label:"From login to a full week\nof scheduled content", w:"75%" },
          { num:"3",  unit:"×",   label:"Platforms covered in\na single generation", w:"55%" },
          { num:"0",  unit:"hrs", label:"Repeated setup after\nyour first product brief", w:"30%" },
        ].map((s, i) => (
          <div key={i} className={`stat reveal${i > 0 ? ` reveal-d${i}` : ""}`} style={{ padding:"52px 56px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:52, fontWeight:800, letterSpacing:-2.5, color:"var(--text)", lineHeight:1, marginBottom:8 }}>{s.num}<span style={{ color:"var(--teal-bright)" }}>{s.unit}</span></div>
            <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>{s.label.split("\n").map((l, j) => <span key={j}>{l}{j === 0 && <br />}</span>)}</div>
            <div style={{ marginTop:20, height:2, background:"var(--border)", borderRadius:2, overflow:"hidden" }}><div className="stat-bar-fill" style={{ width: s.w } as any} /></div>
          </div>
        ))}
      </div>

      {/* PROBLEM / SOLUTION */}
      <section className="section" style={{ position:"relative", zIndex:1, padding:"100px 56px" }}>
        <div className="problem-banner reveal" style={{ position:"relative", border:"1px solid var(--border)", borderRadius:20, background:"var(--bg2)", padding:"52px 64px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, overflow:"hidden" }}>
          <div style={{ position:"absolute", left:-60, top:-60, width:300, height:300, background:"radial-gradient(circle,rgba(25,97,117,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div className="problem-divider" style={{ width:1, background:"var(--border)", position:"absolute", top:52, bottom:52, left:"50%", transform:"translateX(-50%)" }} />
          <div>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14, display:"flex", alignItems:"center", gap:8, color:"#9C6060" }}>
              <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#9C6060" }} />The problem
            </div>
            <h3 style={{ fontFamily:"'Manrope',sans-serif", fontSize:22, fontWeight:800, letterSpacing:-0.5, marginBottom:16, color:"var(--text)" }}>You're shipping. Nobody knows.</h3>
            <p style={{ fontSize:15, color:"var(--muted)", lineHeight:1.7 }}>Indie developers spend weeks building great tools, then stay invisible because content creation feels like a full-time job. A blank page, a blinking cursor, and no idea where to start.</p>
          </div>
          <div>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14, display:"flex", alignItems:"center", gap:8, color:"var(--teal-bright)" }}>
              <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--teal-bright)" }} />The solution
            </div>
            <h3 style={{ fontFamily:"'Manrope',sans-serif", fontSize:22, fontWeight:800, letterSpacing:-0.5, marginBottom:16, color:"var(--text)" }}>Your product becomes content.</h3>
            <p style={{ fontSize:15, color:"var(--muted)", lineHeight:1.7 }}>Tell us what you built once. Pervasively generates a full week of platform-native posts across Twitter, LinkedIn, and Instagram — tuned for each channel, in under 10 minutes.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how" style={{ position:"relative", zIndex:1, padding:"0 56px 100px" }}>
        <div className="section-eyebrow reveal" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:20, height:1, background:"var(--teal-bright)" }} />
          <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--teal-bright)" }}>How it works</span>
        </div>
        <h2 className="reveal">Three steps.<br /><span className="accent">Ten minutes.</span></h2>
        <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"var(--border)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden" }}>
          {[
            { num:"1", idx:"STEP 01", icon:<svg viewBox="0 0 24 24" style={{ width:20, height:20, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>, title:"Tell us your product", desc:"Fill in your product brief once — name, audience, origin story, tone. This becomes your permanent content DNA. You never repeat yourself.", time:"~15 minutes, one time only", delay:"" },
            { num:"2", idx:"STEP 02", icon:<svg viewBox="0 0 24 24" style={{ width:20, height:20, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, title:"Generate a full week", desc:"One click. A complete batch of platform-native posts — right format, tone, length, and structure for each channel. No prompting required.", time:"~30 seconds per batch", delay:" reveal-d1" },
            { num:"3", idx:"STEP 03", icon:<svg viewBox="0 0 24 24" style={{ width:20, height:20, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>, title:"Review & schedule", desc:"Scan, approve, tweak, or regenerate any post with a click. Schedule directly to your connected platforms. Done for the week.", time:"~8 minutes per week", delay:" reveal-d2" },
          ].map(s => (
            <div key={s.num} className={`step reveal${s.delay}`} data-num={s.num} style={{ background:"var(--bg)", padding:"44px 36px", transition:"background .3s", position:"relative", overflow:"hidden" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}>
              <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", color:"var(--teal-bright)", marginBottom:20 }}>{s.idx}</div>
              <div style={{ width:42, height:42, border:"1px solid var(--border-teal)", borderRadius:12, background:"var(--teal-dim)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:18, fontWeight:700, color:"var(--text)", marginBottom:12, letterSpacing:-0.3 }}>{s.title}</div>
              <div style={{ fontSize:13.5, color:"var(--muted)", lineHeight:1.7 }}>{s.desc}</div>
              <div style={{ marginTop:24, fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:600, color:"var(--teal-bright)", letterSpacing:"0.04em", display:"inline-flex", alignItems:"center", gap:6, border:"1px solid var(--border-teal)", background:"var(--teal-dim)", padding:"5px 12px", borderRadius:100 }}>
                <svg viewBox="0 0 24 24" style={{ width:12, height:12, stroke:"var(--teal-bright)", fill:"none", strokeWidth:2, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {s.time}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ position:"relative", zIndex:1, padding:"80px 56px 100px", borderTop:"1px solid var(--border)" }}>
        <div className="section-eyebrow reveal" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:20, height:1, background:"var(--teal-bright)" }} />
          <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--teal-bright)" }}>Features</span>
        </div>
        <h2 className="reveal">Everything you need.<br /><span className="accent">Nothing you don't.</span></h2>
        <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
          {/* Large card */}
          <div className="feature-card feature-large reveal" style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, padding:36, transition:"border-color .3s,background .3s", position:"relative", overflow:"hidden", gridColumn:"span 2", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-teal)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
            <div>
              <div style={{ width:44, height:44, borderRadius:12, background:"var(--teal-dim)", border:"1px solid var(--border-teal)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                <svg viewBox="0 0 24 24" style={{ width:22, height:22, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:17, fontWeight:700, color:"var(--text)", letterSpacing:-0.3, marginBottom:10 }}>Content DNA — set it once</div>
              <div style={{ fontSize:13.5, color:"var(--muted)", lineHeight:1.7 }}>Your product brief is stored as a reusable profile. Every batch generation inherits your voice, audience, and story without you lifting a finger.</div>
            </div>
            <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:12, padding:20, minHeight:160, display:"flex", flexDirection:"column", gap:10 }}>
              {[{ dot:"#2AA5C0", tag:"Voice", tagStyle:{ background:"var(--teal-dim)", color:"var(--teal-bright)", border:"1px solid var(--border-teal)" } }, { dot:"#3DAB7A", tag:"Audience", tagStyle:{ background:"rgba(61,171,122,0.12)", color:"#3DAB7A", border:"1px solid rgba(61,171,122,0.2)" } }, { dot:"#C4974A", tag:"Story", tagStyle:{ background:"rgba(196,151,74,0.1)", color:"#C4974A", border:"1px solid rgba(196,151,74,0.2)" } }].map((r, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:8 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:r.dot }} />
                  <div style={{ flex:1, height:6, borderRadius:3, background:"var(--border)" }} />
                  <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, letterSpacing:"0.06em", ...r.tagStyle }}>{r.tag}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Small cards */}
          {[
            { icon:<svg viewBox="0 0 24 24" style={{ width:22, height:22, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title:"Platform-native tone", desc:"Each post is written for its platform. Twitter hooks are punchy. LinkedIn posts tell stories. Instagram captions drive follows.", delay:"" },
            { icon:<svg viewBox="0 0 24 24" style={{ width:22, height:22, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title:"One-click regeneration", desc:"Don't like a post? Regenerate it in isolation without touching the rest of your week. Iterate fast, stay in flow.", delay:" reveal-d1" },
            { icon:<svg viewBox="0 0 24 24" style={{ width:22, height:22, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title:"Scheduled publishing", desc:"Connect your accounts once. Schedule the whole week in a few clicks. Posts go out while you build the next thing.", delay:"" },
            { icon:<svg viewBox="0 0 24 24" style={{ width:22, height:22, stroke:"var(--teal-bright)", fill:"none", strokeWidth:1.7, strokeLinecap:"round" as const, strokeLinejoin:"round" as const }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title:"Engagement insights", desc:"Track which content performs across platforms. Pervasively learns what resonates and fine-tunes future batches automatically.", delay:" reveal-d1" },
          ].map((f, i) => (
            <div key={i} className={`feature-card reveal${f.delay}`} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, padding:36, transition:"border-color .3s,background .3s", position:"relative", overflow:"hidden" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-teal)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div style={{ width:44, height:44, borderRadius:12, background:"var(--teal-dim)", border:"1px solid var(--border-teal)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>{f.icon}</div>
              <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:17, fontWeight:700, color:"var(--text)", letterSpacing:-0.3, marginBottom:10 }}>{f.title}</div>
              <div style={{ fontSize:13.5, color:"var(--muted)", lineHeight:1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="section" id="platforms" style={{ position:"relative", zIndex:1, padding:"80px 56px 100px", borderTop:"1px solid var(--border)" }}>
        <div className="section-eyebrow reveal" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:20, height:1, background:"var(--teal-bright)" }} />
          <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--teal-bright)" }}>Platform coverage</span>
        </div>
        <h2 className="reveal">Content built for<br /><span className="accent">every channel.</span></h2>
        <div className="platforms-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {[
            { icon:<svg viewBox="0 0 24 24" style={{ width:22, height:22, fill:"var(--teal-bright)" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, name:"Twitter / X", desc:"Hook-first tweets and threads optimized for engagement. No hashtag stuffing — sharp, shareable content within character limits.", tags:["Threads","Takes","Feature drops","Insights"], delay:"" },
            { icon:<svg viewBox="0 0 24 24" width="22" height="22"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style={{ stopColor:"#1E7A91" }}/><stop offset="100%" style={{ stopColor:"#2AA5C0" }}/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="url(#ig-grad)" strokeWidth="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="url(#ig-grad)" strokeWidth="1.8"/><circle cx="17.3" cy="6.7" r="1.1" fill="url(#ig-grad)"/></svg>, name:"Instagram", desc:"Caption-first content with a hook before the fold, value in the body, and a clear CTA at the close. Visual direction included.", tags:["Hooks","Carousels","BTS"], delay:" reveal-d1" },
            { icon:<svg viewBox="0 0 24 24" style={{ width:22, height:22, fill:"var(--teal-bright)" }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>, name:"LinkedIn", desc:"Founder narratives, milestones, and lessons learned. Long-form authority content that reaches the right decision makers.", tags:["Storytelling","Milestones","Leadership"], delay:" reveal-d2" },
          ].map((p, i) => (
            <div key={i} className={`platform-card reveal${p.delay}`} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:18, padding:"36px 32px", transition:"border-color .3s,background .3s,transform .3s", position:"relative", overflow:"hidden" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border-teal2)"; e.currentTarget.style.background="var(--bg3)"; e.currentTarget.style.transform="translateY(-5px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--bg2)"; e.currentTarget.style.transform="none"; }}>
              <div style={{ position:"absolute", bottom:-40, right:-40, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle,rgba(25,97,117,0.10) 0%,transparent 70%)", transition:"transform .4s" }} />
              <div style={{ width:46, height:46, background:"var(--teal-dim)", border:"1px solid var(--border-teal)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:22 }}>{p.icon}</div>
              <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:17, fontWeight:700, color:"var(--text)", marginBottom:10, letterSpacing:-0.3 }}>{p.name}</div>
              <div style={{ fontSize:13.5, color:"var(--muted)", lineHeight:1.7, marginBottom:22 }}>{p.desc}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {p.tags.map(t => <span key={t} style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:600, letterSpacing:"0.05em", padding:"4px 10px", borderRadius:100, border:"1px solid var(--border-teal)", color:"var(--teal-bright)", background:"var(--teal-dim)" }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing" style={{ position:"relative", zIndex:1, padding:"80px 56px 100px", borderTop:"1px solid var(--border)" }}>
        <div className="section-eyebrow reveal" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ width:20, height:1, background:"var(--teal-bright)" }} />
          <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--teal-bright)" }}>Pricing</span>
        </div>
        <h2 className="reveal">Pay for what you use.<br /><span className="accent">Nothing more.</span></h2>
        <div className="reveal" style={{ width:"100%", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden", marginBottom:0 }}>
          <div className="pricing-header" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", background:"var(--bg2)", borderBottom:"1px solid var(--border)" }}>
            {[
              { name:"Starter", price:12, credits:5, per:"2.40", featured:false },
              { name:"Builder", price:24, credits:12, per:"2.00", featured:true },
              { name:"Growth",  price:45, credits:28, per:"1.60", featured:false },
            ].map((p, i) => (
              <div key={i} style={{ padding:"28px 32px", borderRight: i < 2 ? "1px solid var(--border)" : "none", position:"relative", background: p.featured ? "var(--bg3)" : undefined, borderTop: p.featured ? "2px solid var(--teal-bright)" : undefined }}>
                {p.featured && <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,var(--teal),var(--teal-bright))", color:"#fff", fontFamily:"'Manrope',sans-serif", fontSize:9, fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", padding:"3px 12px", borderRadius:"0 0 8px 8px" }}>Most popular</div>}
                <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.10em", textTransform:"uppercase", color:"var(--teal-bright)", marginBottom:14 }}>{p.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:4 }}>
                  <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:18, fontWeight:700, color:"var(--muted)" }}>$</span>
                  <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:44, fontWeight:800, letterSpacing:-2, color:"var(--text)", lineHeight:1 }}>{p.price}</span>
                </div>
                <div style={{ fontSize:13, color:"var(--muted)", marginBottom:6 }}><strong style={{ color:"var(--text)", fontWeight:500 }}>{p.credits} credits</strong></div>
                <div style={{ fontSize:11, color:"var(--muted2)" }}>= <strong style={{ color:"var(--teal-bright)", fontWeight:600 }}>${p.per}</strong> / credit</div>
              </div>
            ))}
          </div>
          <div className="pt-cta-row-wrap pricing-cta-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
            {[false, true, false].map((featured, i) => (
              <div key={i} style={{ padding:"20px 32px", borderRight: i < 2 ? "1px solid var(--border)" : "none", background: featured ? "var(--bg3)" : "var(--bg2)" }}>
                <Link href="/sign-up" style={{ display:"block", padding:"11px 0", background: featured ? "var(--teal)" : "transparent", border:`1px solid ${featured ? "var(--teal)" : "var(--border-teal)"}`, borderRadius:10, color: featured ? "#fff" : "var(--teal-bright)", fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", width:"100%", textAlign:"center", textDecoration:"none", boxShadow: featured ? "0 4px 20px rgba(25,97,117,0.35)" : "none" }}>Sign up free</Link>
              </div>
            ))}
          </div>
          <div className="mobile-cta-row" style={{ display:"none", padding:"20px 32px", background:"var(--bg2)", borderTop:"1px solid var(--border)" }}>
            <Link href="/sign-up" style={{ display:"block", padding:"11px 0", background:"var(--teal)", border:"1px solid var(--teal)", borderRadius:10, color:"#fff", fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:700, textAlign:"center", textDecoration:"none" }}>Sign up free</Link>
          </div>
          <div style={{ background:"var(--bg2)", padding:"24px 32px", borderTop:"1px solid var(--border)" }}>
            <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted2)", marginBottom:16 }}>Everything included in all plans</div>
            <ul style={{ display:"flex", flexWrap:"wrap", gap:"10px 28px", listStyle:"none" }}>
              {["21 posts per credit","Twitter, LinkedIn & Instagram","Platform-native tone per channel","Credits never expire"].map(f => (
                <li key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2AA5C0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="reveal" style={{ marginTop:20, textAlign:"center", fontSize:13, color:"var(--muted2)" }}>New accounts start with <strong style={{ color:"var(--teal-bright)", fontWeight:500 }}>3 free credits</strong> — no card required.</p>
      </section>

      {/* CTA BANNER */}
      <div style={{ position:"relative", zIndex:1, margin:"0 56px 100px", border:"1px solid var(--border-teal)", borderRadius:24, background:"linear-gradient(135deg,rgba(25,97,117,0.14) 0%,rgba(8,13,16,0) 60%)", padding:"80px 72px", overflow:"hidden", textAlign:"center" }} className="reveal">
        <div style={{ position:"absolute", right:-80, top:-80, width:380, height:380, background:"radial-gradient(circle,rgba(42,165,192,0.10) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", left:-40, bottom:-80, width:280, height:280, background:"radial-gradient(circle,rgba(25,97,117,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
          <h2 style={{ marginBottom:0, fontSize:"clamp(28px,3vw,48px)" }}>Start building<br /><span className="accent">your audience.</span></h2>
          <p style={{ fontSize:16, color:"var(--muted)", maxWidth:480, lineHeight:1.65 }}>Pervasively turns your product knowledge into a full week of content — across Twitter, LinkedIn, and Instagram — in under 10 minutes.</p>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginTop:8 }}>
            <Link href="/sign-up" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"16px 40px", background:"var(--teal)", color:"#fff", textDecoration:"none", fontFamily:"'Manrope',sans-serif", fontSize:15, fontWeight:700, borderRadius:14, letterSpacing:0.02, boxShadow:"0 4px 28px rgba(25,97,117,0.45), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
              Create your free account →
            </Link>
            <p style={{ fontSize:12, color:"var(--muted2)" }}>3 free credits · No card required · Start in minutes</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ position:"relative", zIndex:1, borderTop:"1px solid var(--border)", padding:"36px 56px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="#" style={{ fontFamily:"'Manrope',sans-serif", fontSize:19, fontWeight:800, color:"var(--text)", textDecoration:"none", letterSpacing:-0.5 }}>Pervasive<span style={{ color:"var(--teal-bright)" }}>ly</span></a>
        <div className="footer-right" style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
          <span style={{ fontSize:12, color:"var(--muted2)" }}>© 2026 Pervasively</span>
          <span style={{ fontSize:12, color:"var(--muted2)" }}>Built by a solopreneur, for solopreneurs</span>
        </div>
      </footer>
    </>
  );
}