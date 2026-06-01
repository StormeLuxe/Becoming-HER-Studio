"use client";

import { useState, useEffect, useRef } from "react";

const MODULES = [
  { icon: "◈", name: "Storme Archive", tag: "Alter Ego Builder", desc: "Upload your photos and let STORME write your elevated identity into existence — her visual essence, signature aesthetic, and a cinematic AI generation prompt built around YOUR face, YOUR energy.", color: "#f72585" },
  { icon: "⬡", name: "Muse Reel", tag: "Visual Concept Studio", desc: "Turn a feeling into a magazine-grade image or video prompt. Director's lighting notes, shot variations, color grade direction — every frame intentional, every visual earned.", color: "#c77dff" },
  { icon: "◉", name: "Viral Story Brain", tag: "Hook Pressure™ Engine", desc: "Every script, caption, and reel is scored live across 7 Hook Pressure™ metrics: Curiosity Gap, Mid-Scene Drop, Contradiction, Confession, Stakes, Power Reversal, Named Threat. Know it hits before you post.", color: "#f72585" },
  { icon: "●", name: "Emotional Engine", tag: "Story Architecture", desc: "Built on the literary energy of Eric Jerome Dickey, Zane, Sister Souljah, and Tayari Jones. Black love, Black drama, Black interiority — grown, complicated, sensual, consequential. Your story has weight here.", color: "#7b2fff" },
  { icon: "◫", name: "DMS Studio", tag: "Digital Muse Society", desc: "Architect a full digital persona: bio, content pillars, DM openers, signature phrases, and monetization personality. Build the version of you that sells without selling.", color: "#4cc9f0" },
];

const PRICING = [
  { tier: "Creator", price: "$27", period: "/month", tagline: "Start creating.", features: ["100 credits/month", "Content Studio", "Script Studio", "Viral Story Brain", "Community access"], cta: "Choose Creator", plan: "creator", highlight: false },
  { tier: "Pro Creator", price: "$47", period: "/month", tagline: "Scale the content engine.", features: ["300 credits/month", "Everything in Creator", "Character Builder", "Muse Reel", "Brand Vault", "Premium templates"], cta: "Choose Pro Creator", plan: "pro", highlight: true, badge: "Most Popular" },
  { tier: "Studio", price: "$97", period: "/month", tagline: "Full suite. All 8 modules.", features: ["1000 credits/month", "Everything in Pro Creator", "Storyboard Studio", "DMS Studio", "Priority features", "Early access to new modules"], cta: "Choose Studio", plan: "studio", highlight: false, badge: "Full Suite" },
];

const FAQS = [
  { q: "Who is Becoming HER Studio built for?", a: "AI creators, digital entrepreneurs, content strategists, and women building luxury brands online. If you create content and want it to feel like it came from a director's table — not a SaaS dashboard — this is yours." },
  { q: "Do I need tech experience to use it?", a: "None. Becoming HER Studio is built for creators, not developers. You show up with your vision — the platform does the heavy lifting." },
  { q: "What is Hook Pressure™?", a: "Hook Pressure™ is our proprietary scoring system. Every piece of content you generate is analyzed across 7 attention-trap metrics so you know exactly how hard your hook will hit before you post." },
  { q: "Can I upload my own photos?", a: "Yes — on Pro Creator and Studio plans. Upload up to 6 photos and the platform reads your face, your energy, your presence, and writes your alter ego around the real you." },
  { q: "What makes this different from ChatGPT?", a: "Becoming HER Studio is not a general AI tool. It's an AI Creator Operating System with 8+ intentional modules, built around Black feminine creativity, luxury brand positioning, and content that moves people. The culture is built in." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no penalties. Cancel from your account any time — you keep access through the end of your billing period." },
];

const WHO = [
  { icon: "✦", label: "AI Creators", desc: "Building cinematic content brands from scratch" },
  { icon: "✦", label: "Digital Entrepreneurs", desc: "Scaling offers through story and strategy" },
  { icon: "✦", label: "Fanvue & OnlyFans Creators", desc: "Building personas that feel real and magnetic" },
  { icon: "✦", label: "Coaches & Course Creators", desc: "Who need content that converts, not just posts" },
  { icon: "✦", label: "Women in Their Becoming", desc: "Who know their next level is one story away" },
];

function useInView(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function Section({ children, className = "" }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return <section ref={ref} className={`reveal-section ${visible ? "revealed" : ""} ${className}`}>{children}</section>;
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "faq-open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="faq-q"><span>{q}</span><span className="faq-arrow">{open ? "−" : "+"}</span></div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

export default function StormeLanding({ onEnter }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,700;1,300;1,400;1,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--black:#12031E;--deep:#1D0A2E;--card:#2A123F;--card2:#341650;--border:rgba(255,255,255,0.08);--pink:#FF2DA6;--purple:#7b2fff;--violet:#b5179e;--lavender:#c77dff;--teal:#4cc9f0;--cream:#f0e6ff;--text:#d4b8e8;--muted:#9b7bb8;--gold:#D4AF37}
        html{scroll-behavior:smooth}body{background:radial-gradient(ellipse 60% 40% at 0% 0%,rgba(255,45,166,.12) 0%,transparent 50%),radial-gradient(ellipse 50% 40% at 100% 0%,rgba(147,51,234,.12) 0%,transparent 50%),radial-gradient(ellipse 40% 30% at 50% 100%,rgba(255,45,166,.08) 0%,transparent 50%),#12031E;color:var(--text);font-family:'DM Mono',monospace;overflow-x:hidden}
        .noise{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        .ambient{display:none}
        .page{position:relative;z-index:1}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.25rem 2rem;display:flex;align-items:center;justify-content:space-between;transition:all .4s}
        .nav.scrolled{background:rgba(18,3,30,.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08);padding:.9rem 2rem}
        .nav-brand{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:400;color:var(--cream);letter-spacing:.05em}
        .nav-brand em{font-style:italic;color:var(--lavender)}
        .nav-cta{padding:.55rem 1.4rem;background:linear-gradient(135deg,var(--pink),var(--purple));border:none;border-radius:1px;color:#fff;cursor:pointer;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;transition:all .3s}
        .nav-cta:hover{box-shadow:0 0 20px rgba(247,37,133,.5);transform:translateY(-1px)}
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 1.5rem 5rem;position:relative}
        .hero-eyebrow{font-size:.58rem;letter-spacing:.5em;text-transform:uppercase;color:var(--teal);margin-bottom:1.25rem;animation:fadeDown .8s ease both}
        .hero-becoming{font-family:'Playfair Display',serif;font-size:clamp(1rem,3vw,1.3rem);font-style:italic;letter-spacing:.3em;text-transform:uppercase;background:linear-gradient(90deg,#f72585,#c77dff,#4cc9f0,#f72585);background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite,fadeDown .9s ease both;margin-bottom:.75rem}
        @keyframes shimmer{to{background-position:-300% 0}}
        .hero-title{font-family:'Playfair Display',serif;font-size:clamp(3.5rem,10vw,7rem);font-weight:700;line-height:.9;color:var(--cream);letter-spacing:-.02em;margin-bottom:.4rem;animation:fadeDown 1s ease both .1s}
        .hero-title em{font-style:italic;color:var(--lavender);font-weight:300}
        .hero-by{font-size:.58rem;letter-spacing:.35em;text-transform:uppercase;color:var(--muted);margin-bottom:2rem;animation:fadeDown 1s ease both .2s}
        .hero-divider{width:80px;height:1px;margin:0 auto 2rem;background:linear-gradient(90deg,transparent,var(--pink),var(--purple),transparent);animation:fadeDown 1s ease both .3s}
        .hero-desc{font-family:'Cormorant Garamond',serif;font-size:clamp(1.1rem,2.5vw,1.4rem);font-style:italic;line-height:1.75;color:var(--text);max-width:640px;margin:0 auto 3rem;animation:fadeDown 1s ease both .4s}
        .hero-ctas{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;animation:fadeDown 1s ease both .5s}
        .btn-primary{padding:1rem 2.5rem;background:linear-gradient(135deg,#FF2DA6,#f72585);border:none;border-radius:4px;cursor:pointer;font-family:'DM Mono',monospace;font-size:.65rem;letter-spacing:.25em;text-transform:uppercase;color:#fff;transition:all .3s ease;box-shadow:0 4px 15px rgba(255,45,166,.3)}
        .btn-primary:hover{box-shadow:0 8px 30px rgba(255,45,166,.5);transform:translateY(-2px)}
        .btn-ghost{padding:1rem 2.5rem;background:none;border:1px solid rgba(255,45,166,.3);border-radius:4px;cursor:pointer;font-family:'DM Mono',monospace;font-size:.65rem;letter-spacing:.25em;text-transform:uppercase;color:var(--pink);transition:all .3s ease}
        .btn-ghost:hover{border-color:var(--pink);background:rgba(255,45,166,.08);color:var(--cream)}
        .hero-scroll{position:absolute;bottom:2.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.5rem;font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;color:var(--muted);animation:bob 2s ease-in-out infinite}
        .hero-scroll-line{width:1px;height:40px;background:linear-gradient(to bottom,var(--pink),transparent)}
        @keyframes bob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}
        .reveal-section{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease}
        .reveal-section.revealed{opacity:1;transform:translateY(0)}
        .section-wrap{max-width:1100px;margin:0 auto;padding:5rem 1.5rem}
        .section-label{font-size:.55rem;letter-spacing:.45em;text-transform:uppercase;color:var(--pink);margin-bottom:.75rem;text-align:center}
        .section-title{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3.2rem);font-weight:400;color:var(--cream);text-align:center;line-height:1.15;margin-bottom:1rem}
        .section-title em{font-style:italic;color:var(--lavender)}
        .section-sub{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;line-height:1.7;color:var(--muted);text-align:center;max-width:560px;margin:0 auto 3.5rem}
        .what-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center}
        @media(max-width:700px){.what-grid{grid-template-columns:1fr}}
        .what-text h3{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:400;color:var(--cream);margin-bottom:1rem}
        .what-text h3 em{font-style:italic;color:var(--lavender)}
        .what-text p{font-family:'Cormorant Garamond',serif;font-size:1.1rem;line-height:1.85;color:var(--text);margin-bottom:1rem}
        .what-stats{display:flex;flex-direction:column;gap:1.25rem}
        .stat-card{background:var(--card);border:1px solid var(--border);border-left:2px solid var(--pink);padding:1.25rem 1.5rem;border-radius:2px}
        .stat-num{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;background:linear-gradient(90deg,var(--pink),var(--lavender));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
        .stat-label{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:.25rem}
        .modules-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
        .module-card{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:2rem;position:relative;overflow:hidden;transition:all .3s;cursor:default}
        .module-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--pink),var(--purple));opacity:0;transition:opacity .3s}
        .module-card:hover{border-color:var(--purple);transform:translateY(-3px);box-shadow:0 12px 40px rgba(123,47,255,.2)}
        .module-card:hover::before{opacity:1}
        .module-icon{font-size:1.5rem;margin-bottom:1rem}
        .module-tag{font-size:.52rem;letter-spacing:.3em;text-transform:uppercase;color:var(--pink);margin-bottom:.5rem}
        .module-name{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:400;color:var(--cream);margin-bottom:.75rem}
        .module-desc{font-family:'Cormorant Garamond',serif;font-size:1rem;line-height:1.75;color:var(--text)}
        .who-section{background:linear-gradient(180deg,transparent,rgba(123,47,255,.06),transparent)}
        .who-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem}
        .who-card{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:1.75rem 1.5rem;text-align:center;transition:all .3s}
        .who-card:hover{border-color:var(--pink);box-shadow:0 8px 30px rgba(247,37,133,.15)}
        .who-icon{font-size:1.1rem;color:var(--pink);margin-bottom:.75rem}
        .who-label{font-family:'Playfair Display',serif;font-size:1rem;font-weight:400;color:var(--cream);margin-bottom:.4rem}
        .who-desc{font-family:'Cormorant Garamond',serif;font-size:.95rem;font-style:italic;color:var(--muted);line-height:1.5}
        .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;align-items:start}
        .price-card{background:rgba(18,3,30,.85);border:1px solid rgba(255,45,166,.15);backdrop-filter:blur(10px);border-radius:8px;padding:2.5rem 2rem;position:relative;transition:all .4s cubic-bezier(.4,0,.2,1)}
        .price-card.highlighted{background:linear-gradient(160deg,rgba(255,45,166,.12),rgba(123,47,255,.08));border:2px solid #FF2DA6;box-shadow:0 8px 40px rgba(255,45,166,.3);transform:scale(1.05)}
        @media(max-width:700px){.price-card.highlighted{transform:scale(1)}}
        .price-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,var(--pink),var(--purple));padding:.3rem 1.25rem;border-radius:0 0 4px 4px;font-size:.52rem;letter-spacing:.25em;text-transform:uppercase;color:#fff;white-space:nowrap}
        .price-tier{font-family:'Playfair Display',serif;font-size:1.2rem;font-style:italic;color:var(--lavender);margin-bottom:.4rem}
        .price-tagline{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-bottom:1.5rem}
        .price-amount{display:flex;align-items:baseline;gap:.2rem;margin-bottom:.25rem}
        .price-num{font-family:'Playfair Display',serif;font-size:3.5rem;font-weight:700;background:linear-gradient(135deg,var(--cream),var(--lavender));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
        .price-period{font-size:.65rem;letter-spacing:.1em;color:var(--muted)}
        .price-divider{height:1px;background:var(--border);margin:1.5rem 0}
        .price-features{list-style:none;display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
        .price-features li{font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--text);line-height:1.4;display:flex;align-items:flex-start;gap:.75rem}
        .price-features li::before{content:'◈';color:var(--pink);font-size:.6rem;flex-shrink:0;margin-top:.2rem}
        .price-cta{width:100%;padding:.9rem 1rem;border-radius:1px;cursor:pointer;font-family:'DM Mono',monospace;font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;transition:all .3s}
        .price-cta-primary{background:linear-gradient(135deg,var(--pink),var(--purple));border:none;color:#fff}
        .price-cta-primary:hover{box-shadow:0 6px 30px rgba(247,37,133,.5);transform:translateY(-1px)}
        .price-cta-ghost{background:none;border:1px solid var(--border);color:var(--lavender)}
        .price-cta-ghost:hover{border-color:var(--lavender);color:var(--cream)}
        .quote-banner{padding:5rem 1.5rem;text-align:center;background:linear-gradient(180deg,transparent,rgba(247,37,133,.05),transparent);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
        .quote-text{font-family:'Playfair Display',serif;font-size:clamp(1.5rem,4vw,2.8rem);font-style:italic;font-weight:300;color:var(--cream);line-height:1.4;max-width:800px;margin:0 auto 1.5rem}
        .quote-text strong{font-weight:700;background:linear-gradient(90deg,var(--pink),var(--lavender));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .quote-attr{font-size:.58rem;letter-spacing:.4em;text-transform:uppercase;color:var(--muted)}
        .faq-list{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:0}
        .faq-item{border-bottom:1px solid var(--border);padding:1.5rem 0;cursor:pointer;transition:all .2s}
        .faq-item:first-child{border-top:1px solid var(--border)}
        .faq-q{display:flex;justify-content:space-between;align-items:center;gap:1rem;font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:var(--cream);line-height:1.4}
        .faq-open .faq-q{color:var(--lavender)}
        .faq-arrow{font-size:1.2rem;color:var(--pink);flex-shrink:0;line-height:1}
        .faq-a{font-family:'Cormorant Garamond',serif;font-size:1rem;font-style:italic;line-height:1.75;color:var(--muted);margin-top:1rem;padding-right:2rem}
        .final-cta{padding:7rem 1.5rem;text-align:center;position:relative;overflow:hidden}
        .final-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(123,47,255,.12) 0%,transparent 70%);pointer-events:none}
        .final-title{font-family:'Playfair Display',serif;font-size:clamp(2.5rem,7vw,5rem);font-weight:400;color:var(--cream);line-height:1.05;margin-bottom:1.5rem}
        .final-title em{font-style:italic;color:var(--lavender)}
        .final-sub{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-style:italic;color:var(--muted);max-width:480px;margin:0 auto 3rem;line-height:1.7}
        .footer{border-top:1px solid var(--border);padding:2.5rem 1.5rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:1rem}
        .footer-brand{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--cream);letter-spacing:.05em}
        .footer-brand em{font-style:italic;color:var(--lavender)}
        .footer-links{display:flex;gap:2rem;flex-wrap:wrap;justify-content:center}
        .footer-links a{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color .2s;cursor:pointer}
        .footer-links a:hover{color:var(--lavender)}
        .footer-copy{font-size:.55rem;letter-spacing:.15em;color:var(--border)}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-15px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:600px){.nav{padding:1rem}.nav.scrolled{padding:.75rem 1rem}.hero-ctas{flex-direction:column;align-items:center}.btn-primary,.btn-ghost{width:100%;max-width:320px}.price-card.highlighted{margin:0}}
      `}</style>

      <div className="noise" /><div className="ambient" />
      <div className="page">
        <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
          <div className="nav-brand">Becoming <em>HER</em> Studio</div>
          <button className="nav-cta" onClick={() => onEnter("creator")}>Start Becoming →</button>
        </nav>

        <div className="hero">
          <div className="hero-eyebrow">Storme Luxe · The AI Glow-Up</div>
          <div className="hero-becoming">Becoming Her</div>
          <h1 className="hero-title">Becoming <em>HER</em> Studio</h1>
          <div className="hero-by">by Storme Luxe</div>
          <div className="hero-divider" />
          <p className="hero-desc">The AI Creator Operating System designed for women building brands, creating content, and becoming the next version of themselves.</p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => onEnter("creator")}>Start Becoming</button>
            <button className="btn-ghost" onClick={() => document.getElementById("pricing").scrollIntoView({ behavior: "smooth" })}>See Plans</button>
          </div>
          <div className="hero-scroll"><div className="hero-scroll-line" />scroll</div>
        </div>

        <Section>
          <div className="section-wrap">
            <div className="what-grid">
              <div className="what-text">
                <h3>Not a tool. <em>An operating system for creators.</em></h3>
                <p>Becoming HER Studio is an AI Creator Operating System built for women building luxury content brands. Every module is intentional. Every output is cinematic. Every generation is scored for impact.</p>
                <p>It doesn't generate words — it generates consequences. Hooks that stop scrolls. Stories with emotional weight. Personas that feel real.</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", color: "var(--lavender)", lineHeight: 1.7 }}>She didn't arrive… she became.</p>
              </div>
              <div className="what-stats">
                {[{ num: "8", label: "AI Studio Modules" }, { num: "7", label: "Hook Pressure™ Metrics" }, { num: "∞", label: "Stories She Can Tell" }, { num: "1", label: "Version of Her That Wins" }].map(s => (
                  <div key={s.label} className="stat-card"><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="section-wrap">
            <div className="section-label">What's Inside</div>
            <h2 className="section-title">Five Modules. <em>One Direction.</em></h2>
            <p className="section-sub">Every tool built to eliminate friction and move you toward a finished story, a finished scene, a finished her.</p>
            <div className="modules-grid">
              {MODULES.map(m => (
                <div key={m.name} className="module-card">
                  <div className="module-icon" style={{ color: m.color }}>{m.icon}</div>
                  <div className="module-tag">{m.tag}</div>
                  <div className="module-name">{m.name}</div>
                  <div className="module-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <div className="quote-banner">
            <p className="quote-text">"Strip friction. Never add buttons that don't lead to a finished story. Make the creative process feel <strong>easier as you level up.</strong>"</p>
            <div className="quote-attr">The Becoming HER Studio Promise</div>
          </div>
        </Section>

        <Section className="who-section">
          <div className="section-wrap">
            <div className="section-label">Who It's For</div>
            <h2 className="section-title">Built for <em>Her.</em></h2>
            <p className="section-sub">If you believe the story is the strategy, you're already in the right place.</p>
            <div className="who-grid">
              {WHO.map(w => (
                <div key={w.label} className="who-card"><div className="who-icon">{w.icon}</div><div className="who-label">{w.label}</div><div className="who-desc">{w.desc}</div></div>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <div className="section-wrap" id="pricing">
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Choose <em>Your Becoming.</em></h2>
            <p className="section-sub">Three tiers. One direction. Cancel anytime — but she won't want to.</p>
            <div className="pricing-grid">
              {PRICING.map(p => (
                <div key={p.tier} className={`price-card ${p.highlight ? "highlighted" : ""}`}>
                  {p.badge && <div className="price-badge">{p.badge}</div>}
                  <div className="price-tier">{p.tier}</div>
                  <div className="price-tagline">{p.tagline}</div>
                  <div className="price-amount"><span className="price-num">{p.price}</span><span className="price-period">{p.period}</span></div>
                  <div className="price-divider" />
                  <ul className="price-features">{p.features.map(f => <li key={f}>{f}</li>)}</ul>
                  <button className={`price-cta ${p.highlight ? "price-cta-primary" : "price-cta-ghost"}`} onClick={() => onEnter(p.plan)}>{p.cta} →</button>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <div className="section-wrap">
            <div className="section-label">Questions</div>
            <h2 className="section-title">She Wants to <em>Know.</em></h2>
            <p className="section-sub">Everything you need before you begin your becoming.</p>
            <div className="faq-list">{FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}</div>
          </div>
        </Section>

        <Section>
          <div className="final-cta">
            <h2 className="final-title">The story<br />doesn't start later.<br /><em>It starts now.</em></h2>
            <p className="final-sub">Every version of her you've imagined is one story away. Becoming HER Studio is the room where she becomes real.</p>
            <button className="btn-primary" onClick={() => onEnter("creator")}>Start Becoming →</button>
          </div>
        </Section>

        <footer className="footer">
          <div className="footer-brand">Becoming <em>HER</em> Studio by Storme Luxe</div>
          <div className="footer-links">
            <a>Privacy</a><a>Terms</a><a>Support</a>
            <a onClick={() => document.getElementById("pricing").scrollIntoView({ behavior: "smooth" })}>Pricing</a>
          </div>
          <div className="footer-copy">© 2026 Storme Luxe · Becoming Her · All rights reserved</div>
        </footer>
      </div>
    </>
  );
}



