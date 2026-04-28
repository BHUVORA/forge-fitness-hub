import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, Calendar, TrendingUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — IronForge" },
      { name: "description", content: "Manage members, memberships, and attendance." },
    ],
  }),
});

interface Profile { id: string; full_name: string | null; phone: string | null; }
interface Mem { id: string; user_id: string; plan_name: string; end_date: string; status: string; }
interface Att { id: string; user_id: string; check_in_at: string; }

function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [memberships, setMemberships] = useState<Mem[]>([]);
  const [attendance, setAttendance] = useState<Att[]>([]);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState({ plan_name: "Monthly", price: 2499, months: 1 });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, isAdmin, navigate]);

  const load = async () => {
    const [{ data: p }, { data: m }, { data: a }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone"),
      supabase.from("memberships").select("id, user_id, plan_name, end_date, status").order("end_date", { ascending: false }),
      supabase.from("attendance").select("id, user_id, check_in_at").order("check_in_at", { ascending: false }).limit(50),
    ]);
    setProfiles(p ?? []);
    setMemberships(m ?? []);
    setAttendance(a ?? []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const nameOf = (uid: string) => profiles.find((p) => p.id === uid)?.full_name || uid.slice(0, 8);

  const createMembership = async (userId: string) => {
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + newPlan.months);
    const { error } = await supabase.from("memberships").insert({
      user_id: userId,
      plan_name: newPlan.plan_name,
      price: newPlan.price,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      status: "active",
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Membership created");
      setCreatingFor(null);
      load();
    }
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const activeCount = memberships.filter((m) => new Date(m.end_date) >= new Date() && m.status === "active").length;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayCount = attendance.filter((a) => new Date(a.check_in_at) >= todayStart).length;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="mx-auto max-w-6xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="font-heading text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Users} label="Total members" value={profiles.length} />
          <StatCard icon={TrendingUp} label="Active memberships" value={activeCount} />
          <StatCard icon={Calendar} label="Check-ins today" value={todayCount} />
        </div>

        <section className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-heading text-xl font-bold mb-4">Members & Memberships</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Expires</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const mem = memberships.find((m) => m.user_id === p.id);
                  const expired = mem ? new Date(mem.end_date) < new Date() : true;
                  return (
                    <tr key={p.id} className="border-b border-border/30">
                      <td className="py-3">{p.full_name || "—"}</td>
                      <td className="py-3 text-muted-foreground">{p.phone || "—"}</td>
                      <td className="py-3">{mem?.plan_name || <span className="text-muted-foreground">None</span>}</td>
                      <td className="py-3">
                        {mem ? (
                          <span className={expired ? "text-destructive" : "text-primary"}>
                            {new Date(mem.end_date).toLocaleDateString("en-IN")}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="py-3">
                        {creatingFor === p.id ? (
                          <div className="flex flex-wrap gap-2 items-center">
                            <select value={newPlan.plan_name} onChange={(e) => {
                              const name = e.target.value;
                              const config = name === "Monthly" ? { months: 1, price: 2499 } : name === "Quarterly" ? { months: 3, price: 5999 } : { months: 12, price: 19999 };
                              setNewPlan({ plan_name: name, ...config });
                            }} className="bg-background border border-border rounded px-2 py-1 text-xs">
                              <option>Monthly</option>
                              <option>Quarterly</option>
                              <option>Yearly</option>
                            </select>
                            <button onClick={() => createMembership(p.id)} className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold">Save</button>
                            <button onClick={() => setCreatingFor(null)} className="text-xs text-muted-foreground">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setCreatingFor(p.id)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            <Plus className="h-3 w-3" /> Add plan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-heading text-xl font-bold mb-4">Recent attendance (last 50)</h2>
          {attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No check-ins yet</p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded bg-secondary/30 text-sm">
                  <span>{nameOf(a.user_id)}</span>
                  <span className="text-muted-foreground text-xs">{new Date(a.check_in_at).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-5 w-5 text-primary" />
        <span className="text-xs uppercase text-muted-foreground">{label}</span>
      </div>
      <p className="font-heading text-3xl font-bold">{value}</p>
    </div>
  );
}
