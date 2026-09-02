import { NextResponse } from "next/server";
import { db, missing } from "@/lib/server";
export const runtime = "nodejs";
export async function POST(request) { if (missing(["MONGODB_URI"]).length) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 }); const { name, email, phone = "", service = "", message } = await request.json(); if (!name || !email || !message) return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 }); await (await db()).collection("inquiries").insertOne({ name, email, phone, service, message, status: "New", createdAt: new Date() }); return NextResponse.json({ ok: true }, { status: 201 }); }
