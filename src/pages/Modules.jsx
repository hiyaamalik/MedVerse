import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import doorImg from "../assets/door.png";    // Use cropped door asset (or image.jpg temporarily)
import plantImg from "../assets/plant.png";  // Use cropped plant asset (or image.jpg temporarily)

const departments = [
  "Emergency",
  "Cardiology",
  "Pediatrics",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Dentistry"
];

function Modules() {
  const doorsTrackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxVisibleDoors, setMaxVisibleDoors] = useState(4);

  // Calculate how many doors are visible based on screen width
  useEffect(() => {
    const updateVisibleDoors = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setMaxVisibleDoors(2);
      } else if (width < 1024) {
        setMaxVisibleDoors(3);
      } else {
        setMaxVisibleDoors(4);
      }
    };

    updateVisibleDoors();
    window.addEventListener('resize', updateVisibleDoors);
    
    return () => window.removeEventListener('resize', updateVisibleDoors);
  }, []);

  const scrollByAmount = (amount) => {
    if (doorsTrackRef.current) {
      doorsTrackRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const scrollToIndex = (index) => {
    if (doorsTrackRef.current) {
      const doorWidth = 216 + 38.4; // door width + gap
      doorsTrackRef.current.scrollTo({ 
        left: index * doorWidth, 
        behavior: "smooth" 
      });
      setActiveIndex(index);
    }
  };

  // Handle scroll events to update active dot
  const handleScroll = () => {
    if (doorsTrackRef.current) {
      const scrollLeft = doorsTrackRef.current.scrollLeft;
      const doorWidth = 216 + 38.4; // door width + gap
      const newIndex = Math.round(scrollLeft / doorWidth);
      setActiveIndex(newIndex);
    }
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
      padding: "0",
      paddingTop: "90px",
      width: "100%",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "700",
      textAlign: "left",
      background: "linear-gradient(45deg, #fff, #e0e7ff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
      letterSpacing: "0.1em",
      marginBottom: "1.5rem",
      width: "80%",
    },
    corridorWrap: {
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      position: "relative",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
    corridorFloor: {
      position: "relative",
      width: "100%",
      height: "78px",
      background: "#F6CF4E",
      zIndex: 2,
      borderTopLeftRadius: "2rem",
      borderTopRightRadius: "2rem",
      marginTop: "-5px",
    },
    plantsContainer: {
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
      position: "absolute",
      bottom: "78px",
      zIndex: 5,
      padding: "0 20px",
      boxSizing: "border-box",
    },
    plant: {
      width: "82px",
      height: "auto",
    },
    doorsContainer: {
      width: "100%",
      position: "relative",
      marginBottom: "20px",
    },
    doorsTrackScroll: {
      display: "flex",
      gap: "2.4rem",
      overflowX: "auto",
      scrollBehavior: "smooth",
      width: "100%",
      minHeight: "330px",
      padding: "0 70px",
      boxSizing: "border-box",
      zIndex: 4,
      position: "relative",
      scrollbarWidth: "none", // Hide scrollbar for Firefox
      msOverflowStyle: "none", // Hide scrollbar for IE
      "&::-webkit-scrollbar": {
        display: "none", // Hide scrollbar for Chrome, Safari, Opera
      },
    },
    doorBlock: {
      width: "216px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "6px",
      flexShrink: 0,
    },
    doorLabel: {
      background: "#429ac3",
      color: "#fff",
      fontWeight: 500,
      borderRadius: "10px",
      padding: "10px 0",
      width: "98%",
      textAlign: "center",
      letterSpacing: "0.04em",
      fontSize: "1.08rem",
      marginBottom: "9px"
    },
    door: {
      width: "196px",
      height: "250px",
      background: "rgba(220,220,255,0.13)",
      border: "3px solid rgba(180, 180, 200, 0.12)",
      borderRadius: "7px",
      boxShadow: "0 6px 32px rgba(32,32,60, 0.12)",
      overflow: "hidden",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 2
    },
    doorImg: { maxWidth: "97%", maxHeight: "97%" },
    arrow: {
      background: "rgba(32,32,32,0.55)",
      border: "none",
      borderRadius: "50%",
      color: "#fff",
      fontSize: "2.5rem",
      width: "54px",
      height: "54px",
      cursor: "pointer",
      transition: "background 0.15s, transform 0.15s",
      zIndex: 6,
      display:"flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    },
    leftArrow: {
      left: "10px",
    },
    rightArrow: {
      right: "10px",
    },
    dotsContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "20px",
      zIndex: 10,
    },
    dot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      margin: "0 5px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    activeDot: {
      backgroundColor: "#fff",
      transform: "scale(1.2)",
    },
  };

  // Calculate number of dots needed
  const totalDots = Math.ceil(departments.length / maxVisibleDoors);

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.title}>Modules</div>
        <div style={styles.corridorWrap}>
          <div style={styles.doorsContainer}>
            {/* Left Arrow */}
            <button 
              style={{...styles.arrow, ...styles.leftArrow}} 
              onClick={() => scrollByAmount(-260)} 
              aria-label="Scroll left"
            >
              &#60;
            </button>
            
            {/* Doors Scroller */}
            <div 
              style={styles.doorsTrackScroll} 
              ref={doorsTrackRef}
              onScroll={handleScroll}
            >
              {departments.map((dept, idx) => (
                <div key={dept} style={styles.doorBlock}>
                  <div style={styles.doorLabel}>{dept}</div>
                  <div
                    style={styles.door}
                    onClick={() => window.location.assign(`/department/${dept.toLowerCase()}`)}
                  >
                    <img src={doorImg} alt={dept + " Door"} style={styles.doorImg} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right Arrow */}
            <button 
              style={{...styles.arrow, ...styles.rightArrow}} 
              onClick={() => scrollByAmount(260)} 
              aria-label="Scroll right"
            >
              &#62;
            </button>
          </div>
          
          {/* Plants placed on top of the floor */}
          <div style={styles.plantsContainer}>
            <img src={plantImg} style={styles.plant} alt="Left plant" />
            <img src={plantImg} style={styles.plant} alt="Right plant" />
          </div>
          
          {/* Floor extending from one end to another */}
          <div style={styles.corridorFloor}></div>
          
          {/* Scroll dots indicator */}
          <div style={styles.dotsContainer}>
            {Array.from({ length: totalDots }).map((_, index) => (
              <div
                key={index}
                style={{
                  ...styles.dot,
                  ...(index === activeIndex ? styles.activeDot : {})
                }}
                onClick={() => scrollToIndex(index * maxVisibleDoors)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modules;