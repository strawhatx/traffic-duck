// Simple AI helpers with fallback across Grok → OpenAI → Gemini.
// Implemented with fetch to avoid extra SDK dependencies.

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function stripFences(text: string): string {
  return String(text || "").replace(/```json|```/g, "").trim();
}

export async function callGrok(
  prompts: ChatMessage[],
  temperature = 0.4,
): Promise<string> {
  const xaiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY || "";
  if (!xaiKey) return "";
  const baseURL = process.env.XAI_BASE_URL || "https://api.x.ai/v1";
  const model = process.env.XAI_MODEL || "grok-2-latest";
  try {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${xaiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: prompts,
        temperature,
      }),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return stripFences(data?.choices?.[0]?.message?.content || "");
  } catch {
    return "";
  }
}

export async function callOpenAI(
  prompts: ChatMessage[],
  temperature = 0.4,
): Promise<string> {
  const key = process.env.OPENAI_API_KEY || "";
  if (!key) return "";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: prompts,
        temperature,
      }),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return stripFences(data?.choices?.[0]?.message?.content || "");
  } catch {
    return "";
  }
}

export async function callGemini(
  prompts: ChatMessage[],
  temperature = 0.4,
): Promise<string> {
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_KEY || "";
  if (!geminiKey) return "";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompts.map((h) => `${h.role}: ${h.content}`).join("\n"),
                },
              ],
            },
          ],
          generationConfig: { temperature },
        }),
      },
    );
    if (!res.ok) return "";
    const rj: any = await res.json();
    const text = rj?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return stripFences(text);
  } catch {
    return "";
  }
}

export async function generateJsonFromPrompt(
  prompts: ChatMessage[],
  temperature = 0.4,
): Promise<string> {
  const grok = await callGrok(prompts, temperature);
  if (grok) return grok;
  const openai = await callOpenAI(prompts, temperature);
  if (openai) return openai;
  const gemini = await callGemini(prompts, temperature);
  if (gemini) return gemini;
  return "";
}

export async function generateIntentsFromAI(
  nicheDescription: string,
  maxIntents = 12,
): Promise<string[]> {
  const prompts: ChatMessage[] = [
    {
      role: "system",
      content:
        "You generate problem-oriented search queries that mirror how users ask for help, compare options, or describe pain points on social sites. Return strict JSON only.",
    },
    {
      role: "user",
      content:
        `From the following niche description, generate 2 concise, problem-style queries (4-10 words each).` +
        " Use first-person or help-seeking phrasing like 'can't', 'how do I', 'struggling to', 'need', 'looking for'." +
        " Avoid brand names and avoid marketing fluff. Favor verbs and concrete outcomes." +
        " These should match Reddit/Twitter conversations where people seek help, compare approaches, or ask for tips." +
        " Output strict JSON only: { \"intents\": string[] } with high-variance, non-overlapping phrases." +
        ` Niche: "${nicheDescription || ""}"`,
    },
  ];

  const response = await generateJsonFromPrompt(prompts, 0.4);
  if (!response) return [];
  try {
    const parsed = JSON.parse(response);
    const intents = Array.isArray(parsed?.intents) ? parsed.intents : [];
    return Array.from(
      new Set(
        intents
          .map((s: unknown) => String(s || "").trim())
          .filter((s: string) => s.length > 0),
      ),
    );
  } catch {
    return [];
  }
}


