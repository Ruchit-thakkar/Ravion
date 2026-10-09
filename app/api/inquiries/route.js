import { NextResponse } from "next/server";
import { getInquiriesCollection } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

// Sliding window IP rate limiter for public inquiry form
const inquiryAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_INQUIRIES_PER_WINDOW = 6;

function isRateLimited(ip) {
  const now = Date.now();
  const record = inquiryAttempts.get(ip);
  if (!record) return false;

  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    inquiryAttempts.delete(ip);
    return false;
  }

  return record.count >= MAX_INQUIRIES_PER_WINDOW;
}

function recordInquiry(ip) {
  const now = Date.now();
  const record = inquiryAttempts.get(ip);
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    inquiryAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
  }
}

function sanitizeText(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/[<>]/g, "") // remove potential HTML tag delimiters
    .trim();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many inquiries sent from this device. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, phone, service, message, hp } = body || {};

    // 1. Honeypot check: If bot filled the hidden honeypot field, return 200 without saving
    if (hp && String(hp).trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Inquiry sent successfully." },
        { status: 200 }
      );
    }

    // 2. Validate Name
    const cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: "Please enter your name (2 to 100 characters)." },
        { status: 400 }
      );
    }

    // 3. Validate Email
    const cleanEmail = (email || "").toLowerCase().trim();
    if (!cleanEmail || cleanEmail.length > 120 || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 4. Validate Phone Number
    const rawPhone = String(phone || "").trim();
    const cleanPhoneDigits = rawPhone.replace(/[^0-9]/g, "");
    if (!rawPhone || cleanPhoneDigits.length < 7 || rawPhone.length > 25) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    // 5. Validate Service
    const validServices = siteConfig.categories || [
      "Web Services",
      "Link-in-Bio",
      "AI Product Photography",
      "Social Media Content",
      "Photoshop / Design",
      "Video",
      "Other",
    ];
    const cleanService = validServices.includes(service) ? service : "Web Services";

    // 6. Validate Message
    const cleanMessage = sanitizeText(message);
    if (!cleanMessage || cleanMessage.length < 5 || cleanMessage.length > 3000) {
      return NextResponse.json(
        { error: "Please enter a message (between 5 and 3000 characters)." },
        { status: 400 }
      );
    }

    // Record rate-limit usage
    recordInquiry(ip);

    const now = new Date();
    const inquiryDoc = {
      name: cleanName,
      email: cleanEmail,
      phone: rawPhone,
      service: cleanService,
      message: cleanMessage,
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    const inquiries = await getInquiriesCollection();
    const result = await inquiries.insertOne(inquiryDoc);

    // Optional notification logging
    if (process.env.NOTIFICATION_EMAIL) {
      console.log(`[INQUIRY] New inquiry from ${cleanName} (${cleanEmail}) for ${cleanService}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry sent successfully.",
        id: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[INQUIRY_POST_ERROR]", err);
    return NextResponse.json(
      { error: "Something went wrong while submitting your inquiry. Please try again." },
      { status: 500 }
    );
  }
}
