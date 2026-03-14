import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

function Navbar() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const updatePadding = () => {
      const navbar = document.getElementById("navbar");
      if (navbar) document.body.style.paddingTop = navbar.offsetHeight + "px";
    };
    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  const navStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 24px",
    background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
    color: "white", position: "fixed", top: 0, left: 0,
    width: "100%", boxSizing: "border-box", overflowX: "hidden", zIndex: 1000,
    backdropFilter: "blur(10px)",
  };
  const logoStyle = { fontSize: "1.4rem", fontWeight: 800, whiteSpace: "nowrap", letterSpacing: "0.05em", color: "#fff", textDecoration: "none" };
  const listStyle = { display: "flex", listStyle: "none", gap: "6px", margin: 0, padding: 0, alignItems: "center", flexWrap: "wrap" };
  const linkStyle = ({ isActive }) => ({
    textDecoration: "none", color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.75)",
    fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap",
    padding: "6px 12px", borderRadius: "8px",
    background: isActive ? "rgba(165,180,252,0.1)" : "transparent",
    transition: "all 0.2s ease", fontSize: "0.95rem",
  });
  const externalStyle = { textDecoration: "none", color: "rgba(255,255,255,0.75)", fontWeight: 400, padding: "6px 12px", borderRadius: "8px", transition: "all 0.2s ease", fontSize: "0.95rem" };
  const avatarStyle = { width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", color: "#fff" };
  const loginBtnStyle = { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: "20px", padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };
  const logoutBtn = { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "5px 12px", fontSize: "0.8rem", cursor: "pointer" };

  return (
    <>
      <nav id="navbar" style={navStyle}>
        <NavLink to="/" style={logoStyle}>MEDVERSE</NavLink>
        <ul style={listStyle}>
          <li><NavLink to="/" style={linkStyle} end>About Us</NavLink></li>
          <li><NavLink to="/reception" style={linkStyle}>Reception</NavLink></li>
          <li><NavLink to="/modules" style={linkStyle}>Modules</NavLink></li>
          <li><a href="https://github.com/hiyaamalik/MedVerse" target="_blank" rel="noreferrer" style={externalStyle}>GitHub</a></li>
          <li><NavLink to="/contribute" style={linkStyle}>Contribute</NavLink></li>
          <li><NavLink to="/contact" style={linkStyle}>Contact Us</NavLink></li>
          <li style={{ marginLeft: "8px" }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={avatarStyle} title={user.name}>{user.avatar}</div>
                <button style={logoutBtn} onClick={logout}>Sign Out</button>
              </div>
            ) : (
              <button style={loginBtnStyle} onClick={() => setShowAuth(true)}>Sign In</button>
            )}
          </li>
        </ul>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default Navbar;

