import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("API KEY:", process.env.ANTHROPIC_API_KEY?.slice(0, 12));
  try {
    const { product } = await req.json();

    const prompt = `You are a world-class social media content strategist specializing in helping solopreneur developers market their products.

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
- Mix content types across the 7 days in this order:
    Day 1 = Value post
    Day 2 = Product / feature post
    Day 3 = Story / founder post
    Day 4 = Hot take / opinion post
    Day 5 = Behind the scenes post
    Day 6 = Social proof / milestone post
    Day 7 = CTA / engagement post
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