import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Dumbbell, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/classes", label: "Classes" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-primary" />
            <span className="font-heading text-xl font-bold tracking-wider text-foreground">
              IRON<span className="text-gradient-fire">FORGE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors rounded-md ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-gradient-fire text-primary-foreground px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all hover:scale-105 glow-primary inline-flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="bg-gradient-fire text-primary-foreground px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all hover:scale-105 glow-primary"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground p-2"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium uppercase tracking-wide rounded-md transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block bg-gradient-fire text-primary-foreground text-center px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wide mt-3"
              >
                Join Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
