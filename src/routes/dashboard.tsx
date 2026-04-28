import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { LogOut, User as UserIcon, Calendar, Activity, Utensils, ScanLine, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "My Dashboard — IronForge" },
      { name: "description", content: "View your membership, QR check-in code, and AI diet plans." },
    ],
  }),
});

interface Membership {
  id: string;
  plan_name: string;
  end_date: string;
  status: string;
}

interface AttendanceRow {
  id: string;
  check_in_at: string;
}

function Dashboard() {
  const { user, loading, isAdmin, isTrainer, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState("");
  const [membership, setMembership] = useState<Membership | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: mem }, { data: att }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase
          .from("memberships")
          .select("id, plan_name, end_date, status")
          .eq("user_id", user.id)
          .order("end_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("attendance")
          .select("id, check_in_at")
          .eq("user_id", user.id)
          .order("check_in_at", { ascending: false })
          .limit(10),
      ]);
      setProfileName(profile?.full_name || user.email || "");
      setMembership(mem);
      setAttendance(att ?? []);
      setDataLoading(false);
    })();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const expiryDate = membership ? new Date(membership.end_date) : null;
  const isExpired = expiryDate ? expiryDate < new Date() : true;
  const daysLeft = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold">
              Welcome, <span className="text-gradient-fire">{profileName.split(" ")[0] || "Athlete"}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user.email} {(isAdmin || isTrainer) && <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs uppercase">{isAdmin ? "Admin" : "Trainer"}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {(isAdmin || isTrainer) && (
              <Link
                to="/admin/scanner"
                className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80"
              >
                <ScanLine className="h-4 w-4" /> Scanner
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80"
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* QR Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 bg-card border border-border rounded-2xl p-6 flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Check-in QR</h2>
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={user.id} size={180} level="H" />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Show this QR at the front desk to check in
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-2 truncate w-full text-center">
              {user.id}
            </p>
          </motion.div>

          {/* Membership Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Membership</h2>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            {dataLoading ? (
              <div className="h-24 animate-pulse bg-secondary/30 rounded-lg" />
            ) : membership ? (
              <div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl font-heading font-bold">{membership.plan_name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs uppercase font-bold ${
                      isExpired ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {isExpired ? "Expired" : membership.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Expiry</p>
                    <p className="font-medium">{expiryDate?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Days remaining</p>
                    <p className="font-medium">{daysLeft} days</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No active membership</p>
                <Link
                  to="/pricing"
                  className="inline-block bg-gradient-fire text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold uppercase"
                >
                  View Plans
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <Link
                to="/diet-planner"
                className="flex items-center gap-3 bg-secondary/40 hover:bg-secondary/70 transition-colors p-4 rounded-lg"
              >
                <Utensils className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">AI Diet Planner</p>
                  <p className="text-xs text-muted-foreground">Generate plan</p>
                </div>
              </Link>
              <div className="flex items-center gap-3 bg-secondary/40 p-4 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Visits this month</p>
                  <p className="text-xs text-muted-foreground">
                    {attendance.filter((a) => new Date(a.check_in_at).getMonth() === new Date().getMonth()).length} check-ins
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-3 bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="font-heading font-bold text-lg mb-4">Recent check-ins</h2>
            {attendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No check-ins yet</p>
            ) : (
              <div className="space-y-2">
                {attendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                    <span className="text-sm">{new Date(a.check_in_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    <span className="text-xs text-primary uppercase font-bold">Checked in</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
