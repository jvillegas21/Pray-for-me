// @ts-ignore deno std types
import { serve } from "std/server";
// @ts-ignore deno esm
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore deno openai
import OpenAI from "https://deno.land/x/openai@v4.18.0/mod.ts";

serve(async (req) => {
  try {
    const { prayer_id } = await req.json();
    if (!prayer_id) {
      return new Response(JSON.stringify({ error: "prayer_id is required" }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: prayerRow, error: prayerError } = await supabase
      .from("prayers")
      .select("body")
      .eq("id", prayer_id)
      .single();

    if (prayerError || !prayerRow) {
      throw new Error("Prayer not found");
    }

    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_KEY") });

    const prompt = `You are a Bible scholar. Recommend 3-5 Bible verses relevant to the following prayer and provide a short guided study with 3 reflection questions.\n\nPrayer: "${prayerRow.body}"\n\nReturn strict JSON with shape: {\n  \"verses\": [{ \"reference\": string, \"text\": string, \"why\": string }],\n  \"study\": { \"title\": string, \"steps\": [string] }\n}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message?.content || "{}";
    const parsed = JSON.parse(content);

    await supabase.from("prayer_ai_suggestions").upsert({
      prayer_id,
      verses: parsed.verses,
      study: parsed.study,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});