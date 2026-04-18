import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const POST_TYPES = [
  "Value / tip",
  "Product / feature",
  "Founder / story",
  "Hot take / opinion",
  "Behind the scenes",
  "Social proof / milestone",
  "Problem / pain",
  "CTA / engagement",
] as const;

function buildPersona() {
  return `You are a chronically online 22-year-old who has spent 10,000 hours on Reddit, Twitter/X, and TikTok. You grew your accounts to 100,000 followers organically through wit, not budget. You are a marketing specialist who genuinely despises corporate speak and sanitised brand voice.

Your reference points for tone and execution:
- Ryanair on Twitter/X: brutal self-awareness, roasting passengers while they stay on-brand, zero defensiveness, extremely short posts, punching at the industry and themselves simultaneously
- Duolingo on TikTok/X: unhinged mascot energy, hijacking trending memes and news moments, making the product the butt of the joke, never taking itself seriously

Your doctrine: No corporate bullsh*t. No motivational outro. No "excited to share". No em-dashes. No "In today's fast-paced world". No listicles dressed as insight. No posts that could have been written by a 55-year-old VP of Marketing.`;
}

function buildLengthGuidance(postLength: string) {
  if (postLength === "short")
    return `\nPOST LENGTH: Short. Every post should be as punchy and minimal as possible. Twitter: 1-2 sentences max. Instagram: tight hook + 2-3 lines max, no padding. LinkedIn: 60-100 words, no filler. Cut every word that isn't pulling weight.\n`;
  if (postLength === "long")
    return `\nPOST LENGTH: Long. Give posts more room to breathe. Twitter: still under 280 chars but use the full space. Instagram: hook + developed body + CTA, aim for 100-150 words. LinkedIn: 200-300 words, tell a fuller story or make a more developed argument.\n`;
  return `\nPOST LENGTH: Medium. Balanced — not too brief, not padded. Twitter: 1-3 punchy sentences. Instagram: hook + 4-6 lines + CTA. LinkedIn: 100-200 words.\n`;
}

function buildVoiceSection(examplePosts: string[]) {
  const filled = examplePosts?.filter((p: string) => p.trim()) ?? [];
  if (filled.length === 0) return "";
  return `\nThe user has provided the following real posts they've written. Study them carefully to extract their natural voice — notice their sentence length, vocabulary level, what topics they gravitate toward, how they open posts, whether they use questions or statements, their use of punctuation, and any recurring patterns. Mirror this style authentically in every generated post:\n\n${filled
    .map((p: string, i: number) => `[Example ${i + 1}]\n${p.trim()}`)
    .join("\n\n")}\n`;
}

function buildPlatformRules(platforms: string[]) {
  const rules = [];
  if (platforms.includes("twitter"))
    rules.push("- Twitter/X posts must be under 280 characters, hook-first, max 2 hashtags (often zero is better). Think Ryanair: short, sharp, devastating. Respect the POST LENGTH setting.");
  if (platforms.includes("instagram"))
    rules.push("- Instagram posts should have a scroll-stopping hook before the fold, a punchy body, and a CTA that doesn't feel like a CTA. Suggest a visual direction in brackets at the end. Respect the POST LENGTH setting.");
  if (platforms.includes("linkedin"))
    rules.push("- LinkedIn posts should be written like someone who finds LinkedIn cringe but still has to post there. Make the industry or competitors the villain. End with a question or provocation, never a summary of what you just said. Respect the POST LENGTH setting.");
  return rules.join("\n");
}

/* ─────────────────────────────────────────────
   SINGLE MODE — one post, one platform
───────────────────────────────────────────── */
async function handleSingle(body: any) {
  const { product, examplePosts, postLength, platform, topic } = body;

  const lengthGuidance = buildLengthGuidance(postLength);
  const voiceSection   = buildVoiceSection(examplePosts);
  const platformRules  = buildPlatformRules([platform]);

  const prompt = `${buildPersona()}
${lengthGuidance}
You MUST use the web_search tool to find 1-2 currently trending news stories, memes, or cultural moments from the last 7 days relevant to this product's niche. If one fits naturally into the post — as a hook, contrast, or punchline — use it. If nothing fits, don't force it.
${voiceSection}
Here is the product brief:
- Name: ${product.name}
- Tagline: ${product.tagline}
- Target Audience: ${product.targetAudience}
- Key Features: ${product.keyFeatures}

Generate exactly 1 social media post for ${platform === "twitter" ? "Twitter/X" : platform.charAt(0).toUpperCase() + platform.slice(1)}.

Post type: ${topic}

${platformRules}

General rules:
- The post must reference the actual product and audience — no generic content
- Never sound AI-generated. No em-dashes. Write like a human who types fast and doesn't proofread twice
- DON'T BE BORING. If it could appear in a brand guidelines deck, delete it and start over

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "post": "the post content here"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    tools: [{ type: "web_search_20250305", name: "web_search" } as any],
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content.filter(b => b.type === "text").map(b => (b as any).text).join("");
  const parsed = JSON.parse(raw);

  return NextResponse.json({
    success: true,
    mode: "single",
    data: { platform, topic, post: parsed.post },
  });
}

/* ─────────────────────────────────────────────
   BATCH MODE — N batches × M platforms
   Each batch has its own topic; all batches
   share the same platforms and length.
   Returns: { batches: [ { batchIndex, topic, posts: { platform: content } } ] }
───────────────────────────────────────────── */
async function handleBatch(body: any) {
  const { product, examplePosts, previousAngles, postLength, platforms, batchTopics } = body;
  // batchTopics: string[]  — one topic per batch, length = number of batches

  const lengthGuidance = buildLengthGuidance(postLength);
  const voiceSection   = buildVoiceSection(examplePosts);
  const platformRules  = buildPlatformRules(platforms);

  const historySection =
    previousAngles && previousAngles.length > 0
      ? `\nThis user has generated content before. Here are the angles and post types already used, from oldest to most recent:\n${previousAngles
          .map((summary: string, i: number) => `- Session ${i + 1}: ${summary}`)
          .join("\n")}\n\nDo NOT repeat any of these angles, opening hooks, or post types. Choose fresh angles.\n`
      : "";

  const batchCount = batchTopics.length;

  const batchDescriptions = batchTopics
    .map((topic: string, i: number) => `- Batch ${i + 1}: ${topic}`)
    .join("\n");

  const prompt = `${buildPersona()}
${lengthGuidance}
You MUST use the web_search tool to find up to 5 currently trending news stories, memes, or cultural moments from the last 7 days relevant to this product's niche. Use as many as possible across the batches — wherever a reference fits organically as a hook, contrast, or punchline. You decide whether to name it explicitly or weave it in subtly. Only skip a story if it genuinely doesn't fit.
${voiceSection}${historySection}
Here is the product brief:
- Name: ${product.name}
- Tagline: ${product.tagline}
- Target Audience: ${product.targetAudience}
- Key Features: ${product.keyFeatures}

Generate ${batchCount} batch${batchCount > 1 ? "es" : ""} of social media content for the following platforms: ${platforms.join(", ")}.

Each batch has a specific post type/topic:
${batchDescriptions}

${platformRules}

General rules:
- Each batch must have exactly 1 post per platform
- Every post must reference the actual product and audience — no generic content
- Vary opening lines across all batches — no two posts should start the same way
- Never sound AI-generated. No em-dashes. Write like a human who types fast and doesn't proofread twice
- DON'T BE BORING. If a post could appear in a brand guidelines deck, delete it and start over

Respond ONLY with a valid JSON object in this exact structure, no markdown, no explanation:
{
  "angleSummary": "Batch 1: Value tip (specific angle), Batch 2: Hot take (specific angle), ...",
  "batches": [
    {
      "batchIndex": 1,
      "topic": "Value / tip",
      "posts": {
        "twitter": "post content here",
        "instagram": "post content here",
        "linkedin": "post content here"
      }
    }
  ]
}

The "angleSummary" must list each batch's topic and specific angle used — this is used to avoid repetition in future generations.
Only include platforms from this list: ${platforms.join(", ")}.
The batches array must contain exactly ${batchCount} objects.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    tools: [{ type: "web_search_20250305", name: "web_search" } as any],
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content.filter(b => b.type === "text").map(b => (b as any).text).join("");
  const parsed = JSON.parse(raw);

  return NextResponse.json({
    success: true,
    mode: "batch",
    data: { batches: parsed.batches },
    angleSummary: parsed.angleSummary ?? null,
  });
}

/* ─────────────────────────────────────────────
   MAIN HANDLER
───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode } = body;

    if (mode === "single") return await handleSingle(body);
    if (mode === "batch")  return await handleBatch(body);

    return NextResponse.json({ success: false, error: "Invalid mode. Must be 'single' or 'batch'." }, { status: 400 });
  } catch (err: any) {
    console.error("Full error:", JSON.stringify(err?.error ?? err, null, 2));
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}