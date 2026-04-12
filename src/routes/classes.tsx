import { createFileRoute } from "@tanstack/react-router";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/classes")({
  component: ClassesPage,
  head: () => ({
    meta: [
      { title: "Classes — IronForge Gym Group Training" },
      { name: "description", content: "Book group fitness classes at IronForge. Yoga, HIIT, CrossFit, Zumba, and more." },
    ],
  }),
});

const classes = [
  { name: "HIIT Burn", time: "6:00 AM", trainer: "Coach Ravi", duration: "45 min", spots: 20, color: "text-primary" },
  { name: "Power Yoga", time: "7:00 AM", trainer: "Anjali S.", duration: "60 min", spots: 15, color: "text-gold" },
  { name: "CrossFit WOD", time: "8:30 AM", trainer: "Coach Vikram", duration: "50 min", spots: 12, color: "text-primary" },
  { name: "Zumba", time: "5:00 PM", trainer: "Neha K.", duration: "45 min", spots: 25, color: "text-gold" },
  { name: "Strength Training", time: "6:30 PM", trainer: "Coach Arjun", duration: "60 min", spots: 10, color: "text-primary" },
  { name: "Boxing", time: "7:30 PM", trainer: "Coach Sameer", duration: "45 min", spots: 8, color: "text-gold" },
];

function ClassesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Group Training</p>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-foreground mb-4">
              Push <span className="text-gradient-fire">Harder</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Energy-packed group classes led by expert coaches. Every session is designed to push your limits.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-4">
          {classes.map((cls, i) => (
            <AnimatedSection key={cls.name} delay={i * 0.08}>
              <div className="card-premium rounded-xl p-6 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Clock className={`h-5 w-5 ${cls.color}`} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{cls.name}</h3>
                    <p className="text-xs text-muted-foreground">{cls.trainer} · {cls.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{cls.time}</span>
                  <span className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">{cls.spots} spots</span>
                  <button className="bg-gradient-fire text-primary-foreground px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all hover:scale-105">
                    Book
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
