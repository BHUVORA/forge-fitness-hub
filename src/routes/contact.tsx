import { createFileRoute } from "@tanstack/react-router";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Get in Touch with IronForge Gym" },
      { name: "description", content: "Contact IronForge Gym. Book a free trial, ask about memberships, or visit us in Mumbai." },
    ],
  }),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-5xl">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-primary font-heading text-sm tracking-[0.2em] uppercase mb-2">Contact</p>
            <h1 className="font-heading text-4xl sm:text-6xl font-bold text-foreground mb-4">
              Let's <span className="text-gradient-fire">Talk</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ready to transform? Get in touch and we'll help you get started.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="card-premium rounded-xl p-8 space-y-5">
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">Send a Message</h3>
              {[
                { key: "name", label: "Full Name", type: "text" },
                { key: "email", label: "Email", type: "email" },
                { key: "phone", label: "Phone", type: "tel" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    required
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-fire text-primary-foreground py-3.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all hover:scale-[1.02] glow-primary"
              >
                Send Message
              </button>
            </form>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              {[
                { icon: Phone, title: "Call Us", value: "+91 98765 43210", href: "tel:+919876543210" },
                { icon: Mail, title: "Email", value: "info@ironforge.gym", href: "mailto:info@ironforge.gym" },
                { icon: MapPin, title: "Location", value: "Mumbai, Maharashtra, India" },
                { icon: Clock, title: "Hours", value: "5:00 AM – 11:00 PM, Every Day" },
              ].map((item) => (
                <div key={item.title} className="card-premium rounded-xl p-6 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="card-premium rounded-xl overflow-hidden h-48">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="IronForge Location"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
