import { NextResponse } from "next/server";
import {
  getBioPageCollection,
  getBioSectionsCollection,
  getProductsCollection,
  getLinksCollection,
} from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [bioPageCol, bioSectionsCol, productsCol, linksCol] = await Promise.all([
      getBioPageCollection(),
      getBioSectionsCollection(),
      getProductsCollection(),
      getLinksCollection(),
    ]);

    const now = new Date();

    // Publish profile
    await bioPageCol.updateOne(
      { key: "default" },
      { $set: { status: "Published", publishedAt: now, updatedAt: now } },
      { upsert: true }
    );

    // Publish all sections
    await bioSectionsCol.updateMany(
      {},
      { $set: { status: "Published", updatedAt: now } }
    );

    // Also publish any draft products so they appear live immediately
    await productsCol.updateMany(
      { status: "Draft" },
      { $set: { status: "Published", updatedAt: now } }
    );

    const [profile, sections] = await Promise.all([
      bioPageCol.findOne({ key: "default" }),
      bioSectionsCol.find({}).sort({ order: 1 }).toArray(),
    ]);

    return NextResponse.json({
      success: true,
      message: "Bio page changes published successfully! Live page is updated.",
      profile,
      sections,
    });
  } catch (err) {
    console.error("Bio publish error:", err);
    return NextResponse.json({ error: "Failed to publish bio changes." }, { status: 500 });
  }
}
