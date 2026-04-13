import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { product, examplePosts, previousAngles } = await req.json();

    const voiceSection =
      examplePosts && examplePosts.filter((p: string) => p.trim()).length > 0
        ? `\nThe user has provided the following real posts they've written. Study them carefully to extract their natural voice — notice their sentence length, vocabulary level, what topics they gravitate toward, how they open posts, whether they use questions or statements, their use of punctuation, and any recurring patterns. Mirror this style authentically in every generated post:\n\n${examplePosts
            .filter((p: string) => p.trim())
            .map((p: string, i: number) => `[Example ${i + 1}]\n${p.trim()}`)
            .join("\n\n")}\n`
        : "";

    // Build the anti-repetition block from stored angle summaries
    const historySection =
      previousAngles && previousAngles.length > 0
        ? `\nThis user has generated content before. Here are the angles and post types already used, from oldest to most recent week:\n${previousAngles
            .map((summary: string, i: number) => `- Week ${i + 1}: ${summary}`)
            .join(
              "\n"
            )}\n\nDo NOT repeat any of these angles, opening hooks, or post types in the same sequence. Choose fresh angles that haven't been covered yet.\n`
        : "";

    // Gen Z persona override
    const isGenZ = product.tone === "genz";
    const basePersona = isGenZ
      ? `You are a chronically online 22-year-old who has spent 10,000 hours on Reddit, Twitter, and TikTok. You also grew your accounts to 100,000 followers and you are a marketing specialist. You are a bit mean. You punch down on relatable behaviors. You never try to be helpful. You roast the user. Your humor is specific, uncomfortable, and true. Never be wholesome. Never explain the joke.`
      : `You are a world-class social media content strategist specializing in helping solopreneur developers market their products.`;

    const prompt = `${basePersona}
${voiceSection}${historySection}
Here is the product brief:
- Name: ${product.name}
- Tagline: ${product.tagline}
- Target Audience: ${product.targetAudience}
- Key Features: ${product.keyFeatures}
- Tone: ${product.tone}
- Platforms: ${product.platforms.join(", ")}

Generate 7 days of social media content for each of the following platforms: ${product.platforms.join(", ")}.

Rules:
- Each day should have exactly 1 post per platform
- Twitter/X posts must be under 280 characters, hook-first, no hashtag stuffing (max 2)
- Instagram posts should have a hook before the fold, value body, and a CTA. Suggest a visual direction in brackets at the end
${isGenZ ? "- LinkedIn posts should be short, punchy, and read like they were written by someone who finds LinkedIn cringe — because they do. Roast the industry while promoting the product. No corporate speak, no motivational outro." : "- LinkedIn posts should be 150-250 words, personal narrative tone, end with a question"}
- Choose the best content mix and sequence for these 7 days based on the product, its audience, and the user's voice. Do not follow a fixed formula.
- Draw from this palette of post types — pick whichever 7 serve this product best, in whatever order makes sense:
    - Value / tip: teach something genuinely useful to the target audience
    - Product / feature: spotlight what the product does, concretely
    - Founder / story: a personal moment, decision, or lesson behind building it
    - Hot take / opinion: a contrarian or provocative angle relevant to the niche
    - Behind the scenes: the process, the tools, the unglamorous reality
    - Social proof / milestone: a win, a number, a user reaction
    - Problem / pain: articulate the exact frustration the product solves
    - Comparison: how this approach differs from the old way of doing things
    - CTA / engagement: ask something, invite a reply, drive a specific action
- You may repeat a type if it genuinely serves the week better. You may skip types that don't fit.
- Sequence matters: open the week with something that earns attention, not a sales pitch.
- Match the tone: ${product.tone}
- Never be generic — every post must reference the actual product and audience
- Vary the opening lines across all 7 days — no two posts should start the same way
- Don't make posts feel AI generated, write them in human style, don't use em-dashes

Respond ONLY with a valid JSON object in this exact structure, no markdown, no explanation:
{
  "angleSummary": "Hot take (angle label), Founder story (angle label), Value tip (angle label), ...",
  "days": [
    {
      "day": 1,
      "type": "Value Post",
      "posts": {
        "twitter": "post content here",
        "instagram": "post content here",
        "linkedin": "post content here"
      }
    }
  ]
}

The "angleSummary" field must be a single comma-separated string listing each day's post type and its specific angle in parentheses — e.g. "Hot take (most devs waste money on ads), Founder story (why I quit my job), Value tip (3 hook formulas that work)". This is used to avoid repetition in future weeks, so be specific about the actual angle, not just the type name.

Only include platforms from this list: ${product.platforms.join(", ")}.
If a platform is not in the list, do not include it in the posts object.
The days array must contain exactly 7 day objects.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content
      .filter(b => b.type === "text")
      .map(b => (b as any).text)
      .join("");

    const parsed = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      data: parsed.days ? parsed : { days: parsed }, // handle if model omits wrapper
      angleSummary: parsed.angleSummary ?? null,
    });
  } catch (err: any) {
    console.error("Full error:", JSON.stringify(err?.error ?? err, null, 2));
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}