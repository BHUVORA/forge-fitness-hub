import { createFileRoute } from "@tanstack/react-router";
import { AnimatedSection } from "@/components/AnimatedSection";
import { useState } from "react";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery — IronForge Gym Facility" },
      { name: "description", content: "Explore IronForge Gym's premium facility, equipment, and training areas." },
    ],
  }),
});

const images = [
  { src: "/images/gym-1.webp", category: "Facility", alt: "Main training floor" },
  { src: "/images/gym-2.webp", category: "Equipment", alt: "Strength area" },
  { src: "/images/gym-3.jpg", category: "Facility", alt: "Cardio zone" },
];

const categories = ["All", "Facility", "Equipment"];

function GalleryPage() {
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const filtered = active === "All" ? images : images.filter((img) => img.category === active);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Gallery</p>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-foreground">
              Our <span className="text-gradient-fire">Space</span>
            </h1>
          </div>
        </AnimatedSection>

        <div className="flex justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-lg text-sm font-medium uppercase tracking-wide transition-all ${
                active === cat
                  ? "bg-gradient-fire text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((img, i) => (
            <AnimatedSection key={img.src + active} delay={i * 0.1}>
              <button
                onClick={() => setLightbox(img.src)}
                className="relative overflow-hidden rounded-xl aspect-[4/3] group w-full"
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-sm font-medium text-foreground">{img.alt}</span>
                </div>
              </button>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Gallery" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}
