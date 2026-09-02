import { NextResponse } from "next/server";
import { getInquiriesCollection } from "@/lib/db";

export const runtime = "nodejs";

const VALID_SERVICES = [
  "Web Services",
  "Link-in-Bio",
  "AI Product Photography",
  "Social Media Content",
  "Photoshop / Design",
  "Video",
  "Other",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$|^[0-9]{10}$|^\+91[0-9]{10}$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body || {};

    // Validate Name
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }

    // Validate Email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate Phone Number
    const cleanPhone = phone ? phone.toString().trim() : "";
    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, "").length < 7) {
      return NextResponse.json(
        { error: "Please enter your phone number." },
        { status: 400 }
      );
    }

    // Validate Service
    const selectedService = service && VALID_SERVICES.includes(service)
      ? service
      : "Web Services";

    // Validate Message
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter your message." },
        { status: 400 }
      );
    }

    const now = new Date();
    const inquiryDoc = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      service: selectedService,
      message: message.trim(),
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    const inquiries = await getInquiriesCollection();
    const result = await inquiries.insertOne(inquiryDoc);

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
