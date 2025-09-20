import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  useEffect(() => {
    const navbar = document.getElementById("navbar");
    if (navbar) {
      document.body.style.paddingTop = navbar.offsetHeight + "px";
    }
  }, []);

  const styles = {
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",  // reduced padding for better fit
      background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
      color: "white",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      maxWidth: "100vw",
      boxSizing: "border-box",
      overflowX: "hidden", // prevent horizontal scroll
      zIndex: 1000,
    },
    logo: { fontSize: "1.5rem", fontWeight: "bold", whiteSpace: "nowrap" },
    navLinks: {
      display: "flex",
      listStyle: "none",
      gap: "20px",
      margin: 0,
      padding: 0,
      flexWrap: "wrap",        // allow wrapping on small screens
      maxWidth: "calc(100vw - 180px)", // leave space for logo + padding
      overflowX: "auto",       // horizontal scroll if needed
    },
    link: {
      textDecoration: "none",
      color: "white",
      fontWeight: 500,
      whiteSpace: "nowrap",
      userSelect: "none",
      transition: "color 0.3s ease",
    },
  };

  return (
    <nav id="navbar" style={styles.navbar}>
      <div style={styles.logo}>MEDVERSE</div>
      <ul style={styles.navLinks}>
        <li><Link to="/" style={styles.link}>About Us</Link></li>
        <li><Link to="/reception" style={styles.link}>Reception</Link></li>
        <li><Link to="/modules" style={styles.link}>Modules</Link></li>
        <li><a href="https://github.com/hiyaamalik/MedVerse" target="_blank" rel="noreferrer" style={styles.link}>GitHub</a></li>
        <li><Link to="/contribute" style={styles.link}>Contribute</Link></li>
        <li><Link to="/contact" style={styles.link}>Contact Us</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
