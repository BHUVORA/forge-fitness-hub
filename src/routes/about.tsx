import { createFileRoute } from "@tanstack/react-router";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Dumbbell, Users, Award, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About IronForge — Our Story & Mission" },
      { name: "description", content: "Learn about IronForge Gym's mission to transform lives through premium fitness training." },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Our Story</p>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-foreground mb-4">
              Forged in <span className="text-gradient-fire">Iron</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Founded with a vision to create India's most advanced fitness experience. We combine cutting-edge technology with proven training methods.
            </p>
          </div>
        </AnimatedSection>

        <div className="relative rounded-2xl overflow-hidden mb-16 aspect-[21/9]">
          <img src="/images/gym-3.jpg" alt="IronForge gym interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            { icon: Dumbbell, title: "Premium Equipment", desc: "200+ pieces of imported fitness equipment from world-class brands." },
            { icon: Users, title: "Expert Team", desc: "15+ certified trainers with years of competitive and coaching experience." },
            { icon: Award, title: "Proven Results", desc: "Over 2,500 members transformed with our structured approach to fitness." },
            { icon: Heart, title: "Community", desc: "A supportive, motivating community that pushes you beyond your limits." },
          ].map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 0.1}>
              <div className="card-premium rounded-xl p-8 transition-all duration-300">
                <item.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="text-center card-premium rounded-2xl p-12">
            <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground/20 uppercase">
              "Consistency beats motivation"
            </p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
