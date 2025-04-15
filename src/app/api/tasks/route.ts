import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/db";
import { z } from "zod";

// --- Simple in-memory rate limiter (per user, per hour) ---
const userTaskLimit = new Map<string, { count: number, last: number }>();
const LIMIT = 20; // tasks per hour
function checkTaskRateLimit(userId: string) {
  const now = Date.now();
  const windowStart = now - 60 * 60_000;
  const entry = userTaskLimit.get(userId);
  if (entry && entry.last > windowStart) {
    if (entry.count >= LIMIT) return false;
    entry.count++;
    entry.last = now;
    userTaskLimit.set(userId, entry);
    return true;
  }
  userTaskLimit.set(userId, { count: 1, last: now });
  return true;
}

const TaskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.preprocess(
    (val) => val === "Todo" ? "To Do" : val,
    z.enum(["To Do", "In Progress", "Done"])
  ),
  due_date: z
    .preprocess(
      (val) => {
        if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
          // Convert YYYY-MM-DD to ISO string
          return new Date(val).toISOString();
        }
        return val;
      },
      z.string().datetime().optional().or(z.null())
    ),
  image_url: z.string().url().optional().or(z.null()),
});

// GET: List all tasks for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await query(
    `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return NextResponse.json(rows);
}

// POST: Create a new task
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkTaskRateLimit(userId)) {
    return NextResponse.json({ error: "Task creation rate limit exceeded. Please wait and try again." }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parse = TaskSchema.safeParse(body);
  if (!parse.success) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Task validation error:', parse.error);
    }
    return NextResponse.json({ error: "Invalid input: Please provide valid task fields.", details: process.env.NODE_ENV !== 'production' ? parse.error : undefined }, { status: 400 });
  }
  const { title, description, priority, status, due_date, image_url } = parse.data;
  const { rows } = await query(
    `INSERT INTO tasks (user_id, title, description, priority, status, due_date, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, title, description, priority, status, due_date, image_url]
  );
  return NextResponse.json(rows[0]);
}

// PATCH: Update a task (by id, only if owned by user)
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { id, ...fields } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Task id required." }, { status: 400 });
  }
  // Only allow updating valid fields
  const parse = TaskSchema.partial().safeParse(fields);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid update fields." }, { status: 400 });
  }
  // Check ownership
  const { rows: found } = await query(
    `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!found.length) return NextResponse.json({ error: "Task not found or not yours." }, { status: 404 });
  // Build update query
  const updates = Object.keys(parse.data).map((k, i) => `${k} = $${i + 3}`);
  const values = [userId, id, ...Object.values(parse.data)];
  if (!updates.length) return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  const { rows } = await query(
    `UPDATE tasks SET ${updates.join(", ")} WHERE user_id = $1 AND id = $2 RETURNING *`,
    values
  );
  return NextResponse.json(rows[0]);
}

// DELETE: Delete a task (by id, only if owned by user)
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { id } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Task id required." }, { status: 400 });
  }
  // Check ownership
  const { rows: found } = await query(
    `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!found.length) return NextResponse.json({ error: "Task not found or not yours." }, { status: 404 });
  await query(
    `DELETE FROM tasks WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return NextResponse.json({ success: true });
}
