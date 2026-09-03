import { NextResponse } from "next/server";
import { getCategoriesCollection, ensureDefaultCategories } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDefaultCategories();
    const categoriesCol = await getCategoriesCollection();
    const categories = await categoriesCol.find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}
