import React from "react";

function ChatbotPlaceholder({ label = "Agentic Chatbot Interface" }) {
  const styles = {
    chatbot: {
      padding: "30px",
      border: "2px dashed rgba(79, 70, 229, 0.5)",
      borderRadius: "8px",
      fontSize: "1.1rem",
      textAlign: "center",
      background: "rgba(0, 0, 0, 0.2)",
      color: "rgba(255, 255, 255, 0.7)",
      minHeight: "200px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  return <div style={styles.chatbot}>{label}</div>;
}

export default ChatbotPlaceholder;