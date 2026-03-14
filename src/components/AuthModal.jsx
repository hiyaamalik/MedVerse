import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ACCENT = "#4f46e5";

export default function AuthModal({ onClose }) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState("login"); // 'login' | 'register'
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const submit = () => {
        setError("");
        if (!email || !password || (mode === "register" && !name)) {
            setError("Please fill in all fields.");
            return;
        }
        const result = mode === "login" ? login(email, password) : register(name, email, password);
        if (result.error) setError(result.error);
        else onClose();
    };

    return (
        <div style={overlay}>
            <div style={modal}>
                {/* Header */}
                <div style={header}>
                    <h2 style={headerTitle}>{mode === "login" ? "Welcome back" : "Join MedVerse"}</h2>
                    <p style={headerSub}>
                        {mode === "login"
                            ? "Sign in to contribute to the community"
                            : "Create an account to share your work"}
                    </p>
                    <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Tabs */}
                <div style={tabs}>
                    {["login", "register"].map((m) => (
                        <button
                            key={m}
                            style={{ ...tab, ...(mode === m ? activeTab : {}) }}
                            onClick={() => { setMode(m); setError(""); }}
                        >
                            {m === "login" ? "Sign In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div style={formWrap}>
                    {mode === "register" && (
                        <input
                            style={input}
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <input
                        style={input}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        style={input}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submit()}
                    />
                    {error && <div style={errorMsg}>{error}</div>}
                    <button style={submitBtn} onClick={submit}>
                        {mode === "login" ? "Sign In" : "Create Account"}
                    </button>
                </div>

                <p style={switchText}>
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <span
                        style={{ color: ACCENT, cursor: "pointer", fontWeight: 600 }}
                        onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                    >
                        {mode === "login" ? "Sign Up" : "Sign In"}
                    </span>
                </p>
            </div>
        </div>
    );
}

const overlay = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
};
const modal = {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px",
    padding: "2.5rem", width: "420px", maxWidth: "90vw", position: "relative",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
};
const header = { marginBottom: "1.5rem", position: "relative" };
const headerTitle = { color: "#fff", fontSize: "1.8rem", fontWeight: 700, margin: 0, marginBottom: "0.4rem" };
const headerSub = { color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", margin: 0 };
const closeBtn = {
    position: "absolute", top: 0, right: 0, background: "rgba(255,255,255,0.08)",
    border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%",
    cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center",
};
const tabs = { display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "0.3rem" };
const tab = {
    flex: 1, padding: "0.6rem", borderRadius: "8px", border: "none", background: "transparent",
    color: "rgba(255,255,255,0.55)", fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
};
const activeTab = { background: ACCENT, color: "#fff", boxShadow: "0 4px 12px rgba(79,70,229,0.4)" };
const formWrap = { display: "flex", flexDirection: "column", gap: "0.9rem" };
const input = {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
    padding: "0.85rem 1rem", color: "#fff", fontSize: "1rem", outline: "none",
    transition: "border-color 0.2s",
};
const errorMsg = { color: "#ff6b6b", fontSize: "0.9rem", textAlign: "center" };
const submitBtn = {
    background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, color: "#fff", border: "none",
    borderRadius: "10px", padding: "0.9rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s", marginTop: "0.3rem",
    boxShadow: "0 6px 20px rgba(79,70,229,0.35)",
};
const switchText = { color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", textAlign: "center", marginTop: "1.2rem", marginBottom: 0 };
