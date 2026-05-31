"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main style={{ minHeight: "100vh", background: "#0a0612", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(247,37,133,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(123,47,255,0.14) 0%, transparent 60%)" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.4em", color: "#4cc9f0", textTransform: "uppercase", marginBottom: "0.75rem" }}>Storme Luxe · The AI Glow-Up</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(0.85rem, 3vw, 1.1rem)", fontStyle: "italic", letterSpacing: "0.25em", textTransform: "uppercase", background: "linear-gradient(90deg, #f72585, #c77dff, #4cc9f0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "0.4rem" }}>Becoming Her</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 8vw, 3.5rem)", fontWeight: 400, color: "#f0e6ff", lineHeight: 0.9, margin: 0 }}>Becoming <em style={{ color: "#c77dff" }}>HER</em></h1>
          <div style={{ width: 50, height: 1, background: "linear-gradient(90deg, transparent, #f72585, #7b2fff, transparent)", margin: "1.25rem auto" }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", color: "#8b6faa" }}>Enter your world.</p>
        </div>

        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#7b2fff", marginBottom: "0.5rem" }}>Email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="your@email.com" autoComplete="email" required style={{ width: "100%", padding: "0.85rem 1rem", background: "#1c1230", border: `1px solid ${error ? "#f72585" : "#3a2560"}`, borderRadius: 2, color: "#f0e6ff", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#7b2fff", marginBottom: "0.5rem" }}>Password</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" autoComplete="current-password" required style={{ width: "100%", padding: "0.85rem 1rem", background: "#1c1230", border: `1px solid ${error ? "#f72585" : "#3a2560"}`, borderRadius: 2, color: "#f0e6ff", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          {error && <p style={{ fontSize: "0.65rem", color: "#f72585", marginBottom: "0.75rem", fontFamily: "'DM Mono', monospace" }}>{error}</p>}
          <button type="submit" disabled={loading || !email || !password} style={{ width: "100%", padding: "1rem 2rem", background: loading || !email || !password ? "rgba(123,47,255,0.2)" : "linear-gradient(135deg, #b5179e 0%, #f72585 50%, #7b2fff 100%)", border: "none", borderRadius: 1, color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", cursor: loading || !email || !password ? "not-allowed" : "pointer", marginTop: "0.5rem", opacity: loading || !email || !password ? 0.5 : 1 }}>
            {loading ? "Entering…" : "Enter the Studio"}
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
