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
