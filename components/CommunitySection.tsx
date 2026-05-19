"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, MessageCircle, Share2, Users, Music, Star, Camera } from "lucide-react";
import { VideoModal } from "./VideoModal";

interface CommunityPost {
  id: string;
  type: "student_story" | "event" | "jam_session" | "performance";
  title: string;
  author: string;
  date: string;
  location: string;
  description: string;
  image: string;
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "html5";
  likes: number;
}

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "c1",
    type: "student_story",
    title: "From Zero to Hero in 12 Weeks",
    author: "Jamie L.",
    date: "2026-05-15",
    location: "Stuart, FL",
    description: "Started as a complete beginner, now performing at local venues. Thanks to Marcus and the team!",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 342,
  },
  {
    id: "c2",
    type: "event",
    title: "Monthly Gear Showcase - May 2026",
    author: "Goated Guitars",
    date: "2026-05-12",
    location: "Stuart, FL",
    description: "Check out our latest arrivals and rare vintage finds. Special guest: Vintage guitar expert Marcus D.",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 524,
  },
  {
    id: "c3",
    type: "jam_session",
    title: "Friday Night Jam - Blues Edition",
    author: "Elena R.",
    date: "2026-05-10",
    location: "Goated Guitars Studio",
    description: "Amazing energy as our students jam together. Blues standards and original compositions.",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 289,
  },
  {
    id: "c4",
    type: "performance",
    title: "Jason's First Gig - Complete Success!",
    author: "Jason W.",
    date: "2026-05-08",
    location: "Treasure Coast Live",
    description: "Played a full 90-minute set with my band. Couldn't have done it without the lessons. Standing ovation!",
    image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 612,
  },
  {
    id: "c5",
    type: "student_story",
    title: "Adult Learner Breakthrough",
    author: "Robert K.",
    date: "2026-05-05",
    location: "Stuart, FL",
    description: "Started learning at 52. Now playing my favorite songs. It's never too late to chase your dreams!",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 456,
  },
  {
    id: "c6",
    type: "event",
    title: "Summer Workshop Series Begins",
    author: "Goated Guitars",
    date: "2026-05-01",
    location: "Stuart, FL",
    description: "6-week intensive workshops: Fingerstyle, Blues, and Recording Techniques. Limited spots available!",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 378,
  },
  {
    id: "c7",
    type: "jam_session",
    title: "Students Collaborate on Original Track",
    author: "Creative Minds Collective",
    date: "2026-04-28",
    location: "Goated Guitars Studio",
    description: "Our advanced students wrote and recorded an original song together. Sounds incredible!",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 521,
  },
  {
    id: "c8",
    type: "performance",
    title: "Charity Concert Fundraiser Success",
    author: "Local Heroes",
    date: "2026-04-25",
    location: "Stuart Arts Center",
    description: "Our students raised $5,000 for local music programs. Performances ranged from classical to rock!",
    image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
    likes: 789,
  },
];

const typeConfig = {
  student_story: {
    icon: Star,
    label: "Student Story",
    color: "text-blue-400 bg-blue-600/20 border-blue-500/40",
  },
  event: {
    icon: Camera,
    label: "Event",
    color: "text-amber-400 bg-amber-600/20 border-amber-500/40",
  },
  jam_session: {
    icon: Music,
    label: "Jam Session",
    color: "text-purple-400 bg-purple-600/20 border-purple-500/40",
  },
  performance: {
    icon: Users,
    label: "Performance",
    color: "text-rose-400 bg-rose-600/20 border-rose-500/40",
  },
};

export function CommunitySection() {
  const [selectedType, setSelectedType] = useState<"All" | "student_story" | "event" | "jam_session" | "performance">("All");
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    type: "youtube" | "vimeo" | "html5";
    title: string;
  } | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const filteredPosts = useMemo(() => {
    if (selectedType === "All") return COMMUNITY_POSTS;
    return COMMUNITY_POSTS.filter((post) => post.type === selectedType);
  }, [selectedType]);

  const toggleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  return (
    <>
      <section id="community" className="py-24 px-4 sm:px-8 bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400 inline-block mb-3">
              Community
            </span>
            <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-white mb-6">
              Student Showcase
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
              Stories from our community: student successes, events, jam sessions, and performances.
            </p>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {["All", "student_story", "event", "jam_session", "performance"].map((type) => {
              const label =
                type === "All"
                  ? "All"
                  : type === "student_story"
                  ? "Student Story"
                  : type === "jam_session"
                  ? "Jam Session"
                  : type.charAt(0).toUpperCase() + type.slice(1);

              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                    selectedType === type
                      ? "bg-amber-600 text-black"
                      : "bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Results Counter */}
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-8">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"} found
          </p>

          {/* Community Grid */}
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPosts.map((post) => {
                const TypeIcon = typeConfig[post.type].icon;
                const isLiked = likedPosts.has(post.id);

                return (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="group flex flex-col bg-zinc-950/50 border border-white/5 rounded-lg overflow-hidden hover:border-amber-600/40 transition-all hover:shadow-[0_12px_40px_rgba(217,119,6,0.15)]"
                  >
                    {/* Image with Video Button */}
                    <div className="relative w-full aspect-square overflow-hidden bg-black">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Type Badge */}
                      <div
                        className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${typeConfig[post.type].color} font-black text-[10px] uppercase tracking-widest backdrop-blur-sm`}
                      >
                        <TypeIcon size={12} />
                        {typeConfig[post.type].label}
                      </div>

                      {/* Video Button */}
                      {post.videoUrl && (
                        <button
                          onClick={() =>
                            setSelectedVideo({
                              url: post.videoUrl!,
                              type: post.videoType || "youtube",
                              title: post.title,
                            })
                          }
                          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                          aria-label={`Watch video: ${post.title}`}
                        >
                          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/0 group-hover:bg-amber-600 transition-all">
                            <Play size={24} className="text-white" fill="white" />
                          </div>
                        </button>
                      )}

                      {/* Date Badge */}
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm">
                        <span className="text-[9px] font-black uppercase text-zinc-300">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 space-y-3">
                      <h3 className="text-sm font-black uppercase leading-tight text-white">{post.title}</h3>

                      <div className="text-xs space-y-1">
                        <p className="text-zinc-400 font-medium">By {post.author}</p>
                        <p className="text-zinc-500 text-[10px]">{post.location}</p>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed flex-1">{post.description}</p>

                      {/* Engagement Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${
                            isLiked
                              ? "bg-rose-600/20 border border-rose-500/40"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <Heart
                            size={12}
                            className={isLiked ? "text-rose-400 fill-current" : "text-zinc-500"}
                          />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            isLiked ? "text-rose-400" : "text-zinc-500"
                          }`}>
                            {post.likes + (isLiked ? 1 : 0)}
                          </span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button className="p-1.5 hover:bg-white/5 rounded transition-colors" aria-label="Comment">
                            <MessageCircle size={14} className="text-zinc-500" />
                          </button>
                          <button className="p-1.5 hover:bg-white/5 rounded transition-colors" aria-label="Share">
                            <Share2 size={14} className="text-zinc-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
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
