import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Home() {
  const [showContent, setShowContent] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('dots');
  
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
    introContainer: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#0a0a1a",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      flexDirection: "column",
    },
    heartPlusContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "40px",
    },
    heartContainer: {
      position: "relative",
      display: "grid",
      gridTemplateColumns: "repeat(15, 16px)",
      gridTemplateRows: "repeat(13, 16px)",
      gap: "4px",
    },
    dot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      background: "#20B2AA",
      opacity: 0,
      transform: "scale(0)",
      boxShadow: "0 0 15px rgba(32, 178, 170, 0.6)",
      transition: "all 0.3s ease",
    },
    plusSign: {
      position: "relative",
      width: "40px",
      height: "40px",
      marginLeft: "30px",
      opacity: 0,
      zIndex: 10,
    },
    plusVertical: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      width: "8px",
      height: "40px",
      backgroundColor: "#ff3b30",
      borderRadius: "4px",
    },
    plusHorizontal: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: "40px",
      height: "8px",
      backgroundColor: "#ff3b30",
      borderRadius: "4px",
    },
    medverseText: {
      color: "white",
      fontSize: "3.5rem",
      fontWeight: "bold",
      opacity: 0,
      background: "linear-gradient(45deg, #20B2AA, #7c3aed, #4f46e5)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textAlign: "center",
      transition: "opacity 1s ease",
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
      
      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes dotAppear {
        0% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1.2); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes dotPulse {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.1); }
        75% { transform: scale(0.75); }
      }
      
      @keyframes fadeInScale {
        0% { opacity: 0; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.9); }
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @keyframes slideInFromRight {
        0% { opacity: 0; transform: translateX(30px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      
      .beating-heart {
        animation: heartbeat 1.5s ease-in-out infinite;
      }
      
      .dot-appear {
        animation: dotAppear 0.6s ease-out forwards;
      }
      
      .dot-pulse {
        animation: dotPulse 2s ease-in-out infinite;
      }
      
      .text-appear {
        animation: fadeInScale 1s ease-out forwards;
      }
      
      .plus-appear {
        animation: slideInFromRight 0.8s ease-out forwards;
      }
      
      .intro-fadeout {
        animation: fadeOut 1s ease-in-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const runAnimation = async () => {
      // Predefined heart shape pattern that looks good from all angles
      const heartPattern = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,0,1,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      ];

      // Create heart dots with staggered animation
      const heartContainer = document.querySelector('.heart-container');
      const plusSign = document.querySelector('.plus-sign');
      
      if (heartContainer && plusSign) {
        const dots = heartContainer.children;
        let visibleDots = [];
        
        // Identify which dots should be visible (heart shape)
        for (let row = 0; row < 13; row++) {
          for (let col = 0; col < 15; col++) {
            const index = row * 15 + col;
            if (heartPattern[row][col] === 1) {
              dots[index].style.visibility = 'visible';
              visibleDots.push({ dot: dots[index], index: index });
            } else {
              dots[index].style.visibility = 'hidden';
            }
          }
        }

        // Animate dots appearing from center outward
        const centerIndex = Math.floor(visibleDots.length / 2);
        visibleDots.sort((a, b) => {
          const aDistance = Math.abs(a.index - centerIndex);
          const bDistance = Math.abs(b.index - centerIndex);
          return aDistance - bDistance;
        });

        // Phase 1: Dots appear with stagger
        for (let i = 0; i < visibleDots.length; i++) {
          setTimeout(() => {
            visibleDots[i].dot.classList.add('dot-appear');
          }, i * 40);
        }

        // Wait for dots to appear
        setTimeout(() => {
          // Phase 2: Heart beating effect
          heartContainer.classList.add('beating-heart');
          
          // Phase 3: Show plus sign (on the side)
          setTimeout(() => {
            plusSign.classList.add('plus-appear');
          }, 800);
          
          // Phase 4: Show text
          setTimeout(() => {
            setAnimationPhase('text');
            const textElement = document.querySelector('.medverse-text');
            if (textElement) {
              textElement.classList.add('text-appear');
            }
          }, 1200);
          
          // Phase 5: Start dot pulsing animation
          setTimeout(() => {
            visibleDots.forEach((item, index) => {
              setTimeout(() => {
                item.dot.classList.add('dot-pulse');
              }, index * 100);
            });
          }, 1800);
          
          // Phase 6: Complete animation and show main content
          setTimeout(() => {
            const introContainer = document.querySelector('.intro-container');
            if (introContainer) {
              introContainer.classList.add('intro-fadeout');
              setTimeout(() => {
                setShowContent(true);
              }, 1000);
            }
          }, 4000);
          
        }, visibleDots.length * 40 + 500);
      }
    };

    runAnimation();
  }, []);

  if (!showContent) {
    return (
      <div style={styles.introContainer} className="intro-container">
        <div style={styles.heartPlusContainer}>
          <div style={styles.heartContainer} className="heart-container">
            {Array.from({ length: 15 * 13 }).map((_, i) => (
              <div key={i} style={styles.dot} className="dot"></div>
            ))}
          </div>
          <div style={styles.plusSign} className="plus-sign">
            <div style={styles.plusVertical}></div>
            <div style={styles.plusHorizontal}></div>
          </div>
        </div>
        <div 
          style={{
            ...styles.medverseText,
            opacity: animationPhase === 'text' ? 1 : 0
          }}
          className="medverse-text"
        >
          MedVerse
        </div>
      </div>
    );
  }

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
              onClick={() => console.log("Try Now clicked")}
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