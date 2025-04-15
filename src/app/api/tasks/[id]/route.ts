import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { query } from "@/db";

// GET: Get a single task by id
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await query(
    `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

// PUT: Update a task
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, description, priority, status, due_date, image_url } = body;
  const { rows } = await query(
    `UPDATE tasks SET title=$1, description=$2, priority=$3, status=$4, due_date=$5, image_url=$6, updated_at=NOW()
     WHERE id=$7 AND user_id=$8 RETURNING *`,
    [title, description, priority, status, due_date, image_url, id, userId]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

// DELETE: Delete a task
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { rows } = await query(
    `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  return NextResponse.json({ success: true });
}
