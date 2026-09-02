import { NextResponse } from "next/server";
import { db, missing } from "@/lib/server";
export const runtime = "nodejs";
export async function GET(request) { const absent = missing(["MONGODB_URI"]); if (absent.length) return NextResponse.json({ error: `Missing: ${absent.join(", ")}` }, { status: 503 }); const category = new URL(request.url).searchParams.get("category"); const data = await (await db()).collection("samples").find(category ? { category, status: "Published" } : { status: "Published" }).sort({ createdAt: -1 }).toArray(); return NextResponse.json(data); }
