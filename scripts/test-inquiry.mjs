import { getInquiriesCollection } from "./lib/db.js";
import dotenv from "dotenv";

dotenv.config();

async function testInquiry() {
  console.log("=== TESTING INQUIRY MONGODB COLLECTION ===");

  const inquiries = await getInquiriesCollection();
  
  const testDoc = {
    name: "John Doe",
    email: "john@example.com",
    phone: "+919876543210",
    service: "Web Services",
    message: "I need a website for my business.",
    status: "new",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertResult = await inquiries.insertOne(testDoc);
  console.log("✓ Successfully inserted test inquiry with ID:", insertResult.insertedId.toString());

  const found = await inquiries.findOne({ _id: insertResult.insertedId });
  console.log("✓ Retrieved inquiry from MongoDB:", {
    name: found.name,
    email: found.email,
    phone: found.phone,
    service: found.service,
    status: found.status,
  });

  // Clean up test document
  await inquiries.deleteOne({ _id: insertResult.insertedId });
  console.log("✓ Cleaned up test inquiry.");

  console.log("=== INQUIRY TEST PASSED ===");
  process.exit(0);
}

testInquiry().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
