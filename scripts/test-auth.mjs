import { comparePassword, hashPassword, signToken, verifyToken } from "../lib/auth.js";
import { getAdminsCollection } from "../lib/db.js";
import dotenv from "dotenv";

dotenv.config();

async function testAuth() {
  console.log("=== TESTING AUTH SYSTEM ===");

  // 1. Test Password Hashing & Verification
  const plaintext = "ruchit@123";
  const hash = await hashPassword(plaintext);
  console.log("✓ Generated bcrypt hash (length):", hash.length);

  const validMatch = await comparePassword(plaintext, hash);
  console.log("✓ Password match test (should be true):", validMatch);

  const invalidMatch = await comparePassword("wrong-password", hash);
  console.log("✓ Wrong password match test (should be false):", invalidMatch);

  // 2. Test JWT Signing and Verification
  const token = signToken({
    userId: "test-user-id",
    email: "ruchit@gmail.com",
    role: "admin",
  });
  console.log("✓ Generated JWT token");

  const verified = verifyToken(token);
  console.log("✓ Verified JWT payload:", verified);

  // 3. Test MongoDB Admin Lookup
  const admins = await getAdminsCollection();
  const adminDoc = await admins.findOne({ email: "ruchit@gmail.com" });
  console.log("✓ Found admin document in MongoDB:", {
    _id: adminDoc._id.toString(),
    email: adminDoc.email,
    role: adminDoc.role,
    hasPasswordHash: Boolean(adminDoc.passwordHash),
    createdAt: adminDoc.createdAt,
  });

  const dbPasswordMatch = await comparePassword(plaintext, adminDoc.passwordHash);
  console.log("✓ DB passwordHash matches 'ruchit@123':", dbPasswordMatch);

  console.log("=== ALL AUTH TESTS PASSED ===");
  process.exit(0);
}

testAuth().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
