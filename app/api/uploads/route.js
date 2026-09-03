import { NextResponse } from "next/server";
import { imagekit, missing, slugify } from "@/lib/server";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".webm", ".mov", ".avi", ".m4v"];

function isVideoFile(fileName, mimeType) {
  if (mimeType && mimeType.startsWith("video/")) return true;
  const lowerName = (fileName || "").toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export async function POST(request) {
  try {
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const absent = missing([
      "IMAGEKIT_PUBLIC_KEY",
      "IMAGEKIT_PRIVATE_KEY",
      "IMAGEKIT_URL_ENDPOINT",
    ]);
    if (absent.length) {
      return NextResponse.json(
        { error: `Missing ImageKit configuration: ${absent.join(", ")}` },
        { status: 503 }
      );
    }

    const form = await request.formData();
    // Accept either "files" or "images" key from FormData
    const uploadedFiles = [
      ...form.getAll("files"),
      ...form.getAll("images"),
    ].filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);

    if (!uploadedFiles.length) {
      return NextResponse.json(
        { error: "Please select at least one photo or video to upload." },
        { status: 400 }
      );
    }

    const kit = imagekit();

    const uploadedMedia = await Promise.all(
      uploadedFiles.map(async (file) => {
        const isVideo = isVideoFile(file.name, file.type);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeBaseName = slugify(file.name.replace(/\.[^/.]+$/, "")) || "media";
        const extension = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
        const fileName = `${Date.now()}-${safeBaseName}${extension}`;

        const uploadResult = await kit.upload({
          file: buffer.toString("base64"),
          fileName,
          folder: "/ravion/samples",
          useUniqueFileName: true,
          tags: [isVideo ? "video" : "image", "sample"],
        });

        return {
          url: uploadResult.url,
          fileId: uploadResult.fileId,
          name: file.name,
          fileType: isVideo ? "video" : "image",
          thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
        };
      })
    );

    return NextResponse.json({ media: uploadedMedia, images: uploadedMedia }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload to ImageKit failed." },
      { status: 500 }
    );
  }
}
