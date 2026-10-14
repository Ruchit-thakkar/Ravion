import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getProductsCollection } from "@/lib/db";
import { requireAdminSession, verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    let objId;
    try {
      objId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Invalid product identifier." }, { status: 400 });
    }

    const productsCol = await getProductsCollection();
    const product = await productsCol.findOne({ _id: objId });

    if (!product || product.status !== "Published") {
      return NextResponse.json({ error: "Product not available for download." }, { status: 404 });
    }

    if (product.type !== "digital" || !product.fileUrl) {
      return NextResponse.json(
        { error: "This product does not have a direct file delivery configured." },
        { status: 400 }
      );
    }

    const isFree = !product.price || product.price === 0;

    // If it's a paid product, require valid authorization (admin session or verification token)
    if (!isFree) {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get("token");
      const admin = await requireAdminSession(request);

      const isValidToken = token ? verifyToken(token) : false;

      if (!admin && !isValidToken) {
        return NextResponse.json(
          {
            error: "Authorization required. Please purchase this product via the checkout link to receive access.",
            purchaseUrl: product.purchaseUrl || null,
          },
          { status: 403 }
        );
      }
    }

    // Product is verified: redirect to secure cloud delivery URL or serve
    return NextResponse.redirect(product.fileUrl);
  } catch (err) {
    console.error("GET download error:", err);
    return NextResponse.json({ error: "Download could not be processed." }, { status: 500 });
  }
}
