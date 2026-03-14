import React from "react";
import Navbar from "../components/Navbar";
import AgenticChatbot from "../components/AgenticChatbot";
import nurseImage from "../assets/nurse.png";

function Reception() {
  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 35%, #24243e 100%)",
      color: "white",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    blobs: {
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    },
    container: {
      position: "relative",
      zIndex: 2,
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "100px 24px 60px",
    },
    heroRow: {
      display: "flex",
      alignItems: "center",
      gap: "2rem",
      marginBottom: "2.5rem",
      flexWrap: "wrap",
    },
    heroText: { flex: 1, minWidth: "260px" },
    badge: {
      display: "inline-block",
      background: "rgba(79,70,229,0.2)",
      border: "1px solid rgba(79,70,229,0.4)",
      borderRadius: "50px",
      padding: "0.35rem 1rem",
      fontSize: "0.82rem",
      color: "#a5b4fc",
      marginBottom: "1rem",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    title: {
      fontSize: "clamp(2rem, 4vw, 3.2rem)",
      fontWeight: 800,
      margin: "0 0 0.8rem",
      background: "linear-gradient(135deg, #fff 0%, #c7d2fe 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      lineHeight: 1.15,
    },
    subtitle: {
      color: "rgba(255,255,255,0.6)",
      fontSize: "1rem",
      lineHeight: 1.7,
      maxWidth: "440px",
    },
    nurseWrap: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
    },
    nurseImg: {
      maxHeight: "220px",
      width: "auto",
      filter: "drop-shadow(0 10px 30px rgba(79,70,229,0.3))",
    },
    // Capabilities strip
    capsStrip: {
      display: "flex",
      gap: "0.8rem",
      flexWrap: "wrap",
      marginBottom: "2rem",
    },
    cap: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "50px",
      padding: "0.4rem 1rem",
      fontSize: "0.85rem",
      color: "rgba(255,255,255,0.7)",
    },
    // Chat area — full width, tall
    chatArea: {
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
      minHeight: "580px",
      display: "flex",
      flexDirection: "column",
    },
    disclaimer: {
      textAlign: "center",
      color: "rgba(255,255,255,0.25)",
      fontSize: "0.76rem",
      marginTop: "1.2rem",
    },
  };

  return (
    <div style={styles.page}>
      {/* Ambient blobs */}
      <div style={styles.blobs}>
        <div style={{ position: "absolute", width: 500, height: 500, top: -100, left: -100, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, bottom: "5%", right: -80, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <Navbar />

      <div style={styles.container}>
        {/* Hero row */}
        <div style={styles.heroRow}>
          <div style={styles.heroText}>
            <div style={styles.badge}>🏥 Virtual Reception</div>
            <h1 style={styles.title}>MedBot — Your AI<br />Medical Receptionist</h1>
            <p style={styles.subtitle}>
              Describe your symptoms, set reminders, book tests, or get routed to the
              right specialist — all through a single conversation.
            </p>
          </div>
          <div style={styles.nurseWrap}>
            <img src={nurseImage} alt="MedVerse Virtual Nurse" style={styles.nurseImg} />
          </div>
        </div>

        {/* Capability chips */}
        <div style={styles.capsStrip}>
          {[
            { icon: "🏥", label: "Route to 7 Departments" },
            { icon: "💊", label: "Medicine Reminders" },
            { icon: "🧪", label: "Test Booking" },
            { icon: "❓", label: "Medical Q&A" },
            { icon: "⚡", label: "Powered by Groq LLM" },
          ].map(c => (
            <div key={c.label} style={styles.cap}>
              <span>{c.icon}</span> {c.label}
            </div>
          ))}
        </div>

        {/* The chatbot — fills remaining width */}
        <div style={styles.chatArea}>
          <AgenticChatbot />
        </div>

        <p style={styles.disclaimer}>
          ⚠️ MedBot is an AI assistant for demonstration purposes. It is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}

export default Reception;
