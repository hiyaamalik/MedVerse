import React, { useState, useRef, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const DEPARTMENT_PROMPTS = {
    emergency: "You are the MedVerse Senior Emergency Physician. Your tone is urgent but calm, decisive, and clinical. You analyze emergency media (trauma images, rapid clinical videos) to provide immediate triage guidance. Disclaimer: This is AI triage; immediate physical intervention by a human doctor is required for life-threatening cases.",
    cardiology: "You are the MedVerse Chief of Cardiology. You specialize in interpreting ECGs, echocardiogram videos, and heart sound recordings. Your tone is highly professional and precise. You explain complex cardiovascular data in understandable clinical terms.",
    pediatrics: "You are the MedVerse Lead Pediatrician. Your tone is warm, reassuring, and child-specialist professional. You analyze pediatric clinical images and symptoms with extreme care, focusing on child-specific medical norms.",
    neurology: "You are the MedVerse Clinical Neurologist. You specialize in brain imaging analysis, neurological reflex videos, and cognitive reports. Your tone is methodical, intellectual, and observational.",
    oncology: "You are the MedVerse Oncology Consultant. Your tone is empathetic, deeply professional, and meticulous. You analyze imaging reports and clinical presentations with extreme sensitivity and detail.",
    orthopedics: "You are the MedVerse Orthopedic Surgeon. You specialize in analyzing X-rays, MRI scans, and physical movement videos (gait analysis). Your tone is practical, biomechanical, and efficient.",
    dentistry: "You are the MedVerse Dental Specialist. You analyze oral clinical images and dental X-rays. Your tone is professional, observant, and focus on oral health pathology."
};

export default function MultimodalDoctor({ departmentId, departmentName }) {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const [apiKey, setApiKey] = useState(() => envKey || localStorage.getItem("medverse_gemini_key") || "");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hello. I am the **${departmentName} Specialist AI**. \n\nYou can upload **clinical images, audio recordings, or videos** of your symptoms/reports for analysis. \n\nHow can I assist your clinical coordination today?`,
            id: "welcome"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAttachedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const sendMessage = async () => {
        if (!input.trim() && !attachedFile) return;
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            alert("Please replace 'your_gemini_api_key_here' in your .env file with a real Google Gemini API Key.");
            return;
        }

        const userMsg = {
            role: "user",
            content: input,
            id: Date.now(),
            file: filePreview,
            fileName: attachedFile?.name
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setAttachedFile(null);
        setFilePreview(null);
        setIsLoading(true);

        try {
            let inlineData = null;
            if (attachedFile) {
                const b64 = await fileToBase64(attachedFile);
                inlineData = {
                    mimeType: attachedFile.type,
                    data: b64
                };
            }

            // Preparation of contents for Gemini
            // We move the system instruction into the message flow to avoid "Unknown name system_instruction" errors in v1
            const systemContext = [
                {
                    role: "user",
                    parts: [{ text: `SYSTEM INITIALIZATION: ${DEPARTMENT_PROMPTS[departmentId] || "You are a medverse specialist."}` }]
                },
                {
                    role: "model",
                    parts: [{ text: "Clinical Persona Initialized. I am ready to analyze patient media and symptoms for this department." }]
                }
            ];

            const history = messages
                .filter(m => m.id !== "welcome")
                .map(m => ({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{ text: m.content }]
                }));

            const currentPart = { text: userMsg.content || "Analyze the attached media." };
            const parts = [currentPart];
            if (inlineData) parts.push({ inline_data: inlineData });

            const contents = [
                ...systemContext,
                ...history,
                { role: "user", parts }
            ];

            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: 0.4,
                        topK: 32,
                        topP: 1,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Gemini API Error");
            }

            const data = await response.json();
            const aiText = data.candidates[0]?.content?.parts[0]?.text || "I was unable to analyze this. Please try again.";

            setMessages(prev => [...prev, { role: "assistant", content: aiText, id: Date.now() }]);

        } catch (err) {
            console.error("Gemini Error:", err);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `⚠️ **API Error:** ${err.message}\n\n*Help: If you see "Model not found", ensure your key is for 'Google AI Studio' and 'Generative Language API' is enabled.*`,
                id: Date.now(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={chatWrap}>
            <div style={chatHeader}>
                <div style={botAvatar}>{departmentData[departmentId]?.icon || "🩺"}</div>
                <div>
                    <div style={botName}>{departmentName} Specialist AI</div>
                    <div style={botStatus}>
                        <span style={statusDot} />
                        Multimodal Diagnostics · Gemini 1.5
                    </div>
                </div>
            </div>

            <div style={messagesWrap}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", width: "100%" }}>
                            {msg.role === "assistant" && <div style={botAvatarSmall}>🩺</div>}
                            <div style={{ ...bubbleBase, ...(msg.role === "user" ? userBubble : assistantBubble), ...(msg.isError ? errorBubble : {}) }}>
                                {msg.file && (
                                    <div style={filePreviewWrap}>
                                        {msg.file.startsWith("data:image") ? (
                                            <img src={msg.file} alt="attached" style={fileImg} />
                                        ) : msg.file.startsWith("data:video") ? (
                                            <video src={msg.file} controls style={fileImg} />
                                        ) : (
                                            <div style={fileDoc}>📄 {msg.fileName}</div>
                                        )}
                                    </div>
                                )}
                                <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ ...bubbleBase, ...assistantBubble, display: "inline-flex", gap: "5px", padding: "12px 16px", alignItems: "center" }}>
                        <span className="dot-blink">Analyzing media</span>
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block", animation: `bounce 1.2s infinite ${i * 0.2}s` }} />
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {filePreview && (
                <div style={currentFilePreview}>
                    <span style={{ fontSize: "0.8rem", color: "#818cf8", fontWeight: 600 }}>Media Attached:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                        {filePreview.startsWith("data:image") ? (
                            <img src={filePreview} style={{ height: 40, borderRadius: 4 }} alt="preview" />
                        ) : (
                            <div style={{ fontSize: "1.2rem" }}>📄</div>
                        )}
                        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{attachedFile?.name}</span>
                        <button onClick={() => { setAttachedFile(null); setFilePreview(null); }} style={removeFileBtn}>✕</button>
                    </div>
                </div>
            )}

            <div style={inputBar}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept="image/*,audio/*,video/*"
                />
                <button style={attachBtn} onClick={() => fileInputRef.current.click()}>📎</button>
                <input
                    style={inputField}
                    placeholder="Ask about your symptoms or medical reports..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                />
                <button
                    style={{ ...sendBtn, opacity: (isLoading || (!input.trim() && !attachedFile)) ? 0.5 : 1 }}
                    onClick={sendMessage}
                    disabled={isLoading || (!input.trim() && !attachedFile)}
                >
                    ➤
                </button>
            </div>

            <style>{`
                @keyframes bounce { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-4px); opacity: 1; } }
                .dot-blink { font-size: 0.8rem; opacity: 0.7; margin-right: 4px; }
            `}</style>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const departmentData = {
    emergency: { icon: "🚑" }, cardiology: { icon: "❤️" }, pediatrics: { icon: "👶" },
    neurology: { icon: "🧠" }, oncology: { icon: "🦠" }, orthopedics: { icon: "🦴" }, dentistry: { icon: "😁" }
};

const chatWrap = { display: "flex", flexDirection: "column", height: "600px", background: "rgba(10,10,30,0.7)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", overflow: "hidden" };
const chatHeader = { padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "12px" };
const botAvatar = { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" };
const botAvatarSmall = { width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", marginRight: "8px", flexShrink: 0, alignSelf: "flex-end" };
const botName = { color: "#fff", fontWeight: 700, fontSize: "1rem" };
const botStatus = { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" };
const statusDot = { width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.4)" };
const messagesWrap = { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "4px" };
const bubbleBase = { maxWidth: "85%", padding: "12px 16px", borderRadius: "18px", fontSize: "0.95rem", lineHeight: 1.6 };
const userBubble = { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", borderBottomRightRadius: "4px" };
const assistantBubble = { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderBottomLeftRadius: "4px" };
const errorBubble = { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" };
const inputBar = { padding: "16px", background: "rgba(0,0,0,0.3)", display: "flex", gap: "10px", alignItems: "center" };
const inputField = { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "30px", padding: "10px 18px", color: "#fff", fontSize: "0.95rem", outline: "none" };
const attachBtn = { background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem", padding: "0 5px" };
const sendBtn = { width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const filePreviewWrap = { marginBottom: "10px", maxWidth: "100%" };
const fileImg = { maxWidth: "100%", borderRadius: "8px", maxHeight: "250px" };
const fileDoc = { padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", fontSize: "0.85rem" };
const currentFilePreview = { padding: "10px 20px", background: "rgba(79,70,229,0.1)", borderTop: "1px solid rgba(255,255,255,0.05)" };
const removeFileBtn = { background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "auto", fontSize: "1.1rem" };
