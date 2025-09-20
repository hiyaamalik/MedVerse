import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatbotPlaceholder from "../components/ChatbotPlaceholder";

function Department() {
  const { id } = useParams();

  // Department data mapping
  const departmentData = {
    "emergency": { 
      name: "Emergency Department", 
      icon: "🚑", 
      description: "24/7 emergency care for critical conditions",
      color: "#FF5252"
    },
    "cardiology": { 
      name: "Cardiology", 
      icon: "❤️", 
      description: "Heart and cardiovascular health specialists",
      color: "#FF79C6"
    },
    "pediatrics": { 
      name: "Pediatrics", 
      icon: "👶", 
      description: "Healthcare for children and adolescents",
      color: "#50FA7B"
    },
    "neurology": { 
      name: "Neurology", 
      icon: "🧠", 
      description: "Brain and nervous system specialists",
      color: "#8BE9FD"
    },
    "oncology": { 
      name: "Oncology", 
      icon: "🦠", 
      description: "Cancer diagnosis and treatment",
      color: "#FFB86C"
    },
    "orthopedics": { 
      name: "Orthopedics", 
      icon: "🦴", 
      description: "Bone, joint and muscle specialists",
      color: "#BD93F9"
    },
    "dentistry": { 
      name: "Dentistry", 
      icon: "😁", 
      description: "Dental care and oral health specialists",
      color: "#F1FA8C"
    },
  };

  const department = departmentData[id] || { 
    name: `Department ${id}`, 
    icon: "🏥", 
    description: "Specialized medical care",
    color: "#6272A4"
  };

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
      paddingTop: "120px", // This matches the navbar height + padding
    },
    heroSection: {
      textAlign: "center",
      maxWidth: "900px",
      margin: "0 auto 2rem auto",
    },
    title: {
      fontSize: "3.5rem",
      fontWeight: "700",
      marginBottom: "1rem",
      background: "linear-gradient(45deg, #ffffff, #e0e7ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
      letterSpacing: "-0.02em",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
    },
    departmentIcon: {
      fontSize: "3rem",
    },
    subtitle: {
      fontSize: "1.5rem",
      fontWeight: "400",
      opacity: 0.9,
      lineHeight: 1.6,
      maxWidth: "600px",
      margin: "0 auto 2rem auto",
    },
    featureCard: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "16px",
      padding: "2.5rem",
      margin: "2rem auto",
      maxWidth: "900px",
      width: "90%",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    },
    cardTitle: {
      fontSize: "2rem",
      fontWeight: "600",
      marginBottom: "1.5rem",
      color: "#ffffff",
      textAlign: "center",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2.5rem",
    },
    infoCard: {
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "12px",
      padding: "1.5rem",
      textAlign: "left",
      transition: "all 0.3s ease",
      borderLeft: `4px solid ${department.color}`,
    },
    infoTitle: {
      fontSize: "1.1rem",
      fontWeight: "600",
      marginBottom: "0.8rem",
      color: "#e0e7ff",
    },
    infoText: {
      fontSize: "1rem",
      opacity: 0.9,
      lineHeight: 1.5,
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
    backButton: {
      background: "rgba(255, 255, 255, 0.1)",
      color: "white",
      padding: "0.8rem 1.5rem",
      fontSize: "1rem",
      fontWeight: "500",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "50px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginBottom: "2rem",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    staffSection: {
      marginTop: "2rem",
      padding: "1.5rem",
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "12px",
    },
    staffTitle: {
      fontSize: "1.3rem",
      fontWeight: "600",
      marginBottom: "1rem",
      color: "#e0e7ff",
    },
    staffGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
    },
    staffCard: {
      background: "rgba(255, 255, 255, 0.03)",
      borderRadius: "8px",
      padding: "1rem",
      textAlign: "center",
    },
  };

  // Add floating animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      .back-button:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
      
      .info-card:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-3px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
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
        <button 
          style={styles.backButton}
          className="back-button"
          onClick={() => window.history.back()}
        >
          ← Back to Departments
        </button>
        
        <section style={styles.heroSection}>
          <h1 style={styles.title}>
            <span style={styles.departmentIcon}>{department.icon}</span>
            {department.name}
          </h1>
          <p style={styles.subtitle}>
            {department.description}
          </p>
        </section>
        
        <div style={styles.featureCard}>
          <div style={styles.infoGrid}>
            <div style={styles.infoCard} className="info-card">
              <h3 style={styles.infoTitle}>Services Offered</h3>
              <p style={styles.infoText}>
                Comprehensive diagnostic services, treatment plans, specialized procedures, 
                and follow-up care tailored to your specific needs.
              </p>
            </div>
            
            <div style={styles.infoCard} className="info-card">
              <h3 style={styles.infoTitle}>Operating Hours</h3>
              <p style={styles.infoText}>
                Monday - Friday: 8:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 2:00 PM<br />
                {id === "emergency" ? "Open 24/7" : "Emergency services available 24/7"}
              </p>
            </div>
            
            <div style={styles.infoCard} className="info-card">
              <h3 style={styles.infoTitle}>Contact Information</h3>
              <p style={styles.infoText}>
                Phone: (555) 123-4567<br />
                Email: {id}@medverse.hospital<br />
                Location: Main Building, Floor 3
              </p>
            </div>
          </div>
          
          <div style={styles.staffSection}>
            <h3 style={styles.staffTitle}>Our Specialists</h3>
            <div style={styles.staffGrid}>
              <div style={styles.staffCard}>
                <h4>Dr. Smith</h4>
                <p>Senior Specialist</p>
              </div>
              <div style={styles.staffCard}>
                <h4>Dr. Johnson</h4>
                <p>Head of Department</p>
              </div>
              <div style={styles.staffCard}>
                <h4>Dr. Williams</h4>
                <p>Consultant</p>
              </div>
            </div>
          </div>
          
          <h2 style={styles.cardTitle}>How can we assist you today?</h2>
          <ChatbotPlaceholder label="Department Specialist AI Assistant" />
        </div>
      </div>
    </div>
  );
}

export default Department;