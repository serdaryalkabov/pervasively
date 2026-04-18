"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add("visible");
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.10 }
    );
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);


  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #4D8EFF;
          --blue-dim: rgba(77,142,255,0.10);
          --blue-dim2: rgba(77,142,255,0.18);
          --blue-border: rgba(77,142,255,0.22);
          --blue-border2: rgba(77,142,255,0.40);
          --bg: #0A0D12;
          --bg2: #111620;
          --bg3: #161C2A;
          --bg4: #1C2438;
          --border: rgba(255,255,255,0.07);
          --text: #F0F4FF;
          --muted: #7A8BA8;
          --muted2: #4A5870;
          --navy: #F0F4FF;
        }

        html { scroll-behavior: smooth; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .reveal { opacity: 0; transform: translateY(28px); transition: opacity .65s, transform .65s; }
        .reveal.visible { opacity: 1; transform: none; }
        .reveal-d1 { transition-delay: .1s; }
        .reveal-d2 { transition-delay: .2s; }
        .reveal-d3 { transition-delay: .3s; }

        h1 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(44px, 6vw, 84px);
          font-weight: 600;
          line-height: 0.95;
          letter-spacing: -3px;
          color: var(--text);
        }
        h2 {
          font-family: 'Manrope', sans-serif;
          font-size: clamp(32px, 4vw, 54px);
          font-weight: 600;
          letter-spacing: -1.5px;
          line-height: 1.05;
          color: var(--text);
          margin-bottom: 56px;
        }
        .accent { color: var(--blue); }

        .stat-bar-fill {
          height: 100%;
          border-radius: 2px;
          background: var(--blue);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1.2s cubic-bezier(0.16,1,0.3,1);
        }
        .reveal.visible .stat-bar-fill { transform: scaleX(1); }



        /* ── Glassmorphism ── */
        .glass {
          background: rgba(255,255,255,0.04) !important;
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.09) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.06) inset;
          transition: background .15s ease-out, box-shadow .15s ease-out, transform .15s ease-out, z-index 0s;
          isolation: isolate;
          position: relative;
          z-index: 0;
        }
        .glass:hover {
          background: rgba(255,255,255,0.07) !important;
          box-shadow: 0 6px 24px rgba(77,142,255,0.15), 0 1px 0 rgba(255,255,255,0.10) inset !important;
          transform: translateY(-3px);
          z-index: 2;
        }

        /* Background blobs — give glass something to refract */
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          will-change: transform;
        }

        @keyframes blob1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          25%  { transform: translate(80px, 60px) scale(1.05); }
          50%  { transform: translate(40px, 120px) scale(0.95); }
          75%  { transform: translate(-60px, 50px) scale(1.08); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes blob2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          20%  { transform: translate(-90px, 40px) scale(1.06); }
          45%  { transform: translate(-50px, -80px) scale(0.96); }
          70%  { transform: translate(70px, -40px) scale(1.04); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes blob3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          30%  { transform: translate(60px, -70px) scale(1.07); }
          55%  { transform: translate(-40px, -50px) scale(0.94); }
          80%  { transform: translate(-80px, 60px) scale(1.03); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes blob4 {
          0%   { transform: translate(0px, 0px) scale(1); }
          35%  { transform: translate(-70px, -60px) scale(1.05); }
          60%  { transform: translate(50px, -90px) scale(0.97); }
          85%  { transform: translate(90px, 30px) scale(1.06); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .noise-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }

        .tag-pill {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: var(--muted2);
          background: none;
          border: none;
        }
        .tag-pill + .tag-pill::before {
          content: '·';
          margin-right: 6px;
          opacity: 0.4;
        }

        .hero-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
          transition: background .2s, box-shadow .15s ease-out, transform .15s ease-out;
        }
        .hero-card:hover {
          background: var(--bg3);
          box-shadow: 0 6px 24px rgba(77,142,255,0.15), 0 1px 0 rgba(255,255,255,0.10) inset;
          transform: translateY(-3px);
        }

        .step-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 44px 36px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.07) inset;
          transition: background .15s ease-out, box-shadow .15s ease-out, transform .15s ease-out;
        }
        .step-card:hover {
          background: rgba(255,255,255,0.07);
          box-shadow: 0 8px 48px rgba(77,142,255,0.18), 0 1px 0 rgba(255,255,255,0.10) inset;
          transform: translateY(-3px);
        }

        /* ── Liquid Glass shared base ── */
        .green-btn, .ghost-btn, .gray-btn, .pricing-btn {
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(16px) saturate(1.8);
          -webkit-backdrop-filter: blur(16px) saturate(1.8);
          border-radius: 10px;
          transition:
            transform .15s ease-out,
            box-shadow .15s ease-out,
            background .15s ease,
            border-color .15s ease,
            opacity .15s ease;
        }
        /* top-edge highlight — simulates light hitting glass surface */
        .green-btn::before, .ghost-btn::before, .gray-btn::before, .pricing-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          transition: opacity .2s ease;
          pointer-events: none;
        }
        /* on hover: press inward — highlight fades, shadow deepens beneath */
        .green-btn:hover::before, .ghost-btn:hover::before,
        .gray-btn:hover::before, .pricing-btn:hover::before {
          opacity: 0;
        }

        .green-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: linear-gradient(160deg, rgba(120,170,255,0.45) 0%, rgba(55,110,240,0.60) 50%, rgba(37,90,210,0.70) 100%);
          color: #ffffff;
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.01em;
          backdrop-filter: blur(24px) saturate(2);
          -webkit-backdrop-filter: blur(24px) saturate(2);
          border: 1px solid rgba(160,200,255,0.50);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.35) inset,
            0 -1px 0 rgba(0,0,0,0.15) inset,
            0 4px 20px rgba(77,142,255,0.20);
        }
        .green-btn:hover {
          transform: scale(1.03);
          background: linear-gradient(160deg, rgba(140,185,255,0.55) 0%, rgba(70,125,250,0.70) 50%, rgba(45,100,220,0.80) 100%);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.40) inset,
            0 -1px 0 rgba(0,0,0,0.15) inset,
            0 2px 8px rgba(77,142,255,0.20),
            0 8px 24px rgba(77,142,255,0.22),
            0 20px 48px rgba(77,142,255,0.10);
        }

        .ghost-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          background: rgba(77,142,255,0.10);
          color: var(--blue);
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(77,142,255,0.30);
          text-decoration: none;
          box-shadow: 0 2px 0 rgba(0,0,0,0.2), 0 4px 12px rgba(77,142,255,0.10);
        }
        .ghost-btn:hover {
          transform: scale(1.03);
          background: rgba(77,142,255,0.16);
          box-shadow: 0 4px 20px rgba(77,142,255,0.22), 0 1px 0 rgba(255,255,255,0.08) inset;
          border-color: rgba(77,142,255,0.50);
        }

        .gray-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          background: rgba(255,255,255,0.07);
          color: var(--text);
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 2px 0 rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.20);
        }
        .gray-btn:hover {
          transform: scale(1.03);
          background: rgba(255,255,255,0.11);
          box-shadow: 0 4px 18px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.10) inset;
          border-color: rgba(255,255,255,0.16);
        }

        .pricing-btn {
          display: block;
          padding: 11px 0;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: center;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 2px 0 rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15);
        }
        .pricing-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 18px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.10) inset;
          opacity: 0.95;
        }

        /* ── Mobile hamburger menu ── */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 8px;
          cursor: pointer;
          padding: 0;
        }
        .hamburger span {
          display: block;
          width: 18px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all .25s;
        }
        .mobile-menu {
          display: none;
          position: fixed;
          top: 64px;
          left: 0; right: 0;
          background: rgba(10,13,18,0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          z-index: 99;
          padding: 20px 24px 28px;
          flex-direction: column;
          gap: 4px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: var(--muted);
          text-decoration: none;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mobile-menu a:last-child { border-bottom: none; }
        .mobile-menu-btns {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .mobile-menu-btns a { flex: 1; text-align: center; padding: 11px 0; border-bottom: none !important; }

        @media(max-width: 768px) {
          .hamburger { display: flex; }
          .nav-links-wrap { display: none !important; }
          .nav-cta-btns { display: none !important; }

          .stats-grid { grid-template-columns: 1fr !important; }
          .stat { border-right: none !important; border-bottom: 1px solid var(--border) !important; padding: 40px 24px !important; }
          .section { padding: 64px 20px !important; }
          .steps-grid, .platforms-grid { grid-template-columns: 1fr !important; }
          .pricing-header, .pricing-cta-row { grid-template-columns: 1fr !important; }
          .pt-col, .pt-cta-cell { border-right: none !important; border-bottom: 1px solid var(--border) !important; }
          .pt-cta-row-wrap { display: none !important; }
          .mobile-cta-row { display: block !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; padding: 24px !important; text-align: center !important; }
          .footer-right { align-items: center !important; }
          .problem-banner { grid-template-columns: 1fr !important; margin: 0 !important; gap: 32px !important; padding: 36px 24px !important; }
          .problem-divider { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .feature-large { grid-column: span 1 !important; grid-template-columns: 1fr !important; }
          .hero-section { padding: 88px 20px 48px !important; min-height: auto !important; }
          .hero-inner { flex-direction: column !important; align-items: flex-start !important; }
          .hero-right { display: none !important; }
          nav { padding: 0 20px !important; }
          h1 { font-size: clamp(38px, 11vw, 60px) !important; letter-spacing: -1.5px !important; line-height: 1 !important; }
          h2 { font-size: clamp(28px, 8vw, 42px) !important; letter-spacing: -1px !important; margin-bottom: 32px !important; }

          /* Pricing cards — stack vertically on mobile */
          .pricing-card-inner {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .pricing-card-inner > div:nth-child(2) {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: flex-start !important;
          }
          .pricing-card-inner > div:last-child {
            width: 100% !important;
          }
          .pricing-card-inner > div:last-child a {
            width: 100% !important;
            min-width: unset !important;
            padding: 14px 24px !important;
            font-size: 15px !important;
            display: block !important;
            text-align: center !important;
          }

          .pricing-card {
            padding: 28px 20px !important;
          }

          /* Features row */
          .features-row { flex-direction: column !important; gap: 12px !important; padding: 20px !important; }

          /* Pricing section */
          .pricing-section { padding: 64px 16px 80px !important; }
          .pricing-section h2 { margin-bottom: 28px !important; }

          /* CTA banner */
          .cta-banner { margin: 0 0 80px !important; padding: 56px 24px !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }

          /* Footer */
          footer { padding: 28px 20px !important; }
        }

        @media(max-width: 480px) {
          h1 { font-size: clamp(34px, 10vw, 48px) !important; }
          .stat { padding: 32px 20px !important; }
        }
      `}</style>

      {/* Noise overlay */}
      <div className="noise-bg" />
      {/* Background blobs for glass refraction */}
      <div className="bg-blob" style={{ width: 600, height: 600, top: -100, left: -100, background: "rgba(77,142,255,0.18)", animation: "blob1 18s ease-in-out infinite" }} />
      <div className="bg-blob" style={{ width: 500, height: 500, top: "30%", right: -150, background: "rgba(99,102,241,0.14)", animation: "blob2 22s ease-in-out infinite" }} />
      <div className="bg-blob" style={{ width: 400, height: 400, bottom: "20%", left: "20%", background: "rgba(77,142,255,0.10)", animation: "blob3 26s ease-in-out infinite" }} />
      <div className="bg-blob" style={{ width: 350, height: 350, bottom: 0, right: "10%", background: "rgba(139,92,246,0.12)", animation: "blob4 20s ease-in-out infinite" }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 56px", height: 64,
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "transparent"}`,
        background: scrolled ? "rgba(10,13,18,0.80)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.05) inset, 0 1px 32px rgba(0,0,0,0.4)" : "none",
        transition: "all .3s"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <a href="#" style={{ fontFamily: "'Manrope',sans-serif", fontSize: 18, fontWeight: 600, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>
            Pervasive<span style={{ color: "var(--blue)" }}>ly</span>
          </a>
          <ul className="nav-links-wrap" style={{ display: "flex", alignItems: "center", gap: 28, listStyle: "none" }}>
            {[["How it works", "how"], ["Platforms", "platforms"], ["Pricing", "pricing"]].map(([label, id]) => (
              <li key={id}>
                <a onClick={() => scrollTo(id)} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 400, color: "var(--muted)", textDecoration: "none", cursor: "pointer", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-cta-btns">
          <Link href="/sign-in" className="gray-btn">Sign in</Link>
          <Link href="/sign-up" className="green-btn" style={{ fontSize: 13 }}>
            Start free
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Toggle menu">
          <span style={{ transform: mobileMenuOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
          <span style={{ opacity: mobileMenuOpen ? 0 : 1 }} />
          <span style={{ transform: mobileMenuOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
        {[["How it works", "how"], ["Platforms", "platforms"], ["Pricing", "pricing"]].map(([label, id]) => (
          <a key={id} onClick={() => { scrollTo(id); setMobileMenuOpen(false); }} style={{ cursor: "pointer" }}>{label}</a>
        ))}
        <div className="mobile-menu-btns">
          <Link href="/sign-in" className="gray-btn" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
          <Link href="/sign-up" className="green-btn" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 13, justifyContent: "center" }}>Start free</Link>
        </div>
      </div>

      {/* HERO */}
      <section className="hero-section" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "88px 56px 40px", overflow: "hidden", zIndex: 1, background: "linear-gradient(135deg, rgba(77,142,255,0.08) 0%, rgba(77,142,255,0.04) 35%, rgba(77,142,255,0.02) 65%, rgba(0,0,0,0) 100%)" }}>




        <div className="hero-inner" style={{ maxWidth: 1100, width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 64, position: "relative", zIndex: 1 }}>

          {/* Left */}
          <div style={{ maxWidth: 580, flex: "1 1 auto" }}>
            <div style={{ opacity: 0, animation: "fadeUp .6s .1s forwards" }}>

              <h1 style={{ marginBottom: 28 }}>
                <span style={{
                  color: "transparent",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  backgroundImage: "linear-gradient(160deg, rgba(160,200,255,1) 0%, rgba(100,160,255,0.95) 40%, rgba(77,142,255,0.85) 100%)",
                  filter: "drop-shadow(0 2px 12px rgba(77,142,255,0.35))",
                  display: "inline-block",
                }}>No corporate<br />bullsh*t.</span>
              </h1>
            </div>
            <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.6, color: "var(--muted)", maxWidth: 460, marginBottom: 40, opacity: 0, animation: "fadeUp .6s .25s forwards" }}>
              Your brand posts like a corporate robot. Your competitors don't. Pervasively generates a full week of content that actually sounds human — across Twitter, LinkedIn, and Instagram.
            </p>
            <div style={{ opacity: 0, animation: "fadeUp .6s .4s forwards", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <Link href="/sign-up" className="green-btn" style={{ padding: "14px 32px", fontSize: 16, borderRadius: 12 }}>
                Get started free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <p style={{ fontSize: 12, color: "var(--muted2)", fontFamily: "'Inter',sans-serif" }}>3 free credits · no card required</p>
            </div>
          </div>

          {/* Right: detailed demo cards */}
          <div className="hero-right" style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", gap: 12, opacity: 0, animation: "fadeUp .6s .5s forwards" }}>

            {/* Twitter card */}
            <div className="glass" style={{ borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#073590", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <img src="/logos/ryanair.png" alt="Ryanair" width={34} height={34} style={{ objectFit: "cover", borderRadius: "50%" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>Ryanair</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif" }}>@Ryanair</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#8A9AB8"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Z"/></svg>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, fontFamily: "'Inter',sans-serif", fontWeight: 300, marginBottom: 12 }}>
                you paid €8 for a seat. you paid €12 to pick it. you paid €6 to print your boarding pass. and you're still surprised by the price. we love you.
              </p>
              <div style={{ display: "flex", gap: 18, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  47.2K
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  8.1K
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  3.4K
                </span>
              </div>
            </div>

            {/* LinkedIn card */}
            <div className="glass" style={{ borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#58CC02", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <img src="/logos/duolingo.png" alt="Duolingo" width={34} height={34} style={{ objectFit: "cover", borderRadius: 8 }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>Duolingo</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif" }}>Language Learning App · 2m ago</div>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.65, fontFamily: "'Inter',sans-serif", fontWeight: 300, marginBottom: 12 }}>
                We tried being professional on LinkedIn.<br/>
                We tried the thought leadership posts.<br/>
                The "excited to announce" copy.<br/><br/>
                Then we posted our unhinged owl.<br/>
                <span style={{ color: "var(--blue)" }}>3.2M impressions later</span>, here we are.
              </p>
              <div style={{ display: "flex", gap: 18, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                  12.4K
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  891
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  2.1K
                </span>
              </div>
            </div>

            {/* Instagram card */}
            <div className="glass" style={{ borderRadius: 14, padding: "16px 18px", opacity: 0.85 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E2001A", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <img src="/logos/wendys.png" alt="Wendy's" width={34} height={34} style={{ objectFit: "cover", borderRadius: "50%" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>Wendy's</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif" }}>@Wendys</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, fontFamily: "'Inter',sans-serif", fontWeight: 300, marginBottom: 12 }}>
                our ice cream machine works btw 🍦
              </p>
              <div style={{ display: "flex", gap: 18, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  218K
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  14.2K
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  31K
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* FEATURES */}
      <section className="section" style={{ position: "relative", zIndex: 1, padding: "80px 56px 100px", borderTop: "1px solid var(--border)" }}>
        <h2 className="reveal">Built different.<br /><span className="accent">On purpose.</span></h2>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {/* Large card */}
          <div className="feature-card feature-large reveal glass" style={{ borderRadius: 16, padding: 36, position: "relative", overflow: "hidden", gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ marginBottom: 20, color: "var(--blue)" }}><svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: "var(--blue)", fill: "none", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg></div>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 18, fontWeight: 600, color: "var(--text)", letterSpacing: -0.3, marginBottom: 10 }}>Brand DNA — set it once, use it forever</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>Your brand brief — voice, audience, story — is stored once. Every generation inherits it automatically. No copy-pasting prompts. No starting over. Just consistent, on-brand content every week.</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 10, border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { dot: "var(--blue)", tag: "Voice", tagColor: "var(--blue)", tagBg: "var(--blue-dim)", tagBorder: "var(--blue-border)" },
                { dot: "#E05050", tag: "Audience", tagColor: "#C0392B", tagBg: "rgba(192,57,43,0.08)", tagBorder: "rgba(192,57,43,0.2)" },
                { dot: "#FFB800", tag: "Story", tagColor: "#FFB800", tagBg: "rgba(255,184,0,0.08)", tagBorder: "rgba(255,184,0,0.2)" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg2)", borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: r.dot }} />
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--border)" }} />
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 400, color: "var(--muted2)" }}>{r.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Small cards */}
          {[
            { icon: <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: "var(--blue)", fill: "none", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, title: "Platform-native, always", desc: "Twitter posts hook hard. LinkedIn posts tell a story. Instagram captions stop the scroll. Each one written for where it lives.", delay: "" },
            { icon: <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: "var(--blue)", fill: "none", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>, title: "One-click regeneration", desc: "Don't like a post? Hit regenerate. Only that post changes. The rest of your week stays intact.", delay: " reveal-d1" },
            { icon: <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: "var(--blue)", fill: "none", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, title: "No repeating yourself", desc: "Pervasively tracks every angle you've used. Each new week is fresh territory — no recycled takes, no déjà vu.", delay: "" },
            { icon: <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, stroke: "var(--blue)", fill: "none", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, title: "10 minutes a week", desc: "That's the entire time commitment. Set up your brand once, generate on Monday, post all week. Done.", delay: " reveal-d1" },
          ].map((f, i) => (
            <div key={i} className={`feature-card glass reveal${f.delay}`} style={{ borderRadius: 16, padding: 36, position: "relative", overflow: "hidden" }}>
              <div style={{ marginBottom: 20, color: "var(--blue)" }}>{f.icon}</div>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 17, fontWeight: 600, color: "var(--text)", letterSpacing: -0.3, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="section" id="platforms" style={{ position: "relative", zIndex: 1, padding: "80px 56px 100px", borderTop: "1px solid var(--border)" }}>
        <h2 className="reveal">Every channel.<br /><span className="accent">One workflow.</span></h2>
        <div className="platforms-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            {
              icon: <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: "var(--blue)" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
              name: "Twitter / X", desc: "Hook-first. Under 280. No hashtag spam. Posts that make people stop mid-scroll and actually think.", tags: ["Hot takes", "Threads", "Roasts", "Drops"], delay: ""
            },
            {
              icon: <svg viewBox="0 0 24 24" width="22" height="22"><defs><linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#2563EB" /><stop offset="100%" stopColor="#1D4ED8" /></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="url(#ig-g)" strokeWidth="1.8" /><circle cx="12" cy="12" r="4.2" fill="none" stroke="url(#ig-g)" strokeWidth="1.8" /><circle cx="17.3" cy="6.7" r="1.1" fill="url(#ig-g)" /></svg>,
              name: "Instagram", desc: "Hook before the fold. Value in the body. CTA at the close. Visual direction included so you actually know what to shoot.", tags: ["Hooks", "Carousels", "BTS"], delay: " reveal-d1"
            },
            {
              icon: <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: "var(--blue)" }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
              name: "LinkedIn", desc: "Founder stories, sharp opinions, real moments. Not 'excited to announce' — content that people actually comment on.", tags: ["Storytelling", "Opinions", "Wins"], delay: " reveal-d2"
            },
          ].map((p, i) => (
            <div key={i} className={`glass reveal${p.delay}`} style={{ borderRadius: 18, padding: "36px 32px", position: "relative", overflow: "hidden" }}>

              <div style={{ marginBottom: 22, color: "var(--blue)" }}>{p.icon}</div>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 10, letterSpacing: -0.3 }}>{p.name}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 22, fontFamily: "'Inter',sans-serif" }}>{p.desc}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {p.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="section pricing-section" id="pricing" style={{ position: "relative", zIndex: 1, padding: "80px 56px 100px", borderTop: "1px solid var(--border)" }}>
        <h2 className="reveal">Pay for what you use.<br /><span className="accent">Nothing more.</span></h2>
        <div className="reveal" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { name: "Starter", price: 12, credits: 5, per: "2.40", featured: false },
            { name: "Builder", price: 24, credits: 12, per: "2.00", featured: true },
            { name: "Growth", price: 45, credits: 28, per: "1.60", featured: false },
          ].map((p, i) => (
            <div className="pricing-card" key={i} style={{
              position: "relative",
              borderRadius: 20,
              padding: "32px 40px",
              background: p.featured ? "rgba(77,142,255,0.08)" : "rgba(255,255,255,0.03)",
              backdropFilter: "blur(20px) saturate(1.6)",
              WebkitBackdropFilter: "blur(20px) saturate(1.6)",
              border: p.featured ? "1px solid rgba(77,142,255,0.30)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: p.featured
                ? "0 4px 40px rgba(77,142,255,0.18), 0 1px 0 rgba(255,255,255,0.08) inset"
                : "0 4px 24px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.05) inset",
            }}>
              <div className="pricing-card-inner" style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr auto",
                alignItems: "center",
                gap: 40,
              }}>
              {/* Name + price */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 15, fontWeight: 500, color: "var(--muted)" }}>{p.name}</div>
                  {p.featured && <div style={{ background: "rgba(77,142,255,0.12)", color: "var(--blue)", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 5, border: "1px solid rgba(77,142,255,0.2)" }}>Popular</div>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                  <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 16, fontWeight: 500, color: "var(--muted)" }}>$</span>
                  <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 52, fontWeight: 600, letterSpacing: -2, color: "var(--text)", lineHeight: 1 }}>{p.price}</span>
                </div>
              </div>
              {/* Credits info */}
              <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}><strong style={{ color: "var(--text)", fontWeight: 500 }}>{p.credits} credits</strong></div>
                  <div style={{ fontSize: 11, color: "var(--muted2)", fontFamily: "'Inter',sans-serif" }}>= <strong style={{ color: "var(--blue)", fontWeight: 600 }}>${p.per}</strong> / credit</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted2)", fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>
                  21 posts / credit · Twitter, LinkedIn & Instagram<br />Platform-native tone · Credits never expire
                </div>
              </div>
              {/* CTA */}
              <div>
                <Link href="/sign-up" className="pricing-btn" style={{
                  background: p.featured ? "linear-gradient(135deg, rgba(77,142,255,0.90), rgba(55,110,240,0.95))" : "rgba(255,255,255,0.08)",
                  border: p.featured ? "1px solid rgba(120,170,255,0.35)" : "1px solid rgba(255,255,255,0.10)",
                  color: p.featured ? "#ffffff" : "var(--text)",
                  boxShadow: p.featured ? "0 2px 16px rgba(77,142,255,0.30), 0 1px 0 rgba(255,255,255,0.20) inset" : "0 2px 12px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.07) inset",
                  minWidth: 140,
                  padding: "11px 24px",
                  whiteSpace: "nowrap" as const,
                }}>
                  Sign up free
                </Link>
              </div>
              </div>
            </div>
          ))}

          {/* Features row */}
          <div className="features-row" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px 40px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 400, color: "var(--muted)", marginBottom: 16 }}>Everything included in all plans</div>
            <ul style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", listStyle: "none" }}>
              {["21 posts per credit", "Twitter, LinkedIn & Instagram", "Platform-native tone per channel", "Credits never expire"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)", lineHeight: 1.5, fontFamily: "'Inter',sans-serif" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="reveal" style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--muted2)", fontFamily: "'Inter',sans-serif" }}>
          New accounts start with <strong style={{ color: "var(--blue)", fontWeight: 600 }}>3 free credits</strong> — no card required.
        </p>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner reveal" style={{ position: "relative", zIndex: 1, margin: "0 56px 100px", border: "1px solid var(--blue-border)", borderRadius: 24, background: "linear-gradient(135deg, rgba(77,142,255,0.08) 0%, rgba(10,10,10,0) 60%)", padding: "80px 72px", overflow: "hidden", textAlign: "center" }}>

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <h2 style={{ marginBottom: 0 }}>Your brand has a voice.<br /><span className="accent">Time to use it.</span></h2>
          <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 480, lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
            Pervasively turns your brand brief into a week of content that doesn't sound like it was written by a committee. Try it free.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 8 }}>
            <Link href="/sign-up" className="green-btn" style={{ padding: "16px 44px", fontSize: 15 }}>
              Create your free account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <p style={{ fontSize: 12, color: "var(--muted2)", fontFamily: "'Inter',sans-serif" }}>3 free credits · No card required · Start in minutes</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid var(--border)", padding: "36px 56px" }}>
        <div className="footer-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#" style={{ fontFamily: "'Manrope',sans-serif", fontSize: 18, fontWeight: 600, color: "var(--text)", textDecoration: "none", letterSpacing: -0.5 }}>
            Pervasive<span style={{ color: "var(--blue)" }}>ly</span>
          </a>
          <div className="footer-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted2)", fontFamily: "'Inter',sans-serif" }}>© 2026 Pervasively</span>
            <span style={{ fontSize: 12, color: "var(--muted2)", fontFamily: "'Inter',sans-serif" }}>f*ck formality</span>
          </div>
        </div>
      </footer>
    </>
  );
}