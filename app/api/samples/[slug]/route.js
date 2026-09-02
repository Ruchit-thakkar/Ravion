import { NextResponse } from "next/server";
import { db } from "@/lib/server";
export const runtime = "nodejs";
export async function GET(_request, { params }) { const { slug } = await params; const item = await (await db()).collection("samples").findOne({ slug, status: "Published" }); return item ? NextResponse.json(item) : NextResponse.json({ error: "Sample not found." }, { status: 404 }); }
