import React from "react";
import Navbar from "../components/Navbar";
import ChatbotPlaceholder from "../components/ChatbotPlaceholder";
// Import the image correctly
import nurseImage from "../assets/nurse.png";

function Reception() {
  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 35%, #24243e 100%)",
      color: "white",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Arial', sans-serif",
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
    content: {
      maxWidth: "1000px",
      width: "100%",
      textAlign: "center",
    },
    contentWrapper: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "3rem",
      margin: "2rem 0",
      flexWrap: "wrap",
    },
    textSection: {
      flex: 1,
      textAlign: "left",
      minWidth: "300px",
    },
    imageSection: {
      flex: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: "300px",
    },
    nurseImage: {
      maxWidth: "100%",
      height: "auto",
      maxHeight: "400px",
      filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))",
    },
    titleSection: {
      marginBottom: "2rem",
    },
    receptionTitle: {
      fontSize: "3rem",
      fontWeight: "700",
      marginBottom: "0.5rem",
      background: "linear-gradient(45deg, #ffffff, #e0e7ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
      letterSpacing: "0.1em",
    },
    chatbotTitle: {
      fontSize: "2.2rem",
      fontWeight: "300",
      marginBottom: "2rem",
      color: "rgba(255, 255, 255, 0.9)",
      letterSpacing: "0.05em",
    },
    divider: {
      width: "100px",
      height: "4px",
      background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
      margin: "2rem auto",
      borderRadius: "2px",
    },
    navigationSection: {
      margin: "2rem 0 3rem 0",
    },
    navLinks: {
      display: "flex",
      justifyContent: "center",
      gap: "1.5rem",
      flexWrap: "wrap",
    },
    navLink: {
      color: "rgba(255, 255, 255, 0.8)",
      textDecoration: "none",
      fontSize: "1.1rem",
      fontWeight: "500",
      padding: "0.5rem 1rem",
      transition: "all 0.3s ease",
      position: "relative",
    },
    description: {
      fontSize: "1.2rem",
      fontWeight: "300",
      opacity: 0.9,
      lineHeight: "1.6",
      color: "rgba(255, 255, 255, 0.8)",
      marginBottom: "2rem",
      textAlign: "left",
    },
    chatbotSection: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      padding: "2rem",
      margin: "2rem 0",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
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
      background: "rgba(255, 255, 255, 0.05)",
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

  // Add floating animation styles
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      .nav-link::after {
        content: '';
        position: absolute;
        width: 0;
        height: 2px;
        bottom: 0;
        left: 50%;
        background: linear-gradient(90deg, #4f46e5, #7c3aed);
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }
      
      .nav-link:hover::after {
        width: 80%;
      }
      
      .nav-link:hover {
        color: white;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.page}>
      {/* Floating Background Elements */}
      <div style={styles.floatingElements}>
        <div style={{ ...styles.floatingCircle, ...styles.circle1 }}></div>
        <div style={{ ...styles.floatingCircle, ...styles.circle2 }}></div>
        <div style={{ ...styles.floatingCircle, ...styles.circle3 }}></div>
      </div>

      <Navbar />

      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.titleSection}>
            <h1 style={styles.receptionTitle}>RECEPTION</h1>
            <h2 style={styles.chatbotTitle}>AGENTIC CHATBOT</h2>
            <div style={styles.divider}></div>
          </div>
          {/* Correct layout: both chatbot and image in a row */}
          <div style={styles.contentWrapper}>
            <div style={styles.chatbotSection}>
              <ChatbotPlaceholder label="Agentic Chatbot Interface" />
            </div>
            <div style={styles.imageSection}>
              <img
                src={nurseImage}
                alt="Friendly Nurse"
                style={styles.nurseImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reception;
