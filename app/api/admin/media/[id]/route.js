import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import ImageKit from "imagekit";
import {
  getMediaCollection,
  getProductsCollection,
  getBioPageCollection,
  getSamplesCollection,
} from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

function getImageKitInstance() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }
  return new ImageKit({ publicKey, privateKey, urlEndpoint });
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    let objId;
    try {
      objId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "Invalid media ID." }, { status: 400 });
    }

    const mediaCol = await getMediaCollection();
    const asset = await mediaCol.findOne({ _id: objId });
    if (!asset) {
      return NextResponse.json({ error: "Media asset not found." }, { status: 404 });
    }

    // Safety check: Check if file is still referenced in products, bio page, or samples
    const [productsCol, bioCol, samplesCol] = await Promise.all([
      getProductsCollection(),
      getBioPageCollection(),
      getSamplesCollection(),
    ]);

    const assetUrl = asset.url;
    const [productRefCount, bioRefCount, sampleRefCount] = await Promise.all([
      productsCol.countDocuments({
        $or: [
          { thumbnail: assetUrl },
          { previewImages: assetUrl },
          { fileUrl: assetUrl },
        ],
      }),
      bioCol.countDocuments({
        $or: [{ avatarUrl: assetUrl }, { coverUrl: assetUrl }],
      }),
      samplesCol.countDocuments({
        $or: [
          { thumbnail: assetUrl },
          { "images.url": assetUrl },
          { "media.url": assetUrl },
        ],
      }),
    ]);

    const totalRefs = productRefCount + bioRefCount + sampleRefCount;
    if (totalRefs > 0) {
      return NextResponse.json(
        {
          error: `This media asset is currently referenced by ${totalRefs} item(s) on your website. Please reassign or remove references before deleting.`,
          referenced: true,
          referenceCount: totalRefs,
        },
        { status: 409 }
      );
    }

    // Attempt to delete from ImageKit if fileId exists
    if (asset.fileId && !asset.fileId.startsWith("ext-")) {
      const kit = getImageKitInstance();
      if (kit) {
        try {
          await kit.deleteFile(asset.fileId);
        } catch (ikErr) {
          console.warn("Could not delete from ImageKit storage:", ikErr.message);
        }
      }
    }

    await mediaCol.deleteOne({ _id: objId });
    return NextResponse.json({ success: true, message: "Media asset deleted successfully." });
  } catch (err) {
    console.error("DELETE media error:", err);
    return NextResponse.json({ error: "Failed to delete media asset." }, { status: 500 });
  }
}
