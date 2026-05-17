"use client";

import React, {
    useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    ChevronDown, X, Send, MapPin, Clock,
    Camera, Share2, Check, ArrowRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────

interface VaultItem {
    id: string;
    name: string;
    category: string;
    price: string;
    image: string;
    description: string;
    specs: string;
}

interface Testimonial {
    id: string;
    name: string;
    location: string;
    text: string;
    instrument: string;
}

type RVFCVideo = HTMLVideoElement & {
    requestVideoFrameCallback(cb: VideoFrameRequestCallback): number;
    cancelVideoFrameCallback(handle: number): void;
};

// ─── Constants ───────────────────────────────────────────────────────

const MAX_FRAMES = 240;

// ─── Easy site controls ──────────────────────────────────────────────
// Tune these values first when the desktop or phone layout needs a quick correction.
const LAYOUT_CONTROLS = {
    mobileCenterVideoScale: "scaleX(0.95) scaleY(1.25)",
    mobileCenterVideoWidth: "106vw",
    homeSidePanelWidth: "clamp(170px, 22vw, 330px)",
    homeCenterVideoMaxWidth: "clamp(330px, 38vw, 620px)",
    homeCenterVideoMaxHeight: "min(68vh, 640px)",
    vaultSidePanelWidth: "clamp(150px, 18vw, 280px)",
    vaultContentMaxWidth: "960px",
    stickyNavOffset: "73px",
    videoRadius: "14px",
} as const;

// Swap videos or posters here. The layout below will keep phone and desktop aligned.
const SIDE_VIDEO_MEDIA = {
    homeLeft: { src: "/guitar-side-1.mp4", poster: "/Gt1.jpg", objectPosition: "center" },
    homeRight: { src: "/guitar-side-2.mp4", poster: "/gt4.jpg", objectPosition: "center" },
    vaultLeft: { src: "/ACO GT1.mp4", poster: "/Gt1.jpg", objectPosition: "center" },
    vaultRight: { src: "/ACO GT1.mp4", poster: "/gt4.jpg", objectPosition: "center" },
} as const;

const VAULT_ITEMS: VaultItem[] = [
    {
        id: "g1", name: "The GT1 Heritage", category: "Electric",
        price: "$4,200", image: "/Gt1.jpg",
        description: "Immaculate red semi-hollow body with classic dual humbuckers.",
        specs: "Mahogany body · Rosewood fretboard · Dual humbuckers",
    },
    {
        id: "g2", name: "Coastal Dreadnought", category: "Acoustic",
        price: "$3,150", image: "/gt4.jpg",
        description: "Vintage acoustic resonance, protected in its original hardshell case.",
        specs: "Sitka spruce top · Mahogany back & sides · Bone nut & saddle",
    },
    {
        id: "g3", name: "Custom Jet Phaser", category: "Boutique Effects",
        price: "$850", image: "/Gt pedal.jpg",
        description: "The ultimate tone-shaping tool for Treasure Coast legends.",
        specs: "Hand-wired · True bypass · Limited production run",
    },
    {
        id: "g4", name: "Sunrise Cutaway", category: "Acoustic-Electric",
        price: "$2,900", image: "/gt2.jpg",
        description: "Warm cedar top with a crystal-clear Fishman pickup system.",
        specs: "Western red cedar top · Fishman Presys+ · Venetian cutaway",
    },
    {
        id: "g5", name: "Obsidian Classic", category: "Electric",
        price: "$3,800", image: "/gt3.jpg",
        description: "Sleek black limba body with coil-tapped humbuckers.",
        specs: "Black limba body · Maple neck · Coil-tap switching",
    },
];

const TESTIMONIALS: Testimonial[] = [
    {
        id: "t1", name: "Marcus D.", location: "Stuart, FL",
        text: "Walked in not knowing what I wanted. Walked out with a GT1 Heritage that completely changed my playing. These guys actually listen.",
        instrument: "GT1 Heritage",
    },
    {
        id: "t2", name: "Elena R.", location: "Palm Beach, FL",
        text: "The private session experience is unlike any guitar shop I've visited. No pressure, just passion. My Coastal Dreadnought sings.",
        instrument: "Coastal Dreadnought",
    },
    {
        id: "t3", name: "Jason W.", location: "Fort Pierce, FL",
        text: "The Custom Jet Phaser is everything the description promised and then some. Worth every penny. I'll be back for the Obsidian.",
        instrument: "Custom Jet Phaser",
    },
];

const TICKER_ITEMS = [
    "Hand-Selected Instruments", "Private Showroom", "Stuart · Florida",
    "Expert Consultation", "Built for Tone", "Forged for Legends",
    "Treasure Coast's Finest", "Every Guitar Inspected",
];

const SHOP_FEATURES = [
    {
        id: "drops",
        icon: "check",
        eyebrow: "New Arrivals",
        title: "Fresh Vault Drops",
        body: "Recently added electrics, acoustics, and effects staged for fast browsing.",
        target: "vault",
    },
    {
        id: "showroom",
        icon: "map",
        eyebrow: "Private Showroom",
        title: "Book the Room",
        body: "A focused appointment flow for players who want quiet time with serious gear.",
        target: "experience",
    },
    {
        id: "demos",
        icon: "camera",
        eyebrow: "Video First",
        title: "Hear Before You Visit",
        body: "Short shop reels give the page the same pulse as a wall of guitars in motion.",
        target: "top",
    },
    {
        id: "tone",
        icon: "clock",
        eyebrow: "Tone Match",
        title: "Setup Window",
        body: "Reserve time to compare instruments, amps, pedals, and real playing feel.",
        target: "lab",
    },
] as const;

const FOCUSABLE_SELECTOR = [
    "a[href]", "button:not([disabled])", "input:not([disabled])",
    "select:not([disabled])", "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(", ");

// ─── Utilities ───────────────────────────────────────────────────────

const smoothScrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

// ─── Design tokens ───────────────────────────────────────────────────

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

const T: React.CSSProperties = {
    textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
    color: "#ffffff",
};

const TA: React.CSSProperties = {
    textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
    color: "#f59e0b",
};

const Divider = ({ amber = false, className = "" }: { amber?: boolean; className?: string }) => (
    <div className={`flex items-center gap-3 justify-center w-full ${className}`} aria-hidden="true">
        <div className={`h-px flex-1 max-w-[70px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${amber ? "bg-amber-500/60" : "bg-white/20"}`} />
        <div className={`h-px flex-1 max-w-[70px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
    </div>
);

function ShopFeatureIcon({ icon }: { icon: (typeof SHOP_FEATURES)[number]["icon"] }) {
    const common = { size: 20, strokeWidth: 2.2, "aria-hidden": true };
    switch (icon) {
        case "camera":
            return <Camera {...common} />;
        case "map":
            return <MapPin {...common} />;
        case "clock":
            return <Clock {...common} />;
        case "check":
        default:
            return <Check {...common} />;
    }
}

function SideVideoPanel({
    media,
    fade,
    mode,
}: {
    media: (typeof SIDE_VIDEO_MEDIA)[keyof typeof SIDE_VIDEO_MEDIA];
    fade: "left" | "right";
    mode: "home" | "vault";
}) {
    const gradient = fade === "right"
        ? "linear-gradient(to right, transparent 38%, rgba(2,2,2,0.96) 100%)"
        : "linear-gradient(to left, transparent 38%, rgba(2,2,2,0.96) 100%)";

    const wrapperStyle: React.CSSProperties = mode === "vault"
        ? {
            position: "sticky",
            top: "var(--sticky-nav-offset)",
            height: "calc(100vh - var(--sticky-nav-offset))",
            width: "100%",
        }
        : {};

    return (
        <div
            aria-hidden="true"
            className={`hidden md:block side-panel-desktop ${mode === "home" ? "home-side-panel h-full" : "vault-side-panel"} bg-black overflow-hidden relative shrink-0`}
        >
            <div className={mode === "home" ? "absolute inset-0" : "w-full"} style={wrapperStyle}>
                <video
                    src={media.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={media.poster}
                    className="side-panel-video h-full w-full object-cover"
                    style={{ objectPosition: media.objectPosition }}
                />
                <div className="absolute inset-0" style={{ background: gradient }} />
                <div className="absolute inset-0 border-x border-white/10" />
            </div>
        </div>
    );
}

// ─── Frame‑buffer playback engine ────────────────────────────────────

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
            ? (video as unknown as RVFCVideo)
            : null;
        let timer = 0;

        const grab = async () => {
            if (aborted.current || frames.current.length >= MAX_FRAMES) return;
            if (video.ended || video.paused) return;
            try { frames.current.push(await createImageBitmap(video)); } catch { /* dropped */ }
        };

        const onEnded = () => {
            video.pause();
            video.removeEventListener("ended", onEnded);
            if (rvfc) rvfc.cancelVideoFrameCallback(timer);
            else clearInterval(timer);
            if (!aborted.current) { setReady(true); startLoop(); }
        };

        const start = () => {
            if (rvfc) {
                const cb: VideoFrameRequestCallback = async () => {
                    await grab();
                    if (!aborted.current && frames.current.length < MAX_FRAMES)
                        timer = rvfc.requestVideoFrameCallback(cb);
                };
                timer = rvfc.requestVideoFrameCallback(cb);
            } else {
                timer = window.setInterval(grab, 1000 / 30);
            }
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

        // Safety Fallback Valve
        const fallbackTimer = setTimeout(() => {
            if (!ready && !aborted.current) {
                setReady(true);
            }
        }, 1200);

        if (video.readyState >= 3) captureFrames();
        else video.addEventListener("canplay", captureFrames, { once: true });

        return () => {
            aborted.current = true;
            looping.current = false;
            clearTimeout(fallbackTimer);
            cancelAnimationFrame(raf.current);
            frames.current.forEach(b => b.close());
            frames.current = [];
        };
    }, [captureFrames, ready]);

    return { canvasRef, videoRef, ready };
}

// ─── Lightbox ────────────────────────────────────────────────────────

function Lightbox({ src, name, onClose }: { src: string; name: string; onClose: () => void }) {
    const mounted = typeof document !== "undefined";
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<Element | null>(null);

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
        <div
            role="dialog" aria-modal="true" aria-label={`Enlarged image of ${name}`}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 99999,
                background: "rgba(0,0,0,0.95)", backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "zoom-out", padding: 24,
            }}
        >
            <button
                ref={closeRef}
                onClick={e => { e.stopPropagation(); onClose(); }}
                aria-label="Close image preview"
                className="focus-visible:outline-2 focus-visible:outline-amber-400"
                style={{
                    position: "absolute", top: 24, right: 24,
                    background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "50%", width: 44, height: 44,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.75)", cursor: "pointer", zIndex: 2,
                }}
            >
                <X size={20} />
            </button>
            <div onClick={onClose}
                style={{ position: "relative", width: "100%", height: "100%", maxWidth: "88vw", maxHeight: "86vh", cursor: "zoom-out" }}>
                <Image src={src} alt={`${name} — enlarged view`} fill sizes="88vw"
                    className="object-contain" style={{ pointerEvents: "none", filter: "drop-shadow(0 0 60px rgba(0,0,0,0.8))" }} />
            </div>
        </div>,
        document.body
    );
}

// ─── Booking Modal ────────────────────────────────────────────────────

function BookingModal({ onClose }: { onClose: () => void }) {
    const mounted = typeof document !== "undefined";
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [datetime, setDatetime] = useState("");
    const [interest, setInterest] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<Element | null>(null);

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

            const focusable = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            );
            if (!focusable.length) { e.preventDefault(); return; }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
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
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={onClose}
            aria-hidden="true"
        >
            <div
                ref={dialogRef}
                role="dialog" aria-modal="true" aria-label="Book a private session"
                onClick={e => e.stopPropagation()}
                style={panelAmber}
                className="relative w-full max-w-md flex flex-col gap-6"
                aria-hidden="false"
            >
                <button
                    ref={closeRef}
                    onClick={onClose}
                    aria-label="Close booking form"
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                    <X size={18} />
                </button>

                {submitted ? (
                    <div className="flex flex-col items-center gap-5 py-8">
                        <div className="w-16 h-16 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
                            <Check size={28} className="text-amber-400" aria-hidden="true" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight" style={T}>
                            Request Sent!
                        </h3>
                        <p className="text-sm text-zinc-300 text-center leading-relaxed" style={T}>
                            We&apos;ll reach out within 24 hours to confirm your private session.
                        </p>
                        <button onClick={onClose}
                            className="mt-2 px-8 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-amber-400">
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            <h2 className="text-xl font-black uppercase tracking-[0.15em] text-white" style={T}>
                                Book a Private Session
                            </h2>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest" style={T}>
                                We&apos;ll confirm within 24 hours
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                            <div>
                                <label htmlFor="bk-name"
                                    className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>
                                    Your Name *
                                </label>
                                <input id="bk-name" type="text" value={name} required
                                    onChange={e => setName(e.target.value)} placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
                                    style={T} />
                            </div>
                            <div>
                                <label htmlFor="bk-email"
                                    className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>
                                    Email (optional)
                                </label>
                                <input id="bk-email" type="email" value={email}
                                    onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
                                    style={T} />
                            </div>
                            <div>
                                <label htmlFor="bk-dt"
                                    className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>
                                    Preferred Date & Time *
                                </label>
                                <input id="bk-dt" type="datetime-local" value={datetime} required
                                    onChange={e => setDatetime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500/60 transition-colors"
                                    style={T} />
                            </div>
                            <div>
                                <label htmlFor="bk-interest"
                                    className="block text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-1.5" style={TA}>
                                    What are you looking for?
                                </label>
                                <textarea id="bk-interest" rows={3} value={interest}
                                    onChange={e => setInterest(e.target.value)}
                                    placeholder="e.g., GT1 Heritage, acoustic guitars, custom setup…"
                                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
                                    style={T} />
                            </div>
                            <button type="submit"
                                className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(217,119,6,0.5)] focus-visible:outline-2 focus-visible:outline-amber-400">
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

// ─── Vault item card ──────────────────────────────────────────────────

interface VaultCardProps {
    item: VaultItem;
    idx: number;
    onView: (src: string, name: string) => void;
    onBook: () => void;
}

function VaultCard({ item, idx, onView, onBook }: VaultCardProps) {
    const isEven = idx % 2 === 0;
    return (
        <motion.article
            key={item.id}
            aria-label={`${item.name} — ${item.category} — ${item.price}`}
            className={`flex flex-col ${isEven ? "xl:flex-row" : "xl:flex-row-reverse"} items-center gap-10 xl:gap-16 group`}
        >
            <button
                type="button"
                onClick={() => onView(item.image, item.name)}
                aria-label={`View enlarged photo of ${item.name}`}
                aria-haspopup="dialog"
                className="relative w-full max-w-[400px] flex-shrink-0 aspect-[4/5] cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-amber-600/40 hover:shadow-[0_24px_60px_rgba(217,119,6,0.15)] focus-visible:outline-2 focus-visible:outline-amber-400"
            >
                <Image
                    src={item.image} alt={`${item.name} — ${item.description}`} fill
                    sizes="(max-width:768px) 90vw, (max-width:1280px) 38vw, 400px"
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ pointerEvents: "none" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <div aria-hidden="true"
                    className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/80 bg-black/55 px-3 py-1.5 rounded-full">
                        Click to Enlarge
                    </span>
                </div>
            </button>

            <div style={panel} className="flex-1 flex flex-col items-center xl:items-start gap-5 text-center xl:text-left">
                <span className="text-xs font-black uppercase tracking-[0.5em] text-amber-400 border-b border-amber-400/25 pb-1.5" style={TA}>
                    {item.category}
                </span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase italic leading-[0.88] tracking-tighter text-white" style={T}>
                    {item.name}
                </h3>
                <Divider />
                <p className="text-base leading-relaxed text-zinc-300 italic" style={T}>
                    {item.description}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-medium" style={T}>
                    {item.specs}
                </p>
                <div className="flex items-center gap-4 flex-wrap justify-center xl:justify-start mt-1">
                    <span className="text-3xl font-black text-amber-400" style={TA}>{item.price}</span>
                    <button
                        onClick={onBook}
                        aria-label={`Inquire about ${item.name}`}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-xs uppercase tracking-[0.3em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400"
                    >
                        Inquire <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function HomePage() {
    const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);
    const [showBooking, setShowBooking] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const { canvasRef, videoRef, ready } = useFrameBuffer();
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setLightbox(null); setShowBooking(false); }
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, []);

    const categories = useMemo(() =>
        ["All", ...Array.from(new Set(VAULT_ITEMS.map(i => i.category)))],
        []);

    const visibleItems = useMemo(() =>
        activeCategory === "All" ? VAULT_ITEMS : VAULT_ITEMS.filter(i => i.category === activeCategory),
        [activeCategory]);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setSubscribed(true);
        setEmail("");
    };

    return (
        <>
            <a href="#vault"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:font-black focus:text-sm focus:rounded focus:uppercase focus:tracking-widest">
                Skip to Vault
            </a>

            <main className="site-frame global-weave-bg relative min-h-screen text-white antialiased m-0 p-0 overflow-x-hidden">

                {/* ─────────────────────────────────────────────────────────
                    EASY LAYOUT ADJUSTMENTS
                    Primary tuning lives in LAYOUT_CONTROLS at the top of this file.
                ───────────────────────────────────────────────────────── */}
                <style>{`
                    .site-frame {
                        --mobile-center-video-scale: ${LAYOUT_CONTROLS.mobileCenterVideoScale};
                        --mobile-center-video-width: ${LAYOUT_CONTROLS.mobileCenterVideoWidth};
                        --home-side-panel-width: ${LAYOUT_CONTROLS.homeSidePanelWidth};
                        --home-center-video-max-width: ${LAYOUT_CONTROLS.homeCenterVideoMaxWidth};
                        --home-center-video-max-height: ${LAYOUT_CONTROLS.homeCenterVideoMaxHeight};
                        --vault-side-panel-width: ${LAYOUT_CONTROLS.vaultSidePanelWidth};
                        --vault-content-max-width: ${LAYOUT_CONTROLS.vaultContentMaxWidth};
                        --sticky-nav-offset: ${LAYOUT_CONTROLS.stickyNavOffset};
                        --video-radius: ${LAYOUT_CONTROLS.videoRadius};
                    }
                    body, html {
                        background-color: #020202 !important;
                        margin: 0;
                        padding: 0;
                    }
                    .global-weave-bg {
                        background-image: ${weaveBg} !important;
                        background-attachment: fixed !important;
                    }
                    @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
                    .ticker-track{animation:ticker 32s linear infinite}
                    .ticker-track:hover{animation-play-state:paused}

                    /* --- MOBILE PHONE VIDEO SETTINGS --- */
                    .hero-canvas-responsive {
                        transform: var(--mobile-center-video-scale) !important;
                        transform-origin: center center !important;
                        width: var(--mobile-center-video-width) !important;
                        height: 100% !important;
                        object-fit: cover !important;
                    }
                    .side-panel-desktop {
                        display: none;
                    }
                    .side-panel-video {
                        opacity: 0.86;
                        filter: saturate(1.12) contrast(1.06);
                    }
                    .shop-feature-card {
                        background: linear-gradient(180deg, rgba(24,24,27,0.74), rgba(5,5,5,0.92));
                        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 44px rgba(0,0,0,0.36);
                    }

                    /* --- DESKTOP / PC SETTINGS (Over 768px width) --- */
                    @media (min-width: 768px) {
                        .home-stage {
                            display: grid !important;
                            grid-template-columns: var(--home-side-panel-width) minmax(0, 1fr) var(--home-side-panel-width);
                            align-items: stretch;
                        }
                        .home-center-stage {
                            padding: clamp(8px, 1.25vw, 22px);
                        }
                        .home-side-panel,
                        .vault-side-panel {
                            display: block !important;
                            width: 100% !important;
                            min-width: 0 !important;
                        }
                        .hero-canvas-responsive {
                            transform: none !important;
                            width: 100% !important;
                            max-width: var(--home-center-video-max-width) !important;
                            height: auto !important;
                            max-height: var(--home-center-video-max-height) !important;
                            object-fit: contain !important;
                            border-radius: var(--video-radius);
                            box-shadow: 0 18px 55px rgba(0,0,0,0.58);
                        }
                        .hero-title {
                            font-size: clamp(4.75rem, 7.2vw, 8.75rem) !important;
                        }
                        .vault-layout {
                            display: grid !important;
                            grid-template-columns: var(--vault-side-panel-width) minmax(0, 1fr) var(--vault-side-panel-width);
                            align-items: start;
                        }
                        .vault-content {
                            width: 100%;
                            max-width: var(--vault-content-max-width);
                            justify-self: center;
                        }
                    }

                    @media (min-width: 1440px) {
                        .hero-title {
                            font-size: clamp(5.75rem, 6.8vw, 9rem) !important;
                        }
                    }
                `}</style>

                {/* Film grain backdrop visual mesh */}
                <div aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-[998] opacity-[0.04] bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] bg-repeat" />

                {/* Hidden active buffering source element */}
                <video ref={videoRef} src="/Background-video3.mp4" muted autoPlay playsInline preload="auto"
                    aria-hidden="true" className="hidden" />

                {/* ═══════════════════════════════════════
                    HERO SEGMENT
                ═══════════════════════════════════════ */}
                <section id="top" aria-label="Hero — Goated Guitars"
                    className="flex flex-col h-screen w-full overflow-hidden bg-transparent">

                    {/* Top navigation row info data */}
                    <div className="relative z-30 flex items-center justify-center pt-6 px-4 sm:px-8 pb-2">
                        <div className="flex items-center justify-between w-full max-w-7xl">
                            <a
                                href="https://www.facebook.com/profile.php?id=61578260857279"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="text-zinc-400 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 rounded-sm"
                            >
                                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>

                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white text-center" style={T}>
                                1051 SE Ocean Blvd, Unit 1, Stuart, FL 34996
                            </p>

                            <a
                                href="https://www.instagram.com/goatedguitars/?hl=en"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="text-zinc-400 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400 rounded-sm"
                            >
                                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Viewport tracking middle block column setup */}
                    <div className="home-stage flex-1 flex flex-row items-stretch justify-between relative z-10 min-h-0 w-full">

                        {/* Left flank track decoration stream (Strictly mapped to PC/Tablet via md: prefix) */}
                        <SideVideoPanel media={SIDE_VIDEO_MEDIA.homeLeft} fade="right" mode="home" />

                        {/* Central Canvas Container */}
                        <div className="home-center-stage relative flex-1 min-w-0 flex items-center justify-center p-2 bg-transparent z-10 overflow-hidden">
                            <canvas
                                ref={canvasRef}
                                aria-hidden="true"
                                className="block mx-auto text-center hero-canvas-responsive"
                            />
                            {!ready && (
                                <div className="absolute inset-0 bg-transparent flex flex-col items-center justify-center gap-4" aria-live="polite" aria-label="Loading configuration states">
                                    <div aria-hidden="true" className="h-px w-32 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-amber-600 animate-pulse rounded-full" />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">
                                        Warming up amps…
                                    </span>
                                </div>
                            )}

                            {/* Title typographic panel content layer overlay */}
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-4 gap-7 pointer-events-none">
                                <motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-5" >
                                    <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                                        <span aria-hidden="true" className="w-8 h-px bg-amber-500/60 rounded-full" />
                                        Stuart, Florida · Est. 2024
                                        <span aria-hidden="true" className="w-8 h-px bg-amber-500/60 rounded-full" />
                                    </span>
                                    <h1 className="hero-title text-[clamp(3.5rem,10vw,12rem)] font-black uppercase leading-[0.76] tracking-tighter text-white" style={T}>
                                        GOATED <br />
                                        <span className="text-amber-500" style={TA}>GUITARS</span>
                                    </h1>
                                    <Divider amber className="max-w-[200px]" />
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-300 max-w-sm" style={T}>
                                        Built for tone.<br />Forged for Legends
                                    </p>

                                    <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-5 w-full">
                                        <button onClick={() => smoothScrollTo("vault")}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-sm uppercase tracking-[0.3em] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_28px_rgba(217,119,6,0.55)] focus-visible:outline-2 focus-visible:outline-amber-400">
                                            Enter Vault <ChevronDown size={16} aria-hidden="true" />
                                        </button>
                                        <button onClick={() => setShowBooking(true)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-sm uppercase tracking-[0.3em] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_28px_rgba(255,255,255,0.2)] focus-visible:outline-2 focus-visible:outline-amber-400">
                                            Book Session
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Right flank track decoration stream (Strictly mapped to PC/Tablet via md: prefix) */}
                        <SideVideoPanel media={SIDE_VIDEO_MEDIA.homeRight} fade="left" mode="home" />
                    </div>

                    {/* Scroll indicator - Bottom edge */}
                    <div className="relative z-20 flex justify-center items-center pb-6 pt-2 bg-transparent pointer-events-none">
                        <motion.div animate={{ y: reducedMotion ? 0 : [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                            <ChevronDown size={24} className="text-white/40" />
                        </motion.div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            INFINITE RUNNING TICKER TRACK
        ═══════════════════════════════════════ */}
                <section aria-label="Highlights" className="relative z-20 w-full bg-black/60 border-y border-white/5 py-4 overflow-hidden select-none backdrop-blur-sm">
                    <div className="flex w-[200%] ticker-track">
                        <div className="flex justify-around w-1/2 items-center min-w-max gap-8 pr-4">
                            {TICKER_ITEMS.map((text, i) => (
                                <React.Fragment key={`t1-${i}`}>
                                    <span className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-400" style={T}>{text}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" aria-hidden="true" />
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex justify-around w-1/2 items-center min-w-max gap-8 pr-4">
                            {TICKER_ITEMS.map((text, i) => (
                                <React.Fragment key={`t2-${i}`}>
                                    <span className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-400" style={T}>{text}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" aria-hidden="true" />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </section>

                <section aria-label="Shop pathways" className="relative z-20 border-b border-white/5 bg-zinc-950/75 px-4 sm:px-8 py-10 sm:py-14">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
                        {SHOP_FEATURES.map(feature => (
                            <button
                                key={feature.id}
                                type="button"
                                onClick={() => smoothScrollTo(feature.target)}
                                className="shop-feature-card group min-h-[210px] rounded-lg border border-white/10 hover:border-amber-500/45 px-5 py-5 text-left transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-amber-400"
                                aria-label={`${feature.title} - ${feature.eyebrow}`}
                            >
                                <span className="flex items-start justify-between gap-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-400">
                                        <ShopFeatureIcon icon={feature.icon} />
                                    </span>
                                    <ArrowRight size={17} className="mt-1 text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-amber-400" aria-hidden="true" />
                                </span>
                                <span className="mt-7 block text-[10px] font-black uppercase tracking-[0.35em] text-amber-400" style={TA}>
                                    {feature.eyebrow}
                                </span>
                                <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white" style={T}>
                                    {feature.title}
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-zinc-400" style={T}>
                                    {feature.body}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Navigation ───────────────────────────────────────── */}
                <nav aria-label="Primary navigation"
                    className="sticky top-0 z-[100] border-b border-white/5 bg-black/60 backdrop-blur-md">
                    <div className="flex items-center justify-between max-w-6xl mx-auto px-4 sm:px-10 py-3 sm:py-4">
                        <button onClick={() => smoothScrollTo("top")} aria-label="Back to top"
                            className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-amber-400 rounded">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600/15 border border-amber-600/30 flex items-center justify-center">
                                <span className="text-amber-400 font-black text-sm sm:text-base leading-none" style={TA}>G</span>
                            </div>
                            <span className="hidden sm:block text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.35em]" style={T}>
                                Goated <span className="text-amber-500">Guitars</span>
                            </span>
                        </button>

                        <ul className="flex items-center gap-4 sm:gap-10 list-none" role="list">
                            {[
                                ["Home", "top"],
                                ["Vault", "vault"],
                                ["Visit", "experience"],
                            ].map(([label, id]) => (
                                <li key={id}>
                                    <button onClick={() => smoothScrollTo(id)}
                                        className="relative text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-zinc-400 hover:text-white transition-colors group py-1.5 focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
                                        style={T}>
                                        {label}
                                        <span aria-hidden="true"
                                            className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 transition-all duration-300 group-hover:w-full rounded-full" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => setShowBooking(true)}
                            className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-[9px] sm:text-xs uppercase tracking-[0.3em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400"
                        >
                            Book <span className="hidden sm:inline">a Session</span>
                        </button>
                    </div>
                </nav>

                {/* ═══════════════════════════════════════
            THE CURATED VAULT LIST SECTION
        ═══════════════════════════════════════ */}
                <section id="vault" aria-labelledby="vault-heading" className="vault-layout relative flex flex-row items-stretch bg-transparent w-full">

                    {/* Left Panel Vault - Desktop Only */}
                    <SideVideoPanel media={SIDE_VIDEO_MEDIA.vaultLeft} fade="right" mode="vault" />

                    <div className="vault-content flex-1 flex flex-col gap-24 sm:gap-32 py-24 px-4 sm:px-8 bg-transparent z-10 max-w-[1100px]">
                        <header className="flex flex-col items-center text-center gap-4 mb-10">
                            <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400" style={TA}>
                                Curated Masterpieces
                            </span>
                            <h2 id="vault-heading" className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white" style={T}>
                                The Instrument Vault
                            </h2>
                            <Divider amber className="max-w-[240px]" />

                            <nav aria-label="Filter Instruments" className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                {categories.map(cat => {
                                    const active = activeCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            aria-current={active ? "page" : undefined}
                                            className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.25em] transition-all focus-visible:outline-2 focus-visible:outline-amber-400 ${active
                                                ? "bg-amber-600 text-black shadow-[0_0_20px_rgba(217,119,6,0.35)]"
                                                : "bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </nav>
                        </header>

                        <AnimatePresence mode="popLayout">
                            {visibleItems.map((item, idx) => (
                                <VaultCard
                                    key={item.id}
                                    item={item}
                                    idx={idx}
                                    onView={(src, name) => setLightbox({ src, name })}
                                    onBook={() => setShowBooking(true)}
                                />
                            ))}
                        </AnimatePresence>

                        {visibleItems.length === 0 && (
                            <p className="text-zinc-500 text-center uppercase tracking-widest text-xs py-12" style={T}>
                                No instruments found in this category.
                            </p>
                        )}
                    </div>

                    {/* Right Panel Vault - Desktop Only */}
                    <SideVideoPanel media={SIDE_VIDEO_MEDIA.vaultRight} fade="left" mode="vault" />
                </section>

                {/* ═══════════════════════════════════════
            THE BRAND SHOWROOM EXPERIENCE
        ═══════════════════════════════════════ */}
                <section id="experience" aria-labelledby="exp-heading" className="bg-black/80 border-y border-white/5 py-28 px-4 sm:px-8 backdrop-blur-md">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400" style={TA}>
                                By Appointment Only
                            </span>
                            <h2 id="exp-heading" className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white leading-none" style={T}>
                                A Private Sanctuary <br /> For Serious Players
                            </h2>
                            <Divider className="lg:justify-start" />
                            <p className="text-zinc-400 text-base leading-relaxed" style={T}>
                                We do not operate like a crowded commercial storefront. Goated Guitars is a private, sound-isolated showroom tailored for professional artists, seasoned performers, and passionate collectors on the Treasure Coast.
                            </p>
                            <p className="text-zinc-400 text-base leading-relaxed" style={T}>
                                When you book an exploration window, the entire vault is locked downstream to anyone else. You get dedicated time with our engineering specialists, custom tube amplifications tuned to your preferences, and total sonic freedom.
                            </p>
                            <div className="pt-4 flex justify-center lg:justify-start">
                                <button onClick={() => setShowBooking(true)}
                                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-[0.3em] transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-amber-400">
                                    Request Private Access <ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-md grid grid-cols-2 gap-4">
                            <div style={panel} className="flex flex-col items-center justify-center p-8 text-center gap-3 bg-black/40">
                                <MapPin size={24} className="text-amber-500" aria-hidden="true" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-white mt-1" style={T}>Stuart, FL</h3>
                                <p className="text-[11px] text-zinc-500 uppercase tracking-wider leading-relaxed" style={T}>
                                    1051 SE Ocean Blvd <br /> Unit 1
                                </p>
                            </div>
                            <div style={panel} className="flex flex-col items-center justify-center p-8 text-center gap-3 bg-black/40">
                                <Clock size={24} className="text-amber-500" aria-hidden="true" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-white mt-1" style={T}>Exclusive</h3>
                                <p className="text-[11px] text-zinc-500 uppercase tracking-wider leading-relaxed" style={T}>
                                    Custom Booking <br /> 24/7 Availability
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            TESTIMONIAL ACCOUNT MODULES
        ═══════════════════════════════════════ */}
                <section id="testimonials" aria-labelledby="reviews-heading" className="py-24 px-4 sm:px-8 max-w-6xl mx-auto bg-transparent">
                    <header className="flex flex-col items-center text-center gap-4 mb-20">
                        <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400" style={TA}>
                            Verified Accounts
                        </span>
                        <h2 id="reviews-heading" className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white" style={T}>
                            From the Community
                        </h2>
                        <Divider amber className="max-w-[200px]" />
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                        {TESTIMONIALS.map(t => (
                            <blockquote key={t.id} style={panel} className="flex flex-col gap-6 bg-zinc-900/20">
                                <div className="flex-1">
                                    <p className="text-sm leading-relaxed text-zinc-300 italic" style={T}>
                                        “{t.text}”
                                    </p>
                                </div>
                                <footer className="space-y-1.5 border-t border-white/5 pt-4">
                                    <cite className="block text-xs font-black uppercase tracking-widest text-white not-italic" style={T}>
                                        {t.name}
                                    </cite>
                                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-medium" style={T}>
                                        <span>{t.location}</span>
                                        <span className="text-amber-500/60 font-bold" style={TA}>{t.instrument}</span>
                                    </div>
                                </footer>
                            </blockquote>
                        ))}
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            FOOTER / REGISTRY SECTION
        ═══════════════════════════════════════ */}
                <footer id="lab" className="border-t border-white/5 pt-20 pb-10 px-4 sm:px-8 text-center space-y-16 bg-black/60 backdrop-blur-sm">
                    <div className="max-w-xl mx-auto space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white" style={T}>
                            Join the Registry
                        </h2>
                        <p className="text-xs text-zinc-400 uppercase tracking-widest leading-relaxed max-w-sm mx-auto" style={T}>
                            Get notified when historic instruments hit our private vault catalog. No spam.
                        </p>

                        {subscribed ? (
                            <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-950/20 border border-amber-900/30 py-3 rounded-full" style={TA}>
                                ✓ You have been added to our private register.
                            </motion.p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3 w-full" noValidate>
                                <label htmlFor="ft-email" className="sr-only">Email Address</label>
                                <input
                                    id="ft-email" type="email" required placeholder="ENTER YOUR EMAIL ADDRESS" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full sm:flex-1 px-6 py-4 rounded-full bg-black border border-white/10 text-white placeholder-zinc-600 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-amber-500 transition-colors text-center sm:text-left"
                                    style={T}
                                />
                                <button type="submit"
                                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 border border-white/10 hover:bg-white hover:text-black font-black text-xs uppercase tracking-[0.3em] transition-all focus-visible:outline-2 focus-visible:outline-white">
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>

                    <Divider className="max-w-xs mx-auto opacity-40" />

                    <motion.div initial={false} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6">
                        <nav aria-label="Social Links" className="flex items-center gap-4">
                            <a href="https://www.facebook.com/profile.php?id=61578260857279" target="_blank" rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all focus-visible:outline-2 focus-visible:outline-amber-400">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/goatedguitars/?hl=en" target="_blank" rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all focus-visible:outline-2 focus-visible:outline-amber-400">
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <button aria-label="Camera"
                                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all focus-visible:outline-2 focus-visible:outline-amber-400">
                                <Camera size={17} strokeWidth={1.5} aria-hidden="true" />
                            </button>
                            <button aria-label="Share this page"
                                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all focus-visible:outline-2 focus-visible:outline-amber-400">
                                <Share2 size={17} strokeWidth={1.5} aria-hidden="true" />
                            </button>
                        </nav>
                    </motion.div>

                    <p className="relative z-10 text-xs text-zinc-600 uppercase tracking-widest" style={T}>
                        © {new Date().getFullYear()} Goated Guitars · Stuart, Florida · All Rights Reserved
                    </p>
                </footer>

                {/* Dynamic global portal views */}
                {lightbox && (
                    <Lightbox src={lightbox.src} name={lightbox.name} onClose={() => setLightbox(null)} />
                )}
                {showBooking && (
                    <BookingModal onClose={() => setShowBooking(false)} />
                )}
            </main>
        </>
    );
}
