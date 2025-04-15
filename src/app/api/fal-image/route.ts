import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

// --- Simple in-memory rate limiter (per user, per minute) ---
const userRateLimit = new Map<string, { count: number, last: number }>();
const LIMIT = 5;
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

const PromptSchema = z.object({
  prompt: z.string().min(1).max(300),
});

// POST: Receives { prompt }, returns image URL from Fal API using the proxy
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please wait and try again." }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parse = PromptSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid input: 'prompt' is required and must be a string (1-300 chars)." }, { status: 400 });
  }
  const { prompt } = parse.data;
  try {
    fal.config({ proxyUrl: "/api/fal/proxy" });
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: { prompt, image_size: "square_hd" },
      pollInterval: 5000,
      logs: false,
    });
    // Extract image URL from Fal API response structure
    const imageUrl = result?.data?.images?.[0]?.url || null;
    return NextResponse.json({ imageUrl });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Fal API error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
