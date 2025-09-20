import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Reception from "./pages/Reception.jsx";
import Modules from "./pages/Modules.jsx";
import Department from "./pages/Department.jsx";

function App() {
  const [showContent, setShowContent] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('dots');

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
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

  const introStyles = {
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

  if (!showContent) {
    return (
      <div style={introStyles.introContainer} className="intro-container">
        <div style={introStyles.heartPlusContainer}>
          <div style={introStyles.heartContainer} className="heart-container">
            {Array.from({ length: 15 * 13 }).map((_, i) => (
              <div key={i} style={introStyles.dot} className="dot"></div>
            ))}
          </div>
          <div style={introStyles.plusSign} className="plus-sign">
            <div style={introStyles.plusVertical}></div>
            <div style={introStyles.plusHorizontal}></div>
          </div>
        </div>
        <div 
          style={{
            ...introStyles.medverseText,
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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/modules" element={<Modules />} />
      <Route path="/department/:id" element={<Department />} />
      <Route path="/reception" element={<Reception />} />

      {/* placeholder routes for contribute & contact */}
      <Route path="/contribute" element={<h2 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>Contribute Page (Coming Soon)</h2>} />
      <Route path="/contact" element={<h2 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>Contact Page (Coming Soon)</h2>} />
    </Routes>
  );
}

export default App;