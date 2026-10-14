import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { requireAdminSession } from "@/lib/auth";
import { getMediaCollection } from "@/lib/db";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max per file
const MAX_FILES_PER_REQUEST = 10;

const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/avi",
  "video/x-msvideo",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".mp4",
  ".mov",
  ".webm",
  ".mkv",
  ".avi",
];

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"];

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isVideo(fileName, mimeType) {
  if (mimeType && ALLOWED_VIDEO_MIMES.includes(mimeType.toLowerCase())) return true;
  const lower = (fileName || "").toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isValidFileType(fileName, mimeType) {
  const lowerName = (fileName || "").toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime =
    ALLOWED_IMAGE_MIMES.includes(mimeType?.toLowerCase()) ||
    ALLOWED_VIDEO_MIMES.includes(mimeType?.toLowerCase());
  return hasValidExt || hasValidMime;
}

function getImageKitInstance() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit configuration is missing in environment variables.");
  }

  return new ImageKit({ publicKey, privateKey, urlEndpoint });
}

export async function POST(request) {
  try {
    // 1. Authorize admin
    const admin = await requireAdminSession(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Check ImageKit credentials
    let kit;
    try {
      kit = getImageKitInstance();
    } catch (configErr) {
      return NextResponse.json(
        { error: "ImageKit cloud storage is not configured." },
        { status: 503 }
      );
    }

    // 3. Parse FormData
    const form = await request.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }

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

    if (uploadedFiles.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `You can upload a maximum of ${MAX_FILES_PER_REQUEST} files at once.` },
        { status: 400 }
      );
    }

    // 4. Validate each file size and type
    for (const file of uploadedFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum allowed size of 25MB.` },
          { status: 400 }
        );
      }

      if (!isValidFileType(file.name, file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" has an unsupported format. Supported formats: images (JPG, PNG, WebP, SVG) and videos (MP4, MOV, WebM).` },
          { status: 400 }
        );
      }
    }

    // 5. Upload files to ImageKit securely
    const uploadedMedia = await Promise.all(
      uploadedFiles.map(async (file) => {
        const videoType = isVideo(file.name, file.type);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const safeBaseName = slugify(file.name.replace(/\.[^/.]+$/, "")) || "media";
        const extension = file.name.includes(".") ? `.${file.name.split(".").pop().toLowerCase()}` : "";
        const fileName = `${Date.now()}-${safeBaseName}${extension}`;

        const uploadResult = await kit.upload({
          file: buffer.toString("base64"),
          fileName,
          folder: "/ravion/samples",
          useUniqueFileName: true,
          tags: [videoType ? "video" : "image", "sample"],
        });

        return {
          url: uploadResult.url,
          fileId: uploadResult.fileId,
          name: file.name,
          fileType: videoType ? "video" : "image",
          thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
          size: file.size,
          mimeType: file.type,
        };
      })
    );

    // Save metadata to media collection for Central Media Library
    try {
      const mediaCol = await getMediaCollection();
      const mediaDocs = uploadedMedia.map((m) => ({
        fileId: m.fileId,
        name: m.name,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        fileType: m.fileType,
        size: m.size,
        mimeType: m.mimeType,
        tags: [m.fileType],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await mediaCol.insertMany(mediaDocs);
    } catch (dbErr) {
      console.warn("Could not record media assets in DB:", dbErr.message);
    }

    return NextResponse.json(
      { media: uploadedMedia, images: uploadedMedia },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error.message);
    return NextResponse.json(
      { error: error.message || "Upload to ImageKit failed." },
      { status: 500 }
    );
  }
}
