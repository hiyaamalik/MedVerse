import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("medverse_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem("medverse_users") || "[]");
    if (users.find((u) => u.email === email)) {
      return { error: "Email already registered." };
    }
    const newUser = { id: Date.now(), name, email, password, avatar: name[0].toUpperCase() };
    users.push(newUser);
    localStorage.setItem("medverse_users", JSON.stringify(users));
    const session = { id: newUser.id, name, email, avatar: newUser.avatar };
    setUser(session);
    localStorage.setItem("medverse_user", JSON.stringify(session));
    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("medverse_users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { error: "Invalid email or password." };
    const session = { id: found.id, name: found.name, email: found.email, avatar: found.avatar };
    setUser(session);
    localStorage.setItem("medverse_user", JSON.stringify(session));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("medverse_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
