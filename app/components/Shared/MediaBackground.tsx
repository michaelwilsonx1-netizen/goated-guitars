'use client';
import React from 'react';

// We use the full-bleed, responsive classes here to ensure scaling on 2560px.
const sideWidthClass = "max-w-[20vw] sm:max-w-xs lg:max-w-sm"; 

export default function MediaBackground({ leftSrc: leftSrcProp, rightSrc: rightSrcProp }: { leftSrc: string; rightSrc: string; }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none"> {/* <-- CRITICAL FIX: Set Z-index to 0 */}
      {/* Left side video */}
      <div className={`absolute left-0 top-0 h-full ${sideWidthClass} z-0`}>
        <video
          src={leftSrcProp}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.8 }}
        />
        {/* Gradient mask remains crucial for aesthetic fade */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, transparent 94%, black 100%)" }}
        />
      </div >

      {/* Right side video */}
      <div className={`absolute right-0 top-0 h-full ${sideWidthClass} z-0`}>
        <video
          src={rightSrcProp}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.8 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to left, transparent 94%, black 100%)" }}
        />
      </div >
    </div>
  );
}
