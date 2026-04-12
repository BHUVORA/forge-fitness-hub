import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Check, Flame } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — IronForge Gym Membership Plans" },
      { name: "description", content: "Affordable gym membership plans starting from ₹2,499/month. Monthly, quarterly, and yearly options." },
    ],
  }),
});

const plans = [
  {
    name: "Monthly",
    price: "2,499",
    period: "/month",
    features: [
      "Full gym access (5 AM – 11 PM)",
      "Locker & changing room",
      "Basic diet guidance",
      "QR attendance tracking",
    ],
    popular: false,
  },
  {
    name: "Quarterly",
    price: "5,999",
    period: "/3 months",
    save: "Save ₹1,498",
    features: [
      "Everything in Monthly",
      "Personal trainer (2x/week)",
      "AI diet planner access",
      "Class booking priority",
      "Body composition analysis",
    ],
    popular: true,
  },
  {
    name: "Yearly",
    price: "19,999",
    period: "/year",
    save: "Save ₹9,989",
    features: [
      "Everything in Quarterly",
      "Unlimited PT sessions",
      "Priority class booking",
      "Guest passes (4/year)",
      "Exclusive member events",
      "Nutrition consultation",
    ],
    popular: false,
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Membership</p>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-foreground mb-4">
              Invest in <span className="text-gradient-fire">Yourself</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Flexible plans designed for every fitness journey. No hidden fees, no long-term lock-in.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={i * 0.15}>
              <div className={`card-premium rounded-xl p-8 transition-all duration-300 relative h-full flex flex-col ${plan.popular ? "border-glow glow-primary" : ""}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-fire text-primary-foreground text-xs font-bold uppercase tracking-wide px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-lg text-foreground">{plan.name}</h3>
                {plan.save && <p className="text-xs text-primary mt-1">{plan.save}</p>}
                <p className="font-heading text-5xl font-bold text-foreground mt-4 mb-1">
                  ₹{plan.price}
                </p>
                <p className="text-sm text-muted-foreground mb-6">{plan.period}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  className={`block text-center py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
                    plan.popular
                      ? "bg-gradient-fire text-primary-foreground hover:scale-105"
                      : "border border-border text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  <Flame className="h-4 w-4 inline mr-1" /> Get Started
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
