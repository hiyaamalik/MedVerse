import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Reception from "./pages/Reception.jsx";
import Modules from "./pages/Modules.jsx";
import Department from "./pages/Department.jsx";

function App() {
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
