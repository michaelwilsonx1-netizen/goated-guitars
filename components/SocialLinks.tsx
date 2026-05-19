"use client";

import React from "react";
import { Camera, Share2 } from "lucide-react";

interface SocialLinksProps {
  variant?: "header" | "footer";
}

export function SocialLinks({ variant = "footer" }: SocialLinksProps) {
  if (variant === "header") {
    return (
      <nav aria-label="Social Links" className="flex items-center gap-3">
        <a
          href="https://www.facebook.com/profile.php?id=61578260857279"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 text-zinc-400 hover:text-[#1877F2] transition-all focus-visible:outline-2 focus-visible:outline-[#1877F2]"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
          </svg>
        </a>
        <a
          href="https://www.instagram.com/goatedguitars/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10 text-zinc-400 hover:text-[#E1306C] transition-all focus-visible:outline-2 focus-visible:outline-[#E1306C]"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      </nav>
    );
  }

  return (
    <nav aria-label="Social Links" className="flex items-center gap-4">
      <a
        href="https://www.facebook.com/profile.php?id=61578260857279"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 text-zinc-400 hover:text-[#1877F2] transition-all focus-visible:outline-2 focus-visible:outline-[#1877F2]"
      >
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
        </svg>
      </a>
      <a
        href="https://www.instagram.com/goatedguitars/?hl=en"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10 text-zinc-400 hover:text-[#E1306C] transition-all focus-visible:outline-2 focus-visible:outline-[#E1306C]"
      >
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </a>
      <button
        aria-label="Camera"
        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all focus-visible:outline-2 focus-visible:outline-amber-400"
      >
        <Camera size="17" strokeWidth="1.5" />
      </button>
      <button
        aria-label="Share this page"
        className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 hover:border-amber-500/50 hover:bg-amber-600/10 text-zinc-400 hover:text-amber-400 transition-all focus-visible:outline-2 focus-visible:outline-amber-400"
      >
        <Share2 size="17" strokeWidth="1.5" />
      </button>
    </nav>
  );
}
