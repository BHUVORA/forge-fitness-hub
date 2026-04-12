import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Users, Award, Dumbbell, Clock, Star, ChevronRight, Flame, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "IronForge Gym — Transform Your Body, Elevate Your Mind" },
      { name: "description", content: "Premium gym in Mumbai with world-class equipment, expert trainers, and AI-powered fitness tools. Join IronForge today." },
      { property: "og:title", content: "IronForge Gym — Transform Your Body" },
      { property: "og:description", content: "Premium gym with AI diet planning, QR attendance, and more." },
    ],
  }),
});

const stats = [
  { icon: Users, value: "2,500+", label: "Active Members" },
  { icon: Award, value: "15+", label: "Expert Trainers" },
  { icon: Dumbbell, value: "200+", label: "Equipment" },
  { icon: Clock, value: "5 AM - 11 PM", label: "Open Daily" },
];

const testimonials = [
  { name: "Arjun Mehta", role: "Lost 25kg in 8 months", text: "IronForge changed my life. The trainers are incredible and the AI diet planner made nutrition easy.", rating: 5 },
  { name: "Priya Sharma", role: "Fitness Enthusiast", text: "Best gym in the city. Premium equipment, clean facilities, and an amazing community.", rating: 5 },
  { name: "Vikram Singh", role: "Gained 12kg muscle", text: "The personal training and structured approach helped me achieve results I never thought possible.", rating: 5 },
];

const plans = [
  { name: "Monthly", price: "2,499", duration: "/month", features: ["Full gym access", "Locker facility", "Basic diet plan"], popular: false },
  { name: "Quarterly", price: "5,999", duration: "/3 months", features: ["Everything in Monthly", "Personal trainer (2x/week)", "AI diet planner", "QR attendance"], popular: true, save: "Save ₹1,498" },
  { name: "Yearly", price: "19,999", duration: "/year", features: ["Everything in Quarterly", "Unlimited PT sessions", "Priority booking", "Body composition analysis"], popular: false, save: "Save ₹9,989" },
];

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/gym-1.webp')" }}
        />
        <div className="absolute inset-0 overlay-dark" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-gold font-heading text-sm tracking-[0.3em] uppercase mb-4">
              Discipline · Consistency · Results
            </p>
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6">
              <span className="text-foreground">Build Your</span>
              <br />
              <span className="text-gradient-fire">Best Self</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-body">
              Premium training facility with world-class equipment, expert coaches, and AI-powered fitness tools to transform your body and mind.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/pricing"
              className="bg-gradient-fire text-primary-foreground px-8 py-4 rounded-lg text-base font-bold uppercase tracking-wide transition-all hover:scale-105 glow-primary inline-flex items-center gap-2"
            >
              <Flame className="h-5 w-5" /> Join Now
            </Link>
            <Link
              to="/contact"
              className="border border-foreground/30 text-foreground px-8 py-4 rounded-lg text-base font-bold uppercase tracking-wide transition-all hover:border-primary hover:text-primary inline-flex items-center gap-2"
            >
              Book Free Trial <ChevronRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="card-premium rounded-xl p-6 text-center transition-all duration-300">
                  <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <AnimatedSection className="py-20 text-center px-4">
        <p className="font-heading text-3xl sm:text-5xl font-bold text-foreground/10 uppercase">
          "Your only limit is you"
        </p>
      </AnimatedSection>

      {/* Gallery Preview */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <div className="text-center mb-12">
              <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Our Space</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">World-Class Facility</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["/images/gym-1.webp", "/images/gym-2.webp", "/images/gym-3.jpg"].map((src, i) => (
              <AnimatedSection key={src} delay={i * 0.15}>
                <div className="relative overflow-hidden rounded-xl aspect-[4/3] group">
                  <img src={src} alt={`Gym facility ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gradient-dark">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <div className="text-center mb-14">
              <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Why IronForge</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Stronger Every Day</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "AI Diet Planner", desc: "Personalized Indian diet plans powered by AI. Get macro-optimized meals for your goals." },
              { icon: Zap, title: "QR Attendance", desc: "Scan your unique QR code on entry. Track your consistency with real-time logs." },
              { icon: Dumbbell, title: "Expert Coaching", desc: "Certified trainers with proven transformation results. Personal & group sessions." },
            ].map((feat, i) => (
              <AnimatedSection key={feat.title} delay={i * 0.15}>
                <div className="card-premium rounded-xl p-8 transition-all duration-300 h-full">
                  <feat.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection>
            <div className="text-center mb-14">
              <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Membership</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Choose Your Plan</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 0.15}>
                <div className={`card-premium rounded-xl p-8 transition-all duration-300 relative ${plan.popular ? "border-glow glow-primary" : ""}`}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-fire text-primary-foreground text-xs font-bold uppercase tracking-wide px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-heading text-lg text-foreground mb-1">{plan.name}</h3>
                  {plan.save && <p className="text-xs text-primary mb-3">{plan.save}</p>}
                  <p className="font-heading text-4xl font-bold text-foreground mb-1">
                    ₹{plan.price}<span className="text-base text-muted-foreground font-body">{plan.duration}</span>
                  </p>
                  <ul className="mt-6 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/pricing"
                    className={`block text-center py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
                      plan.popular
                        ? "bg-gradient-fire text-primary-foreground hover:scale-105"
                        : "border border-border text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-dark">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection>
            <div className="text-center mb-14">
              <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Testimonials</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Real Results</h2>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 0.15}>
                <div className="card-premium rounded-xl p-8 transition-all duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-gold fill-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                  <div>
                    <p className="font-heading text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-primary">{t.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <AnimatedSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
              No Excuses. <span className="text-gradient-fire">Start Today.</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Your transformation journey begins with a single step. Book your free trial and experience the IronForge difference.
            </p>
            <Link
              to="/contact"
              className="bg-gradient-fire text-primary-foreground px-10 py-4 rounded-lg text-base font-bold uppercase tracking-wide transition-all hover:scale-105 glow-primary inline-flex items-center gap-2"
            >
              <Flame className="h-5 w-5" /> Book Free Trial
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
