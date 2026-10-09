import { getDatabase } from "./db.js";
import ImageKit from "imagekit";

export function missing(keys) {
  return keys.filter((key) => !process.env[key]);
}

export async function db() {
  return await getDatabase();
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function imagekit() {
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}
