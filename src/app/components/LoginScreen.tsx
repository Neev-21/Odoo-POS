import { useState } from "react";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#FDFBF7" }}
    >
      {/* Left: cafe image */}
      <div className="relative h-full overflow-hidden" style={{ width: "40%" }}>
        <img
          src="https://images.unsplash.com/photo-1775050704009-94e3a9cd223d?w=900&h=900&fit=crop&auto=format"
          alt="Barista pouring latte art"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(44,26,17,0.18) 0%, rgba(196,98,45,0.10) 100%)" }}
        />
        {/* Brand mark */}
        <div className="absolute bottom-10 left-10">
          <p
            className="tracking-widest uppercase text-white/60"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.22em" }}
          >
            Point of Sale
          </p>
          <h1
            className="text-white mt-1"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", lineHeight: 1.1 }}
          >
            Grounds &<br />Grace
          </h1>
        </div>
      </div>

      {/* Right: form */}
      <div className="h-full flex flex-col items-center justify-center" style={{ width: "60%", background: "#FDFBF7", padding: "0 10%" }}>
        <div className="w-full" style={{ maxWidth: "420px" }}>
          {/* Logo text */}
          <p
            className="mb-10 tracking-widest uppercase"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.22em",
              color: "#C4622D",
            }}
          >
            Cafe POS · Staff Access
          </p>

          {/* Toggle */}
          <div
            className="flex relative mb-10 p-1 rounded-full w-full"
            style={{ background: "#EDE5DB" }}
          >
            <button
              onClick={() => setMode("login")}
              className="relative z-10 flex-1 py-2 rounded-full transition-all duration-200"
              style={{
                background: mode === "login" ? "#2C1A11" : "transparent",
                color: mode === "login" ? "#FDFBF7" : "#7A5C48",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
              }}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className="relative z-10 flex-1 py-2 rounded-full transition-all duration-200"
              style={{
                background: mode === "signup" ? "#2C1A11" : "transparent",
                color: mode === "signup" ? "#FDFBF7" : "#7A5C48",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "38px",
              color: "#2C1A11",
              lineHeight: 1.15,
              marginBottom: "36px",
            }}
          >
            {mode === "login" ? <>Welcome<br />back.</> : <>Create your<br />account.</>}
          </h2>

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: "12px", color: "#7A5C48", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full outline-none transition-all"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1.5px solid rgba(44,26,17,0.2)",
                    padding: "12px 0",
                    fontSize: "16px",
                    color: "#2C1A11",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "#C4622D")}
                  onBlur={(e) => (e.target.style.borderBottomColor = "rgba(44,26,17,0.2)")}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: "12px", color: "#7A5C48", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@groundsandgrace.com"
                className="w-full outline-none transition-all"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1.5px solid rgba(44,26,17,0.2)",
                  padding: "12px 0",
                  fontSize: "16px",
                  color: "#2C1A11",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "#C4622D")}
                onBlur={(e) => (e.target.style.borderBottomColor = "rgba(44,26,17,0.2)")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: "12px", color: "#7A5C48", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full outline-none transition-all"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1.5px solid rgba(44,26,17,0.2)",
                  padding: "12px 0",
                  fontSize: "16px",
                  color: "#2C1A11",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "#C4622D")}
                onBlur={(e) => (e.target.style.borderBottomColor = "rgba(44,26,17,0.2)")}
              />
            </div>
          </div>

          {/* CTA + forgot */}
          <div className="mt-10 flex flex-col gap-4">
            <button
              onClick={onLogin}
              className="w-full py-4 rounded-2xl transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              style={{
                background: "#C4622D",
                color: "#FDFBF7",
                fontSize: "15px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.04em",
                border: "none",
                cursor: "pointer",
              }}
            >
              Enter POS
            </button>

            {mode === "login" && (
              <button
                className="text-center transition-colors"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#7A5C48",
                  fontSize: "13px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#C4622D")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#7A5C48")}
              >
                Forgot Password?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
