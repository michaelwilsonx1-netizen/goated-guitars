"use client";

import React, {
    useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
    ChevronDown, X, ArrowRight, ArrowLeft,
    MapPin, Clock, Camera, Share2,
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

interface VideoFrameCallbackMetadata { mediaTime: number; }
type VideoFrameRequestCallback = (now: number, metadata: VideoFrameCallbackMetadata) => void;

interface RVFCVideo extends HTMLVideoElement {
    requestVideoFrameCallback(cb: VideoFrameRequestCallback): number;
    cancelVideoFrameCallback(handle: number): void;
}

// ─── Constants ───────────────────────────────────────────────────────

const MAX_FRAMES = 240;

const VAULT_ITEMS: VaultItem[] = [
    {
        id: "g1", name: "The GT1 Heritage", category: "Electric",
        price: "$4,200", image: "/gt1.jpg",
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

// ─── Utilities ───────────────────────────────────────────────────────

const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(", ");

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
    border: "1px solid rgba(217,119,6,0.32)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.7), 0 12px 40px rgba(0,0,0,0.85), 0 0 30px rgba(217,119,6,0.10)",
};

const T: React.CSSProperties = {
    WebkitTextStroke: "0.55px rgba(255,255,255,0.5)",
    textShadow: "-1px -1px 0 rgba(255,255,255,0.07), 2px 2px 5px rgba(0,0,0,0.97), 0 0 14px rgba(0,0,0,0.7)",
};

const TA: React.CSSProperties = {
    WebkitTextStroke: "0.55px rgba(255,255,255,0.45)",
    textShadow: "-1px -1px 0 rgba(255,255,255,0.07), 2px 2px 5px rgba(0,0,0,0.97), 0 0 18px rgba(217,119,6,0.4)",
};

// ─── Sub-components ──────────────────────────────────────────────────

const Divider = ({ amber = false }: { amber?: boolean }) => (
    <div className="flex items-center gap-3 w-full justify-center" aria-hidden="true">
        <div className={`h-px flex-1 max-w-[60px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
        <div className={`w-1.5 h-1.5 rounded-full ${amber ? "bg-amber-500/60" : "bg-white/20"}`} />
        <div className={`h-px flex-1 max-w-[60px] rounded-full ${amber ? "bg-amber-500/40" : "bg-white/10"}`} />
    </div>
);

// ─── Lightbox ────────────────────────────────────────────────────────

interface LightboxProps {
    items: VaultItem[];
    index: number;
    onClose: () => void;
    onNav: (dir: 1 | -1) => void;
}

function Lightbox({ items, index, onClose, onNav }: LightboxProps) {
    const [mounted, setMounted] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const triggerRef = useRef<Element | null>(null);
    const item = items[index];

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!mounted) return;
        triggerRef.current = document.activeElement;
        requestAnimationFrame(() => closeRef.current?.focus());
        return () => {
            (triggerRef.current as HTMLElement | null)?.focus();
        };
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") { onClose(); return; }
            if (e.key === "ArrowLeft") { onNav(-1); return; }
            if (e.key === "ArrowRight") { onNav(1); return; }

            if (e.key === "Tab" && dialogRef.current) {
                const focusable = Array.from(
                    dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
                ).filter(el => !el.closest("[aria-hidden='true']"));
                if (!focusable.length) { e.preventDefault(); return; }
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [mounted, onClose, onNav]);

    if (!mounted || !item) return null;

    return createPortal(
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Enlarged view of ${item.name}. Press Escape to close, arrow keys to navigate.`}
            style={{
                position: "fixed", inset: 0, zIndex: 99999,
                background: "rgba(0,0,0,0.95)", backdropFilter: "blur(14px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "24px",
            }}
        >
            <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close image preview"
                style={{
                    position: "absolute", top: 24, right: 24,
                    background: "rgba(20,20,20,0.9)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "50%", width: 44, height: 44,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.75)", cursor: "pointer", zIndex: 2,
                }}
            >
                <X size={20} />
            </button>

            {index > 0 && (
                <button
                    onClick={() => onNav(-1)}
                    aria-label="Previous instrument"
                    style={{
                        position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                        background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "50%", width: 44, height: 44,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "rgba(255,255,255,0.75)", cursor: "pointer", zIndex: 2,
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
            )}

            {index < items.length - 1 && (
                <button
                    onClick={() => onNav(1)}
                    aria-label="Next instrument"
                    style={{
                        position: "absolute", right: 72, top: "50%", transform: "translateY(-50%)",
                        background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "50%", width: 44, height: 44,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "rgba(255,255,255,0.75)", cursor: "pointer", zIndex: 2,
                    }}
                >
                    <ArrowRight size={20} />
                </button>
            )}

            <div
                onClick={onClose}
                style={{
                    position: "relative", width: "100%", height: "100%",
                    maxWidth: "85vw", maxHeight: "85vh", cursor: "zoom-out",
                }}
            >
                <Image
                    src={item.image}
                    alt={`${item.name} — ${item.description}`}
                    fill sizes="85vw"
                    className="object-contain"
                    style={{
                        pointerEvents: "none",
                        filter: "drop-shadow(0 0 60px rgba(0,0,0,0.8))"
                    }}
                />
            </div>

            <div style={{
                position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "10px 24px", textAlign: "center",
                backdropFilter: "blur(10px)", pointerEvents: "none",
            }}>
                <p className="text-white text-sm font-bold uppercase tracking-widest" style={T}>
                    {item.name}
                </p>
                <p className="text-amber-400 text-xs tracking-widest mt-0.5" style={TA}>
                    {item.price}
                </p>
                <p className="text-zinc-500 text-[10px] mt-1 tracking-widest">
                    {index + 1} / {items.length} · ← → to navigate · Esc to close
                </p>
            </div>
        </div>,
        document.body
    );
}

// ─── Frame-buffer engine ─────────────────────────────────────────────

function useFrameBuffer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const frames = useRef<ImageBitmap[]>([]);
    const idx = useRef(0);
    const dir = useRef(1);
    const rafId = useRef(0);
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
            const elapsed = ts - last;
            if (elapsed >= FPS) {
                let i = idx.current + dir.current;
                if (i >= f.length - 1) { dir.current = -1; i = f.length - 1; }
                else if (i <= 0) { dir.current = 1; i = 0; }
                idx.current = i;
                try { ctx.drawImage(f[i], 0, 0); }
                catch { looping.current = false; return; }
                last = ts - (elapsed % FPS);
            }
            rafId.current = requestAnimationFrame(step);
        };
        rafId.current = requestAnimationFrame(step);
    }, []);

    const captureFrames = useCallback(async () => {
        const video = videoRef.current;
        if (!video) return;

        const hasRVFC = "requestVideoFrameCallback" in video;
        const rvfc = hasRVFC ? (video as unknown as RVFCVideo) : null;
        let timer = 0;

        const grab = async () => {
            if (aborted.current || frames.current.length >= MAX_FRAMES) return;
            if (video.ended || video.paused) return;
            try { frames.current.push(await createImageBitmap(video)); }
            catch { /* frame dropped */ }
        };

        const onEnded = () => {
            video.pause();
            video.removeEventListener("ended", onEnded);
            rvfc ? rvfc.cancelVideoFrameCallback(timer)
                : clearInterval(timer);
            if (!aborted.current) {
                setReady(true);
                startLoop();
            }
        };

        const startCapture = () => {
            if (rvfc) {
                const cb: VideoFrameRequestCallback = async () => {
                    await grab();
                    if (!aborted.current && frames.current.length < MAX_FRAMES) {
                        timer = rvfc.requestVideoFrameCallback(cb);
                    }
                };
                timer = rvfc.requestVideoFrameCallback(cb);
            } else {
                timer = window.setInterval(grab, 1000 / 30);
            }
            video.addEventListener("ended", onEnded);
            video.play().catch(() => { });
        };

        if (video.readyState >= 2) startCapture();
        else video.addEventListener("loadeddata", startCapture, { once: true });
    }, [startLoop]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        aborted.current = false;

        if (video.readyState >= 3) captureFrames();
        else video.addEventListener("canplay", captureFrames, { once: true });

        return () => {
            aborted.current = true;
            looping.current = false;
            cancelAnimationFrame(rafId.current);
            frames.current.forEach(b => b.close());
            frames.current = [];
        };
    }, [captureFrames]);

    return { canvasRef, videoRef, ready };
}

// ─── Page ────────────────────────────────────────────────────────────

export default function HomePage() {
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const { canvasRef, videoRef, ready } = useFrameBuffer();
    const reducedMotion = useReducedMotion();

    const handleLightboxNav = useCallback((dir: 1 | -1) => {
        setLightboxIdx(prev => {
            if (prev === null) return null;
            const next = prev + dir;
            return next >= 0 && next < VAULT_ITEMS.length ? next : prev;
        });
    }, []);

    const closeLightbox = useCallback(() => setLightboxIdx(null), []);

    const fadeUp = useMemo(() => ({
        hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: reducedMotion ? 0.01 : 0.75, ease: [0.16, 1, 0.3, 1] }
        },
    }), [reducedMotion]);

    return (
        <>
            <a
                href="#vault"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-black focus:font-black focus:text-sm focus:rounded focus:uppercase focus:tracking-widest"
            >
                Skip to Vault
            </a>

            <main
                className="relative min-h-screen bg-black text-white antialiased selection:bg-amber-500 selection:text-black"
                id="main-content"
            >
                <style>{`body,html{background:#000;margin:0;padding:0}`}</style>

                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-[998] opacity-[0.035] bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')] bg-repeat"
                />

                <video
                    ref={videoRef}
                    src="/background-video3.mp4"
                    muted playsInline preload="auto"
                    aria-hidden="true"
                    className="hidden"
                />

                {/* ═══════════════════════════════════════
            HERO
        ═══════════════════════════════════════ */}
                <section
                    id="top"
                    aria-label="Hero — Goated Guitars"
                    className="flex flex-col h-screen w-full bg-black overflow-hidden"
                >
                    {/* ---- TOP ROW: "GOATED GUITARS" ---- */}
                    <div className="relative z-20 flex justify-center items-center pt-0 pb-0">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col items-center gap-1"
                        >
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                                Stuart, Florida · Est. 2024
                            </span>

                            <h1
                                className="text-[clamp(3.5rem,11vw,13rem)] font-black uppercase leading-[0.75] tracking-tighter text-white"
                                style={T}
                            >
                                GOATED
                                <br />
                                <span className="text-amber-500" style={TA}>GUITARS</span>
                            </h1>
                        </motion.div>
                    </div>

                    {/* ---- MIDDLE ROW: side videos + centre canvas ---- */}
                    <div className="flex-[0.65] flex items-stretch relative z-10 min-h-0 pt-0">
                        {/* Left side video */}
                        <div className="w-[20vw] flex-shrink-0 relative" aria-hidden="true">
                            <video
                                src="/guitar-side-1.mp4"
                                autoPlay loop muted playsInline
                                poster="/gt1.jpg"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 55%, rgba(0,0,0,0.9) 100%)" }} />
                        </div>

                        {/* Centre canvas */}
                        <div className="relative flex-1 min-w-0 bg-black flex items-start justify-center">
                            <canvas
                                ref={canvasRef}
                                aria-hidden="true"
                                className="bg-black"
                                style={{ transform: "scale(0.8625)", transformOrigin: "center top", maxWidth: "100%", maxHeight: "100%" }}
                            />
                            {!ready && (
                                <div
                                    className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4"
                                    aria-live="polite"
                                    aria-label="Video loading"
                                >
                                    <div className="h-px w-32 bg-zinc-800 overflow-hidden rounded-full" aria-hidden="true">
                                        <div className="h-full w-1/3 bg-amber-600 animate-pulse rounded-full" />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">
                                        Warming up amps...
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right side video */}
                        <div className="w-[20vw] flex-shrink-0 relative" aria-hidden="true">
                            <video
                                src="/guitar-side-2.mp4"
                                autoPlay loop muted playsInline
                                poster="/gt4.jpg"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(to left, transparent 55%, rgba(0,0,0,0.9) 100%)" }} />
                        </div>
                    </div>

                    {/* ---- BOTTOM ROW: tagline + CTA buttons + NAVIGATION ---- */}
                    <div className="relative z-20 flex justify-center items-center pb-4 pt-2">
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col items-center gap-5 text-center px-4"
                        >
                            <Divider amber />

                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-300 max-w-sm" style={T}>
                                Treasure Coast's Premier Boutique Guitar Experience
                            </p>

                            <div className="flex items-center gap-4 flex-wrap justify-center">
                                <button
                                    onClick={() => scrollTo("vault")}
                                    className="flex items-center gap-2 px-7 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-[0.3em] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_rgba(217,119,6,0.5)] focus-visible:outline-2 focus-visible:outline-amber-400"
                                >
                                    View The Vault <ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => scrollTo("lab")}
                                    className="flex items-center gap-2 px-7 py-3 rounded-full border border-white/20 hover:border-amber-500/60 text-white font-black text-xs uppercase tracking-[0.3em] transition-all duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-amber-400"
                                    style={T}
                                >
                                    Book a Session
                                </button>
                            </div>

                            {/* Home · Vault · Lab integrated nav */}
                            <nav aria-label="Primary navigation" className="flex gap-10 mt-1">
                                {([["Home", "top"], ["Vault", "vault"], ["Lab", "lab"]] as const).map(([label, id]) => (
                                    <button
                                        key={id}
                                        onClick={() => scrollTo(id)}
                                        className="relative text-[11px] font-black uppercase tracking-[0.5em] text-zinc-400 hover:text-white transition-colors duration-200 group py-1 focus-visible:outline-2 focus-visible:outline-amber-400 rounded"
                                        style={T}
                                    >
                                        {label}
                                        <span
                                            aria-hidden="true"
                                            className="absolute bottom-0 left-0 w-0 h-px bg-amber-500 transition-all duration-300 group-hover:w-full rounded-full"
                                        />
                                    </button>
                                ))}
                            </nav>

                            {!reducedMotion && (
                                <ChevronDown
                                    className="animate-bounce text-amber-600/60"
                                    size={24}
                                    aria-hidden="true"
                                />
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            VAULT
        ═══════════════════════════════════════ */}
                <section id="vault" aria-labelledby="vault-heading" className="relative flex items-stretch bg-black">
                    <div className="w-[20vw] flex-shrink-0 bg-black overflow-hidden" aria-hidden="true"
                        style={{ position: "sticky", top: 0, height: "100vh", alignSelf: "flex-start" }}>
                        <video src="/ACO GT1.mp4" autoPlay loop muted playsInline poster="/gt1.jpg"
                            className="h-full w-full object-cover opacity-80" />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.85) 100%)" }} />
                    </div>

                    <div
                        className="flex-1 min-w-0 flex flex-col items-center px-8 py-24 md:py-36"
                        style={{
                            background: "rgba(0,0,0,0.75)", backgroundImage: "url('/logo.jpg')",
                            backgroundRepeat: "repeat", backgroundSize: "180px", backgroundBlendMode: "overlay"
                        }}
                    >
                        <header className="mb-20 w-full flex justify-center">
                            <motion.div
                                variants={fadeUp} initial="hidden"
                                whileInView="visible" viewport={{ once: true }}
                                style={panelAmber}
                                className="flex flex-col items-center gap-4 text-center max-w-xl"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                                    Hand-Selected Instruments
                                </span>
                                <h2
                                    id="vault-heading"
                                    className="text-[clamp(3rem,6vw,7rem)] font-black uppercase italic leading-none tracking-tighter text-white"
                                    style={T}
                                >
                                    The Vault
                                </h2>
                                <Divider amber />
                                <p className="text-sm text-zinc-300 font-medium leading-relaxed max-w-sm" style={T}>
                                    Every instrument is personally inspected and chosen for tone, playability, and character. We carry only what we'd play ourselves.
                                </p>
                            </motion.div>
                        </header>

                        <ol className="w-full max-w-5xl flex flex-col gap-24 md:gap-32 list-none m-0 p-0" aria-label="Instruments for sale">
                            {VAULT_ITEMS.map((item, i) => (
                                <motion.li
                                    key={item.id}
                                    variants={fadeUp} initial="hidden"
                                    whileInView="visible" viewport={{ once: true }}
                                >
                                    <article
                                        aria-label={`${item.name} — ${item.category} — ${item.price}`}
                                        className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 md:gap-14`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setLightboxIdx(i)}
                                            aria-label={`View enlarged photo of ${item.name}`}
                                            aria-haspopup="dialog"
                                            className="relative w-full max-w-[380px] flex-shrink-0 aspect-[4/5] cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl group/img transition-all duration-500 hover:-translate-y-2 hover:border-amber-600/40 hover:shadow-[0_24px_60px_rgba(217,119,6,0.15)] focus-visible:outline-2 focus-visible:outline-amber-400"
                                        >
                                            <Image
                                                src={item.image}
                                                alt={`${item.name} — ${item.description}`}
                                                fill
                                                sizes="(max-width: 768px) 90vw, (max-width: 1280px) 38vw, 380px"
                                                priority={i === 0}
                                                loading={i === 0 ? "eager" : "lazy"}
                                                className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                                                style={{ pointerEvents: "none" }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                            <div
                                                aria-hidden="true"
                                                className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none"
                                            >
                                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/80 bg-black/50 px-3 py-1.5 rounded-full">
                                                    Click to Enlarge
                                                </span>
                                            </div>
                                        </button>

                                        <div style={panel} className="flex-1 flex flex-col items-center md:items-start gap-5 text-center md:text-left">
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 border-b border-amber-400/25 pb-1.5" style={TA}>
                                                {item.category}
                                            </span>
                                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic leading-[0.88] tracking-tighter text-white" style={T}>
                                                {item.name}
                                            </h3>
                                            <Divider />
                                            <p className="text-sm leading-relaxed text-zinc-300 italic" style={T}>
                                                {item.description}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-medium" style={T}>
                                                {item.specs}
                                            </p>
                                            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start mt-1">
                                                <span className="text-2xl font-black text-amber-400" style={TA}>
                                                    {item.price}
                                                </span>
                                                <button
                                                    onClick={() => scrollTo("lab")}
                                                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-600/15 border border-amber-600/30 hover:bg-amber-600 hover:border-amber-600 text-amber-400 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400"
                                                    aria-label={`Inquire about ${item.name}`}
                                                >
                                                    Inquire <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                </motion.li>
                            ))}
                        </ol>
                    </div>

                    <div className="w-[20vw] flex-shrink-0 bg-black overflow-hidden" aria-hidden="true"
                        style={{ position: "sticky", top: 0, height: "100vh", alignSelf: "flex-start" }}>
                        <video src="/ACO GT1.mp4" autoPlay loop muted playsInline poster="/gt4.jpg"
                            className="h-full w-full object-cover opacity-80" />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to left, transparent 50%, rgba(0,0,0,0.85) 100%)" }} />
                    </div>
                </section>

                {/* ═══════════════════════════════════════
            LAB / FOOTER (sizes increased for readability)
        ═══════════════════════════════════════ */}
                <footer
                    id="lab"
                    aria-labelledby="lab-heading"
                    className="relative flex flex-col items-center px-6 py-28 text-center bg-black border-t border-white/5 overflow-hidden"
                >
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(217,119,6,0.06) 0%, transparent 70%)" }}
                    />

                    <motion.div
                        variants={fadeUp} initial="hidden"
                        whileInView="visible" viewport={{ once: true }}
                        style={panelAmber}
                        className="relative z-10 flex flex-col items-center gap-7 w-full max-w-xl"
                    >
                        <span className="text-sm font-black uppercase tracking-[0.5em] text-amber-400" style={TA}>
                            Private Showroom · Stuart, Florida
                        </span>

                        <h2 id="lab-heading"
                            className="text-[clamp(3.08rem,8vw,6.6rem)] font-black uppercase italic leading-[0.82] tracking-tighter text-white"
                            style={T}
                        >
                            Visit<br />
                            <span className="text-amber-500" style={TA}>The Lab.</span>
                        </h2>

                        <Divider amber />

                        <p className="text-lg text-zinc-300 leading-relaxed max-w-sm" style={T}>
                            Step into our private showroom and experience these instruments firsthand. Every visit is by appointment — because you deserve undivided attention.
                        </p>

                        <a
                            href="mailto:info@goatedguitars.com"
                            className="flex items-center gap-2 px-8 py-4 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-black text-lg uppercase tracking-[0.3em] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(217,119,6,0.5)] focus-visible:outline-2 focus-visible:outline-amber-400"
                        >
                            Book a Private Session <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
                        </a>

                        <address className="not-italic flex flex-col sm:flex-row gap-5 text-base text-zinc-400 font-medium w-full justify-center" style={T}>
                            <span className="flex items-center gap-1.5 justify-center">
                                <MapPin size={12} strokeWidth={2} className="text-amber-500/60" aria-hidden="true" />
                                1051 SE Ocean Blvd, Unit 1, Stuart, FL 34996
                            </span>
                            <span className="hidden sm:block text-white/10" aria-hidden="true">|</span>
                            <span className="flex items-center gap-1.5 justify-center">
                                <Clock size={12} strokeWidth={2} className="text-amber-500/60" aria-hidden="true" />
                                By Appointment
                            </span>
                        </address>

                        <nav aria-label="Social media links" className="flex gap-4 pt-1">
                            <a href="https://www.facebook.com/profile.php?id=61578260857279"
                                target="_blank" rel="noopener noreferrer"
                                aria-label="Goated Guitars on Facebook (opens in new tab)"
                                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400"
                            >
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/goatedguitars/?hl=en"
                                target="_blank" rel="noopener noreferrer"
                                aria-label="Goated Guitars on Instagram (opens in new tab)"
                                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400"
                            >
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <button aria-label="Open camera / share photo" className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400">
                                <Camera size={18} strokeWidth={1.5} aria-hidden="true" />
                            </button>
                            <button aria-label="Share this page" className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-400">
                                <Share2 size={18} strokeWidth={1.5} aria-hidden="true" />
                            </button>
                        </nav>

                        <p className="text-sm text-zinc-600 tracking-widest pt-1" style={T}>
                            © {new Date().getFullYear()} Goated Guitars · Stuart, Florida
                        </p>
                    </motion.div>
                </footer>

                {/* Lightbox */}
                {lightboxIdx !== null && (
                    <Lightbox
                        items={VAULT_ITEMS}
                        index={lightboxIdx}
                        onClose={closeLightbox}
                        onNav={handleLightboxNav}
                    />
                )}
            </main>
        </>
    );
}