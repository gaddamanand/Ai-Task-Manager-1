import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// export const runtime = "edge";

// --- Simple in-memory rate limiter (per user, per minute) ---
const userRateLimit = new Map<string, { count: number, last: number }>();
const LIMIT = 10;
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

// POST: Receives audio blob, returns transcript using ElevenLabs API
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please wait and try again." }, { status: 429 });
  }
  const formData = await req.formData();
  const audio = formData.get("audio");
  if (!audio || !(audio instanceof Blob)) return NextResponse.json({ error: "No audio provided" }, { status: 400 });

  // ElevenLabs API now requires model_id and file in the body
  const elevenForm = new FormData();
  elevenForm.append("file", audio as Blob, "recording.webm");
  elevenForm.append("model_id", "scribe_v1");

  // console.log("audio type:", (audio as Blob).type, "size:", (audio as Blob).size);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing ElevenLabs API key" }, { status: 500 });

  const elevenRes = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey as string,
    },
    body: elevenForm,
  });

  if (!elevenRes.ok) {
    const err = await elevenRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }
  const data = await elevenRes.json();
  return NextResponse.json({ transcript: data.text || data.transcript || "" });
}
