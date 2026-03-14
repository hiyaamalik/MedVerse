import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../context/AuthContext";

// ─── Category config ─────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: "all", label: "All", icon: "🌐", color: "#6366f1" },
    { id: "project", label: "AI Projects", icon: "🤖", color: "#8b5cf6" },
    { id: "dataset", label: "Datasets", icon: "📊", color: "#06b6d4" },
    { id: "opening", label: "Project Openings", icon: "🚀", color: "#10b981" },
    { id: "research", label: "Research Opportunities", icon: "🔬", color: "#f59e0b" },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.slice(1).map((c) => [c.id, c]));

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_POSTS = [
    {
        id: 1,
        type: "project",
        title: "CardioNet — ECG Arrhythmia Classifier",
        author: "Dr. Priya Ramesh",
        avatar: "P",
        description:
            "Open-source deep learning model (ResNet-34) trained on 100k+ ECG recordings for 12-class arrhythmia classification. Achieves 94% F1 on the PTB-XL benchmark.",
        tags: ["deep-learning", "ECG", "cardiology", "PyTorch"],
        link: "https://github.com",
        date: "2026-03-10",
        likes: 48,
    },
    {
        id: 2,
        type: "dataset",
        title: "MedImageNet-Radiology v2 — 200k Labelled X-Rays",
        author: "Rohan Gupta",
        avatar: "R",
        description:
            "A curated, de-identified chest X-ray dataset with 14 pathology labels including pneumonia, pleural effusion, and cardiomegaly. Released under CC-BY 4.0.",
        tags: ["radiology", "X-ray", "dataset", "open-data"],
        link: "https://github.com",
        date: "2026-03-08",
        likes: 72,
    },
    {
        id: 3,
        type: "opening",
        title: "Looking for ML Engineers — Retinal Scan AI Startup",
        author: "VisionAI Health",
        avatar: "V",
        description:
            "We are building an AI for early diabetic retinopathy detection. Seeking 2 ML engineers (remote, equity + stipend). Python & PyTorch required. 3–6 month commitment.",
        tags: ["ophthalmology", "remote", "startup", "equity"],
        link: "https://github.com",
        date: "2026-03-07",
        likes: 31,
    },
    {
        id: 4,
        type: "research",
        title: "NLP in Clinical Notes — Co-author Opportunity",
        author: "AIIMS Delhi Research Lab",
        avatar: "A",
        description:
            "Our lab is working on named entity recognition for Hindi and English clinical notes. Seeking co-authors with NLP background for a journal submission. Work remotely.",
        tags: ["NLP", "clinical-notes", "research", "co-author"],
        link: "https://github.com",
        date: "2026-03-05",
        likes: 19,
    },
    {
        id: 5,
        type: "project",
        title: "MedChat — LLM Fine-tuned on PubMed Q&A",
        author: "Fatima Al-Rashid",
        avatar: "F",
        description:
            "Llama-3 8B fine-tuned on 50k PubMed question-answer pairs. Excels at evidence-based medical Q&A. Weights available on HuggingFace under a research license.",
        tags: ["LLM", "PubMed", "fine-tuning", "Llama"],
        link: "https://github.com",
        date: "2026-03-01",
        likes: 104,
    },
    {
        id: 6,
        type: "dataset",
        title: "Derma-Open — 30k Skin Lesion Images",
        author: "SkinAILab",
        avatar: "S",
        description:
            "30,000 dermoscopy images across 8 skin lesion classes (including melanoma). Fully anonymized, with expert dermatologist annotations and metadata.",
        tags: ["dermatology", "computer-vision", "dataset", "melanoma"],
        link: "https://github.com",
        date: "2026-02-20",
        likes: 88,
    },
];

// Seed posts into localStorage only on first load
function seedLocalStorage() {
    if (!localStorage.getItem("medverse_posts")) {
        localStorage.setItem("medverse_posts", JSON.stringify(SEED_POSTS));
    }
}

// ─── Contribute Page ─────────────────────────────────────────────────────────
export default function Contribute() {
    const { user, logout } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState(() =>
        JSON.parse(localStorage.getItem("medverse_liked") || "[]")
    );
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        seedLocalStorage();
        const stored = JSON.parse(localStorage.getItem("medverse_posts") || "[]");
        setPosts(stored.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, []);

    const filtered = posts.filter((p) => {
        const matchCat = activeFilter === "all" || p.type === activeFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch =
            !q ||
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q));
        return matchCat && matchSearch;
    });

    const handleLike = (postId) => {
        if (!user) { setShowAuth(true); return; }
        let updated;
        if (likedPosts.includes(postId)) {
            updated = likedPosts.filter((id) => id !== postId);
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, likes: p.likes - 1 } : p))
            );
        } else {
            updated = [...likedPosts, postId];
            setPosts((prev) =>
                prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
            );
        }
        setLikedPosts(updated);
        localStorage.setItem("medverse_liked", JSON.stringify(updated));
        // Persist updated post likes
        const storedPosts = JSON.parse(localStorage.getItem("medverse_posts") || "[]");
        const newPosts = storedPosts.map((p) => {
            if (p.id !== postId) return p;
            return { ...p, likes: likedPosts.includes(postId) ? p.likes - 1 : p.likes + 1 };
        });
        localStorage.setItem("medverse_posts", JSON.stringify(newPosts));
    };

    const addPost = (post) => {
        const newPost = {
            ...post,
            id: Date.now(),
            author: user.name,
            avatar: user.avatar,
            date: new Date().toISOString().split("T")[0],
            likes: 0,
        };
        const updated = [newPost, ...posts];
        setPosts(updated);
        localStorage.setItem("medverse_posts", JSON.stringify(updated));
        setShowNewPost(false);
    };

    return (
        <div style={page}>
            {/* Animated blobs */}
            <div style={blobs}>
                <div style={{ ...blob, width: 400, height: 400, top: "-100px", left: "-100px", background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)" }} />
                <div style={{ ...blob, width: 350, height: 350, bottom: "10%", right: "-80px", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
                <div style={{ ...blob, width: 250, height: 250, top: "50%", left: "40%", background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />
            </div>

            <Navbar />

            <div style={container}>
                {/* ── Hero ── */}
                <div style={heroSection}>
                    <div style={heroBadge}>🌍 Open Source Medical AI Community</div>
                    <h1 style={heroTitle}>Contribute to MedVerse</h1>
                    <p style={heroSub}>
                        Share AI projects, datasets, research opportunities, and project openings.
                        Collaborate with the global medical AI community.
                    </p>

                    <div style={heroActions}>
                        {user ? (
                            <div style={userBar}>
                                <div style={avatarBubble}>{user.avatar}</div>
                                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{user.name}</span>
                                <button style={secondaryBtn} onClick={logout}>Sign Out</button>
                            </div>
                        ) : (
                            <button style={primaryBtn} onClick={() => setShowAuth(true)}>
                                Sign In to Contribute
                            </button>
                        )}
                        <button
                            style={{ ...primaryBtn, background: "linear-gradient(135deg, #06b6d4, #3b82f6)", boxShadow: "0 6px 20px rgba(6,182,212,0.3)" }}
                            onClick={() => user ? setShowNewPost(true) : setShowAuth(true)}
                        >
                            + New Post
                        </button>
                    </div>
                </div>

                {/* ── Stats Strip ── */}
                <div style={statsStrip}>
                    {[
                        { label: "Posts", value: posts.length },
                        { label: "Projects", value: posts.filter(p => p.type === "project").length },
                        { label: "Datasets", value: posts.filter(p => p.type === "dataset").length },
                        { label: "Openings", value: posts.filter(p => p.type === "opening" || p.type === "research").length },
                    ].map((s) => (
                        <div key={s.label} style={statItem}>
                            <div style={statValue}>{s.value}</div>
                            <div style={statLabel}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Filters + Search ── */}
                <div style={controlsRow}>
                    <div style={filterTabs}>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                style={{
                                    ...filterTab,
                                    ...(activeFilter === cat.id ? { ...activeFilterTab, borderColor: cat.color, color: cat.color } : {}),
                                }}
                                onClick={() => setActiveFilter(cat.id)}
                            >
                                <span>{cat.icon}</span> {cat.label}
                            </button>
                        ))}
                    </div>
                    <input
                        style={searchBox}
                        placeholder="🔍  Search posts, tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* ── Post Feed ── */}
                <div style={feed}>
                    {filtered.length === 0 ? (
                        <div style={emptyState}>
                            <div style={{ fontSize: "3rem" }}>🔬</div>
                            <p>No posts found. Be the first to share something!</p>
                        </div>
                    ) : (
                        filtered.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                liked={likedPosts.includes(post.id)}
                                onLike={() => handleLike(post.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} onSubmit={addPost} />}
        </div>
    );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, liked, onLike }) {
    const cat = CATEGORY_MAP[post.type];
    return (
        <div style={card}>
            <div style={cardHeader}>
                <div style={cardMeta}>
                    <div style={{ ...avatarBubble, background: categoryGradient(post.type), fontSize: "0.9rem" }}>{post.avatar}</div>
                    <div>
                        <div style={authorName}>{post.author}</div>
                        <div style={postDate}>{formatDate(post.date)}</div>
                    </div>
                </div>
                <div style={{ ...categoryBadge, background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}>
                    {cat.icon} {cat.label}
                </div>
            </div>

            <h3 style={cardTitle}>{post.title}</h3>
            <p style={cardDesc}>{post.description}</p>

            <div style={tagsRow}>
                {post.tags.map((t) => (
                    <span key={t} style={tag}>#{t}</span>
                ))}
            </div>

            <div style={cardFooter}>
                <button style={{ ...likeBtn, color: liked ? "#f472b6" : "rgba(255,255,255,0.5)" }} onClick={onLike}>
                    {liked ? "♥" : "♡"} {post.likes}
                </button>
                <a href={post.link} target="_blank" rel="noreferrer" style={viewLink}>
                    View Project →
                </a>
            </div>
        </div>
    );
}

// ─── New Post Modal ───────────────────────────────────────────────────────────
function NewPostModal({ onClose, onSubmit }) {
    const [type, setType] = useState("project");
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [link, setLink] = useState("");
    const [error, setError] = useState("");

    const submit = () => {
        if (!title.trim() || !desc.trim()) { setError("Title and description are required."); return; }
        const tags = tagInput.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean);
        onSubmit({ type, title: title.trim(), description: desc.trim(), tags, link: link.trim() || "#" });
    };

    return (
        <div style={overlay}>
            <div style={{ ...modalBox, maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ color: "#fff", margin: 0, fontSize: "1.6rem" }}>New Post</h2>
                    <button style={closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Type selector */}
                <label style={fieldLabel}>Post Type</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
                    {CATEGORIES.slice(1).map((cat) => (
                        <button
                            key={cat.id}
                            style={{
                                ...typeBtn,
                                ...(type === cat.id
                                    ? { background: cat.color, color: "#fff", borderColor: cat.color }
                                    : {}),
                            }}
                            onClick={() => setType(cat.id)}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                <label style={fieldLabel}>Title *</label>
                <input style={formInput} placeholder="Give your post a clear title..." value={title} onChange={(e) => setTitle(e.target.value)} />

                <label style={fieldLabel}>Description *</label>
                <textarea
                    style={{ ...formInput, minHeight: "120px", resize: "vertical" }}
                    placeholder="Describe your project, dataset, or opportunity in detail..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />

                <label style={fieldLabel}>Tags <span style={{ opacity: 0.5 }}>(comma-separated)</span></label>
                <input style={formInput} placeholder="e.g. deep-learning, radiology, open-source" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />

                <label style={fieldLabel}>Link <span style={{ opacity: 0.5 }}>(GitHub, paper, etc.)</span></label>
                <input style={formInput} placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />

                {error && <div style={{ color: "#ff6b6b", marginBottom: "0.8rem", fontSize: "0.9rem" }}>{error}</div>}

                <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                    <button style={secondaryBtn} onClick={onClose}>Cancel</button>
                    <button style={primaryBtn} onClick={submit}>Publish Post</button>
                </div>
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function categoryGradient(type) {
    const g = { project: "linear-gradient(135deg,#8b5cf6,#6366f1)", dataset: "linear-gradient(135deg,#06b6d4,#3b82f6)", opening: "linear-gradient(135deg,#10b981,#059669)", research: "linear-gradient(135deg,#f59e0b,#ef4444)" };
    return g[type] || "linear-gradient(135deg,#6366f1,#4f46e5)";
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const page = { minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 35%, #24243e 100%)", color: "white", fontFamily: "Inter, system-ui, sans-serif", position: "relative", overflowX: "hidden" };
const blobs = { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 };
const blob = { position: "absolute", borderRadius: "50%", filter: "blur(60px)" };
const container = { position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "120px 24px 60px" };

// Hero
const heroSection = { textAlign: "center", marginBottom: "3rem" };
const heroBadge = { display: "inline-block", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "50px", padding: "0.4rem 1.2rem", fontSize: "0.9rem", color: "#a5b4fc", marginBottom: "1.2rem" };
const heroTitle = { fontSize: "3.5rem", fontWeight: 800, background: "linear-gradient(135deg, #fff 0%, #c7d2fe 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: "0 0 1rem" };
const heroSub = { fontSize: "1.2rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: "620px", margin: "0 auto 2rem" };
const heroActions = { display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: "center" };
const primaryBtn = { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: "50px", padding: "0.8rem 1.8rem", fontSize: "1rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 6px 20px rgba(79,70,229,0.35)", transition: "transform 0.2s, box-shadow 0.2s" };
const secondaryBtn = { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50px", padding: "0.75rem 1.5rem", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer" };
const userBar = { display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50px", padding: "0.4rem 1rem 0.4rem 0.5rem" };

// Stats
const statsStrip = { display: "flex", justifyContent: "center", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "2.5rem", overflow: "hidden" };
const statItem = { flex: 1, textAlign: "center", padding: "1.2rem 0.5rem", borderRight: "1px solid rgba(255,255,255,0.06)" };
const statValue = { fontSize: "1.8rem", fontWeight: 700, color: "#a5b4fc" };
const statLabel = { fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.2rem" };

// Controls
const controlsRow = { display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "flex-start", flexWrap: "wrap" };
const filterTabs = { display: "flex", gap: "0.5rem", flexWrap: "wrap", flex: 1 };
const filterTab = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50px", padding: "0.55rem 1.1rem", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "inherit" };
const activeFilterTab = { background: "rgba(255,255,255,0.08)", color: "#fff" };
const searchBox = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50px", padding: "0.6rem 1.2rem", color: "#fff", fontSize: "0.95rem", outline: "none", width: "240px", fontFamily: "inherit" };

// Feed
const feed = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: "1.2rem" };
const emptyState = { textAlign: "center", padding: "4rem 2rem", color: "rgba(255,255,255,0.4)", gridColumn: "1/-1" };

// Card
const card = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem", transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s", backdropFilter: "blur(10px)" };
const cardHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "0.8rem" };
const cardMeta = { display: "flex", alignItems: "center", gap: "0.8rem" };
const authorName = { color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: "0.95rem" };
const postDate = { color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "0.1rem" };
const categoryBadge = { borderRadius: "50px", padding: "0.3rem 0.8rem", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" };
const cardTitle = { color: "#fff", fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.7rem", lineHeight: 1.4 };
const cardDesc = { color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 1rem" };
const tagsRow = { display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.2rem" };
const tag = { background: "rgba(99,102,241,0.15)", color: "#a5b4fc", borderRadius: "6px", padding: "0.25rem 0.6rem", fontSize: "0.8rem", fontWeight: 500 };
const cardFooter = { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" };
const likeBtn = { background: "none", border: "none", fontSize: "1rem", cursor: "pointer", fontWeight: 600, transition: "color 0.2s", fontFamily: "inherit" };
const viewLink = { color: "#818cf8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 };

// Avatar
const avatarBubble = { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", color: "#fff", flexShrink: 0 };

// Modal shared
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "1rem" };
const modalBox = { background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "2rem", width: "550px", maxWidth: "95vw", boxShadow: "0 30px 70px rgba(0,0,0,0.6)" };
const closeBtn = { background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "0.85rem" };
const fieldLabel = { display: "block", color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.5rem", marginTop: "1rem" };
const formInput = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "0.8rem 1rem", color: "#fff", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: "0.3rem" };
const typeBtn = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50px", padding: "0.45rem 0.9rem", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" };
