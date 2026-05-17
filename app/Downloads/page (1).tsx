"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Send, Check, ChevronLeft, SlidersHorizontal, Guitar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────

interface ShopItem {
    id: string;
    name: string;
    category: string;
    brand: string;
    price: string;
    originalPrice?: string;
    image: string;
    description: string;
    specs: string;
    badge?: string;
    condition: "New" | "Used" | "Vintage";
}

// ─── Data ─────────────────────────────────────────────────────────────

const SHOP_ITEMS: ShopItem[] = [
    {
        id: "s1",
        name: "The GT1 Heritage",
        category: "Electric",
        brand: "Goated Custom",
        price: "$4,200",
        image: "/Gt1.jpg",
        description: "Immaculate red semi-hollow body with classic dual humbuckers and a voice that cuts through any mix.",
        specs: "Mahogany body · Rosewood fretboard · Dual humbuckers · Sunburst finish",
        badge: "Signature",
        condition: "New",
    },
    {
        id: "s2",
        name: "Coastal Dreadnought",
        category: "Acoustic",
        brand: "Heritage Co.",
        price: "$3,150",
        image: "/gt4.jpg",
        description: "Vintage acoustic resonance with a bold, open low-end and singing treble response.",
        specs: "Sitka spruce top · Mahogany back & sides · Bone nut & saddle",
        condition: "Vintage",
        badge: "Vintage",
    },
    {
        id: "s3",
        name: "Sunrise Cutaway",
        category: "Acoustic-Electric",
        brand: "Cedar Ridge",
        price: "$2,900",
        image: "/gt2.jpg",
        description: "Warm cedar top with a crystal-clear Fishman pickup system. The ideal stage acoustic.",
        specs: "Western red cedar top · Fishman Presys+ · Venetian cutaway",
        condition: "New",
    },
    {
        id: "s4",
        name: "Obsidian Classic",
        category: "Electric",
        brand: "Nocturne Series",
        price: "$3,800",
        originalPrice: "$4,400",
        image: "/gt3.jpg",
        description: "Sleek black limba body with coil-tapped humbuckers capable of singing single-coil clarity.",
        specs: "Black limba body · Maple neck · Coil-tap switching · Ebony fretboard",
        badge: "Sale",
        condition: "New",
    },
    {
        id: "s5",
        name: "Custom Jet Phaser",
        category: "Effects",
        brand: "Boutique Works",
        price: "$850",
        image: "/Gt pedal.jpg",
        description: "The ultimate tone-shaping tool for Treasure Coast legends. Hand-wired and built to last.",
        specs: "Hand-wired · True bypass · Limited production run · 9V DC",
        badge: "Limited",
        condition: "New",
    },
    {
        id: "s6",
        name: "GT1 Heritage Burst",
        category: "Electric",
        brand: "Goated Custom",
        price: "$4,600",
        image: "/Gt1.jpg",
        description: "The burst variant of our flagship model. Aged nitro finish over a resonant mahogany body.",
        specs: "Mahogany body · Aged nitro finish · Locking tuners · Graph Tech nut",
        badge: "New Arrival",
        condition: "New",
    },
];

const CATEGORIES = ["All", "Electric", "Acoustic", "Acoustic-Electric", "Effects"];
const CONDITIONS = ["All", "New", "Used", "Vintage"];

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

const BADGE_STYLES: Record<string, string> = {
    "Signature": "bg-amber-600/20 border-amber-500/40 text-amber-400",
    "Vintage": "bg-stone-700/30 border-stone-500/30 text-stone-300",
    "Sale": "bg-red-900/30 border-red-500/40 text-red-400",
    "Limited": "bg-purple-900/30 border-purple-500/40 text-purple-300",
    "New Arrival": "bg-emerald-900/25 border-emerald-500/35 text-emerald-400",
};

// ─── Inquiry Modal ────────────────────────────────────────────────────

function InquiryModal({ item, onClose }: { item: ShopItem; onClose: () => void }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;
        setSubmitted(true);
    };

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={onClose}
            aria-hidden="true"
        >
            <div
                role="dialog" aria-modal="true"
                onClick={e => e.stopPropagation()}
                style={panelAmber}
                className="relative w-full max-w-md flex flex-col gap-6"
                aria-hidden="false"
            >
                <button onClick={onClose} aria-label="Close"
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white transition-colors">
                    <X size={18} />
                </button>

                {submitted ? (
                    <div className="flex flex-col items-center gap-5 py-8">
                        <div className="w-16 h-16 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                            <Check size={28} className="text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight" style={T}>Inquiry Sent!</h3>
                        <p className="text-sm text-zinc-300 text-center leading-relaxed" style={T}>
                            We&apos;ll be in touch within 24 hours about the {item.name}.
                        </p>
                        <button onClick={onClose}
                            className="mt-2 px-8 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400" style={TA}>Inquire About</p>
                            <h2 className="text-xl font-black uppercase tracking-[0.15em] text-white" style={T}>{item.name}</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest" style={T}>{item.price} · {item.condition}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                            {[
                                { id: "inq-name", label: "Your Name *", type: "text", value: name, setter: setName, placeholder: "John Doe", required: true },
                                { id: "inq-email", label: "Email Address *", type: "email", value: email, setter: setEmail, placeholder: "you@example.com", required: true },
                            ].map(f => (
                                <div key={f.id}>
                                    <label htmlFor={f.id} className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>{f.label}</label>
                                    <input id={f.id} type={f.type} value={f.value} required={f.required}
                                        onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
                                        style={T} />
                                </div>
                            ))}
                            <div>
                                <label htmlFor="inq-msg" className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>Message (optional)</label>
                                <textarea id="inq-msg" rows={3} value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Any questions about condition, trades, shipping…"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
                                    style={T} />
                            </div>
                            <button type="submit"
                                className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(217,119,6,0.5)]">
                                Send Inquiry <Send size={16} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Shop Card ────────────────────────────────────────────────────────

function ShopCard({ item, onInquire }: { item: ShopItem; onInquire: (item: ShopItem) => void }) {
    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/60 hover:border-amber-500/25 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                {/* Condition pill */}
                <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    item.condition === "New" ? "bg-zinc-900/80 border-white/15 text-zinc-300"
                    : item.condition === "Vintage" ? "bg-stone-900/80 border-stone-500/30 text-stone-300"
                    : "bg-blue-950/80 border-blue-500/30 text-blue-300"
                }`}>
                    {item.condition}
                </span>

                {/* Badge */}
                {item.badge && (
                    <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${BADGE_STYLES[item.badge] ?? "bg-zinc-800 border-white/10 text-white"}`}>
                        {item.badge}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 gap-3 p-5">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-400/70 mb-1" style={TA}>{item.brand} · {item.category}</p>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight" style={T}>{item.name}</h3>
                </div>

                <p className="text-xs leading-relaxed text-zinc-400 flex-1" style={T}>{item.description}</p>

                <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium leading-relaxed">{item.specs}</p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-400" style={TA}>{item.price}</span>
                        {item.originalPrice && (
                            <span className="text-sm text-zinc-600 line-through">{item.originalPrice}</span>
                        )}
                    </div>
                    <button
                        onClick={() => onInquire(item)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-200"
                    >
                        Inquire <ArrowRight size={11} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeCondition, setActiveCondition] = useState("All");
    const [inquiryItem, setInquiryItem] = useState<ShopItem | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const filtered = useMemo(() => {
        return SHOP_ITEMS.filter(item => {
            const catMatch = activeCategory === "All" || item.category === activeCategory;
            const condMatch = activeCondition === "All" || item.condition === activeCondition;
            return catMatch && condMatch;
        });
    }, [activeCategory, activeCondition]);

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

                        <Link href="/"
                            className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-[9px] sm:text-xs uppercase tracking-[0.3em] transition-all duration-200">
                            <ChevronLeft size={13} />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                    </div>
                </nav>

                {/* ── Page Hero ─────────────────────────────────────────── */}
                <section className="relative z-10 py-24 px-4 sm:px-8 border-b border-white/5 overflow-hidden">
                    {/* Ambient glow */}
                    <div aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="w-[600px] h-[300px] rounded-full bg-amber-600/5 blur-[120px]" />
                    </div>

                    <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
                        <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                            <span className="w-8 h-px bg-amber-500/60 rounded-full" aria-hidden="true" />
                            Stuart, Florida · Treasure Coast
                            <span className="w-8 h-px bg-amber-500/60 rounded-full" aria-hidden="true" />
                        </span>

                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase leading-[0.82] tracking-tighter text-white" style={T}>
                            The Guitar <br />
                            <span className="text-amber-500" style={TA}>Shop</span>
                        </h1>

                        <Divider amber className="max-w-[200px]" />

                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-300 max-w-sm" style={T}>
                            Hand-selected instruments. Every guitar inspected.
                        </p>

                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600 font-bold mt-2">
                            <span>{SHOP_ITEMS.length} instruments in stock</span>
                            <span className="w-1 h-1 rounded-full bg-amber-500/40" />
                            <span>Private inquiries welcome</span>
                        </div>
                    </div>
                </section>

                {/* ── Filter Bar ────────────────────────────────────────── */}
                <section className="sticky top-[57px] z-50 border-b border-white/5 bg-black/80 backdrop-blur-md px-4 sm:px-8 py-3">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">

                        {/* Category tabs */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {CATEGORIES.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 border ${
                                        activeCategory === cat
                                            ? "bg-amber-600 border-amber-600 text-black"
                                            : "bg-transparent border-white/10 text-zinc-500 hover:border-white/25 hover:text-white"
                                    }`}>
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Condition filter */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal size={13} className="text-zinc-600" />
                            <div className="flex items-center gap-1">
                                {CONDITIONS.map(cond => (
                                    <button key={cond} onClick={() => setActiveCondition(cond)}
                                        className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all duration-200 border ${
                                            activeCondition === cond
                                                ? "bg-zinc-800 border-white/20 text-white"
                                                : "bg-transparent border-transparent text-zinc-600 hover:text-zinc-400"
                                        }`}>
                                        {cond}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Grid ──────────────────────────────────────────────── */}
                <section aria-label="Instrument inventory" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-16">

                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                                Available Now
                            </p>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1" style={T}>
                                {filtered.length} {filtered.length === 1 ? "Instrument" : "Instruments"}
                                {activeCategory !== "All" && <span className="text-amber-500 ml-2">— {activeCategory}</span>}
                            </h2>
                        </div>
                        <Divider className="max-w-[120px] opacity-40" />
                    </div>

                    <AnimatePresence mode="popLayout">
                        {filtered.length > 0 ? (
                            <motion.div
                                layout
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filtered.map(item => (
                                    <ShopCard key={item.id} item={item} onInquire={setInquiryItem} />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-32 flex flex-col items-center gap-4 text-center"
                            >
                                <Guitar size={40} className="text-zinc-700" />
                                <p className="text-sm font-black uppercase tracking-widest text-zinc-600">No instruments match your filter</p>
                                <button onClick={() => { setActiveCategory("All"); setActiveCondition("All"); }}
                                    className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors">
                                    Clear Filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* ── Private Inquiry CTA ───────────────────────────────── */}
                <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pb-24">
                    <div style={panelAmber} className="flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>Don&apos;t see what you&apos;re after?</p>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white" style={T}>
                                Private Sourcing Available
                            </h2>
                            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed" style={T}>
                                Tell us what you&apos;re hunting — we&apos;ll source it. From vintage pre-war acoustics to boutique custom builds.
                            </p>
                        </div>
                        <Link href="/#experience"
                            className="shrink-0 flex items-center gap-2 px-10 py-5 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)]">
                            Book a Session <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>

                {/* ── Footer ────────────────────────────────────────────── */}
                <footer className="border-t border-white/5 pt-10 pb-8 px-4 sm:px-8 text-center bg-black/60 backdrop-blur-sm">
                    <p className="text-xs text-zinc-600 uppercase tracking-widest">
                        © {new Date().getFullYear()} Goated Guitars · Stuart, Florida · All Rights Reserved
                    </p>
                </footer>
            </main>

            {inquiryItem && (
                <InquiryModal item={inquiryItem} onClose={() => setInquiryItem(null)} />
            )}
        </>
    );
}
