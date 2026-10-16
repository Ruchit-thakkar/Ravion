const BASE = "http://localhost:3000";

async function runSamplesTests() {
  console.log("==================================================");
  console.log("STARTING PHASE 5 PORTFOLIO SAMPLES AUTOMATED TESTS");
  console.log("==================================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    console.log(`[${condition ? "PASS" : "FAIL"}] ${name} ${details ? "- " + details : ""}`);
  }

  // 1. Unauthenticated GET /admin/samples -> Redirect to /admin/login
  const unauthPageRes = await fetch(`${BASE}/admin/samples`, { redirect: "manual" });
  const isRedirect = [302, 307, 308].includes(unauthPageRes.status);
  const locationHeader = unauthPageRes.headers.get("location") || "";
  assert(
    "Test 1: Unauthenticated /admin/samples redirects to /admin/login",
    isRedirect && locationHeader.includes("/admin/login"),
    `Status: ${unauthPageRes.status}, Location: ${locationHeader}`
  );

  // 2. Unauthenticated GET /api/admin/samples -> 401
  const unauthGetRes = await fetch(`${BASE}/api/admin/samples`);
  assert(
    "Test 2: Unauthenticated GET /api/admin/samples returns 401",
    unauthGetRes.status === 401,
    `Status: ${unauthGetRes.status}`
  );

  // 3. Unauthenticated POST /api/admin/samples -> 401
  const unauthPostRes = await fetch(`${BASE}/api/admin/samples`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Unauthorized Sample" }),
  });
  assert(
    "Test 3: Unauthenticated POST /api/admin/samples returns 401",
    unauthPostRes.status === 401,
    `Status: ${unauthPostRes.status}`
  );

  // 4. Authenticate as Admin
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ruchit@gmail.com", password: "ruchit@123" }),
  });
  const rawCookie = loginRes.headers.get("set-cookie");
  const authCookie = rawCookie ? rawCookie.split(";")[0] : "";
  assert(
    "Test 4: Admin authentication succeeds",
    loginRes.status === 200 && Boolean(authCookie),
    `Status: ${loginRes.status}, Has cookie: ${Boolean(authCookie)}`
  );

  // 5. Authenticated GET /admin/samples page renders
  const adminPageRes = await fetch(`${BASE}/admin/samples`, {
    headers: { Cookie: authCookie },
  });
  const pageHtml = await adminPageRes.text();
  const hasPageHeading = pageHtml.includes("Portfolio Samples") || pageHtml.includes("Samples");
  const hasSidebarLink = pageHtml.includes("/admin/samples");
  const hasPhaseBadge = pageHtml.includes("Phase 5 Active");
  assert(
    "Test 5: Authenticated /admin/samples page renders complete interface",
    adminPageRes.status === 200 && hasPageHeading && hasSidebarLink && hasPhaseBadge,
    `Status: ${adminPageRes.status}`
  );

  // 6. Authenticated GET /api/admin/samples returns samples array and counts
  const getSamplesRes = await fetch(`${BASE}/api/admin/samples`, {
    headers: { Cookie: authCookie },
  });
  const samplesData = await getSamplesRes.json();
  const samplesList = samplesData.samples || [];
  const counts = samplesData.counts || {};
  assert(
    "Test 6: Authenticated GET /api/admin/samples returns samples and counts",
    getSamplesRes.status === 200 &&
      Array.isArray(samplesList) &&
      typeof counts.total === "number" &&
      typeof counts.published === "number",
    `Total: ${counts.total}, Published: ${counts.published}, Draft: ${counts.draft}`
  );

  // 7. Verify Categories integration with real DB categories
  const categoriesRes = await fetch(`${BASE}/api/categories`);
  const categoriesData = await categoriesRes.json();
  const categories = categoriesData.categories || [];
  assert(
    "Test 7: Categories integration loads real taxonomies",
    categoriesRes.status === 200 && categories.length > 0,
    `Categories found: ${categories.length}`
  );
  const selectedCategory = categories[0]?.name || "Web Services";

  // 8. Create a new sample with Draft status (POST /api/admin/samples)
  const uniqueTitle = `Phase5 Draft Showcase ${Date.now()}`;
  const createDraftPayload = {
    title: uniqueTitle,
    category: selectedCategory,
    description: "Testing draft status visibility and management for Phase 5.",
    status: "Draft",
    media: [
      {
        url: "https://ik.imagekit.io/ruchit/ravion/samples/test-sample.png",
        fileId: "test-file-123",
        name: "test-sample.png",
        fileType: "image",
        thumbnailUrl: "https://ik.imagekit.io/ruchit/tr:n-ik_ml_thumbnail/ravion/samples/test-sample.png",
      },
    ],
    thumbnail: "https://ik.imagekit.io/ruchit/tr:n-ik_ml_thumbnail/ravion/samples/test-sample.png",
  };

  const createDraftRes = await fetch(`${BASE}/api/admin/samples`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify(createDraftPayload),
  });
  const createDraftData = await createDraftRes.json();
  const createdSample = createDraftData.sample;
  const sampleId = createdSample?._id;
  assert(
    "Test 8: Create new sample succeeds with 201 (POST /api/admin/samples)",
    createDraftRes.status === 201 && createDraftData.success === true && Boolean(sampleId),
    `Status: ${createDraftRes.status}, ID: ${sampleId}`
  );

  // 9. Draft sample remains hidden from public visitors
  const publicSamplesRes = await fetch(`${BASE}/api/samples`);
  const publicSamples = await publicSamplesRes.json();
  const isDraftInPublic = publicSamples.some((s) => s._id === sampleId || s.title === uniqueTitle);
  assert(
    "Test 9: Draft samples remain hidden from public /api/samples",
    publicSamplesRes.status === 200 && !isDraftInPublic,
    `Found in public: ${isDraftInPublic}`
  );

  // 10. Update sample status to 'Published' and edit description (PUT /api/admin/samples/[id])
  const updatePayload = {
    title: `${uniqueTitle} (Published)`,
    description: "Updated description — now live on the creative portfolio.",
    status: "Published",
  };
  const updateRes = await fetch(`${BASE}/api/admin/samples/${sampleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify(updatePayload),
  });
  const updateData = await updateRes.json();
  assert(
    "Test 10: Edit existing sample succeeds with 200 (PUT /api/admin/samples/[id])",
    updateRes.status === 200 &&
      updateData.sample?.status === "Published" &&
      updateData.sample?.title?.includes("(Published)"),
    `Status: ${updateRes.status}, New title: ${updateData.sample?.title}`
  );

  // 11. Published sample immediately appears in public API
  const recheckPublicRes = await fetch(`${BASE}/api/samples`);
  const recheckPublic = await recheckPublicRes.json();
  const isPublishedInPublic = recheckPublic.some((s) => s._id === sampleId);
  assert(
    "Test 11: Published sample immediately appears in public /api/samples",
    recheckPublicRes.status === 200 && isPublishedInPublic,
    `Found in public: ${isPublishedInPublic}`
  );

  // 12. Search & filter in admin API
  const searchAdminRes = await fetch(`${BASE}/api/admin/samples?q=${encodeURIComponent(uniqueTitle)}`, {
    headers: { Cookie: authCookie },
  });
  const searchAdminData = await searchAdminRes.json();
  const foundSearch = (searchAdminData.samples || []).some((s) => s._id === sampleId);
  assert(
    "Test 12: Search query finds the sample in admin API",
    searchAdminRes.status === 200 && foundSearch,
    `Search found: ${foundSearch}`
  );

  // 13. Rejection of invalid sample submission (missing required title)
  const invalidSampleRes = await fetch(`${BASE}/api/admin/samples`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({ title: "", category: "Web Services" }),
  });
  assert(
    "Test 13: Server rejects invalid sample payload with 400",
    invalidSampleRes.status === 400,
    `Status: ${invalidSampleRes.status}`
  );

  // 14. Safe deletion (DELETE /api/admin/samples/[id])
  const deleteRes = await fetch(`${BASE}/api/admin/samples/${sampleId}`, {
    method: "DELETE",
    headers: { Cookie: authCookie },
  });
  const deleteData = await deleteRes.json();
  assert(
    "Test 14: Sample deletion succeeds with 200",
    deleteRes.status === 200 && deleteData.success === true,
    `Status: ${deleteRes.status}`
  );

  // 15. Verify deleted sample no longer exists (404)
  const verifyDeleteRes = await fetch(`${BASE}/api/admin/samples/${sampleId}`, {
    headers: { Cookie: authCookie },
  });
  assert(
    "Test 15: Re-fetching deleted sample returns 404",
    verifyDeleteRes.status === 404,
    `Status: ${verifyDeleteRes.status}`
  );

  // 16. Existing original portfolio records remain intact in DB
  const finalSamplesRes = await fetch(`${BASE}/api/admin/samples`, {
    headers: { Cookie: authCookie },
  });
  const finalSamplesData = await finalSamplesRes.json();
  assert(
    "Test 16: Existing portfolio records preserved in database",
    finalSamplesData.counts?.total >= 2,
    `Final total count: ${finalSamplesData.counts?.total}`
  );

  // 17. Client-facing website preserved (Selected Work & Let's Talk intact)
  const homeRes = await fetch(`${BASE}/`);
  const homeHtml = await homeRes.text();
  const hasSelectedWork = homeHtml.includes("SELECTED WORK") || homeHtml.includes("Selected Work");
  const hasLetsTalk = homeHtml.includes("LET&#x27;S TALK") || homeHtml.includes("Start a Project Inquiry");
  assert(
    "Test 17: Client-facing website preserved (Selected Work & Let's Talk intact)",
    homeRes.status === 200 && hasSelectedWork && hasLetsTalk,
    `Home status: ${homeRes.status}, SelectedWork: ${hasSelectedWork}, LetsTalk: ${hasLetsTalk}`
  );

  console.log("\n==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`SUMMARY: ${passed}/${total} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSamplesTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
