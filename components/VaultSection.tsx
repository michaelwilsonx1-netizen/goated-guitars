"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Search, Check } from "lucide-react";
import { VideoModal } from "./VideoModal";

interface VaultProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  description: string;
  specs: string;
  image: string;
  inStock: boolean;
  videoUrl?: string;
  videoType?: "youtube" | "vimeo" | "html5";
}

const VAULT_PRODUCTS: VaultProduct[] = [
  {
    id: "v1",
    name: "Eastman T59/V-RD",
    brand: "Eastman",
    category: "Electric Guitar",
    price: "$1,499",
    description: "Thinline semi-hollow maple body with Seymour Duncan pickups. Antique red finish with classic vibes.",
    specs: "Maple Neck · Ebony Fretboard · Gotoh Tuners · Seymour Duncan Pickups",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=600&fit=crop",
    inStock: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
  {
    id: "v2",
    name: "1967 Harptone E-6N",
    brand: "Harptone",
    category: "Acoustic Guitar",
    price: "$799",
    description: "Vintage D-18 style dreadnought. Spruce top with mahogany sides. Original hardshell case included.",
    specs: "Sitka Spruce Top · Mahogany Sides · Bone Nut & Saddle · Players: George Harrison, David Bowie",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=600&fit=crop",
    inStock: true,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoType: "youtube",
  },
  {
    id: "v3",
    name: "Fender American Elite Strat HSS",
    brand: "Fender",
    category: "Electric Guitar",
    price: "$1,299",
    description: "Modern innovation meets classic style. Shawbucker pickup configuration with advanced electronics.",
    specs: "Western Red Cedar Top · Fishman Presys+ · Venetian Cutaway · Premium Hardware",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=500&h=600&fit=crop",
    inStock: true,
  },
  {
    id: "v4",
    name: "Obsidian Classic",
    brand: "Obsidian",
    category: "Electric Guitar",
    price: "$3,800",
    description: "Premium sleek black limba body with coil-tapped humbuckers. Built for professionals.",
    specs: "Alder Body · Maple Neck · 4th Gen Noiseless Pickups · Shawbucker Bridge",
    image: "https://images.unsplash.com/photo-1510915721058-297e0d2a13d4?w=500&h=600&fit=crop",
    inStock: false,
  },
  {
    id: "v5",
    name: "Fender Precision Bass",
    brand: "Fender",
    category: "Bass Guitar",
    price: "$899",
    description: "The iconic P-Bass. Legendary tone and reliability for studio and stage.",
    specs: "Alder Body · Maple Neck · Split Single-Coil Pickup · Vintage Bridge",
    image: "https://images.unsplash.com/photo-1510915721058-297e0d2a13d4?w=500&h=600&fit=crop",
    inStock: true,
  },
  {
    id: "v6",
    name: "Marshall JCM800 100W Head",
    brand: "Marshall",
    category: "Amplifier",
    price: "$1,199",
    description: "Legendary all-tube rock amp. The sound of legends. Full power and tone control.",
    specs: "100W All-Tube · EL34 Power Tubes · Hand-Wired · British Made",
    image: "https://images.unsplash.com/photo-1510915721058-297e0d2a13d4?w=500&h=600&fit=crop",
    inStock: true,
  },
  {
    id: "v7",
    name: "Boss ME-80 Multi-Effects",
    brand: "Boss",
    category: "Effects Pedal",
    price: "$499",
    description: "Professional-grade multi-effects processor. All the tools you need on one platform.",
    specs: "200+ Effects · Amp Modeling · Expression Pedal · Wireless Ready",
    image: "https://images.unsplash.com/photo-1510915721058-297e0d2a13d4?w=500&h=600&fit=crop",
    inStock: true,
  },
  {
    id: "v8",
    name: "Ernie Ball Premium Strings Set",
    brand: "Ernie Ball",
    category: "Accessory",
    price: "$8.99",
    description: "Professional-grade nickel wound strings. Trusted by professionals worldwide.",
    specs: "Nickel Wound · Consistent Tone · Long-Lasting · .010-.046 Gauge",
    image: "https://images.unsplash.com/photo-1510915721058-297e0d2a13d4?w=500&h=600&fit=crop",
    inStock: true,
  },
];

export function VaultSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    type: "youtube" | "vimeo" | "html5";
    title: string;
  } | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(VAULT_PRODUCTS.map((p) => p.category)))],
    []
  );

  const filteredProducts = useMemo(() => {
    return VAULT_PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <section id="vault" className="py-24 px-4 sm:px-8 bg-black/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-[0.6em] text-amber-400 inline-block mb-3">
              The Vault
            </span>
            <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-white mb-6">
              Curated Instruments
            </h2>
            <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
              Hand-selected guitars, basses, amps, and gear. Every instrument inspected and ready to play.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search by name, brand, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-600 text-black"
                    : "bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Counter */}
          <p className="text-xs text-zinc-500 uppercase tracking-widest text-center mb-8">
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} found
          </p>

          {/* Products Grid */}
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product) => (
                  <motion.article
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="group flex flex-col bg-zinc-950/50 border border-white/5 rounded-lg overflow-hidden hover:border-amber-600/40 transition-all hover:shadow-[0_12px_40px_rgba(217,119,6,0.15)]"
                  >
                    {/* Image Container */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-black">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* In Stock Badge */}
                      {product.inStock && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600/20 border border-green-500/40 backdrop-blur-sm">
                          <Check size={12} className="text-green-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                            In Stock
                          </span>
                        </div>
                      )}

                      {/* Video Button */}
                      {product.videoUrl && (
                        <button
                          onClick={() =>
                            setSelectedVideo({
                              url: product.videoUrl!,
                              type: product.videoType || "youtube",
                              title: product.name,
                            })
                          }
                          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                          aria-label={`Watch demo video for ${product.name}`}
                        >
                          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/0 group-hover:bg-amber-600 transition-all">
                            <Play size={24} className="text-white" fill="white" />
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                          {product.brand}
                        </span>
                        <h3 className="text-sm font-black uppercase leading-tight text-white">
                          {product.name}
                        </h3>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed flex-1">{product.description}</p>

                      <div className="text-lg font-black text-amber-400">{product.price}</div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-zinc-500 text-sm uppercase tracking-widest">
                  No items found. Try adjusting your search or filters.
                </p>
              </motion.div>
            )}
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
