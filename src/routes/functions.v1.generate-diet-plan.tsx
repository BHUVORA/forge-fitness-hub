import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const inputSchema = z.object({
  age: z.number().min(13).max(90),
  weight_kg: z.number().min(30).max(250),
  height_cm: z.number().min(120).max(230),
  gender: z.enum(["male", "female"]),
  goal: z.enum(["fat_loss", "muscle_gain", "maintenance"]),
  diet_preference: z.enum(["veg", "non_veg"]),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

const ACTIVITY_FACTOR = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const ServerRoute = createFileRoute("/functions/v1/generate-diet-plan")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          // Auth
          const authHeader = request.headers.get("Authorization");
          if (!authHeader) {
            return json({ error: "Unauthorized" }, 401);
          }
          const token = authHeader.replace("Bearer ", "");

          const SUPABASE_URL = process.env.SUPABASE_URL!;
          const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

          const supabaseAuth = createClient(SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY!, {
            global: { headers: { Authorization: `Bearer ${token}` } },
          });
          const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
          if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
          const userId = userData.user.id;

          const body = await request.json();
          const parsed = inputSchema.safeParse(body);
          if (!parsed.success) {
            return json({ error: parsed.error.errors[0].message }, 400);
          }
          const i = parsed.data;

          // BMR (Mifflin-St Jeor)
          const bmr = i.gender === "male"
            ? 10 * i.weight_kg + 6.25 * i.height_cm - 5 * i.age + 5
            : 10 * i.weight_kg + 6.25 * i.height_cm - 5 * i.age - 161;
          const tdee = bmr * ACTIVITY_FACTOR[i.activity_level];
          const adjusted = Math.round(
            i.goal === "fat_loss" ? tdee - 500 : i.goal === "muscle_gain" ? tdee + 350 : tdee
          );

          // Macro targets
          const proteinPerKg = i.goal === "muscle_gain" ? 2.0 : i.goal === "fat_loss" ? 2.2 : 1.6;
          const protein_g = Math.round(i.weight_kg * proteinPerKg);
          const fats_g = Math.round((adjusted * 0.25) / 9);
          const carbs_g = Math.round((adjusted - protein_g * 4 - fats_g * 9) / 4);

          // Call Lovable AI for meal plan
          const prompt = `Generate a one-day Indian-friendly ${i.diet_preference === "veg" ? "vegetarian" : "non-vegetarian"} meal plan for someone with goal "${i.goal.replace("_", " ")}".
Targets: ${adjusted} kcal, ${protein_g}g protein, ${carbs_g}g carbs, ${fats_g}g fats.
Provide exactly 4 meals: Breakfast (8 AM), Lunch (1 PM), Snacks (5 PM), Dinner (8:30 PM).
Each meal should have 2-4 realistic Indian food items with quantities (e.g. "1 bowl", "100g", "2 rotis") and per-item calorie estimates.
The sum of all item calories should be close to ${adjusted}.`;

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
              tools: [
                {
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
                },
              ],
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
            return json({ error: "Invalid AI response" }, 500);
          }
          const mealsResult = JSON.parse(toolCall.function.arguments);
          const meals = mealsResult.meals;

          // Save with service role
          const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
          const { data: saved, error: saveErr } = await supabaseAdmin
            .from("diet_plans")
            .insert({
              user_id: userId,
              goal: i.goal,
              diet_preference: i.diet_preference,
              calories: adjusted,
              protein_g,
              carbs_g,
              fats_g,
              meals,
              inputs: i,
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
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
