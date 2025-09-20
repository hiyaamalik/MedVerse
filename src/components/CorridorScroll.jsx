import React from "react";
import { Link } from "react-router-dom";

const CorridorScroll = ({ departments }) => {
  const styles = {
    corridor: {
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      padding: "60px",
      overflowX: "auto",
    },
    door: {
      background: "#203a43",
      padding: "50px 20px",
      borderRadius: "10px",
      minWidth: "150px",
      textAlign: "center",
      transition: "transform 0.3s",
      cursor: "pointer",
    },
    link: {
      color: "white",
      textDecoration: "none",
      fontWeight: "bold",
      fontSize: "1.1rem",
    },
  };

  return (
    <section style={styles.corridor}>
      {departments.map((dept, idx) => (
        <div
          key={idx}
          style={styles.door}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Link to={`/department/${idx + 1}`} style={styles.link}>
            {dept}
          </Link>
        </div>
      ))}
    </section>
  );
};

export default CorridorScroll;
