import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = ["emergency", "cardiology", "pediatrics", "neurology", "oncology", "orthopedics", "dentistry"];
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";
const ONEMG_SEARCH = "https://www.1mg.com/labs?wpsrc=Bing+Organic+Search";

const TOOLS = [
    {
        type: "function",
        function: {
            name: "navigate_to_department",
            description: "Navigate the patient to a specific hospital department page for treatment. Use this when patient describes symptoms that map to a department.",
            parameters: {
                type: "object",
                properties: {
                    department: { type: "string", enum: DEPARTMENTS, description: "The department to navigate to" },
                    reason: { type: "string", description: "Short explanation of why this department is recommended" },
                },
                required: ["department", "reason"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "set_reminder",
            description: "Set a medicine or medical test reminder for the patient.",
            parameters: {
                type: "object",
                properties: {
                    reminder_type: { type: "string", enum: ["medicine", "test"], description: "Type of reminder" },
                    name: { type: "string", description: "Medicine name or test name" },
                    time: { type: "string", description: "Time for the reminder e.g. '8:00 AM'" },
                    frequency: { type: "string", description: "How often e.g. 'daily', 'twice daily', 'every Monday'" },
                    note: { type: "string", description: "Additional note or dosage instructions" },
                },
                required: ["reminder_type", "name", "time", "frequency"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "book_test",
            description: "Book a medical test or diagnostic appointment for the patient.",
            parameters: {
                type: "object",
                properties: {
                    test_name: { type: "string", description: "Name of the medical test or procedure" },
                    department: { type: "string", description: "Relevant department for the test" },
                    suggested_date: { type: "string", description: "A suggested date e.g. 'Tomorrow', 'Next Monday'" },
                    suggested_time: { type: "string", description: "Suggested appointment time e.g. '10:00 AM'" },
                    preparation: { type: "string", description: "Pre-test instructions e.g. 'Fasting required for 8 hours'" },
                },
                required: ["test_name", "department", "suggested_date", "suggested_time"],
            },
        },
    },
];

const buildSystemPrompt = () => `You are MedBot, the intelligent virtual reception assistant for MedVerse Hospital. You are warm, professional, and empathetic.

Available departments: Emergency, Cardiology, Pediatrics, Neurology, Oncology, Orthopedics, Dentistry.

Your 3 superpowers (ALWAYS use tools to act, never just describe what you'd do):
1. navigate_to_department — Direct patients to the right department based on symptoms
2. set_reminder — Set medicine or test reminders. Before calling this tool ALWAYS ask the patient for their 10-digit mobile number so an SMS confirmation can be sent (if they decline, proceed without it).
3. book_test — Schedule diagnostic tests or appointments. This will open 1mg's test booking page for them.

Symptom routing guide:
- Chest pain, heart palpitations, high blood pressure → Cardiology
- Life-threatening / severe / trauma / difficulty breathing → Emergency  
- Children under 18 → Pediatrics
- Headaches, seizures, dizziness, numbness, memory loss → Neurology
- Cancer, tumors, unexplained weight loss → Oncology
- Bone, joint, muscle, sports injuries → Orthopedics
- Teeth, gums, mouth pain → Dentistry

Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

Keep replies concise (2–4 sentences). Always use tools to take real action. Remind patients you're an AI and real medical decisions need a doctor.`;

const SUGGESTIONS = [
    "I have chest pain and shortness of breath",
    "Set a daily reminder for my blood pressure medication",
    "Book a blood test for tomorrow morning",
    "My child has a high fever",
    "I need an appointment for knee pain",
    "I have a severe toothache",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgenticChatbot() {
    const navigate = useNavigate();

    // API Key state — reads from env or localStorage
    const envKey = typeof import.meta !== "undefined" ? (import.meta.env?.VITE_GROQ_API_KEY || "") : "";
    const [apiKey, setApiKey] = useState(() => envKey || localStorage.getItem("medverse_groq_key") || "");
    const [keyInput, setKeyInput] = useState("");
    const [keySet, setKeySet] = useState(() => !!(envKey || localStorage.getItem("medverse_groq_key")));

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I'm **MedBot** 👋 — your virtual medical receptionist at MedVerse.\n\nI can:\n• 🏥 Route you to the right department based on your symptoms\n• 💊 Set medicine & test reminders\n• 🧪 Book diagnostic tests\n\nHow can I help you today?",
            id: "welcome",
        },
    ]);
    const [pendingActions, setPendingActions] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, pendingActions, isLoading]);

    // ── Key setup ──────────────────────────────────────────────────────────────
    const saveKey = () => {
        const k = keyInput.trim();
        if (!k) return;
        localStorage.setItem("medverse_groq_key", k);
        setApiKey(k);
        setKeySet(true);
    };

    // ── Tool execution ─────────────────────────────────────────────────────────
    const executeToolCall = (toolName, args) => {
        if (toolName === "navigate_to_department") {
            const action = { id: Date.now(), type: "navigate", dept: args.department, reason: args.reason };
            setPendingActions(prev => [...prev, action]);
            setTimeout(() => navigate(`/department/${args.department}`), 2500);
            return `Navigating to ${args.department} department now.`;
        }

        if (toolName === "set_reminder") {
            const reminders = JSON.parse(localStorage.getItem("medverse_reminders") || "[]");
            reminders.push({ id: Date.now(), ...args, createdAt: new Date().toISOString() });
            localStorage.setItem("medverse_reminders", JSON.stringify(reminders));
            const action = { id: Date.now(), type: "reminder", ...args };
            setPendingActions(prev => [...prev, action]);

            // ── SMS via Fast2SMS (if phone number provided & API key set) ─────
            const smsKey = typeof import.meta !== "undefined" ? (import.meta.env?.VITE_FAST2SMS_KEY || "") : "";
            if (args.phone_number && smsKey) {
                const smsMessage = `MedVerse Reminder: ${args.reminder_type === "medicine" ? "💊" : "🧪"} ${args.name} at ${args.time} (${args.frequency}).${args.note ? " Note: " + args.note : ""} - MedVerse Hospital`;
                fetch(`${FAST2SMS_URL}?authorization=${smsKey}&sender_id=MEDVRS&message=${encodeURIComponent(smsMessage)}&language=english&route=q&numbers=${args.phone_number}`, {
                    method: "GET",
                }).catch(() => { }); // fire-and-forget, fail silently
            }

            return `Reminder saved: ${args.name} at ${args.time}, ${args.frequency}.${args.phone_number ? " SMS sent to " + args.phone_number + "." : ""}`;
        }

        if (toolName === "book_test") {
            const bookings = JSON.parse(localStorage.getItem("medverse_bookings") || "[]");
            bookings.push({ id: Date.now(), ...args, status: "confirmed", createdAt: new Date().toISOString() });
            localStorage.setItem("medverse_bookings", JSON.stringify(bookings));
            const action = { id: Date.now(), type: "booking", ...args };
            setPendingActions(prev => [...prev, action]);

            // ── Open 1mg labs page — new tab, current tab untouched ──────────
            // requestAnimationFrame defers until after React's render cycle,
            // so the page never flashes white before the tab opens.
            requestAnimationFrame(() => {
                window.open(ONEMG_SEARCH, "_blank", "noopener,noreferrer");
            });

            return `Booked: ${args.test_name} on ${args.suggested_date} at ${args.suggested_time}. Opening 1mg booking page.`;
        }

        return "Action executed.";
    };

    // ── Send message ───────────────────────────────────────────────────────────
    const sendMessage = async (text) => {
        const userText = (text || input).trim();
        if (!userText || isLoading) return;
        setInput("");
        setPendingActions([]);

        const userMsg = { role: "user", content: userText, id: Date.now() };
        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setIsLoading(true);

        const apiHistory = updatedHistory
            .filter(m => m.id !== "welcome")
            .map(m => ({ role: m.role, content: m.content }));

        try {
            // Round 1 — with tools
            const res1 = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: [{ role: "system", content: buildSystemPrompt() }, ...apiHistory],
                    tools: TOOLS,
                    tool_choice: "auto",
                    temperature: 0.6,
                    max_tokens: 800,
                }),
            });

            if (!res1.ok) {
                const errData = await res1.json();
                throw new Error(errData.error?.message || `HTTP ${res1.status}`);
            }

            const data1 = await res1.json();
            const assistantMsg = data1.choices[0].message;

            // If tool calls, execute them and do round 2
            if (assistantMsg.tool_calls?.length) {
                const toolResults = [];
                for (const tc of assistantMsg.tool_calls) {
                    const args = JSON.parse(tc.function.arguments);
                    const result = executeToolCall(tc.function.name, args);
                    toolResults.push({ role: "tool", tool_call_id: tc.id, content: result });
                }

                // Round 2 — get final human-readable reply
                const res2 = await fetch(GROQ_API_URL, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: GROQ_MODEL,
                        messages: [
                            { role: "system", content: buildSystemPrompt() },
                            ...apiHistory,
                            assistantMsg,
                            ...toolResults,
                        ],
                        temperature: 0.6,
                        max_tokens: 500,
                    }),
                });
                const data2 = await res2.json();
                const finalText = data2.choices[0]?.message?.content || assistantMsg.content || "";
                setMessages(prev => [...prev, { role: "assistant", content: finalText, id: Date.now() }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: assistantMsg.content, id: Date.now() }]);
            }
        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: `⚠️ **Error:** ${err.message}\n\nPlease make sure your Groq API key is valid.`, id: Date.now(), isError: true },
            ]);
        }

        setIsLoading(false);
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    if (!keySet) {
        return (
            <div style={keyGateWrap}>
                <div style={keyGateBox}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>🔑</div>
                    <h3 style={{ color: "#fff", margin: "0 0 0.5rem", fontSize: "1.4rem" }}>Connect Groq API</h3>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
                        MedBot runs on Groq LLM. Paste your free Groq API key below to activate it.<br />
                        Get one at <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: "#818cf8" }}>console.groq.com</a>
                    </p>
                    <input
                        style={keyInput_style}
                        type="password"
                        placeholder="gsk_..."
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveKey()}
                    />
                    <button style={activateBtn} onClick={saveKey}>Activate MedBot →</button>
                </div>
            </div>
        );
    }

    return (
        <div style={chatWrap}>
            {/* Header */}
            <div style={chatHeader}>
                <div style={botAvatar}>🤖</div>
                <div>
                    <div style={botName}>MedBot</div>
                    <div style={botStatus}>
                        <span style={statusDot} />
                        Agentic AI · Groq LLM
                    </div>
                </div>
                <button
                    style={resetKeyBtn}
                    onClick={() => { localStorage.removeItem("medverse_groq_key"); setApiKey(""); setKeySet(false); setKeyInput(""); }}
                    title="Change API key"
                >⚙️</button>
            </div>

            {/* Messages */}
            <div style={messagesWrap}>
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                ))}

                {/* Action cards */}
                {pendingActions.map(action => (
                    <ActionCard key={action.id} action={action} />
                ))}

                {/* Typing indicator */}
                {isLoading && (
                    <div style={{ ...bubbleBase, ...assistantBubble, display: "inline-flex", gap: "5px", padding: "12px 16px", alignItems: "center" }}>
                        {[0, 1, 2].map(i => (
                            <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8", display: "block", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                        ))}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestion chips — only show when at welcome state */}
            {messages.length <= 1 && !isLoading && (
                <div style={suggestionWrap}>
                    <p style={suggestionLabel}>Quick starts:</p>
                    <div style={chipsRow}>
                        {SUGGESTIONS.map(s => (
                            <button key={s} style={chip} onClick={() => sendMessage(s)}>{s}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input bar */}
            <div style={inputBar}>
                <input
                    style={inputField}
                    placeholder="Describe your symptoms or ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    disabled={isLoading}
                />
                <button
                    style={{ ...sendBtn, opacity: (!input.trim() || isLoading) ? 0.4 : 1 }}
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                >
                    ➤
                </button>
            </div>

            <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
    const isUser = msg.role === "user";
    // Simple markdown-lite: bold, bullet points
    const renderContent = (text) => {
        const lines = text.split("\n").map((line, i) => {
            const formatted = line
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/^• /, "• ")
                .replace(/^\* /, "• ");
            return <div key={i} dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />;
        });
        return lines;
    };

    return (
        <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", animation: "fadeSlideIn 0.3s ease-out", marginBottom: "2px" }}>
            {!isUser && <div style={botAvatarSmall}>🤖</div>}
            <div style={{ ...bubbleBase, ...(isUser ? userBubble : assistantBubble), ...(msg.isError ? errorBubble : {}) }}>
                {renderContent(msg.content)}
            </div>
        </div>
    );
}

// ─── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({ action }) {
    const configs = {
        navigate: {
            icon: "🏥", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)",
            title: `Navigating to ${action.dept.charAt(0).toUpperCase() + action.dept.slice(1)}`,
            body: action.reason, label: "Opening department page in 2s..."
        },
        reminder: {
            icon: action.reminder_type === "medicine" ? "💊" : "🧪",
            color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.3)",
            title: `${action.reminder_type === "medicine" ? "Medicine" : "Test"} Reminder Set`,
            body: `${action.name} — ${action.time} (${action.frequency})${action.note ? "\n📋 " + action.note : ""}`,
            label: "Saved to your reminders ✓"
        },
        booking: {
            icon: "📅", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)",
            title: `Test Booked: ${action.test_name}`,
            body: `📆 ${action.suggested_date} at ${action.suggested_time}\n🏥 ${action.department}${action.preparation ? "\n⚠️ " + action.preparation : ""}`,
            label: "Booking confirmed ✓"
        },
    };
    const c = configs[action.type];
    if (!c) return null;

    return (
        <div style={{ animation: "fadeSlideIn 0.35s ease-out", marginBottom: "2px" }}>
            <div style={{ ...actionCard, background: c.bg, borderColor: c.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                    <span style={{ color: c.color, fontWeight: 700, fontSize: "0.95rem" }}>{c.title}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>{c.body}</div>
                <div style={{ color: c.color, fontSize: "0.8rem", marginTop: "0.6rem", fontWeight: 500 }}>{c.label}</div>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const chatWrap = {
    display: "flex", flexDirection: "column", height: "100%", minHeight: "520px",
    background: "rgba(10,10,30,0.6)", borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
    overflow: "hidden", fontFamily: "Inter, system-ui, sans-serif",
};

// Header
const chatHeader = {
    display: "flex", alignItems: "center", gap: "0.8rem",
    padding: "14px 18px", background: "rgba(79,70,229,0.15)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
};
const botAvatar = { width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 };
const botAvatarSmall = { width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", marginRight: "8px", flexShrink: 0, alignSelf: "flex-end" };
const botName = { color: "#fff", fontWeight: 700, fontSize: "0.95rem" };
const botStatus = { color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" };
const statusDot = { width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" };
const resetKeyBtn = { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", opacity: 0.6 };

// Messages
const messagesWrap = { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" };
const bubbleBase = { maxWidth: "78%", padding: "10px 14px", borderRadius: "14px", fontSize: "0.92rem", lineHeight: 1.6 };
const userBubble = { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", borderBottomRightRadius: 4 };
const assistantBubble = { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 };
const errorBubble = { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" };

// Action card
const actionCard = { border: "1px solid", borderRadius: "12px", padding: "12px 14px", marginLeft: "38px" };

// Suggestions
const suggestionWrap = { padding: "0 14px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" };
const suggestionLabel = { color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", margin: "10px 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" };
const chipsRow = { display: "flex", flexWrap: "wrap", gap: "6px" };
const chip = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", color: "rgba(255,255,255,0.65)", padding: "5px 12px", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" };

// Input
const inputBar = { display: "flex", gap: "8px", padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" };
const inputField = { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "10px 16px", color: "#fff", fontSize: "0.92rem", outline: "none", fontFamily: "inherit" };
const sendBtn = { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: "1rem", cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s" };

// Key gate
const keyGateWrap = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "420px", background: "rgba(10,10,30,0.5)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" };
const keyGateBox = { textAlign: "center", padding: "2.5rem", maxWidth: "360px" };
const keyInput_style = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", marginBottom: "1rem", fontFamily: "monospace" };
const activateBtn = { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: "24px", padding: "10px 24px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", width: "100%" };
