import { NextResponse } from "next/server";
import { getNewsletterCollection } from "@/lib/db";

export const runtime = "nodejs";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const newsletterCol = await getNewsletterCollection();
    const existing = await newsletterCol.findOne({ email });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You are already subscribed to the list!",
      });
    }

    await newsletterCol.insertOne({
      email,
      source: body.source || "bio_page",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for subscribing! Check your inbox soon.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/newsletter error:", err);
    return NextResponse.json({ error: "Subscription could not be processed." }, { status: 500 });
  }
}
