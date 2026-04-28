import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Sparkles, RefreshCw, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/diet-planner")({
  component: DietPlanner,
  head: () => ({
    meta: [
      { title: "AI Diet Planner — IronForge" },
      { name: "description", content: "Generate Indian-friendly personalized diet plans powered by AI." },
    ],
  }),
});

const inputSchema = z.object({
  age: z.number().min(13).max(90),
  weight_kg: z.number().min(30).max(250),
  height_cm: z.number().min(120).max(230),
  gender: z.enum(["male", "female"]),
  goal: z.enum(["fat_loss", "muscle_gain", "maintenance"]),
  diet_preference: z.enum(["veg", "non_veg"]),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});
type Inputs = z.infer<typeof inputSchema>;

interface Meal {
  name: string;
  time: string;
  items: { food: string; quantity: string; calories: number }[];
}

interface Plan {
  id: string;
  goal: string;
  diet_preference: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  meals: Meal[];
  created_at: string;
}

function DietPlanner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<Partial<Inputs>>({
    gender: "male",
    goal: "muscle_gain",
    diet_preference: "veg",
    activity_level: "moderate",
  });
  const [generating, setGenerating] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const fetchPlans = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("diet_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPlans((data ?? []) as unknown as Plan[]);
  };

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const handleGenerate = async () => {
    const parsed = inputSchema.safeParse(inputs);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-diet-plan", {
        body: parsed.data,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Diet plan generated!");
      await fetchPlans();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate plan";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("diet_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Plan deleted");
      await fetchPlans();
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="mx-auto max-w-5xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-fire flex items-center justify-center">
            <Utensils className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">AI Diet Planner</h1>
            <p className="text-sm text-muted-foreground">Indian-friendly meal plans tailored to your goals</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="font-heading font-bold mb-4">Your details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Age">
              <input type="number" value={inputs.age ?? ""} onChange={(e) => setInputs({ ...inputs, age: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" value={inputs.weight_kg ?? ""} onChange={(e) => setInputs({ ...inputs, weight_kg: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </Field>
            <Field label="Height (cm)">
              <input type="number" value={inputs.height_cm ?? ""} onChange={(e) => setInputs({ ...inputs, height_cm: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm" />
            </Field>
            <Field label="Gender">
              <select value={inputs.gender} onChange={(e) => setInputs({ ...inputs, gender: e.target.value as Inputs["gender"] })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="Goal">
              <select value={inputs.goal} onChange={(e) => setInputs({ ...inputs, goal: e.target.value as Inputs["goal"] })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="fat_loss">Fat loss</option>
                <option value="muscle_gain">Muscle gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </Field>
            <Field label="Diet preference">
              <select value={inputs.diet_preference} onChange={(e) => setInputs({ ...inputs, diet_preference: e.target.value as Inputs["diet_preference"] })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="veg">Vegetarian</option>
                <option value="non_veg">Non-vegetarian</option>
              </select>
            </Field>
            <Field label="Activity level">
              <select value={inputs.activity_level} onChange={(e) => setInputs({ ...inputs, activity_level: e.target.value as Inputs["activity_level"] })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                <option value="sedentary">Sedentary (desk job)</option>
                <option value="light">Light (1-3 workouts/week)</option>
                <option value="moderate">Moderate (3-5 workouts/week)</option>
                <option value="active">Active (6-7 workouts/week)</option>
                <option value="very_active">Very active (twice daily)</option>
              </select>
            </Field>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-6 w-full md:w-auto bg-gradient-fire text-primary-foreground px-8 py-3 rounded-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : plans.length > 0 ? "Regenerate plan" : "Generate plan"}
          </button>
        </motion.div>

        {plans.length > 0 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold">Your saved plans</h2>
            {plans.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-heading text-xl font-bold capitalize">
                      {p.goal.replace("_", " ")} · {p.diet_preference === "veg" ? "Veg" : "Non-veg"}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("en-IN")}</p>
                  </div>
                  <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <Stat label="Calories" value={`${p.calories} kcal`} />
                  <Stat label="Protein" value={`${p.protein_g} g`} />
                  <Stat label="Carbs" value={`${p.carbs_g} g`} />
                  <Stat label="Fats" value={`${p.fats_g} g`} />
                </div>

                <div className="space-y-4">
                  {p.meals.map((meal, idx) => (
                    <div key={idx} className="border border-border rounded-xl p-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="font-heading font-bold">{meal.name}</h3>
                        <span className="text-xs text-muted-foreground">{meal.time}</span>
                      </div>
                      <div className="space-y-1">
                        {meal.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                            <span>{item.food} <span className="text-muted-foreground">({item.quantity})</span></span>
                            <span className="text-muted-foreground">{item.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/40 rounded-lg p-3 text-center">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="font-heading font-bold text-lg">{value}</p>
    </div>
  );
}
