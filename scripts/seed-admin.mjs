import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "ravion";

if (!uri) {
  console.error("❌ MONGODB_URI is missing from .env");
  process.exit(1);
}

async function seed() {
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    console.error("   Set them in your .env file or pass them as CLI arguments:");
    console.error("   npm run seed:admin <email> <password>");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const admins = db.collection("admins");

    const existing = await admins.findOne({ email });
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    if (existing) {
      console.log(`Admin ${email} already exists. Updating password hash & role...`);
      await admins.updateOne(
        { email },
        {
          $set: {
            passwordHash,
            role: "admin",
            updatedAt: now,
          },
        }
      );
      console.log(`✅ Admin ${email} updated successfully.`);
    } else {
      await admins.insertOne({
        email,
        passwordHash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✅ Administrator ${email} created successfully.`);
    }
  } catch (err) {
    console.error("❌ Error provisioning admin:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
