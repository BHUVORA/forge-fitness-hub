// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTIVITY_FACTOR: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

    const supabaseAuth = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json();
    const { age, weight_kg, height_cm, gender, goal, diet_preference, activity_level } = body;

    if (
      typeof age !== "number" || age < 13 || age > 90 ||
      typeof weight_kg !== "number" || weight_kg < 30 || weight_kg > 250 ||
      typeof height_cm !== "number" || height_cm < 120 || height_cm > 230 ||
      !["male", "female"].includes(gender) ||
      !["fat_loss", "muscle_gain", "maintenance"].includes(goal) ||
      !["veg", "non_veg"].includes(diet_preference) ||
      !ACTIVITY_FACTOR[activity_level]
    ) {
      return json({ error: "Invalid input" }, 400);
    }

    // BMR (Mifflin-St Jeor)
    const bmr = gender === "male"
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
    const tdee = bmr * ACTIVITY_FACTOR[activity_level];
    const adjusted = Math.round(
      goal === "fat_loss" ? tdee - 500 : goal === "muscle_gain" ? tdee + 350 : tdee
    );

    const proteinPerKg = goal === "muscle_gain" ? 2.0 : goal === "fat_loss" ? 2.2 : 1.6;
    const protein_g = Math.round(weight_kg * proteinPerKg);
    const fats_g = Math.round((adjusted * 0.25) / 9);
    const carbs_g = Math.round((adjusted - protein_g * 4 - fats_g * 9) / 4);

    const prompt = `Generate a one-day Indian-friendly ${diet_preference === "veg" ? "vegetarian" : "non-vegetarian"} meal plan for someone with goal "${goal.replace("_", " ")}".
Targets: ${adjusted} kcal, ${protein_g}g protein, ${carbs_g}g carbs, ${fats_g}g fats.
Provide exactly 4 meals: Breakfast (8 AM), Lunch (1 PM), Snacks (5 PM), Dinner (8:30 PM).
Each meal must have 2-4 realistic Indian food items with quantities (e.g. "1 bowl", "100g", "2 rotis") and per-item calorie estimates that sum close to ${adjusted}.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an Indian nutrition expert. Always return realistic, region-appropriate meals." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_meal_plan",
            description: "Submit the structured one-day meal plan",
            parameters: {
              type: "object",
              properties: {
                meals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", enum: ["Breakfast", "Lunch", "Snacks", "Dinner"] },
                      time: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            food: { type: "string" },
                            quantity: { type: "string" },
                            calories: { type: "number" },
                          },
                          required: ["food", "quantity", "calories"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["name", "time", "items"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["meals"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_meal_plan" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return json({ error: "Rate limit reached. Please wait a moment." }, 429);
      if (aiResp.status === 402) return json({ error: "AI credits exhausted. Please add credits in Settings." }, 402);
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return json({ error: "AI generation failed" }, 500);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response", JSON.stringify(aiData));
      return json({ error: "Invalid AI response" }, 500);
    }
    const mealsResult = JSON.parse(toolCall.function.arguments);

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: saved, error: saveErr } = await supabaseAdmin
      .from("diet_plans")
      .insert({
        user_id: userId,
        goal,
        diet_preference,
        calories: adjusted,
        protein_g,
        carbs_g,
        fats_g,
        meals: mealsResult.meals,
        inputs: { age, weight_kg, height_cm, gender, goal, diet_preference, activity_level },
      })
      .select()
      .single();

    if (saveErr) {
      console.error("Save error:", saveErr);
      return json({ error: saveErr.message }, 500);
    }

    return json({ plan: saved });
  } catch (err) {
    console.error("Diet plan error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
