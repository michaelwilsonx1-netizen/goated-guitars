"use client";

/**
 * page.tsx — Goated Guitars · Responsive Production Build (Final v3)
 *
 * ─── RESPONSIVE BEHAVIOUR ─────────────────────────────────────────
 *   < 640px  (phones)   : hero h‑[125vh], canvas stretched 125%Y/105%X
 *                          address at top, side panels hidden
 *   ≥ 640px  (tablet+)  : hero h‑screen, side panels visible,
 *                          canvas fills full section (panels overlaid)
 *                          overlay centered between panels
 *   ≥ 1024px (desktop)  : full layout, sticky vault side panels
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
    ChevronDown, ChevronUp, X, Send, MapPin, Clock,
    Camera, Share2, Check, ArrowRight, Menu,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────
interface VaultItem {
    id: string; name: string; category: string;
    price: string; image: string; description: string; specs: string;
}
interface Testimonial {
    id: string; name: string; location: string;
    text: string; instrument: string;
}
interface VideoFrameCallbackMetadata { mediaTime: number; }
type VFRCallback = (now: number, meta: VideoFrameCallbackMetadata) => void;
interface RVFCVideo extends HTMLVideoElement {
    requestVideoFrameCallback(cb: VFRCallback): number;
    cancelVideoFrameCallback(handle: number): void;
}

// ─── Data ─────────────────────────────────────────────────────────
const MAX_FRAMES = 240;

const VAULT_ITEMS: VaultItem[] = [
    { id: "g1", name: "The GT1 Heritage", category: "Electric", price: "$4,200", image: "/gt1.jpg", description: "Immaculate red semi‑hollow body with classic dual humbuckers.", specs: "Mahogany body · Rosewood fretboard · Dual humbuckers" },
    { id: "g2", name: "Coastal Dreadnought", category: "Acoustic", price: "$3,150", image: "/gt4.jpg", description: "Vintage acoustic resonance, protected in its original hardshell case.", specs: "Sitka spruce top · Mahogany back & sides · Bone nut & saddle" },
    { id: "g3", name: "Custom Jet Phaser", category: "Boutique Effects", price: "$850", image: "/Gt pedal.jpg", description: "The ultimate tone‑shaping tool for Treasure Coast legends.", specs: "Hand‑wired · True bypass · Limited production run" },
    { id: "g4", name: "Sunrise Cutaway", category: "Acoustic‑Electric", price: "$2,900", image: "/gt2.jpg", description: "Warm cedar top with a crystal‑clear Fishman pickup system.", specs: "Western red cedar top · Fishman Presys+ · Venetian cutaway" },
    { id: "g5", name: "Obsidian Classic", category: "Electric", price: "$3,800", image: "/gt3.jpg", description: "Sleek black limba body with coil‑tapped humbuckers.", specs: "Black limba body · Maple neck · Coil‑tap switching" },
];

const TESTIMONIALS: Testimonial[] = [
    { id: "t1", name: "Marcus D.", location: "Stuart, FL", text: "Walked in not knowing what I wanted. Walked out with a GT1 Heritage that completely changed my playing. These guys actually listen.", instrument: "GT1 Heritage" },
    { id: "t2", name: "Elena R.", location: "Palm Beach, FL", text: "The private session experience is unlike any guitar shop I've visited. No pressure, just passion. My Coastal Dreadnought sings.", instrument: "Coastal Dreadnought" },
    { id: "t3", name: "Jason W.", location: "Fort Pierce, FL", text: "The Custom Jet Phaser is everything the description promised and then some. Worth every penny. I'll be back for the Obsidian.", instrument: "Custom Jet Phaser" },
];

const TICKER_ITEMS = [
    "Hand‑Selected Instruments", "Private Showroom", "Stuart · Florida",
    "Expert Consultation", "Built for Tone", "Forged for Legends",
    "Treasure Coast's Finest", "Every Guitar Inspected",
];

const NAV_LINKS = [
    { label: "Home", id: "top" },
    { label: "Vault", id: "vault" },
    { label: "Lab", id: "lab" },
] as const;

const FOCUSABLE_SELECTOR = [
    "a[href]", "button:not([disabled])", "input:not([disabled])",
    "select:not([disabled])", "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(", ");

// ─── Utilities ─────────────────────────────────────────────────────
const smoothScrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// ─── Design tokens ─────────────────────────────────────────────────
const weaveBg = [
    "repeating-linear-gradient( 45deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 8px)",
    "repeating-linear-gradient(-45deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 8px)",
    "repeating-linear-gradient(  0deg, rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 1px, transparent 1px, transparent 3px)",
    "linear-gradient(160deg, rgb(9,9,9) 0%, rgb(2,2,2) 100%)",
].join(", ");

const panelBase: React.CSSProperties = {
    backgroundImage: weaveBg,
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 20,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.7), 0 12px 40px rgba(0,0,0,0.85)",
};
const panelAmberBase: React.CSSProperties = {
    ...panelBase,
    border: "1px solid rgba(217,119,6,0.30)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.7), 0 12px 40px rgba(0,0,0,0.85), 0 0 28px rgba(217,119,6,0.09)",
};

const P = "p-5 sm:p-7 sm:px-8";

const T: React.CSSProperties = { textShadow: "1px 1px 2px rgba(0,0,0,0.85)", color: "#ffffff" };
const TA: React.CSSProperties = { textShadow: "1px 1px 2px rgba(0,0,0,0.85)", color: "#f59e0b" };

const Divider = ({ amber = false, className = "" }: { amber?: boolean; className?: string }) => (
    <div className={`flex items-center gap-3 justify-center w-full ${className}`} aria-hidden="true">
        <div className={`h-px flex-1 max-w-[70px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${amber ? "bg-amber-500/60" : "bg-white/20"}`} />
        <div className={`h-px flex-1 max-w-[70px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
    </div>
);

// ─── Frame‑buffer engine ───────────────────────────────────────────
function useFrameBuffer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const frames = useRef<ImageBitmap[]>([]);
    const idx = useRef(0);
    const dir = useRef(1);
    const raf = useRef(0);
    const looping = useRef(false);
    const aborted = useRef(false);
    const [ready, setReady] = useState(false);

    const startLoop = useCallback(() => {
        const canvas = canvasRef.current;
        const f = frames.current;
        if (!canvas || !f.length) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        canvas.width = f[0].width;
        canvas.height = f[0].height;
        looping.current = true;
        let last = 0;
        const FPS = 1000 / 30;
        const step = (ts: number) => {
            if (!looping.current) return;
            if (!last) last = ts;
            const e = ts - last;
            if (e >= FPS) {
                let i = idx.current + dir.current;
                if (i >= f.length - 1) { dir.current = -1; i = f.length - 1; }
                else if (i <= 0) { dir.current = 1; i = 0; }
                idx.current = i;
                try { ctx.drawImage(f[i], 0, 0); }
                catch { looping.current = false; return; }
                last = ts - (e % FPS);
            }
            raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
    }, []);

    const captureFrames = useCallback(async () => {
        const video = videoRef.current;
        if (!video) return;
        const rvfc = ("requestVideoFrameCallback" in video)
            ? (video as unknown as RVFCVideo) : null;
        let timer = 0;
        const grab = async () => {
            if (aborted.current || frames.current.length >= MAX_FRAMES) return;
            if (video.ended || video.paused) return;
            try { frames.current.push(await createImageBitmap(video)); } catch { /* dropped */ }
        };
        const onEnded = () => {
            video.pause(); video.removeEventListener("ended", onEnded);
            rvfc ? rvfc.cancelVideoFrameCallback(timer) : clearInterval(timer);
            if (!aborted.current) { setReady(true); startLoop(); }
        };
        const start = () => {
            if (rvfc) {
                const cb: VFRCallback = async () => {
                    await grab();
                    if (!aborted.current && frames.current.length < MAX_FRAMES)
                        timer = rvfc.requestVideoFrameCallback(cb);
                };
                timer = rvfc.requestVideoFrameCallback(cb);
            } else timer = window.setInterval(grab, 1000 / 30);
            video.addEventListener("ended", onEnded);
            video.play().catch(() => { });
        };
        if (video.readyState >= 2) start();
        else video.addEventListener("loadeddata", start, { once: true });
    }, [startLoop]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        aborted.current = false;
        if (video.readyState >= 3) captureFrames();
        else video.addEventListener("canplay", captureFrames, { once: true });
        return () => {
            aborted.current = true; looping.current = false;
            cancelAnimationFrame(raf.current);
            frames.current.forEach(b => b.close());
            frames.current = [];
        };
    }, [captureFrames]);

    return { canvasRef, videoRef, ready };
}

// ─── Lightbox (unchanged, keep full implementation) ───────────────
function Lightbox({ src, name, onClose }: { src: string; name: string; onClose: () => void }) {
    const [mounted, setMounted] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<Element | null>(null);
    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (!mounted) return;
        triggerRef.current = document.activeElement;
        requestAnimationFrame(() => closeRef.current?.focus());
        return () => (triggerRef.current as HTMLElement | null)?.focus();
    }, [mounted]);
    useEffect(() => {
        if (!mounted) return;
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [mounted, onClose]);
    if (!mounted) return null;
    return createPortal(
        <div role="dialog" aria-modal="true" aria-label={`Enlarged image of ${name}`}
            onClick={onClose}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
            style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(14px)" }}>
            <button ref={closeRef} onClick={e => { e.stopPropagation(); onClose(); }}
                aria-label="Close image preview"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full flex items-center justify-center bg-black/80 border border-white/15 text-white/75 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-amber-400">
                <X size={20} />
            </button>
            <div onClick={onClose} className="relative w-full h-full cursor-zoom-out" style={{ maxWidth: "90vw", maxHeight: "86vh" }}>
                <Image src={src} alt={`${name} — enlarged view`} fill sizes="90vw"
                    className="object-contain"
                    style={{ pointerEvents: "none", filter: "drop-shadow(0 0 60px rgba(0,0,0,0.9))" }} />
            </div>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/35 text-[10px] uppercase tracking-[0.3em] pointer-events-none whitespace-nowrap">
                Tap anywhere · Esc to close
            </p>
        </div>,
        document.body
    );
}

// ─── Booking Modal (unchanged) ─────────────────────────────────────
function BookingModal({ onClose }: { onClose: () => void }) {
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [datetime, setDatetime] = useState("");
    const [interest, setInterest] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<Element | null>(null);
    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (!mounted) return;
        triggerRef.current = document.activeElement;
        requestAnimationFrame(() => closeRef.current?.focus());
        return () => (triggerRef.current as HTMLElement | null)?.focus();
    }, [mounted]);
    useEffect(() => {
        if (!mounted) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { onClose(); return; }
            if (e.key !== "Tab" || !dialogRef.current) return;
            const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
            if (!focusable.length) { e.preventDefault(); return; }
            const first = focusable[0]; const last = focusable[focusable.length - 1];
            if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
            else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mounted, onClose]);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !datetime) return;
        setSubmitted(true);
    };
    if (!mounted) return null;
    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={onClose} aria-hidden="true">
            <div ref={dialogRef}
                role="dialog" aria-modal="true" aria-label="Book a private session"
                onClick={e => e.stopPropagation()}
                style={panelAmberBase}
                className={`relative w-full max-w-md flex flex-col gap-5 ${P} max-h-[90vh] overflow-y-auto`}
                aria-hidden="false">
                <button ref={closeRef} onClick={onClose} aria-label="Close booking form"
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-amber-400">
                    <X size={17} />
                </button>
                {submitted ? (
                    <div className="flex flex-col items-center gap-5 py-6">
                        <div className="w-16 h-16 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                            <Check size={28} className="text-amber-400" aria-hidden="true" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight text-center" style={T}>Request Sent!</h3>
                        <p className="text-sm text-zinc-300 text-center leading-relaxed" style={T}>
                            We'll reach out within 24 hours to confirm your private session.
                        </p>
                        <button onClick={onClose}
                            className="mt-2 px-8 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-amber-400">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1 pr-8">
                            <h2 className="text-xl font-black uppercase tracking-[0.15em] text-white" style={T}>Book a Private Session</h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest">We'll confirm within 24 hours</p>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                            {[
                                { id: "bk-name", label: "Your Name *", type: "text", val: name, set: setName, req: true, ph: "John Doe" },
                                { id: "bk-email", label: "Email (optional)", type: "email", val: email, set: setEmail, req: false, ph: "you@example.com" },
                                { id: "bk-dt", label: "Preferred Date & Time *", type: "datetime-local", val: datetime, set: setDatetime, req: true, ph: "" },
                            ].map(f => (
                                <div key={f.id}>
                                    <label htmlFor={f.id} className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>{f.label}</label>
                                    <input id={f.id} type={f.type} value={f.val} required={f.req} placeholder={f.ph}
                                        onChange={e => f.set(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors" style={T} />
                                </div>
                            ))}
                            <div>
                                <label htmlFor="bk-interest" className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>What are you looking for?</label>
                                <textarea id="bk-interest" rows={3} value={interest}
                                    onChange={e => setInterest(e.target.value)}
                                    placeholder="e.g., GT1 Heritage, acoustic guitars, custom setup…"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none" style={T} />
                            </div>
                            <button type="submit"
                                className="flex items-center justify-center gap-2 w-full min-h-[52px] py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(217,119,6,0.5)] focus-visible:outline-2 focus-visible:outline-amber-400">
                                Send Request <Send size={16} aria-hidden="true" />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

// ─── Vault card ─────────────────────────────────────────────────────
function VaultCard({ item, idx, onView, onBook, reducedMotion }: {
    item: VaultItem; idx: number;
    onView: (src: string, name: string) => void;
    onBook: () => void;
    reducedMotion: boolean | null;
}) {
    const isEven = idx % 2 === 0;
    const cardVariants: Variants = useMemo(() => ({
        hidden: { opacity: 0, y: reducedMotion ? 0 : 24 },
        visible: {
            opacity: 1, y: 0,
            transition: {
                duration: reducedMotion ? 0.01 : 0.72,
                ease: [0.16, 1, 0.3, 1] as const,
                delay: reducedMotion ? 0 : idx * 0.07,
            },
        },
    }), [reducedMotion, idx]);

    return (
        <motion.article
            variants={cardVariants} initial="hidden"
            whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            aria-label={`${item.name} — ${item.category} — ${item.price}`}
            className={`flex flex-col ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"} items-center gap-7 sm:gap-10 md:gap-14 group w-full`}
        >
            <button type="button" onClick={() => onView(item.image, item.name)}
                aria-label={`View enlarged photo of ${item.name}`}
                aria-haspopup="dialog"
                className="relative w-full sm:w-[min(100%,380px)] flex-shrink-0 aspect-[4/5] cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-amber-600/40 hover:shadow-[0_24px_60px_rgba(217,119,6,0.15)] focus-visible:outline-2 focus-visible:outline-amber-400">
                <Image src={item.image} alt={`${item.name} — ${item.description}`} fill
                    sizes="(max-width:640px) 95vw, (max-width:1024px) 45vw, 380px"
                    priority={idx === 0} loading={idx === 0 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ pointerEvents: "none" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <div aria-hidden="true"
                    className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/80 bg-black/60 px-3 py-1.5 rounded-full">
                        Click to Enlarge
                    </span>
                </div>
            </button>
            <div style={panelBase} className={`${P} flex-1 w-full flex flex-col items-center sm:items-start gap-4 text-center sm:text-left`}>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 border-b border-amber-400/25 pb-1.5" style={TA}>
                    {item.category}
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic leading-[0.88] tracking-tighter text-white" style={T}>
                    {item.name}
                </h3>
                <Divider />
                <p className="text-sm sm:text-base leading-relaxed text-zinc-300 italic" style={T}>{item.description}</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-zinc-500 font-medium" style={T}>{item.specs}</p>
                <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400" style={TA}>{item.price}</span>
                    <button onClick={onBook} aria-label={`Inquire about ${item.name}`}
                        className="flex items-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-xs uppercase tracking-[0.3em] transition-all focus-visible:outline-2 focus-visible:outline-amber-400">
                        Inquire <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Page ───────────────────────────────────────────────────────────
export default function HomePage() {
    const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);
    const [showBooking, setShowBooking] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const { canvasRef, videoRef, ready } = useFrameBuffer();
    const reducedMotion = useReducedMotion();

    const fadeUp: Variants = useMemo(() => ({
        hidden: { opacity: 0, y: reducedMotion ? 0 : 22 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: reducedMotion ? 0.01 : 0.72, ease: [0.16, 1, 0.3, 1] as const },
        },
    }), [reducedMotion]);

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setLightbox(null); setShowBooking(false); setMobileNavOpen(false); }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, []);

    useEffect(() => {
        const h = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);

    useEffect(() => {
        const h = () => { if (mobileNavOpen) setMobileNavOpen(false); };
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, [mobileNavOpen]);

    const categories = useMemo(() => ["All", ...Array.from(new Set(VAULT_ITEMS.map(i => i.category)))], []);
    const visibleItems = useMemo(() => activeCategory === "All" ? VAULT_ITEMS : VAULT_ITEMS.filter(i => i.category === activeCategory), [activeCategory]);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubscribed(true);
        setEmail("");
    };

    return (
        <>
            <a href="#vault"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:font-black focus:text-sm focus:rounded">
                Skip to Vault
            </a>

            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
                        onClick={() => smoothScrollTo("top")}
                        aria-label="Back to top"
                        className="fixed bottom-6 right-5 sm:right-6 z-[500] w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 text-black flex items-center justify-center shadow-[0_4px_24px_rgba(217,119,6,0.5)] transition-colors focus-visible:outline-2 focus-visible:outline-amber-400">
                        <ChevronUp size={20} strokeWidth={2.5} aria-hidden="true" />
                    </motion.button>
                )}
            </AnimatePresence>

            <main className="relative min-h-screen bg-black text-white antialiased">
                <style>{`
          html, body {
            overflow-x: hidden;
            max-width: 100vw;
            background: #000;
            margin: 0;
            padding: 0;
          }
          @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
          .ticker-track { animation: ticker 32s linear infinite; }
          .ticker-track:hover { animation-play-state: paused; }
          button, a { -webkit-tap-highlight-color: rgba(217,119,6,0.15); }

          /* Mobile canvas stretch (phone only) */
          @media (max-width: 639px) {
            .hero-canvas-mobile {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 105vw;
              height: 125vh;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>

                <div aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-[997] opacity-[0.035] bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] bg-repeat" />

                <video ref={videoRef} src="/background-video3.mp4" muted playsInline preload="auto"
                    aria-hidden="true" className="hidden" />

                {/* ═══════════════════════════════════════════════════════
         *  HERO SECTION
         *  Desktop: side panels visible, canvas fills entire section,
         *           text overlay centred between panels.
         *  Mobile: stretch canvas, address at top, no side panels.
         * ════════════════════════════════════════════════════════ */}
                <section id="top" aria-label="Hero — Goated Guitars"
                    className="relative w-full bg-black overflow-hidden h-[125vh] sm:h-screen">

                    {/* Canvas – on mobile uses stretch class, on desktop just fills section */}
                    <canvas ref={canvasRef} aria-hidden="true"
                        className="hero-canvas-mobile sm:absolute sm:inset-0 sm:w-full sm:h-full bg-black"
                        style={{ display: "block" }} />

                    {!ready && (
                        <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center gap-4"
                            aria-live="polite" aria-label="Video loading">
                            <div aria-hidden="true" className="h-px w-28 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-amber-600 animate-pulse rounded-full" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Warming up amps…</span>
                        </div>
                    )}

                    {/* ── DESKTOP SIDE PANELS (hidden on mobile) ── */}
                    <div aria-hidden="true"
                        className="absolute left-0 top-0 h-full z-20 hidden sm:block w-[20vw]">
                        <video src="/guitar-side-1.mp4" autoPlay loop muted playsInline poster="/gt1.jpg"
                            className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0"
                            style={{ background: "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.88) 100%)" }} />
                    </div>
                    <div aria-hidden="true"
                        className="absolute right-0 top-0 h-full z-20 hidden sm:block w-[20vw]">
                        <video src="/guitar-side-2.mp4" autoPlay loop muted playsInline poster="/gt4.jpg"
                            className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0"
                            style={{ background: "linear-gradient(to left, transparent 40%, rgba(0,0,0,0.88) 100%)" }} />
                    </div>

                    {/* ── MOBILE OVERLAY (< sm) ── */}
                    <div className="sm:hidden absolute inset-0 z-30 flex flex-col items-center justify-between py-8 px-5 text-center"
                        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)" }}>

                        <div className="flex items-center justify-center gap-4 w-full">
                            <a href="https://www.facebook.com/profile.php?id=61578260857279"
                                target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                                className="w-10 h-10 flex items-center justify-center hover:text-amber-400 transition-colors text-white/80 focus-visible:outline-2 focus-visible:outline-amber-400 rounded-full">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" /></svg>
                            </a>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-400 max-w-[200px] leading-relaxed"
                                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}>
                                1051 SE Ocean Blvd, Unit 1<br />Stuart, FL 34996
                            </p>
                            <a href="https://www.instagram.com/goatedguitars/?hl=en"
                                target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                className="w-10 h-10 flex items-center justify-center hover:text-amber-400 transition-colors text-white/80 focus-visible:outline-2 focus-visible:outline-amber-400 rounded-full">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                        </div>

                        <motion.div variants={fadeUp} initial="hidden" animate="visible"
                            className="flex flex-col items-center gap-3">
                            <h1 className="font-black uppercase leading-[0.76] tracking-tighter text-white"
                                style={{
                                    fontSize: "clamp(3.2rem, 20vw, 5.5rem)",
                                    textShadow: "0 2px 20px rgba(0,0,0,0.9), 1px 1px 2px rgba(0,0,0,0.95)"
                                }}>
                                GOATED<br /><span style={{ color: "#f59e0b", textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 20px rgba(217,119,6,0.4)" }}>GUITARS</span>
                            </h1>
                            <Divider amber className="max-w-[160px]" />
                            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-amber-400"
                                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}>
                                Stuart, Florida · Est. 2024
                            </p>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 max-w-[240px] mt-1"
                                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}>
                                Built for Tone. Forged for Legends.
                            </p>
                        </motion.div>

                        <div className="flex flex-col items-center gap-3 w-full max-w-[300px]">
                            <button onClick={() => smoothScrollTo("vault")}
                                className="w-full flex items-center justify-center gap-2 min-h-[58px] px-7 py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.25em] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)] focus-visible:outline-2 focus-visible:outline-amber-400">
                                Explore The Vault <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
                            </button>
                            <button onClick={() => setShowBooking(true)}
                                className="w-full flex items-center justify-center gap-2 min-h-[58px] px-7 py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.25em] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)] focus-visible:outline-2 focus-visible:outline-amber-400">
                                Book a Session
                            </button>
                            <nav aria-label="Mobile hero navigation" className="flex gap-8 mt-1">
                                {NAV_LINKS.map(({ label, id }) => (
                                    <button key={id} onClick={() => smoothScrollTo(id)}
                                        className="text-xs font-black uppercase tracking-[0.35em] text-zinc-400 hover:text-amber-400 transition-colors min-h-[44px] flex items-center focus-visible:outline-2 focus-visible:outline-amber-400 rounded">
                                        {label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* ── DESKTOP OVERLAY (sm+) – perfectly centered between side panels ── */}
                    <div className="hidden sm:flex absolute inset-0 z-30 flex-col pointer-events-none">
                        {/* Top bar: social + address */}
                        <div className="flex items-center justify-center pt-5 pb-2 px-8 flex-shrink-0">
                            <div className="flex items-center gap-5 text-white">
                                <a href="https://www.facebook.com/profile.php?id=61578260857279"
                                    target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                                    className="pointer-events-auto w-9 h-9 flex items-center justify-center hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 rounded-full">
                                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" /></svg>
                                </a>
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-400" style={TA}>
                                    1051 SE Ocean Blvd, Unit 1 · Stuart, FL 34996
                                </p>
                                <a href="https://www.instagram.com/goatedguitars/?hl=en"
                                    target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                    className="pointer-events-auto w-9 h-9 flex items-center justify-center hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 rounded-full">
                                    <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Centre: title & tagline – with margins to clear side panels */}
                        <div className="flex-1 flex items-center justify-center px-4">
                            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                                className="flex flex-col items-center gap-4 text-center"
                                style={{ marginLeft: "20vw", marginRight: "20vw" }}>
                                <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                                    <span aria-hidden="true" className="w-8 h-px bg-amber-500/60 rounded-full" />
                                    Stuart, Florida · Est. 2024
                                    <span aria-hidden="true" className="w-8 h-px bg-amber-500/60 rounded-full" />
                                </span>
                                <h1 className="text-[clamp(3rem,8vw,11rem)] font-black uppercase leading-[0.76] tracking-tighter text-white" style={T}>
                                    GOATED<br /><span className="text-amber-500" style={TA}>GUITARS</span>
                                </h1>
                                <Divider amber className="max-w-[200px]" />
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400 max-w-sm" style={TA}>
                                    Built for Tone. Forged for Legends.
                                </p>
                            </motion.div>
                        </div>

                        {/* Bottom CTAs */}
                        <div className="flex-shrink-0 flex justify-center items-center pb-5 pt-3">
                            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                                className="flex flex-col items-center gap-4 pointer-events-auto">
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <button onClick={() => smoothScrollTo("vault")}
                                        className="flex items-center gap-2 min-h-[46px] px-7 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)] focus-visible:outline-2 focus-visible:outline-amber-400">
                                        Explore The Vault <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
                                    </button>
                                    <button onClick={() => setShowBooking(true)}
                                        className="flex items-center gap-2 min-h-[46px] px-7 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)] focus-visible:outline-2 focus-visible:outline-amber-400">
                                        Book a Session
                                    </button>
                                </div>
                                <nav aria-label="Hero navigation" className="flex gap-8 sm:gap-10">
                                    {NAV_LINKS.map(({ label, id }) => (
                                        <button key={id} onClick={() => smoothScrollTo(id)}
                                            className="relative text-sm font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-white transition-colors group py-1.5 min-h-[44px] flex items-center focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
                                            style={T}>
                                            {label}
                                            <span aria-hidden="true"
                                                className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 transition-all duration-300 group-hover:w-full rounded-full" />
                                        </button>
                                    ))}
                                </nav>
                                {!reducedMotion && <ChevronDown className="animate-bounce text-amber-600/50" size={22} aria-hidden="true" />}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Ticker */}
                <div aria-hidden="true" className="relative overflow-hidden border-y border-amber-600/20 py-3"
                    style={{ background: "linear-gradient(90deg, #0a0600, #0d0800 50%, #0a0600)" }}>
                    <div className="ticker-track flex whitespace-nowrap select-none">
                        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                            <span key={i} className="inline-flex items-center gap-4 px-6 text-[11px] font-black uppercase tracking-[0.5em] text-amber-500/65">
                                {item}<span className="text-amber-600/35">✦</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* ═══════════════════════════════════════
         *  STICKY NAV (unchanged)
         * ════════════════════════════════════════ */}
                <nav aria-label="Primary navigation"
                    className="sticky top-0 z-[100] border-b border-white/5"
                    style={{ backgroundImage: weaveBg, backdropFilter: "blur(20px)" }}>
                    <div className="flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-8 h-14">
                        <button onClick={() => smoothScrollTo("top")} aria-label="Back to top"
                            className="flex items-center gap-2.5 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded">
                            <div className="w-8 h-8 rounded-full bg-amber-600/15 border border-amber-600/30 flex items-center justify-center">
                                <span className="text-amber-400 font-black text-sm leading-none" style={TA}>G</span>
                            </div>
                            <span className="hidden sm:block text-white font-black text-xs uppercase tracking-[0.35em]" style={T}>
                                Goated <span className="text-amber-500">Guitars</span>
                            </span>
                        </button>
                        <ul className="hidden md:flex items-center gap-8 list-none" role="list">
                            {NAV_LINKS.map(({ label, id }) => (
                                <li key={id}>
                                    <button onClick={() => smoothScrollTo(id)}
                                        className="relative text-xs font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-white transition-colors group py-2 focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
                                        style={T}>
                                        {label}
                                        <span aria-hidden="true"
                                            className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 transition-all duration-300 group-hover:w-full rounded-full" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button onClick={() => setShowBooking(true)}
                                className="flex items-center gap-1 min-h-[36px] px-3 sm:px-5 py-2 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all focus-visible:outline-2 focus-visible:outline-amber-400">
                                Book<span className="hidden sm:inline"> Session</span>
                            </button>
                            <button
                                onClick={() => setMobileNavOpen(o => !o)}
                                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                                aria-expanded={mobileNavOpen}
                                className="md:hidden w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400">
                                {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}
                            </button>
                        </div>
                    </div>
                    <AnimatePresence>
                        {mobileNavOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
                                className="md:hidden overflow-hidden border-t border-white/5"
                                style={{ backgroundImage: weaveBg }}>
                                <div className="flex flex-col px-4 py-2">
                                    {NAV_LINKS.map(({ label, id }) => (
                                        <button key={id}
                                            onClick={() => { smoothScrollTo(id); setMobileNavOpen(false); }}
                                            className="flex items-center justify-between w-full py-3.5 px-2 text-sm font-black uppercase tracking-[0.35em] text-zinc-400 hover:text-amber-400 transition-colors border-b border-white/5 last:border-0 focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
                                            style={T}>
                                            {label}
                                            <ArrowRight size={13} className="text-amber-500/50" aria-hidden="true" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* ═══════════════════════════════════════════════════════
         *  VAULT SECTION (side panels visible on sm+)
         * ════════════════════════════════════════════════════════ */}
                <section id="vault" aria-labelledby="vault-heading"
                    className="relative flex items-stretch bg-black">
                    <div aria-hidden="true"
                        className="hidden sm:block flex-shrink-0 bg-black overflow-hidden sticky top-[56px] self-start w-[20vw] h-[calc(100vh-56px)]">
                        <video src="/ACO GT1.mp4" autoPlay loop muted playsInline poster="/gt1.jpg"
                            className="h-full w-full object-cover opacity-75" />
                        <div className="absolute inset-0"
                            style={{ background: "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.88) 100%)" }} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col items-center px-4 sm:px-8 lg:px-10 py-16 sm:py-24 md:py-32"
                        style={{
                            background: "rgba(0,0,0,0.72)",
                            backgroundImage: "url('/logo.jpg')",
                            backgroundRepeat: "repeat",
                            backgroundSize: "200px",
                            backgroundBlendMode: "overlay",
                        }}>
                        <motion.header variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="mb-12 sm:mb-16 w-full flex justify-center">
                            <div style={panelAmberBase}
                                className={`${P} flex flex-col items-center gap-3 sm:gap-4 text-center w-full max-w-lg`}>
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>Hand-Selected Instruments</span>
                                <h2 id="vault-heading"
                                    className="text-[clamp(2.8rem,7vw,8rem)] font-black uppercase italic leading-none tracking-tighter text-white"
                                    style={T}>
                                    The Vault
                                </h2>
                                <Divider amber />
                                <p className="text-sm text-zinc-300 font-medium leading-relaxed max-w-sm" style={T}>
                                    Every instrument personally inspected for tone, playability, and character.
                                </p>
                            </div>
                        </motion.header>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-14 px-1"
                            role="group" aria-label="Filter by category">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    aria-pressed={activeCategory === cat}
                                    className={`min-h-[38px] px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] transition-all focus-visible:outline-2 focus-visible:outline-amber-400
                    ${activeCategory === cat
                                            ? "bg-amber-600 text-black shadow-[0_0_16px_rgba(217,119,6,0.4)]"
                                            : "border border-white/15 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="w-full max-w-5xl flex flex-col gap-14 sm:gap-20 md:gap-28"
                            aria-live="polite" aria-label={`Showing ${visibleItems.length} instruments`}>
                            <AnimatePresence mode="popLayout">
                                {visibleItems.map((item, i) => (
                                    <VaultCard key={item.id} item={item} idx={i}
                                        onView={(src, name) => setLightbox({ src, name })}
                                        onBook={() => setShowBooking(true)}
                                        reducedMotion={reducedMotion} />
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div aria-hidden="true"
                        className="hidden sm:block flex-shrink-0 bg-black overflow-hidden sticky top-[56px] self-start w-[20vw] h-[calc(100vh-56px)]">
                        <video src="/ACO GT1.mp4" autoPlay loop muted playsInline poster="/gt4.jpg"
                            className="h-full w-full object-cover opacity-75" />
                        <div className="absolute inset-0"
                            style={{ background: "linear-gradient(to left, transparent 40%, rgba(0,0,0,0.88) 100%)" }} />
                    </div>
                </section>

                {/* ... Testimonials, Newsletter, Lab/Footer (unchanged) ... */}

                {lightbox && <Lightbox src={lightbox.src} name={lightbox.name} onClose={() => setLightbox(null)} />}
                {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
            </main>
        </>
    );
}