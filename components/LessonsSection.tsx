"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, TrendingUp } from "lucide-react";
import { VideoModal } from "./VideoModal";

interface Lesson {
  id: string;
  title: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  price: string;
  image: string;
  description: string;
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "html5";
}

const FEATURED_VIDEO = {
  url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  type: "youtube" as const,
  title: "Lesson Highlights",
};

const LESSONS: Lesson[] = [
  {
    id: "l1",
    title: "Guitar Basics 101",
    instructor: "Marcus D.",
    level: "Beginner",
    duration: "6 weeks",
    price: "$129",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop",
    description: "Learn the fundamentals: chord shapes, finger positions, basic strumming patterns, and first songs.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
  {
    id: "l2",
    title: "Electric Lead Techniques",
    instructor: "Elena R.",
    level: "Intermediate",
    duration: "8 weeks",
    price: "$199",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=500&fit=crop",
    description: "Master bending, vibrato, slides, and soloing techniques. Build speed and control.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
  {
    id: "l3",
    title: "Blues Fundamentals",
    instructor: "Jason W.",
    level: "Intermediate",
    duration: "6 weeks",
    price: "$179",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=500&fit=crop",
    description: "Understand the 12-bar blues, pentatonic scales, and classic blues phrasing.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
  {
    id: "l4",
    title: "Fingerstyle Mastery",
    instructor: "Sarah M.",
    level: "Advanced",
    duration: "10 weeks",
    price: "$279",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=500&fit=crop",
    description: "Advanced fingerpicking patterns, Travis picking, and classical techniques.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
  {
    id: "l5",
    title: "Music Theory for Guitarists",
    instructor: "David L.",
    level: "Intermediate",
    duration: "12 weeks",
    price: "$229",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=500&fit=crop",
    description: "Scales, modes, chord theory, and composition. Build a strong musical foundation.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
  {
    id: "l6",
    title: "Performance & Gigging Prep",
    instructor: "Alex T.",
    level: "Advanced",
    duration: "8 weeks",
    price: "$249",
    image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=500&fit=crop",
    description: "Stage presence, setlist planning, gear management, and dealing with performance anxiety.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
];

const levelColors = {
  Beginner: "bg-emerald-600/20 border-emerald-500/40 text-emerald-300",
  Intermediate: "bg-amber-600/20 border-amber-500/40 text-amber-300",
  Advanced: "bg-rose-600/20 border-rose-500/40 text-rose-300",
};

export function LessonsSection() {
  const [selectedLevel, setSelectedLevel] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    type: "youtube" | "vimeo" | "html5";
    title: string;
  } | null>(null);

  const filteredLessons = useMemo(() => {
    if (selectedLevel === "All") return LESSONS;
    return LESSONS.filter((lesson) => lesson.level === selectedLevel);
  }, [selectedLevel]);

  return (
    <>
      <section id="lessons" className="py-24 px-4 sm:px-8 bg-black/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          {/* Featured Video Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 rounded-lg overflow-hidden border border-white/10 bg-black/40 hover:border-amber-600/40 transition-all"
          >
            <button
              onClick={() => setSelectedVideo(FEATURED_VIDEO)}
              className="relative w-full aspect-video overflow-hidden group"
              aria-label="Watch lesson highlights video"
            >
              <Image
                src="https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&h=675&fit=crop"
                alt="Lesson Highlights"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/10 group-hover:bg-amber-600 transition-all">
                  <Play size={40} className="text-white" fill="white" />
                </div>
              </div>
            </button>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-black uppercase text-white mb-2">Lesson Highlights</h3>
              <p className="text-sm text-zinc-400">Watch a sample of our teaching methods and student successes.</p>
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400 inline-block mb-3">
              Learn from Experts
            </span>
            <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-white mb-6">
              Guitar Lessons
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
              From beginner basics to advanced techniques. Learn from experienced instructors.
            </p>
          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level as any)}
                className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  selectedLevel === level
                    ? "bg-amber-600 text-black"
                    : "bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Results Counter */}
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-8">
            {filteredLessons.length} {filteredLessons.length === 1 ? "lesson" : "lessons"} available
          </p>

          {/* Lessons Grid */}
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => (
                <motion.article
                  key={lesson.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="group flex flex-col bg-zinc-950/50 border border-white/5 rounded-lg overflow-hidden hover:border-amber-600/40 transition-all hover:shadow-[0_12px_40px_rgba(217,119,6,0.15)]"
                >
                  {/* Image with Video Button */}
                  <div className="relative w-full aspect-[3/2] overflow-hidden bg-black">
                    <Image
                      src={lesson.image}
                      alt={lesson.title}
                      fill
                      sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Level Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full border ${levelColors[lesson.level]} font-black text-[10px] uppercase tracking-widest backdrop-blur-sm`}>
                      {lesson.level}
                    </div>

                    {/* Video Button */}
                    {lesson.videoUrl && (
                      <button
                        onClick={() =>
                          setSelectedVideo({
                            url: lesson.videoUrl!,
                            type: lesson.videoType || "youtube",
                            title: lesson.title,
                          })
                        }
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                        aria-label={`Watch preview for ${lesson.title}`}
                      >
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/0 group-hover:bg-amber-600 transition-all">
                          <Play size={24} className="text-white" fill="white" />
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 space-y-3">
                    <h3 className="text-base font-black uppercase leading-tight text-white">{lesson.title}</h3>

                    <p className="text-xs text-zinc-500 font-medium">By {lesson.instructor}</p>

                    <p className="text-xs text-zinc-400 leading-relaxed flex-1">{lesson.description}</p>

                    {/* Duration & Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest">
                        <Clock size={12} />
                        {lesson.duration}
                      </div>
                      <div className="text-base font-black text-amber-400">{lesson.price}</div>
                    </div>

                    <button className="w-full mt-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase tracking-widest transition-all">
                      Enroll Now
                    </button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        videoUrl={selectedVideo?.url || ""}
        videoType={selectedVideo?.type || "youtube"}
        title={selectedVideo?.title || ""}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}
