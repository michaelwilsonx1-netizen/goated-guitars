"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight, X, Send, Check, ChevronLeft,
    Music, Mic2, Zap, BookOpen, Clock, Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────

interface LessonTier {
    id: string;
    level: string;
    eyebrow: string;
    description: string;
    details: string[];
    price: string;
    duration: string;
    icon: React.ReactNode;
}

interface Instructor {
    name: string;
    title: string;
    bio: string;
    styles: string[];
    years: string;
}

// ─── Data ─────────────────────────────────────────────────────────────

const LESSON_TIERS: LessonTier[] = [
    {
        id: "beginner",
        level: "Foundations",
        eyebrow: "Beginner · Level 01",
        description: "Zero to first song. We build proper form, tuning, and fundamental chord vocabulary from day one.",
        details: [
            "Proper posture & hand position",
            "Open chord shapes & barre chords",
            "Strumming patterns & timing",
            "Reading chord charts & tabs",
            "First song of your choice",
        ],
        price: "$60",
        duration: "45 min",
        icon: <BookOpen size={22} strokeWidth={1.8} />,
    },
    {
        id: "intermediate",
        level: "Development",
        eyebrow: "Intermediate · Level 02",
        description: "Unlock scale positions, music theory, and the expressive vocabulary that separates good players from great ones.",
        details: [
            "Pentatonic & major scale systems",
            "Music theory for guitarists",
            "Fingerpicking & hybrid picking",
            "Songwriting fundamentals",
            "Genre-specific technique deep dives",
        ],
        price: "$75",
        duration: "60 min",
        icon: <Music size={22} strokeWidth={1.8} />,
    },
    {
        id: "advanced",
        level: "Mastery",
        eyebrow: "Advanced · Level 03",
        description: "Stage-ready refinement. Tone control, advanced harmony, improv, and building a performance identity.",
        details: [
            "Advanced improvisation & ear training",
            "Chord-melody & solo arrangements",
            "Recording & studio technique",
            "Gear signal chain optimization",
            "Performance coaching & stagecraft",
        ],
        price: "$95",
        duration: "60 min",
        icon: <Zap size={22} strokeWidth={1.8} />,
    },
];

const FORMATS = [
    {
        id: "in-person",
        title: "In-Person",
        description: "One-on-one sessions inside our private Stuart showroom. Play through world-class amplifiers in an acoustically tuned space.",
        icon: <Star size={20} strokeWidth={1.8} />,
    },
    {
        id: "online",
        title: "Online",
        description: "High-quality video sessions from your home. We use a pro-grade setup for crisp audio so nothing gets lost through the camera.",
        icon: <Mic2 size={20} strokeWidth={1.8} />,
    },
];

const INSTRUCTOR: Instructor = {
    name: "Coach at Goated",
    title: "Lead Instructor · Goated Guitars",
    bio: "With over a decade of performance and teaching experience spanning blues, rock, jazz, and country, our instructors bring a no-fluff approach to helping players at every level build real, lasting skills. Lessons are tailored — not templated.",
    styles: ["Blues", "Rock", "Country", "Jazz", "Classical", "Fingerstyle"],
    years: "10+",
};

const TESTIMONIALS = [
    {
        id: "l1",
        name: "Marcus D.",
        location: "Stuart, FL",
        text: "I came in as a complete beginner and within three months I was playing full songs. The personalized approach made all the difference.",
        level: "Foundations",
    },
    {
        id: "l2",
        name: "Elena R.",
        location: "Palm Beach, FL",
        text: "The intermediate program gave me the theory foundation I'd been missing for years. I finally understand what I'm playing.",
        level: "Development",
    },
    {
        id: "l3",
        name: "Jason W.",
        location: "Fort Pierce, FL",
        text: "Advanced sessions pushed my improv and stage confidence to another level. Worth every session.",
        level: "Mastery",
    },
];

const FAQS = [
    { q: "Do I need my own guitar?", a: "Not at first. We have instruments available in the showroom for your first few lessons while you find the right guitar for you." },
    { q: "How often should I take lessons?", a: "Weekly lessons produce the best results. Monthly check-ins work for self-directed players who just want a tune-up." },
    { q: "Can I switch levels mid-program?", a: "Absolutely. Your instructor will guide you to the right level based on your progress — we don't keep you in a box." },
    { q: "Are lessons available on weekends?", a: "Yes. We offer morning and afternoon slots on Saturday by appointment. Sunday availability varies — reach out to check." },
];

// ─── Design tokens ────────────────────────────────────────────────────

const weaveBg = [
    "repeating-linear-gradient( 45deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 8px)",
    "repeating-linear-gradient(-45deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 8px)",
    "repeating-linear-gradient(  0deg, rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 1px, transparent 1px, transparent 3px)",
    "linear-gradient(160deg, rgb(9,9,9) 0%, rgb(2,2,2) 100%)",
].join(", ");

const panel: React.CSSProperties = {
    backgroundImage: weaveBg,
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 20,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.7), 0 12px 40px rgba(0,0,0,0.85)",
    padding: "28px 36px",
};

const panelAmber: React.CSSProperties = {
    ...panel,
    border: "1px solid rgba(217,119,6,0.30)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.7), 0 12px 40px rgba(0,0,0,0.85), 0 0 28px rgba(217,119,6,0.09)",
};

const T: React.CSSProperties = { textShadow: "1px 1px 2px rgba(0,0,0,0.7)", color: "#ffffff" };
const TA: React.CSSProperties = { textShadow: "1px 1px 2px rgba(0,0,0,0.7)", color: "#f59e0b" };

const Divider = ({ amber = false, className = "" }: { amber?: boolean; className?: string }) => (
    <div className={`flex items-center gap-3 justify-center w-full ${className}`} aria-hidden="true">
        <div className={`h-px flex-1 max-w-[70px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${amber ? "bg-amber-500/60" : "bg-white/20"}`} />
        <div className={`h-px flex-1 max-w-[70px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
    </div>
);

// ─── Booking Modal ────────────────────────────────────────────────────

function BookingModal({ tier, onClose }: { tier: LessonTier | null; onClose: () => void }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [level, setLevel] = useState(tier?.id ?? "beginner");
    const [format, setFormat] = useState("in-person");
    const [note, setNote] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;
        setSubmitted(true);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={onClose} aria-hidden="true">
            <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}
                style={panelAmber}
                className="relative w-full max-w-md flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
                aria-hidden="false">
                <button onClick={onClose} aria-label="Close"
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white transition-colors">
                    <X size={18} />
                </button>

                {submitted ? (
                    <div className="flex flex-col items-center gap-5 py-8">
                        <div className="w-16 h-16 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                            <Check size={28} className="text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight" style={T}>You&apos;re Booked!</h3>
                        <p className="text-sm text-zinc-300 text-center leading-relaxed" style={T}>
                            We&apos;ll reach out within 24 hours to confirm your first lesson.
                        </p>
                        <button onClick={onClose}
                            className="mt-2 px-8 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400" style={TA}>Book a Lesson</p>
                            <h2 className="text-xl font-black uppercase tracking-[0.12em] text-white" style={T}>Start Your Journey</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest" style={T}>We&apos;ll confirm within 24 hours</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                            {/* Name */}
                            <div>
                                <label htmlFor="ls-name" className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>Your Name *</label>
                                <input id="ls-name" type="text" value={name} required onChange={e => setName(e.target.value)} placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors" style={T} />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="ls-email" className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>Email Address *</label>
                                <input id="ls-email" type="email" value={email} required onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors" style={T} />
                            </div>

                            {/* Level selector */}
                            <div>
                                <p className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>Level</p>
                                <div className="flex gap-2">
                                    {LESSON_TIERS.map(t => (
                                        <button key={t.id} type="button" onClick={() => setLevel(t.id)}
                                            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                level === t.id
                                                    ? "bg-amber-600/20 border-amber-500/50 text-amber-400"
                                                    : "bg-black/40 border-white/10 text-zinc-500 hover:border-white/20"
                                            }`}>
                                            {t.level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format selector */}
                            <div>
                                <p className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>Format</p>
                                <div className="flex gap-2">
                                    {FORMATS.map(f => (
                                        <button key={f.id} type="button" onClick={() => setFormat(f.id)}
                                            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                format === f.id
                                                    ? "bg-amber-600/20 border-amber-500/50 text-amber-400"
                                                    : "bg-black/40 border-white/10 text-zinc-500 hover:border-white/20"
                                            }`}>
                                            {f.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label htmlFor="ls-note" className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>Anything else?</label>
                                <textarea id="ls-note" rows={2} value={note} onChange={e => setNote(e.target.value)}
                                    placeholder="e.g., your experience, goals, preferred times…"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none" style={T} />
                            </div>

                            <button type="submit"
                                className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(217,119,6,0.5)]">
                                Book My First Lesson <Send size={16} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
                aria-expanded={open}
            >
                <span className="text-sm font-black uppercase tracking-tight text-white" style={T}>{q}</span>
                <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${open ? "border-amber-500/50 bg-amber-600/15 text-amber-400 rotate-45" : "border-white/15 text-zinc-500"}`}>
                    <ArrowRight size={10} strokeWidth={2.5} />
                </span>
            </button>
            <motion.div
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
            >
                <p className="text-sm text-zinc-400 leading-relaxed pb-5" style={T}>{a}</p>
            </motion.div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function LessonsPage() {
    const [bookingTier, setBookingTier] = useState<LessonTier | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);

    const openBooking = (tier?: LessonTier) => {
        setBookingTier(tier ?? null);
        setBookingOpen(true);
    };

    return (
        <>
            <main className="relative min-h-screen text-white antialiased overflow-x-hidden"
                style={{ background: "linear-gradient(160deg, rgb(9,9,9) 0%, rgb(2,2,2) 100%)" }}>

                {/* Weave texture */}
                <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
                    style={{ backgroundImage: weaveBg }} />

                {/* Film grain */}
                <div aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-[998] opacity-[0.035] bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] bg-repeat" />

                {/* ── Sticky Nav ────────────────────────────────────────── */}
                <nav aria-label="Primary navigation"
                    className="sticky top-0 z-[100] border-b border-white/5 bg-black/70 backdrop-blur-md">
                    <div className="flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-10 py-3 sm:py-4">
                        <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-amber-400 rounded">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600/15 border border-amber-600/30 flex items-center justify-center">
                                <span className="text-amber-400 font-black text-sm sm:text-base leading-none" style={TA}>G</span>
                            </div>
                            <span className="hidden sm:block text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.35em]" style={T}>
                                Goated <span className="text-amber-500">Guitars</span>
                            </span>
                        </Link>

                        <ul className="flex items-center gap-4 sm:gap-8 list-none" role="list">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Shop", href: "/shop" },
                                { label: "Lessons", href: "/lessons" },
                            ].map(({ label, href }) => (
                                <li key={href}>
                                    <Link href={href}
                                        className="relative text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-400 hover:text-white transition-colors group py-1.5 focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
                                        style={T}>
                                        {label}
                                        <span aria-hidden="true"
                                            className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 transition-all duration-300 group-hover:w-full rounded-full" />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <button onClick={() => openBooking()}
                            className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-[9px] sm:text-xs uppercase tracking-[0.3em] transition-all duration-200">
                            Book <span className="hidden sm:inline">a Lesson</span>
                        </button>
                    </div>
                </nav>

                {/* ── Hero ──────────────────────────────────────────────── */}
                <section className="relative z-10 py-28 px-4 sm:px-8 border-b border-white/5 overflow-hidden">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="w-[700px] h-[350px] rounded-full bg-amber-600/4 blur-[140px]" />
                    </div>

                    <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center gap-7">
                        <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                            <span className="w-8 h-px bg-amber-500/60 rounded-full" aria-hidden="true" />
                            Private Guitar Coaching
                            <span className="w-8 h-px bg-amber-500/60 rounded-full" aria-hidden="true" />
                        </span>

                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.82] tracking-tighter text-white" style={T}>
                            Learn <br />
                            <span className="text-amber-500" style={TA}>Guitar</span>
                        </h1>

                        <Divider amber className="max-w-[200px]" />

                        <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.25em] text-zinc-300 max-w-lg leading-relaxed" style={T}>
                            Private lessons for new players, returning players, and gig-ready musicians. In-person or online.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
                            <button onClick={() => openBooking()}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)]">
                                Book First Lesson <ArrowRight size={16} />
                            </button>
                            <a href="#tiers"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-sm uppercase tracking-[0.3em] transition-all">
                                See Pricing
                            </a>
                        </div>

                        {/* Quick stats */}
                        <div className="flex items-center gap-6 mt-4 flex-wrap justify-center">
                            {[
                                { label: "Experience", value: "10+ Years" },
                                { label: "Formats", value: "In-Person & Online" },
                                { label: "Styles", value: "All Genres" },
                            ].map(s => (
                                <div key={s.label} className="flex flex-col items-center gap-1">
                                    <span className="text-lg font-black text-amber-400" style={TA}>{s.value}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Formats ───────────────────────────────────────────── */}
                <section aria-label="Lesson formats" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {FORMATS.map((f, i) => (
                            <motion.div
                                key={f.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={panel}
                                className="flex flex-col gap-4"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
                                    {f.icon}
                                </span>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-white" style={T}>{f.title}</h3>
                                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed" style={T}>{f.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── Lesson Tiers ──────────────────────────────────────── */}
                <section id="tiers" aria-labelledby="tiers-heading" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-20 border-t border-white/5">
                    <header className="flex flex-col items-center text-center gap-4 mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400" style={TA}>Programs & Pricing</span>
                        <h2 id="tiers-heading" className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white" style={T}>
                            Choose Your Level
                        </h2>
                        <Divider amber className="max-w-[200px]" />
                        <p className="text-sm text-zinc-400 max-w-sm uppercase tracking-wider leading-relaxed" style={T}>
                            Not sure where you fall? We&apos;ll figure it out together in your first session.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {LESSON_TIERS.map((tier, i) => (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.4 }}
                                style={i === 1 ? panelAmber : panel}
                                className="flex flex-col gap-5 relative"
                            >
                                {i === 1 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-600 text-black">Most Popular</span>
                                    </div>
                                )}

                                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
                                    {tier.icon}
                                </span>

                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-amber-400/70 mb-1" style={TA}>{tier.eyebrow}</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white" style={T}>{tier.level}</h3>
                                </div>

                                <p className="text-sm text-zinc-400 leading-relaxed" style={T}>{tier.description}</p>

                                <ul className="space-y-2" aria-label={`${tier.level} includes`}>
                                    {tier.details.map((d, j) => (
                                        <li key={j} className="flex items-start gap-2.5 text-xs text-zinc-300" style={T}>
                                            <Check size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                            {d}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                                    <div>
                                        <span className="text-3xl font-black text-amber-400" style={TA}>{tier.price}</span>
                                        <span className="text-xs text-zinc-600 uppercase tracking-widest ml-1"> / session</span>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Clock size={11} className="text-zinc-600" />
                                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{tier.duration}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => openBooking(tier)}
                                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-200">
                                        Book <ArrowRight size={11} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── Instructor ────────────────────────────────────────── */}
                <section aria-labelledby="instructor-heading" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-20 border-t border-white/5">
                    <div style={panel} className="flex flex-col md:flex-row items-start gap-10">
                        {/* Avatar placeholder */}
                        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-600/15 border-2 border-amber-500/25 flex items-center justify-center">
                            <span className="text-amber-400 font-black text-3xl" style={TA}>G</span>
                        </div>
                        <div className="flex flex-col gap-4 flex-1">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-amber-400/70 mb-0.5" style={TA}>{INSTRUCTOR.title}</p>
                                <h2 id="instructor-heading" className="text-3xl font-black uppercase tracking-tight text-white" style={T}>{INSTRUCTOR.name}</h2>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed max-w-xl" style={T}>{INSTRUCTOR.bio}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {INSTRUCTOR.styles.map(s => (
                                    <span key={s} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-400">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ──────────────────────────────────────── */}
                <section aria-labelledby="reviews-heading" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-20 border-t border-white/5">
                    <header className="flex flex-col items-center text-center gap-4 mb-14">
                        <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400" style={TA}>Student Accounts</span>
                        <h2 id="reviews-heading" className="text-4xl font-black uppercase tracking-tighter text-white" style={T}>From the Students</h2>
                        <Divider amber className="max-w-[200px]" />
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.blockquote
                                key={t.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={panel}
                                className="flex flex-col gap-5 bg-zinc-900/20"
                            >
                                <p className="text-sm leading-relaxed text-zinc-300 italic flex-1" style={T}>
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <footer className="space-y-1.5 border-t border-white/5 pt-4">
                                    <cite className="block text-xs font-black uppercase tracking-widest text-white not-italic" style={T}>{t.name}</cite>
                                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                                        <span>{t.location}</span>
                                        <span className="text-amber-500/60 font-bold" style={TA}>{t.level}</span>
                                    </div>
                                </footer>
                            </motion.blockquote>
                        ))}
                    </div>
                </section>

                {/* ── FAQ ───────────────────────────────────────────────── */}
                <section aria-labelledby="faq-heading" className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 py-20 border-t border-white/5">
                    <header className="flex flex-col items-center text-center gap-4 mb-14">
                        <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400" style={TA}>Common Questions</span>
                        <h2 id="faq-heading" className="text-4xl font-black uppercase tracking-tighter text-white" style={T}>FAQ</h2>
                        <Divider amber className="max-w-[200px]" />
                    </header>
                    <div style={panel}>
                        {FAQS.map(faq => (
                            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </section>

                {/* ── Bottom CTA ────────────────────────────────────────── */}
                <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-24">
                    <div style={panelAmber} className="flex flex-col items-center text-center gap-6">
                        <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400" style={TA}>Ready to Play?</span>
                        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white" style={T}>
                            Your First Lesson Starts Here
                        </h2>
                        <Divider amber className="max-w-[160px]" />
                        <p className="text-sm text-zinc-400 max-w-sm uppercase tracking-wider leading-relaxed" style={T}>
                            No prior experience needed. Just a willingness to play.
                        </p>
                        <button onClick={() => openBooking()}
                            className="flex items-center gap-2 px-12 py-5 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)]">
                            Book My First Lesson <ArrowRight size={16} />
                        </button>
                    </div>
                </section>

                {/* ── Footer ────────────────────────────────────────────── */}
                <footer className="border-t border-white/5 pt-10 pb-8 px-4 sm:px-8 text-center bg-black/60 backdrop-blur-sm">
                    <p className="text-xs text-zinc-600 uppercase tracking-widest">
                        © {new Date().getFullYear()} Goated Guitars · Stuart, Florida · All Rights Reserved
                    </p>
                </footer>
            </main>

            {bookingOpen && (
                <BookingModal tier={bookingTier} onClose={() => setBookingOpen(false)} />
            )}
        </>
    );
}
