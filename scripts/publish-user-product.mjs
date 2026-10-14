// scripts/publish-user-product.mjs
import { getProductsCollection } from "../lib/db.js";
import { ObjectId } from "mongodb";

async function run() {
  const productsCol = await getProductsCollection();
  const prod = await productsCol.findOne({});
  if (!prod) {
    console.log("No product found!");
    process.exit(0);
  }

  const res = await productsCol.updateOne(
    { _id: prod._id },
    {
      $set: {
        status: "Published",
        slug: "gemini-ai-video-ad-prompts",
        purchaseUrl: "https://ruchit45.gumroad.com/l/gemini-ai-video-ad-prompts",
        deliveryMethod: "external",
        featured: true,
        shortDescription: "105+ high-converting Gemini AI prompts to create cinematic video ads without a studio.",
        updatedAt: new Date(),
      },
    }
  );

  console.log("Successfully published user product to live /bio:", res.modifiedCount);
  const updated = await productsCol.findOne({ _id: prod._id });
  console.log("Updated Product:", updated);
  process.exit(0);
}

run().catch((err) => {
  console.error("Error publishing product:", err);
  process.exit(1);
});
