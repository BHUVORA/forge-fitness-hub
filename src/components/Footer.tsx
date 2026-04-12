import { Link } from "@tanstack/react-router";
import { Dumbbell, Phone, Mail, MapPin, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="font-heading text-lg font-bold tracking-wider">
                IRON<span className="text-gradient-fire">FORGE</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transform your body. Elevate your mind. Join the community that never quits.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm text-foreground mb-4">Quick Links</h4>
            <div className="space-y-2">
              {["/about", "/pricing", "/classes", "/gallery", "/contact"].map((to) => (
                <Link key={to} to={to} className="block text-sm text-muted-foreground hover:text-primary transition-colors capitalize">
                  {to.slice(1)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm text-foreground mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><span>+91 98765 43210</span></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><span>info@ironforge.gym</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span>Mumbai, India</span></div>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="section-separator mt-8 mb-6" />
        <p className="text-center text-xs text-muted-foreground">
          © 2026 IronForge Gym. All rights reserved. — Discipline. Consistency. Results.
        </p>
      </div>
    </footer>
  );
}
