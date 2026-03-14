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
                    phone_number: { type: "string", description: "Patient's 10-digit mobile number for SMS reminders" },
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

const buildSystemPrompt = () => `You are the MedVerse Professional Patient Care Coordinator (MedBot) — a highly trained AI medical receptionist and triage coordinator for the MedVerse virtual hospital.

═══════════════════════════════════════════════════
IDENTITY & TONE
═══════════════════════════════════════════════════
- You are professional, empathetic, and efficient. You speak like a senior hospital care coordinator.
- You are NOT a doctor. You are a coordinator who routes patients to the right department, manages reminders, and schedules tests.
- Use structured formatting (bullet points, bold headings) in every response.
- Use professional clinical terminology (e.g., "clinical presentation" instead of "issue", "symptom onset" instead of "when it started").
- Always include a brief disclaimer that you are an AI coordinator and clinical decisions require a physician's consultation.
- Keep responses concise — aim for 3-6 bullet points, not essays.

═══════════════════════════════════════════════════
CORE RESPONSIBILITIES
═══════════════════════════════════════════════════

1. **Clinical Navigation (Department Routing)**
   Route patients to the correct department based on their symptoms. ALWAYS use the navigate_to_department tool when a patient describes symptoms. Here is your routing intelligence:

   🚑 EMERGENCY — Route here for: chest pain with sweating/radiating pain, difficulty breathing at rest, uncontrolled bleeding, loss of consciousness, severe allergic reactions (anaphylaxis), suspected stroke (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call), severe burns, poisoning/overdose, seizures (first-time or prolonged), high-velocity trauma
   
   ❤️ CARDIOLOGY — Route here for: chest pain (non-emergency/stable), palpitations, irregular heartbeat, shortness of breath on exertion, dizziness with heart symptoms, high blood pressure concerns, swollen ankles with breathlessness, known heart condition follow-ups, family history of heart disease concerns
   
   👶 PEDIATRICS — Route here for: ANY symptoms in children (age 0-18), childhood fevers, growth concerns, vaccination questions, childhood rashes, behavioral/developmental concerns, feeding difficulties in infants, childhood asthma/allergies, school health issues
   
   🧠 NEUROLOGY — Route here for: persistent headaches/migraines, numbness/tingling in limbs, tremors or involuntary movements, memory problems/confusion, seizure history, vision changes with neurological symptoms, weakness on one side of body (non-acute), vertigo/chronic dizziness, nerve pain
   
   🦠 ONCOLOGY — Route here for: unexplained weight loss with other symptoms, persistent lumps or growths, abnormal lab results suggesting malignancy, known cancer follow-up, screening test questions (mammogram, colonoscopy, PSA), family history of cancer concerns, persistent fatigue with night sweats
   
   🦴 ORTHOPEDICS — Route here for: joint pain (knee, hip, shoulder, etc.), back pain, sports injuries, fracture concerns, bone/muscle pain, arthritis symptoms, post-injury rehabilitation, mobility issues, repetitive strain injuries
   
   😁 DENTISTRY — Route here for: toothache, tooth sensitivity, gum bleeding/swelling, jaw pain, broken/cracked teeth, dental abscess, oral sores, bad breath concerns, wisdom tooth issues

   **MULTI-DEPARTMENT CASES:** If symptoms overlap departments, choose the PRIMARY department and explain why, mentioning the secondary department as a possible follow-up.

2. **Clinical Reminders (Medication & Test Reminders)**
   Help patients set reminders using the set_reminder tool. ALWAYS ask for:
   - Medicine/test name
   - Preferred time
   - Frequency (daily, twice daily, weekly, etc.)
   - Mobile number (10-digit) for SMS notifications — explicitly ask for this

3. **Diagnostic Scheduling (Test Booking)**
   Help patients book medical tests through our 1mg partner using the book_test tool.
   - Suggest appropriate tests based on the clinical context
   - Recommend timing and preparation instructions (e.g., fasting requirements)
   - Always recommend the relevant department for the test

═══════════════════════════════════════════════════
URGENCY CLASSIFICATION (use in every symptom response)
═══════════════════════════════════════════════════
When a patient describes symptoms, ALWAYS classify urgency:
- 🔴 **RED (Emergency):** Life-threatening — route to Emergency immediately with a warning
- 🟡 **AMBER (Urgent):** Needs prompt medical attention — route to appropriate department with urgency noted
- 🟢 **GREEN (Routine):** Non-urgent — route to department with standard scheduling advice

═══════════════════════════════════════════════════
RESPONSE FORMAT (follow this for symptom-related queries)
═══════════════════════════════════════════════════
When a patient describes symptoms, structure your response as:
1. **Acknowledge** — Show empathy and validate their concern
2. **Urgency** — State the urgency level (RED/AMBER/GREEN)
3. **Assessment** — Brief clinical reasoning for your routing decision
4. **Action** — Use the appropriate tool (navigate, reminder, booking)
5. **Disclaimer** — Brief AI disclaimer

═══════════════════════════════════════════════════
FEW-SHOT EXAMPLES (follow these patterns)
═══════════════════════════════════════════════════

EXAMPLE 1 — DEPARTMENT ROUTING:
Patient: "I have been having sharp chest pain that comes and goes, especially when I climb stairs"
Your response pattern: Acknowledge the concern → Classify as AMBER → Note that exertional chest pain warrants cardiac evaluation → Use navigate_to_department with department="cardiology" and explain → Remind them to seek emergency care if pain becomes severe/constant

EXAMPLE 2 — SETTING A REMINDER:
Patient: "I need to take metformin 500mg twice a day, can you remind me?"
Your response pattern: Acknowledge → Ask what times they prefer (e.g., 8:00 AM and 8:00 PM) → Ask for their 10-digit mobile number → Use set_reminder tool with all details → Confirm the setup

EXAMPLE 3 — BOOKING A TEST:
Patient: "My doctor said I need a complete blood count test"
Your response pattern: Acknowledge → Ask about preferred date/time → Mention that CBC typically doesn't require fasting → Use book_test tool → Provide pre-test guidance

═══════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════
- NEVER diagnose. You COORDINATE and ROUTE, you don't treat.
- If a patient asks a general medical question (not about symptoms), provide brief educational info and suggest which department to consult.
- If the conversation is casual/greeting, respond warmly and ask how you can help.
- If unsure which department, ask 1-2 clarifying questions before routing.
- You can mention multiple departments if relevant, but only navigate_to_department for the primary one.

Today's Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;

const SUGGESTIONS = [
    "I have chest pain and shortness of breath",
    "Set a daily reminder for my blood pressure medication",
    "Book a blood test for tomorrow morning",
    "My child has a high fever",
    "I need an appointment for knee pain",
    "I have a severe toothache",
];

// ─── Error Boundary Component ─────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught in boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={errorBoundaryStyle}>
                    <h3 style={{ color: "#fca5a5", marginBottom: "1rem" }}>⚠️ Something went wrong</h3>
                    <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
                        {this.state.error?.message || "The application encountered an error"}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={refreshButtonStyle}
                    >
                        Refresh Application
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AgenticChatbotContent() {
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
        try {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (e) {
            console.error("Scroll error", e);
        }
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
        try {
            if (toolName === "navigate_to_department") {
                const action = {
                    id: Date.now(),
                    type: "navigate",
                    dept: String(args.department || ""),
                    reason: String(args.reason || "")
                };
                setPendingActions(prev => [...prev, action]);

                // Navigate after delay
                setTimeout(() => {
                    try {
                        navigate(`/department/${args.department}`);
                    } catch (navError) {
                        console.error("Navigation error:", navError);
                    }
                }, 2500);

                return `Clinical coordination initialized. Directing to ${args.department}.`;
            }

            if (toolName === "set_reminder") {
                try {
                    const reminders = JSON.parse(localStorage.getItem("medverse_reminders") || "[]");
                    reminders.push({ id: Date.now(), ...args, createdAt: new Date().toISOString() });
                    localStorage.setItem("medverse_reminders", JSON.stringify(reminders));
                } catch (e) {
                    console.error("Storage error", e);
                }

                const action = { id: Date.now(), type: "reminder", ...args };
                setPendingActions(prev => [...prev, action]);

                // ── SMS via Fast2SMS ─────
                const smsKey = typeof import.meta !== "undefined" ? (import.meta.env?.VITE_FAST2SMS_KEY || "") : "";
                if (args.phone_number && smsKey) {
                    const smsMessage = `MedVerse Reminder: ${args.reminder_type === "medicine" ? "💊" : "🧪"} ${args.name} at ${args.time} (${args.frequency}). - MedVerse`;

                    fetch(`${FAST2SMS_URL}?authorization=${smsKey}&sender_id=MEDVRS&message=${encodeURIComponent(smsMessage)}&language=english&route=q&numbers=${args.phone_number}`, {
                        method: "GET",
                    }).catch(err => console.error("SMS error:", err));
                }

                return `Confirmed: Reminder set for ${args.name} at ${args.time}. Status: Logged.`;
            }

            if (toolName === "book_test") {
                try {
                    const bookings = JSON.parse(localStorage.getItem("medverse_bookings") || "[]");
                    bookings.push({
                        id: Date.now(),
                        ...args,
                        status: "confirmed",
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem("medverse_bookings", JSON.stringify(bookings));
                } catch (e) {
                    console.error("Storage error", e);
                }

                // Make sure to include the URL in the action
                const action = {
                    id: Date.now(),
                    type: "booking",
                    ...args,
                    url: ONEMG_SEARCH  // Explicitly set the URL here
                };
                setPendingActions(prev => [...prev, action]);

                return `I have prepared the diagnostic request for ${args.test_name}. Please use the button below to finalize at 1mg.`;
            }

            return "Action processed.";
        } catch (err) {
            console.error("Tool execution failed", err);
            return `System action partially successful. Error: ${err.message}`;
        }
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
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
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
                const results = [];
                for (const tc of assistantMsg.tool_calls) {
                    try {
                        const args = JSON.parse(tc.function.arguments || "{}");
                        const res = executeToolCall(tc.function.name, args);
                        results.push({
                            role: "tool",
                            tool_call_id: tc.id,
                            content: String(res)
                        });
                    } catch (e) {
                        console.error("Tool execution error:", e);
                        results.push({
                            role: "tool",
                            tool_call_id: tc.id,
                            content: "Error executing action."
                        });
                    }
                }

                const res2 = await fetch(GROQ_API_URL, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: GROQ_MODEL,
                        messages: [
                            { role: "system", content: buildSystemPrompt() },
                            ...apiHistory,
                            assistantMsg,
                            ...results
                        ],
                        temperature: 0.6,
                        max_tokens: 500,
                    }),
                });

                if (res2.ok) {
                    const data2 = await res2.json();
                    const finalText = data2.choices?.[0]?.message?.content || assistantMsg.content || "Action confirmed.";
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: String(finalText),
                        id: Date.now()
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "Action completed successfully, but I was unable to generate a summary. How else can I assist?",
                        id: Date.now()
                    }]);
                }
            } else {
                // Fallback: Check if the model embedded tool calls as inline <function=...> tags in the text
                const responseText = String(assistantMsg.content || "");
                const functionTagRegex = /<function=(\w+)>([\s\S]*?)<\/function>/g;
                let match;
                const inlineCalls = [];
                while ((match = functionTagRegex.exec(responseText)) !== null) {
                    try {
                        const funcName = match[1];
                        const funcArgs = JSON.parse(match[2]);
                        inlineCalls.push({ name: funcName, args: funcArgs });
                    } catch (parseErr) {
                        console.error("Failed to parse inline function call:", parseErr);
                    }
                }

                if (inlineCalls.length > 0) {
                    // Execute the inline tool calls
                    for (const call of inlineCalls) {
                        executeToolCall(call.name, call.args);
                    }
                    // Clean the function tags from the displayed message
                    const cleanedText = responseText
                        .replace(/<function=\w+>[\s\S]*?<\/function>/g, "")
                        .replace(/\*\s*Action:\s*/g, "")
                        .trim();
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: cleanedText || "I've initiated the action for you.",
                        id: Date.now()
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: responseText,
                        id: Date.now()
                    }]);
                }
            }
        } catch (err) {
            console.error("API Error:", err);
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: `⚠️ **Error:** ${err.message}\n\nPlease make sure your Groq API key is valid.`,
                    id: Date.now(),
                    isError: true
                },
            ]);
        } finally {
            setIsLoading(false);
        }
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
                    onClick={() => {
                        localStorage.removeItem("medverse_groq_key");
                        setApiKey("");
                        setKeySet(false);
                        setKeyInput("");
                    }}
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
                    <div style={{
                        ...bubbleBase,
                        ...assistantBubble,
                        display: "inline-flex",
                        gap: "5px",
                        padding: "12px 16px",
                        alignItems: "center"
                    }}>
                        {[0, 1, 2].map(i => (
                            <span
                                key={i}
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#818cf8",
                                    display: "block",
                                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                                }}
                            />
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
                            <button
                                key={s}
                                style={chip}
                                onClick={() => sendMessage(s)}
                            >
                                {s}
                            </button>
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
                    style={{
                        ...sendBtn,
                        opacity: (!input.trim() || isLoading) ? 0.4 : 1
                    }}
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

    const renderContent = (text) => {
        if (!text || typeof text !== "string") return null;

        return text.split("\n").map((line, i) => {
            if (!line && i === 0) return null;
            let formatted = line
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/^# (.*)/, "<h3>$1</h3>")
                .replace(/^## (.*)/, "<h4>$1</h4>");

            if (line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim().startsWith("• ")) {
                formatted = "• " + line.trim().substring(2);
            }

            return <div
                key={i}
                style={{ marginBottom: line ? "0.3rem" : "0.8rem" }}
                dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }}
            />;
        });
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
            animation: "fadeSlideIn 0.3s ease-out",
            marginBottom: "2px"
        }}>
            {!isUser && <div style={botAvatarSmall}>🤖</div>}
            <div style={{
                ...bubbleBase,
                ...(isUser ? userBubble : assistantBubble),
                ...(msg.isError ? errorBubble : {})
            }}>
                {renderContent(msg.content)}
            </div>
        </div>
    );
}

// ─── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({ action }) {
    const configs = {
        navigate: {
            icon: "🏥",
            color: "#10b981",
            bg: "rgba(16,185,129,0.1)",
            border: "rgba(16,185,129,0.3)",
            title: `Navigating to ${action.dept ? action.dept.charAt(0).toUpperCase() + action.dept.slice(1) : 'Department'}`,
            body: action.reason,
            label: "Redirecting in 2.5s..."
        },
        reminder: {
            icon: action.reminder_type === "medicine" ? "💊" : "🧪",
            color: "#818cf8",
            bg: "rgba(129,140,248,0.1)",
            border: "rgba(129,140,248,0.3)",
            title: `${action.reminder_type === "medicine" ? "Clinical" : "Diagnostic"} Reminder Set`,
            body: `Package: ${action.name}\nSchedule: ${action.time} (${action.frequency})${action.note ? "\nNotes: " + action.note : ""}`,
            label: "Successfully logged to system ✓",
        },
        booking: {
            icon: "📅",
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
            border: "rgba(245,158,11,0.3)",
            title: `Diagnostic Request: ${action.test_name || 'Medical Test'}`,
            body: `Preferred: ${action.suggested_date || 'ASAP'} @ ${action.suggested_time || 'Flexible'}\nDept: ${action.department || 'General'}${action.preparation ? "\nPrep: " + action.preparation : ""}`,
            label: "Click below to finalize booking",
            url: action.url || ONEMG_SEARCH,
            isBooking: true
        },
    };

    const c = configs[action.type];
    if (!c) return null;

    // Handle booking button click - prevent event bubbling and ensure new tab opens
    const handleBookingClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const bookingUrl = action.url || ONEMG_SEARCH;

        // Open in new tab with proper parameters
        const newWindow = window.open(bookingUrl, '_blank', 'noopener,noreferrer');

        // Fallback if popup blocker prevents opening
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Create a temporary anchor element as fallback
            const link = document.createElement('a');
            link.href = bookingUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();
        }
    };

    return (
        <div style={{ animation: "fadeSlideIn 0.35s ease-out", marginBottom: "8px" }}>
            <div style={{ ...actionCard, background: c.bg, borderColor: c.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                    <span style={{ color: c.color, fontWeight: 700, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.02em" }}>{c.title}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>{c.body}</div>
                <div style={{ color: c.color, fontSize: "0.8rem", marginTop: "0.8rem", fontWeight: 600, borderTop: `1px solid ${c.border}`, paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{c.label}</span>
                    {c.isBooking && (
                        <button
                            type="button"
                            onClick={handleBookingClick}
                            style={{
                                background: c.color,
                                color: "#000",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                transition: "all 0.2s",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                            onMouseOut={(e) => e.currentTarget.style.filter = "none"}
                        >
                            FINALIZE ON 1MG ↗
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const chatWrap = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: "520px",
    background: "rgba(10,10,30,0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    overflow: "hidden",
    fontFamily: "Inter, system-ui, sans-serif",
};

// Header
const chatHeader = {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    padding: "14px 18px",
    background: "rgba(79,70,229,0.15)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
};

const botAvatar = {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    flexShrink: 0
};

const botAvatarSmall = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    marginRight: "8px",
    flexShrink: 0,
    alignSelf: "flex-end"
};

const botName = {
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.95rem"
};

const botStatus = {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.78rem",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "2px"
};

const statusDot = {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#10b981",
    display: "inline-block",
    boxShadow: "0 0 6px #10b981"
};

const resetKeyBtn = {
    marginLeft: "auto",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    opacity: 0.6
};

// Messages
const messagesWrap = {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.1) transparent"
};

const bubbleBase = {
    maxWidth: "78%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "0.92rem",
    lineHeight: 1.6
};

const userBubble = {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    borderBottomRightRadius: 4
};

const assistantBubble = {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4
};

const errorBubble = {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5"
};

// Action card
const actionCard = {
    border: "1px solid",
    borderRadius: "12px",
    padding: "12px 14px",
    marginLeft: "38px"
};

// Suggestions
const suggestionWrap = {
    padding: "0 14px 12px",
    borderTop: "1px solid rgba(255,255,255,0.05)"
};

const suggestionLabel = {
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.75rem",
    margin: "10px 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.08em"
};

const chipsRow = {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
};

const chip = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    color: "rgba(255,255,255,0.65)",
    padding: "5px 12px",
    fontSize: "0.8rem",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit"
};

// Input
const inputBar = {
    display: "flex",
    gap: "8px",
    padding: "12px 14px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.2)"
};

const inputField = {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "10px 16px",
    color: "#fff",
    fontSize: "0.92rem",
    outline: "none",
    fontFamily: "inherit"
};

const sendBtn = {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    border: "none",
    borderRadius: "50%",
    width: 42,
    height: 42,
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.2s"
};

// Key gate
const keyGateWrap = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "420px",
    background: "rgba(10,10,30,0.5)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)"
};

const keyGateBox = {
    textAlign: "center",
    padding: "2.5rem",
    maxWidth: "360px"
};

const keyInput_style = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "1rem",
    fontFamily: "monospace"
};

const activateBtn = {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "24px",
    padding: "10px 24px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%"
};

// Error boundary styles
const errorBoundaryStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "520px",
    padding: "2rem",
    textAlign: "center",
    background: "rgba(10,10,30,0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    fontFamily: "Inter, system-ui, sans-serif",
};

const refreshButtonStyle = {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "24px",
    padding: "10px 24px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
};

// ─── Export with Error Boundary ───────────────────────────────────────────────
export default function AgenticChatbot() {
    return (
        <ErrorBoundary>
            <AgenticChatbotContent />
        </ErrorBoundary>
    );
}