import "dotenv/config";
import express from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";
import ImageKit from "imagekit";

const app = express();
const port = Number(process.env.PORT || 8787);
const required = ["MONGODB_URI", "IMAGEKIT_PUBLIC_KEY", "IMAGEKIT_PRIVATE_KEY", "IMAGEKIT_URL_ENDPOINT", "ADMIN_PASSWORD", "JWT_SECRET"];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024, files: 8 } });
let client;

app.use(express.json({ limit: "1mb" }));
function configured(res, keys = required) {
  const missing = keys.filter((key) => !process.env[key]);
  if (!missing.length) return true;
  res.status(503).json({ error: `Server is not configured. Missing: ${missing.join(", ")}` });
  return false;
}
async function db() {
  if (!client) { client = new MongoClient(process.env.MONGODB_URI); await client.connect(); }
  return client.db(process.env.MONGODB_DB || "ravion");
}
function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function auth(req, res, next) {
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: "JWT_SECRET is not configured." });
  try { req.user = jwt.verify(req.headers.authorization?.replace("Bearer ", ""), process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Please sign in to continue." }); }
}
function imagekit() { return new ImageKit({ publicKey: process.env.IMAGEKIT_PUBLIC_KEY, privateKey: process.env.IMAGEKIT_PRIVATE_KEY, urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT }); }

app.get("/api/health", async (_req, res) => {
  if (!configured(res, ["MONGODB_URI"])) return;
  try { await (await db()).command({ ping: 1 }); res.json({ ok: true }); } catch { res.status(503).json({ error: "MongoDB connection failed." }); }
});
app.post("/api/auth/login", (req, res) => {
  if (!configured(res, ["ADMIN_EMAIL", "ADMIN_PASSWORD", "JWT_SECRET"])) return;
  const email = String(req.body.email || "").toLowerCase().trim();
  if (email !== process.env.ADMIN_EMAIL.toLowerCase() || req.body.password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Incorrect email or password." });
  res.json({ token: jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "8h" }) });
});
app.get("/api/samples", async (req, res) => {
  if (!configured(res, ["MONGODB_URI"])) return;
  const query = req.query.category ? { category: req.query.category, status: "Published" } : { status: "Published" };
  const samples = await (await db()).collection("samples").find(query).sort({ createdAt: -1 }).toArray();
  res.json(samples);
});
app.get("/api/samples/:slug", async (req, res) => {
  if (!configured(res, ["MONGODB_URI"])) return;
  const sample = await (await db()).collection("samples").findOne({ slug: req.params.slug, status: "Published" });
  if (!sample) return res.status(404).json({ error: "Sample not found." });
  res.json(sample);
});
app.get("/api/admin/samples", auth, async (_req, res) => { if (!configured(res, ["MONGODB_URI"])) return; res.json(await (await db()).collection("samples").find({}).sort({ createdAt: -1 }).toArray()); });
app.post("/api/uploads", auth, upload.array("images", 8), async (req, res) => {
  if (!configured(res)) return;
  if (!req.files?.length) return res.status(400).json({ error: "Choose at least one image." });
  try {
    const kit = imagekit();
    const images = await Promise.all(req.files.map(async (file) => {
      const uploaded = await kit.upload({ file: file.buffer.toString("base64"), fileName: `${Date.now()}-${slugify(file.originalname)}`, folder: "/ravion/samples", useUniqueFileName: true });
      return { url: uploaded.url, fileId: uploaded.fileId, name: file.originalname };
    }));
    res.status(201).json({ images });
  } catch (error) { res.status(502).json({ error: error.message || "ImageKit upload failed." }); }
});
app.post("/api/admin/samples", auth, async (req, res) => {
  if (!configured(res, ["MONGODB_URI"])) return;
  const { title, category, description = "", status = "Draft", images = [], tags = [] } = req.body;
  if (!title || !category) return res.status(400).json({ error: "Title and category are required." });
  const collection = (await db()).collection("samples");
  let slug = slugify(title), index = 2;
  while (await collection.findOne({ slug })) slug = `${slugify(title)}-${index++}`;
  const doc = { title, slug, category, description, status, images, thumbnail: images[0]?.url || "", tags, createdAt: new Date(), updatedAt: new Date() };
  await collection.insertOne(doc); res.status(201).json(doc);
});
app.delete("/api/admin/samples/:id", auth, async (req, res) => { if (!configured(res, ["MONGODB_URI"])) return; await (await db()).collection("samples").deleteOne({ _id: new ObjectId(req.params.id) }); res.status(204).end(); });
app.post("/api/inquiries", async (req, res) => {
  if (!configured(res, ["MONGODB_URI"])) return;
  const { name, email, phone, service, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "Name, email and message are required." });
  await (await db()).collection("inquiries").insertOne({ name, email, phone: phone || "", service: service || "", message, createdAt: new Date(), status: "New" });
  res.status(201).json({ ok: true });
});
app.listen(port, () => console.log(`Ravion API listening on http://localhost:${port}`));
