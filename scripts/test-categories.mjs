const BASE = "http://localhost:3000";

async function runCategoriesTests() {
  console.log("==================================================");
  console.log("STARTING PHASE 6 CATEGORIES MANAGEMENT TESTS");
  console.log("==================================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    console.log(`[${condition ? "PASS" : "FAIL"}] ${name} ${details ? "- " + details : ""}`);
  }

  try {
    // 1. Unauthenticated GET /admin/categories -> Redirect to /admin/login
    const unauthPageRes = await fetch(`${BASE}/admin/categories`, { redirect: "manual" });
    const isRedirect = [302, 307, 308].includes(unauthPageRes.status);
    const locationHeader = unauthPageRes.headers.get("location") || "";
    assert(
      "Test 1: Unauthenticated /admin/categories redirects to /admin/login",
      isRedirect && locationHeader.includes("/admin/login"),
      `Status: ${unauthPageRes.status}, Location: ${locationHeader}`
    );

    // 2. Unauthenticated GET /api/admin/categories -> 401
    const unauthGetRes = await fetch(`${BASE}/api/admin/categories`);
    assert(
      "Test 2: Unauthenticated GET /api/admin/categories returns 401",
      unauthGetRes.status === 401,
      `Status: ${unauthGetRes.status}`
    );

    // 3. Unauthenticated POST /api/admin/categories -> 401
    const unauthPostRes = await fetch(`${BASE}/api/admin/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauthorized Category" }),
    });
    assert(
      "Test 3: Unauthenticated POST /api/admin/categories returns 401",
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

    // 5. Authenticated GET /admin/categories page renders
    const adminPageRes = await fetch(`${BASE}/admin/categories`, {
      headers: { Cookie: authCookie },
    });
    const adminPageText = await adminPageRes.text();
    assert(
      "Test 5: Authenticated /admin/categories loads successfully",
      adminPageRes.status === 200 && adminPageText.includes("Categories Management"),
      `Status: ${adminPageRes.status}, Contains header: ${adminPageText.includes("Categories Management")}`
    );

    // 6. Authenticated GET /api/admin/categories returns list with sample counts
    const listRes = await fetch(`${BASE}/api/admin/categories`, {
      headers: { Cookie: authCookie },
    });
    const listData = await listRes.json();
    assert(
      "Test 6: GET /api/admin/categories returns array with sample counts",
      listRes.status === 200 && Array.isArray(listData.categories) && listData.categories.length > 0 && typeof listData.categories[0].sampleCount === "number",
      `Count: ${listData.categories?.length}, Sample count type: ${typeof listData.categories?.[0]?.sampleCount}`
    );

    // 7. Create a new test category
    const testCatTimestamp = Date.now();
    const testCatName = `Test Automation Cat ${testCatTimestamp}`;
    const testCatSlug = `test-auto-cat-${testCatTimestamp}`;

    const createRes = await fetch(`${BASE}/api/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        name: testCatName,
        slug: testCatSlug,
        description: "Automated test category description",
        isActive: true,
      }),
    });
    const createData = await createRes.json();
    assert(
      "Test 7: POST /api/admin/categories creates new category",
      createRes.status === 201 && createData.category?.name === testCatName && createData.category?.slug === testCatSlug,
      `Status: ${createRes.status}, ID: ${createData.category?._id}`
    );
    const createdCatId = createData.category?._id;

    // 8. Prevent duplicate slug
    const duplicateSlugRes = await fetch(`${BASE}/api/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        name: `Different Name ${testCatTimestamp}`,
        slug: testCatSlug,
      }),
    });
    const dupSlugData = await duplicateSlugRes.json();
    assert(
      "Test 8: Duplicate slug is rejected with 400",
      duplicateSlugRes.status === 400 && dupSlugData.error?.includes("slug"),
      `Status: ${duplicateSlugRes.status}, Error: ${dupSlugData.error}`
    );

    // 9. Prevent duplicate name
    const duplicateNameRes = await fetch(`${BASE}/api/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        name: testCatName,
        slug: `different-slug-${testCatTimestamp}`,
      }),
    });
    const dupNameData = await duplicateNameRes.json();
    assert(
      "Test 9: Duplicate name is rejected with 400",
      duplicateNameRes.status === 400 && dupNameData.error?.includes("name"),
      `Status: ${duplicateNameRes.status}, Error: ${dupNameData.error}`
    );

    // 10. Edit category
    const updatedDesc = "Updated automated description";
    const editRes = await fetch(`${BASE}/api/admin/categories/${createdCatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        name: testCatName,
        slug: testCatSlug,
        description: updatedDesc,
        isActive: true,
      }),
    });
    const editData = await editRes.json();
    assert(
      "Test 10: PUT /api/admin/categories/[id] updates category",
      editRes.status === 200 && editData.category?.description === updatedDesc,
      `Status: ${editRes.status}, Desc: ${editData.category?.description}`
    );

    // 11. Search categories
    const searchRes = await fetch(`${BASE}/api/admin/categories?q=${encodeURIComponent(testCatSlug)}`, {
      headers: { Cookie: authCookie },
    });
    const searchData = await searchRes.json();
    const searchMatched = searchData.categories?.some((c) => c._id === createdCatId);
    assert(
      "Test 11: GET /api/admin/categories?q=... searches accurately",
      searchRes.status === 200 && searchMatched,
      `Matched created test category in search results: ${searchMatched}`
    );

    // 12. Dependency check on category deletion
    // Create a temporary sample associated with testCatName
    const tempSampleRes = await fetch(`${BASE}/api/admin/samples`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        title: `Temp Linked Sample ${testCatTimestamp}`,
        category: testCatName,
        description: "Sample created to verify category dependency safety",
        status: "Published",
        media: [
          {
            url: "https://ik.imagekit.io/ruchit/ravion/samples/test-sample.png",
            fileId: "test-file-cat-123",
            name: "test-sample.png",
            fileType: "image",
            thumbnailUrl: "https://ik.imagekit.io/ruchit/tr:n-ik_ml_thumbnail/ravion/samples/test-sample.png",
          },
        ],
        thumbnail: "https://ik.imagekit.io/ruchit/tr:n-ik_ml_thumbnail/ravion/samples/test-sample.png",
      }),
    });
    const tempSampleData = await tempSampleRes.json();
    const tempSampleId = tempSampleData.sample?._id;
    assert(
      "Test 12a: Associated sample created with test category",
      tempSampleRes.status === 201 && Boolean(tempSampleId),
      `Status: ${tempSampleRes.status}, Sample ID: ${tempSampleId}, Category: ${tempSampleData.sample?.category}`
    );

    // Now attempt to delete the category WITHOUT reassignment -> MUST FAIL with 409 Conflict
    const unsafeDeleteRes = await fetch(`${BASE}/api/admin/categories/${createdCatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
    });
    const unsafeDeleteData = await unsafeDeleteRes.json();
    assert(
      "Test 12b: Delete category with associated samples is BLOCKED (409 Conflict)",
      unsafeDeleteRes.status === 409 && unsafeDeleteData.requiresReassignment === true,
      `Status: ${unsafeDeleteRes.status}, requiresReassignment: ${unsafeDeleteData.requiresReassignment}, sampleCount: ${unsafeDeleteData.sampleCount}`
    );

    // Verify sample still exists and was NOT deleted
    const verifySampleRes = await fetch(`${BASE}/api/admin/samples/${tempSampleId}`, {
      headers: { Cookie: authCookie },
    });
    const verifySampleData = await verifySampleRes.json();
    assert(
      "Test 12c: Associated sample remains intact after blocked deletion",
      verifySampleRes.status === 200 && verifySampleData.sample?.category === testCatName,
      `Sample status: ${verifySampleRes.status}, Category: ${verifySampleData.sample?.category}`
    );

    // Now delete with safe reassignment to "Web Services"
    const safeDeleteRes = await fetch(`${BASE}/api/admin/categories/${createdCatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        reassignToCategory: "Web Services",
      }),
    });
    const safeDeleteData = await safeDeleteRes.json();
    assert(
      "Test 12d: Safe deletion with reassignment succeeds",
      safeDeleteRes.status === 200 && safeDeleteData.reassignedCount >= 1,
      `Status: ${safeDeleteRes.status}, Reassigned count: ${safeDeleteData.reassignedCount}`
    );

    // Verify sample now has category "Web Services"
    const sampleAfterReassignRes = await fetch(`${BASE}/api/admin/samples/${tempSampleId}`, {
      headers: { Cookie: authCookie },
    });
    const sampleAfterData = await sampleAfterReassignRes.json();
    assert(
      "Test 12e: Sample was reassigned to target category and not deleted",
      sampleAfterReassignRes.status === 200 && sampleAfterData.sample?.category === "Web Services",
      `New Category: ${sampleAfterData.sample?.category}`
    );

    // Clean up temporary sample
    await fetch(`${BASE}/api/admin/samples/${tempSampleId}`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });

    // 13. Delete empty category directly
    const emptyCatRes = await fetch(`${BASE}/api/admin/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        name: `Empty Cat ${testCatTimestamp}`,
        slug: `empty-cat-${testCatTimestamp}`,
        description: "Empty category for direct deletion test",
      }),
    });
    const emptyCatData = await emptyCatRes.json();
    const emptyCatId = emptyCatData.category?._id;

    const deleteEmptyRes = await fetch(`${BASE}/api/admin/categories/${emptyCatId}`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });
    assert(
      "Test 13: Delete empty category succeeds directly (HTTP 200)",
      deleteEmptyRes.status === 200,
      `Status: ${deleteEmptyRes.status}`
    );

    // 14. Public /api/categories is working and returns categories
    const pubCatRes = await fetch(`${BASE}/api/categories`);
    const pubCatData = await pubCatRes.json();
    const pubCatList = pubCatData.categories || [];
    assert(
      "Test 14: Public /api/categories returns active categories list",
      pubCatRes.status === 200 && Array.isArray(pubCatList) && pubCatList.length > 0,
      `Status: ${pubCatRes.status}, Public Categories count: ${pubCatList.length}`
    );

    // 15. Public website UI check - homepage Selected Work and Let's Talk preserved
    const homeRes = await fetch(`${BASE}/`);
    const homeText = await homeRes.text();
    const hasSelectedWork = homeText.includes("SELECTED WORK") || homeText.includes("Selected Work");
    const hasLetsTalk = homeText.includes("LET&#x27;S TALK") || homeText.includes("LET'S TALK") || homeText.includes("Start a Project Inquiry");
    assert(
      "Test 15: Public website homepage loads with Selected Work & Let's Talk preserved",
      homeRes.status === 200 && hasSelectedWork && hasLetsTalk,
      `Status: ${homeRes.status}, Selected Work: ${hasSelectedWork}, Let's Talk: ${hasLetsTalk}`
    );

    // 16. Public /api/samples returns published samples
    const pubSamplesRes = await fetch(`${BASE}/api/samples`);
    const pubSamplesData = await pubSamplesRes.json();
    assert(
      "Test 16: Public /api/samples returns active samples",
      pubSamplesRes.status === 200 && Array.isArray(pubSamplesData),
      `Status: ${pubSamplesRes.status}, Public samples count: ${pubSamplesData?.length}`
    );

  } catch (err) {
    console.error("Test execution failed with error:", err);
    assert("Unhandled Test Error", false, err.message);
  }

  console.log("\n==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`SUMMARY: ${passed}/${total} tests passed (${failed} failed)`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCategoriesTests();
