"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message === "Invalid login credentials"
        ? "Email or password is incorrect."
        : authError.message);
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(ellipse 60% 40% at 0% 0%, rgba(255,45,166,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(147,51,234,0.12) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 50% 100%, rgba(255,45,166,0.08) 0%, transparent 50%), #12031E", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      <div style={{ display: "none" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.4em", color: "#4cc9f0", textTransform: "uppercase", marginBottom: "0.75rem" }}>Storme Luxe Â· The AI Glow-Up</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(0.85rem, 3vw, 1.1rem)", fontStyle: "italic", letterSpacing: "0.25em", textTransform: "uppercase", background: "linear-gradient(90deg, #FF2DA6, #c77dff, #4cc9f0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "0.4rem" }}>Becoming Her</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 8vw, 3.5rem)", fontWeight: 400, color: "#f0e6ff", lineHeight: 0.9, margin: 0 }}>Becoming <em style={{ color: "#c77dff" }}>HER</em></h1>
          <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, transparent, #FF2DA6, #7b2fff, transparent)", margin: "1.25rem auto" }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", color: "#8b6faa" }}>Enter your world.</p>
        </div>

        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#7b2fff", marginBottom: "0.5rem" }}>Email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="your@email.com" autoComplete="email" required style={{ width: "100%", padding: "0.85rem 1rem", background: "#1c1230", border: `1px solid ${error ? "#f72585" : "#3a2560"}`, borderRadius: 2, color: "#f0e6ff", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#7b2fff", marginBottom: "0.5rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" autoComplete="current-password" required style={{ width: "100%", padding: "0.85rem 3rem 0.85rem 1rem", background: "#1c1230", border: `1px solid ${error ? "#f72585" : "#3a2560"}`, borderRadius: 2, color: "#f0e6ff", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", outline: "none", boxSizing: "border-box" }} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", top: "50%", right: "0.85rem", transform: "translateY(-50%)", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(123,47,255,0.12)", border: "1px solid rgba(199,125,255,0.28)", borderRadius: 2, color: showPassword ? "#f0e6ff" : "#8b6faa", cursor: "pointer", padding: 0 }}>
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.5 4.5A9.7 9.7 0 0 1 12 4c5 0 8.5 5 9 8a10.8 10.8 0 0 1-2.1 4.1" /><path d="M6.1 6.1C4.4 7.5 3.3 9.5 3 12c.5 3 4 8 9 8a9.7 9.7 0 0 0 4.2-.9" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>
          {error && <p style={{ fontSize: "0.65rem", color: "#f72585", marginBottom: "0.75rem", fontFamily: "'DM Mono', monospace" }}>{error}</p>}
          <button type="submit" disabled={loading || !email || !password} style={{ width: "100%", padding: "1rem 2rem", background: loading || !email || !password ? "rgba(123,47,255,0.2)" : "linear-gradient(135deg, #FF2DA6, #f72585)", border: "none", borderRadius: 4, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", cursor: loading || !email || !password ? "not-allowed" : "pointer", marginTop: "0.5rem", opacity: loading || !email || !password ? 0.5 : 1, boxShadow: loading || !email || !password ? "none" : "0 4px 15px rgba(255, 45, 166, 0.3)", transition: "all 0.3s ease" }}>
            {loading ? "Enteringâ€¦" : "Enter the Studio"}
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.9rem", color: "#8b6faa" }}>
          New here?{" "}
          <Link href="/signup" style={{ color: "#c77dff", textDecoration: "none" }}>Create your account</Link>
        </p>
      </div>
    </main>
  );
}

