import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import ImageKit from "imagekit";

let client;
export function missing(keys) { return keys.filter((key) => !process.env[key]); }
export async function db() { if (!client) { client = new MongoClient(process.env.MONGODB_URI); await client.connect(); } return client.db(process.env.MONGODB_DB || "ravion"); }
export function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
export function tokenFrom(request) { return request.headers.get("authorization")?.replace("Bearer ", ""); }
export function requireAdmin(request) { const token = tokenFrom(request); if (!token || !process.env.JWT_SECRET) throw new Error("Unauthorized"); return jwt.verify(token, process.env.JWT_SECRET); }
export function signAdmin(email) { return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "8h" }); }
export function imagekit() { return new ImageKit({ publicKey: process.env.IMAGEKIT_PUBLIC_KEY, privateKey: process.env.IMAGEKIT_PRIVATE_KEY, urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT }); }
