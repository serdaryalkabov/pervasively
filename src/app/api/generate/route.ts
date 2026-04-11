import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("API KEY:", process.env.ANTHROPIC_API_KEY?.slice(0, 12));
  try {
    const { product, examplePosts } = await req.json();

    const voiceSection = examplePosts && examplePosts.filter((p: string) => p.trim()).length > 0
      ? `\nThe user has provided the following real posts they've written. Study them carefully to extract their natural voice — notice their sentence length, vocabulary level, what topics they gravitate toward, how they open posts, whether they use questions or statements, their use of punctuation, and any recurring patterns. Mirror this style authentically in every generated post:\n\n${examplePosts.filter((p: string) => p.trim()).map((p: string, i: number) => `[Example ${i + 1}]\n${p.trim()}`).join("\n\n")}\n`
      : "";

    const prompt = `You are a world-class social media content strategist specializing in helping solopreneur developers market their products.
${voiceSection}
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
- LinkedIn posts should be 150-250 words, personal narrative tone, end with a question
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
  "days": [
    {
      "day": 1,
      "type": "Value Post",
      "posts": {
        "twitter": "post content here",
        "instagram": "post content here",
        "linkedin": "post content here"
      }
    },
    {
      "day": 2,
      "type": "Product Post",
      "posts": {
        "twitter": "post content here",
        "instagram": "post content here",
        "linkedin": "post content here"
      }
    }
  ]
}

Only include platforms from this list: ${product.platforms.join(", ")}.
If a platform is not in the list, do not include it in the posts object.
The array must contain exactly 7 day objects.`;

    console.log("KEY AT CALL TIME:", process.env.ANTHROPIC_API_KEY?.slice(0, 15));

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content
      .filter(b => b.type === "text")
      .map(b => (b as any).text)
      .join("");

    const parsed = JSON.parse(raw);

    return NextResponse.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Full error:", JSON.stringify(err?.error ?? err, null, 2));
    console.error("Status:", err?.status);
    console.error("Headers:", err?.headers);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}