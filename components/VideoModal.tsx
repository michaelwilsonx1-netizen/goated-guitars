"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface VideoModalProps {
  isOpen: boolean;
  videoUrl: string;
  videoType: "youtube" | "vimeo" | "html5";
  title: string;
  onClose: () => void;
}

export function VideoModal({ isOpen, videoUrl, videoType, title, onClose }: VideoModalProps) {
  const mounted = typeof document !== "undefined";
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!mounted || !isOpen) return;
    triggerRef.current = document.activeElement;
    requestAnimationFrame(() => closeRef.current?.focus());
    return () => (triggerRef.current as HTMLElement | null)?.focus();
  }, [mounted, isOpen]);

  useEffect(() => {
    if (!mounted || !isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mounted, isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const renderVideo = () => {
    switch (videoType) {
      case "youtube":
        return (
          <iframe
            src={videoUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        );
      case "vimeo":
        return (
          <iframe
            src={videoUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        );
      case "html5":
        return (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full rounded-lg bg-black"
          />
        );
      default:
        return null;
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl aspect-video"
        role="dialog"
        aria-modal="true"
        aria-label={`Video: ${title}`}
      >
        {renderVideo()}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-12 right-0 p-2 text-white hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          <X size={28} />
        </button>
      </motion.div>
    </motion.div>,
    document.body
  );
}
