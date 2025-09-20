import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom"; 

function Home() {
  const navigate = useNavigate();
  
  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 35%, #24243e 100%)",
      color: "white",
      position: "relative",
      overflow: "hidden",
    },
    backgroundOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "url('/hospital-bg.jpg') no-repeat center center fixed",
      backgroundSize: "cover",
      opacity: 0.3,
      zIndex: 1,
    },
    container: {
      position: "relative",
      zIndex: 2,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      paddingTop: "120px",
    },
    heroSection: {
      textAlign: "center",
      maxWidth: "900px",
      margin: "0 auto",
    },
    title: {
      fontSize: "4.5rem",
      fontWeight: "700",
      marginBottom: "2rem",
      background: "linear-gradient(45deg, #ffffff, #e0e7ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: "1.5rem",
      fontWeight: "400",
      marginBottom: "3rem",
      opacity: 0.9,
      lineHeight: 1.6,
      maxWidth: "600px",
      margin: "0 auto 3rem auto",
    },
    ctaSection: {
      display: "flex",
      gap: "2rem",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: "4rem",
    },
    tryNowButton: {
      background: "linear-gradient(45deg, #4f46e5, #7c3aed)",
      color: "white",
      padding: "16px 32px",
      fontSize: "1.2rem",
      fontWeight: "600",
      border: "none",
      borderRadius: "50px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 25px rgba(79, 70, 229, 0.4)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    featureCard: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "16px",
      padding: "2rem",
      margin: "2rem auto",
      maxWidth: "800px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    },
    cardTitle: {
      fontSize: "2rem",
      fontWeight: "600",
      marginBottom: "1rem",
      color: "#ffffff",
    },
    cardContent: {
      fontSize: "1.1rem",
      opacity: 0.9,
      lineHeight: 1.6,
    },
    navigationLinks: {
      display: "flex",
      gap: "2rem",
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: "2rem",
    },
    navLink: {
      color: "rgba(255, 255, 255, 0.8)",
      textDecoration: "none",
      fontSize: "1rem",
      fontWeight: "500",
      padding: "0.5rem 1rem",
      borderRadius: "8px",
      transition: "all 0.3s ease",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    floatingElements: {
      position: "absolute",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 1,
    },
    floatingCircle: {
      position: "absolute",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.1)",
      animation: "float 6s ease-in-out infinite",
    },
    circle1: {
      width: "80px",
      height: "80px",
      top: "20%",
      left: "10%",
      animationDelay: "0s",
    },
    circle2: {
      width: "120px",
      height: "120px",
      top: "60%",
      right: "15%",
      animationDelay: "2s",
    },
    circle3: {
      width: "60px",
      height: "60px",
      bottom: "20%",
      left: "20%",
      animationDelay: "4s",
    },
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      .try-now-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 35px rgba(79, 70, 229, 0.6);
        background: linear-gradient(45deg, #5b52f0, #8b47ff);
      }
      
      .nav-link:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.backgroundOverlay}></div>

      {/* Floating Background Elements */}
      <div style={styles.floatingElements}>
        <div style={{ ...styles.floatingCircle, ...styles.circle1 }}></div>
        <div style={{ ...styles.floatingCircle, ...styles.circle2 }}></div>
        <div style={{ ...styles.floatingCircle, ...styles.circle3 }}></div>
      </div>

      {/* Use your actual Navbar component */}
      <Navbar />

      <div style={styles.container}>
        <section style={styles.heroSection}>
          <h1 style={styles.title}>Welcome to MedVerse</h1>
          <p style={styles.subtitle}>
            Experience the future of healthcare with our cutting-edge virtual
            hospital platform powered by advanced AI modules.
          </p>

          <div style={styles.ctaSection}>
            <button
              className="try-now-btn"
              style={styles.tryNowButton}
              onClick={() => navigate("/reception")}
            >
              Try Now
            </button>
          </div>
        </section>

        <div style={styles.featureCard}>
          <h2 style={styles.cardTitle}>Virtual Hospital Platform</h2>
          <p style={styles.cardContent}>
            Access comprehensive healthcare services through our innovative
            AI-powered modules. Get instant medical consultations, health
            assessments, and personalized treatment recommendations from the
            comfort of your home.
          </p>

          <div style={styles.navigationLinks}>
            <a href="#information" className="nav-link" style={styles.navLink}>
              Information
            </a>
            
            <span style={{ color: "rgba(255,255,255,0.5)" }}>|</span>
            <a href="#policies" className="nav-link" style={styles.navLink}>
              Policies
            </a>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>|</span>
            <a href="#more" className="nav-link" style={styles.navLink}>
              More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;