import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// --- Simple in-memory rate limiter (per user, per minute) ---
const userRateLimit = new Map<string, { count: number, last: number }>();
const LIMIT = 5; // requests per minute

function checkRateLimit(userId: string) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const entry = userRateLimit.get(userId);
  if (entry && entry.last > windowStart) {
    if (entry.count >= LIMIT) return false;
    entry.count++;
    entry.last = now;
    userRateLimit.set(userId, entry);
    return true;
  }
  userRateLimit.set(userId, { count: 1, last: now });
  return true;
}

// --- Zod validation ---
const SuggestSchema = z.object({
  context: z.string().min(1).max(1000),
});

// Optionally: import OpenAI or Vercel AI SDK
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit check
  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please wait and try again." }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parse = SuggestSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid input: 'context' is required and must be a string (1-1000 chars)." }, { status: 400 });
  }
  const { context } = parse.data;

  // Compose prompt from context/tasks
  const prompt = `You are an expert productivity assistant. Based on the following context, suggest 3 actionable, specific, and creative tasks for the user.\nContext: ${context}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: "You are an expert productivity assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    const text = completion.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ suggestions: text });
  } catch {
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
  }
}
