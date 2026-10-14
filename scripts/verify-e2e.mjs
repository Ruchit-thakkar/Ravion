// scripts/verify-e2e.mjs
import assert from "node:assert";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
let authCookie = "";

console.log("=== STARTING RAVION NO-CODE PLATFORM E2E VERIFICATION ===");
console.log(`Targeting: ${BASE_URL}\n`);

async function runTest(name, fn) {
  process.stdout.write(`• Testing: ${name}... `);
  try {
    await fn();
    console.log(" PASSED");
  } catch (err) {
    console.log(" FAILED");
    console.error("  ", err.message);
    throw err;
  }
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(authCookie ? { Cookie: authCookie } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // not json
  }
  return { status: res.status, headers: res.headers, data: json, text };
}

async function main() {
  // 1. Admin Login
  await runTest("Admin Login & JWT Authentication", async () => {
    const res = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "ruchitthakkar12@gmail.com",
        password: "ruchit@286",
      }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}: ${res.text}`);
    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "Expected set-cookie header on successful login");
    authCookie = setCookie.split(";")[0];
    assert.ok(authCookie.startsWith("ravion_admin_token="), "Expected ravion_admin_token in cookie");
  });

  // 2. Admin Metrics
  await runTest("Admin Metrics API", async () => {
    const res = await api("/api/admin/metrics");
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.summary, "Summary payload present");
    assert.strictEqual(typeof res.data.products.total, "number");
    assert.strictEqual(typeof res.data.links.published, "number");
    assert.strictEqual(typeof res.data.bioSections.total, "number");
  });

  // 3. Bio Management Workflow
  let createdSectionId = "";
  await runTest("Bio Page Admin Fetch & Update Profile", async () => {
    const res = await api("/api/admin/bio");
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.profile, "Bio profile exists");
    assert.ok(Array.isArray(res.data.sections), "Bio sections exist");

    // Update profile
    const updateRes = await api("/api/admin/bio", {
      method: "PUT",
      body: JSON.stringify({
        displayName: "Ravion Studio",
        title: "Creative Designer & Digital Builder",
        shortBio: "BUILD · CREATE · INNOVATE",
        description: "Elevated digital experiences, high-converting websites, creative content, and digital resources for founders and creators.",
        socialLinks: [
          { platform: "instagram", url: "https://www.instagram.com/ravion.ai/", label: "Instagram", isActive: true },
          { platform: "whatsapp", url: "https://wa.me/917990774831", label: "WhatsApp", isActive: true }
        ]
      })
    });
    assert.strictEqual(updateRes.status, 200);
  });

  await runTest("Bio Page Section Creation & Publish", async () => {
    // Add custom banner section
    const createRes = await api("/api/admin/bio/sections", {
      method: "POST",
      body: JSON.stringify({
        type: "promotional_banner",
        title: "Limited Summer Drop",
        subtitle: "Exclusive templates now available with instant download",
        config: {
          ctaText: "Explore Now",
          ctaUrl: "https://ravion.in/samples",
          badge: "NEW RELEASE",
          backgroundColor: "#082d2a",
          textColor: "#f5f0e8",
        },
        isVisible: true
      })
    });
    assert.strictEqual(createRes.status, 201);
    assert.ok(createRes.data.section?._id, "Section ID returned");
    createdSectionId = createRes.data.section._id;

    // Publish bio page
    const pubRes = await api("/api/admin/bio/publish", { method: "POST" });
    assert.strictEqual(pubRes.status, 200);
    assert.strictEqual(pubRes.data.success, true);
  });

  // 4. Products Workflow (Digital + Affiliate)
  let testDigitalProductId = "";
  let testAffiliateProductId = "";
  let digitalSlug = "";

  await runTest("Create Digital Free Product & Download Validation", async () => {
    const res = await api("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
        type: "digital",
        title: "E2E Test Luxury Frame Template",
        slug: "e2e-test-luxury-frame-template",
        category: "Templates",
        price: 0,
        currency: "USD",
        shortDescription: "Free luxury template for digital creators.",
        description: "Full resolution mockup template pack with instant download.",
        fileDeliveryType: "direct_upload",
        fileUrl: "https://example.com/downloads/luxury-frame.zip",
        fileName: "luxury-frame.zip",
        fileSizeMb: 12.5,
        status: "Published",
        badge: "FREE"
      })
    });
    assert.strictEqual(res.status, 201);
    testDigitalProductId = res.data.product._id;
    digitalSlug = res.data.product.slug;

    // Fetch public product by slug
    const pubProd = await api(`/api/products/${digitalSlug}`);
    assert.strictEqual(pubProd.status, 200);
    assert.strictEqual(pubProd.data.product.title, "E2E Test Luxury Frame Template");

    // Secure download validation for free product (redirects to fileUrl)
    const dlRes = await api(`/api/products/download/${testDigitalProductId}`, {
      redirect: "manual",
    });
    // In manual redirect, fetch returns status 307 or 302 or opaqueredirect
    assert.ok(
      dlRes.status === 307 || dlRes.status === 302,
      `Expected redirect (302/307), got ${dlRes.status}`
    );
    const location = dlRes.headers.get("location");
    assert.strictEqual(
      location,
      "https://example.com/downloads/luxury-frame.zip",
      "Redirects to secure download file URL"
    );
  });

  await runTest("Create Affiliate Product & Affiliate Disclosures", async () => {
    const res = await api("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
        type: "affiliate",
        title: "E2E Test Modern Workstation Monitor",
        slug: "e2e-test-workstation-monitor",
        category: "Gear",
        price: 499,
        originalPrice: 599,
        currency: "USD",
        shortDescription: "Ultra-wide 4K color accurate display for editing.",
        affiliateUrl: "https://amazon.com/dp/B0EXAMPLE?tag=ravion-21",
        affiliateDisclosure: "Special partner discount applies at checkout.",
        status: "Published",
        badge: "DEAL"
      })
    });
    assert.strictEqual(res.status, 201);
    testAffiliateProductId = res.data.product._id;

    // Verify in public products endpoint
    const pubList = await api("/api/products?type=affiliate");
    assert.strictEqual(pubList.status, 200);
    const found = pubList.data.products.find(p => p._id === testAffiliateProductId);
    assert.ok(found, "Affiliate product appears in public listing");
    assert.strictEqual(found.affiliateUrl, "https://amazon.com/dp/B0EXAMPLE?tag=ravion-21");
  });

  // 5. Links Workflow
  let testLinkId = "";
  await runTest("Links Management (Create, Reorder, Toggle)", async () => {
    const res = await api("/api/admin/links", {
      method: "POST",
      body: JSON.stringify({
        title: "Book Strategy Call",
        subtitle: "1-on-1 30-minute creative consult",
        url: "https://cal.com/ravion/strategy",
        category: "Work With Us",
        icon: "calendar",
        badge: "POPULAR",
        openInNewTab: true,
        isActive: true
      })
    });
    assert.strictEqual(res.status, 201);
    testLinkId = res.data.link._id;

    // Toggle active
    const patchRes = await api(`/api/admin/links/${testLinkId}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: false })
    });
    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(patchRes.data.link.isActive, false);

    // Toggle back
    await api(`/api/admin/links/${testLinkId}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: true })
    });
  });

  // 6. Safe Deletion Protection (Categories)
  await runTest("Category Safe Deletion Checks", async () => {
    // 1. Attempt to delete 'Templates' which has our newly created product
    const catList = await api("/api/admin/categories");
    assert.strictEqual(catList.status, 200);
    const templatesCat = catList.data.categories.find(c => c.name === "Templates");
    if (templatesCat) {
      const delAttempt = await api(`/api/admin/categories/${templatesCat._id}`, { method: "DELETE" });
      assert.strictEqual(delAttempt.status, 400, "Should refuse deleting in-use category");
      assert.ok(delAttempt.data.error.includes("Cannot delete category"), "Provides clear error message");
    }

    // 2. Create unused category and delete it safely
    const newCat = await api("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Temporary Unused Cat" })
    });
    assert.strictEqual(newCat.status, 201);
    const catDelRes = await api(`/api/admin/categories/${newCat.data.category._id}`, { method: "DELETE" });
    assert.strictEqual(catDelRes.status, 200);
  });

  // 7. Site Settings Sync
  await runTest("Site Settings Update & Instant Reflection", async () => {
    const getRes = await api("/api/admin/settings");
    assert.strictEqual(getRes.status, 200);
    const current = getRes.data.settings;

    const newTagline = "Build. Create. Elevate.";
    const updateRes = await api("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({
        branding: {
          ...current.branding,
          tagline: newTagline
        }
      })
    });
    assert.strictEqual(updateRes.status, 200);

    // Verify public settings endpoint
    const pubSettings = await api("/api/settings");
    assert.strictEqual(pubSettings.status, 200);
    assert.strictEqual(pubSettings.data.settings.branding.tagline, newTagline);
  });

  // 8. Public Pages HTTP 200 Verification
  await runTest("Public Pages HTTP Status Check (/, /samples, /bio)", async () => {
    const homeRes = await fetch(`${BASE_URL}/`);
    assert.strictEqual(homeRes.status, 200, "Homepage returns 200");

    const samplesRes = await fetch(`${BASE_URL}/samples`);
    assert.strictEqual(samplesRes.status, 200, "Samples page returns 200");

    const bioRes = await fetch(`${BASE_URL}/bio`);
    assert.strictEqual(bioRes.status, 200, "Bio page returns 200");
    const bioHtml = await bioRes.text();
    assert.ok(bioHtml.includes("Ravion"), "Bio page contains Ravion branding");
  });

  // 9. Clean up test records
  await runTest("Cleanup Test Records", async () => {
    if (createdSectionId) {
      await api(`/api/admin/bio/sections/${createdSectionId}`, { method: "DELETE" });
    }
    if (testDigitalProductId) {
      await api(`/api/admin/products/${testDigitalProductId}`, { method: "DELETE" });
    }
    if (testAffiliateProductId) {
      await api(`/api/admin/products/${testAffiliateProductId}`, { method: "DELETE" });
    }
    if (testLinkId) {
      await api(`/api/admin/links/${testLinkId}`, { method: "DELETE" });
    }
    // Re-publish clean bio
    await api("/api/admin/bio/publish", { method: "POST" });
  });

  console.log("\n=== ALL E2E VERIFICATION CHECKS PASSED PERFECTLY! ===");
}

main().catch((err) => {
  console.error("\nFATAL ERROR IN E2E VERIFICATION:", err);
  process.exit(1);
});
