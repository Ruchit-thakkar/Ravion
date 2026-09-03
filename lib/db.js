import { MongoClient } from "mongodb";

let clientPromise;

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return await global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      const client = new MongoClient(uri);
      clientPromise = client.connect();
    }
    return await clientPromise;
  }
}

export async function getDatabase() {
  const dbName = process.env.MONGODB_DB || "ravion";
  const client = await getMongoClient();
  return client.db(dbName);
}

export async function getAdminsCollection() {
  const db = await getDatabase();
  return db.collection("admins");
}

export async function getInquiriesCollection() {
  const db = await getDatabase();
  return db.collection("inquiries");
}

export async function getCategoriesCollection() {
  const db = await getDatabase();
  return db.collection("categories");
}

export async function getSamplesCollection() {
  const db = await getDatabase();
  return db.collection("samples");
}

export async function ensureDefaultCategories() {
  try {
    const categoriesCol = await getCategoriesCollection();
    const count = await categoriesCol.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: "Web Services", slug: "web-services", description: "Modern websites, web apps, and design systems.", createdAt: new Date() },
        { name: "Link-in-Bio", slug: "link-in-bio", description: "High-converting, brand-aligned link-in-bio pages.", createdAt: new Date() },
        { name: "AI Product Photography", slug: "ai-product-photography", description: "Photorealistic AI product imagery and commercial visuals.", createdAt: new Date() },
        { name: "Social Media Content", slug: "social-media-content", description: "Thumb-stopping social media creatives and carousels.", createdAt: new Date() },
        { name: "Photoshop / Design", slug: "photoshop-design", description: "Creative retouching, poster design, and manipulations.", createdAt: new Date() },
        { name: "Video", slug: "video", description: "Short-form video editing, motion graphics, and reels.", createdAt: new Date() },
      ];
      await categoriesCol.insertMany(defaultCategories);
    }
  } catch (err) {
    console.error("Could not seed default categories:", err);
  }
}

