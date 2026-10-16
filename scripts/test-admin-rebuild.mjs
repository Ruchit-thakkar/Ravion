// scripts/test-admin-rebuild.mjs
import assert from "node:assert";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
let authCookie = "";

console.log("=================================================");
console.log("=== RAVION ADMIN REBUILD COMPREHENSIVE TESTS ===");
console.log(`=== Target: ${BASE_URL} ===\n`);

async function runTest(name, fn) {
  process.stdout.write(`• Testing: ${name}... `);
  try {
    await fn();
    console.log("✓ PASSED");
  } catch (err) {
    console.log("✗ FAILED");
    console.error("   Error details:", err.message);
    throw err;
  }
}

async function request(path, options = {}) {
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
  } catch {}
  return { status: res.status, headers: res.headers, data: json, text };
}

async function main() {
  // Test 1: Admin Login
  await runTest("Admin Login & JWT Cookie Session", async () => {
    const res = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "ruchit@gmail.com",
        password: "ruchit@123",
      }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}: ${res.text}`);
    const setCookie = res.headers.get("set-cookie");
    assert.ok(setCookie, "Expected set-cookie on login");
    authCookie = setCookie.split(";")[0];
    assert.ok(authCookie.includes("ravion_admin_token="), "Expected ravion_admin_token in cookie");
  });

  // Test 2: Admin Metrics for Rebuilt Dashboard
  await runTest("Dashboard Metrics API with full breakdown", async () => {
    const res = await request("/api/admin/metrics");
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert.ok(res.data.inquiries, "Inquiries metrics object present");
    assert.strictEqual(typeof res.data.inquiries.total, "number");
    assert.strictEqual(typeof res.data.inquiries.new, "number");
    assert.ok(Array.isArray(res.data.inquiries.recent), "Recent inquiries array present");
    assert.strictEqual(typeof res.data.samples.total, "number");
    assert.strictEqual(typeof res.data.samples.published, "number");
    assert.strictEqual(typeof res.data.categories.total, "number");
    assert.ok(res.data.system, "System status object present");
    assert.strictEqual(res.data.system.databaseConnected, true);
  });

  // Test 3: Link in Bio Fetch & Update
  await runTest("Bio Control Hub GET & PUT Configuration", async () => {
    const getRes = await request("/api/admin/bio");
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.profile, "Profile data exists");

    const putRes = await request("/api/admin/bio", {
      method: "PUT",
      body: JSON.stringify({
        brandName: "Ravion",
        tagline: "BUILD · CREATE · INNOVATE",
        heading: "Made with imagination.",
        description: "Elevated digital experiences, high-converting websites, creative content, and digital resources.",
        ctaButtons: [
          {
            id: "cta-test-1",
            title: "Work With Us",
            description: "Hire Ravion for web experiences and digital visuals",
            url: "/#contact",
            style: "solid",
            isActive: true,
            order: 1,
          },
          {
            id: "cta-test-2",
            title: "Explore Portfolio",
            description: "View our recent works",
            url: "/samples",
            style: "outline",
            isActive: true,
            order: 2,
          },
        ],
        socialLinks: [
          { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/ravion.ai/", isActive: true, order: 1 },
          { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/917990774831", isActive: true, order: 2 },
          { platform: "email", label: "Email", url: "mailto:ruchitthakkar12@gmail.com", isActive: true, order: 3 },
          { platform: "website", label: "Website", url: "https://ravion.in", isActive: true, order: 4 },
        ],
        contactInformation: {
          email: "ruchitthakkar12@gmail.com",
          phone: "+91 79907 74831",
          whatsapp: "https://wa.me/917990774831",
          website: "https://ravion.in",
          location: "India · Worldwide",
        },
        status: "Published",
      }),
    });
    assert.strictEqual(putRes.status, 200, `Expected 200, got ${putRes.status}`);
    assert.strictEqual(putRes.data.profile.brandName, "Ravion");
    assert.strictEqual(putRes.data.profile.status, "Published");
  });

  // Test 4: Category Management Workflow
  let testCatId = "";
  await runTest("Categories GET, POST & PATCH", async () => {
    const listRes = await request("/api/admin/categories");
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data.categories));

    const testCatName = `Test Category ${Date.now()}`;
    const createRes = await request("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        name: testCatName,
        description: "Created via automated test",
        order: 99,
        isActive: true,
      }),
    });
    assert.strictEqual(createRes.status, 201, `Expected 201, got ${createRes.status}: ${createRes.text}`);
    assert.ok(createRes.data.category._id);
    testCatId = createRes.data.category._id;

    // PATCH category
    const patchRes = await request(`/api/admin/categories/${testCatId}`, {
      method: "PATCH",
      body: JSON.stringify({
        description: "Updated description via test",
      }),
    });
    assert.strictEqual(patchRes.status, 200);
  });

  // Test 5: Portfolio Samples Workflow
  let testSampleId = "";
  await runTest("Portfolio Samples GET, POST, PATCH & DELETE", async () => {
    const listRes = await request("/api/admin/samples");
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data));

    const createRes = await request("/api/admin/samples", {
      method: "POST",
      body: JSON.stringify({
        title: `Test Sample Project ${Date.now()}`,
        category: "Web Services",
        shortDescription: "Short excerpt for portfolio card",
        description: "Full case study description",
        status: "Published",
        featured: true,
        tags: ["Test", "Branding"],
        media: [
          {
            url: "/assets/ravion-logo.png",
            thumbnailUrl: "/assets/ravion-logo.png",
            fileType: "image",
            name: "ravion-logo.png",
          },
        ],
      }),
    });
    assert.strictEqual(createRes.status, 201, `Expected 201, got ${createRes.status}: ${createRes.text}`);
    assert.ok(createRes.data._id);
    testSampleId = createRes.data._id;

    // PATCH sample status to Draft
    const patchRes = await request(`/api/admin/samples/${testSampleId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "Draft",
        shortDescription: "Updated excerpt",
      }),
    });
    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(patchRes.data.status, "Draft");

    // Clean up test sample
    const delRes = await request(`/api/admin/samples/${testSampleId}`, {
      method: "DELETE",
    });
    assert.strictEqual(delRes.status, 204);
  });

  // Clean up test category
  if (testCatId) {
    await runTest("Delete Category safely", async () => {
      const delCatRes = await request(`/api/admin/categories/${testCatId}?force=true`, {
        method: "DELETE",
      });
      assert.strictEqual(delCatRes.status, 200);
    });
  }

  // Test 6: Inquiries Listing & Status Update
  await runTest("Client Inquiries GET & PATCH", async () => {
    const inqRes = await request("/api/admin/inquiries");
    assert.strictEqual(inqRes.status, 200);
    assert.ok(Array.isArray(inqRes.data.inquiries));

    if (inqRes.data.inquiries.length > 0) {
      const targetInq = inqRes.data.inquiries[0];
      const patchRes = await request(`/api/admin/inquiries/${targetInq._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "In Progress",
          internalNotes: "Verified via automated test run.",
        }),
      });
      assert.strictEqual(patchRes.status, 200);
      assert.strictEqual(patchRes.data.inquiry.status, "In Progress");
      assert.strictEqual(patchRes.data.inquiry.internalNotes, "Verified via automated test run.");
    }
  });

  // Test 7: Website Settings GET & PUT
  await runTest("Website Settings GET & PUT", async () => {
    const getRes = await request("/api/admin/settings");
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.settings);

    const putRes = await request("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({
        branding: {
          name: "Ravion",
          tagline: "Build. Create. Innovate.",
        },
        seo: {
          defaultTitle: "Ravion — Creative Studio & Digital Experiences",
        },
      }),
    });
    assert.strictEqual(putRes.status, 200);
  });

  // Test 8: Public Bio Page Rendering
  await runTest("Public /bio Page Rendering", async () => {
    const bioPageRes = await request("/bio");
    assert.strictEqual(bioPageRes.status, 200);
    assert.ok(bioPageRes.text.includes("Ravion"), "Public bio page contains Ravion");
  });

  // Test 9: Public Samples Page Rendering
  await runTest("Public /samples Page Rendering", async () => {
    const samplesPageRes = await request("/samples");
    assert.strictEqual(samplesPageRes.status, 200);
  });

  console.log("\n=================================================");
  console.log("=== ALL END-TO-END VERIFICATION TESTS PASSED! ===");
  console.log("=================================================");
}

main().catch((err) => {
  console.error("\n❌ E2E Verification failed:", err);
  process.exit(1);
});
