const BASE = "http://localhost:3000";

async function runBioTests() {
  console.log("==================================================");
  console.log("STARTING PHASE 7 LINK IN BIO AUTOMATED TESTS");
  console.log("==================================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    console.log(`[${condition ? "PASS" : "FAIL"}] ${name} ${details ? "- " + details : ""}`);
  }

  try {
    // 1. Unauthenticated /admin/bio -> Redirects to /admin/login
    const unauthPageRes = await fetch(`${BASE}/admin/bio`, { redirect: "manual" });
    const isRedirect = [302, 307, 308].includes(unauthPageRes.status);
    const locationHeader = unauthPageRes.headers.get("location") || "";
    assert(
      "Test 1: Unauthenticated /admin/bio redirects to /admin/login",
      isRedirect && locationHeader.includes("/admin/login"),
      `Status: ${unauthPageRes.status}, Location: ${locationHeader}`
    );

    // 2. Unauthenticated GET /api/admin/bio -> 401
    const unauthGetRes = await fetch(`${BASE}/api/admin/bio`);
    assert(
      "Test 2: Unauthenticated GET /api/admin/bio returns 401",
      unauthGetRes.status === 401,
      `Status: ${unauthGetRes.status}`
    );

    // 3. Unauthenticated PUT /api/admin/bio -> 401
    const unauthPutRes = await fetch(`${BASE}/api/admin/bio`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: "Hacker" }),
    });
    assert(
      "Test 3: Unauthenticated PUT /api/admin/bio returns 401",
      unauthPutRes.status === 401,
      `Status: ${unauthPutRes.status}`
    );

    // 4. Unauthenticated POST /api/admin/bio/links -> 401
    const unauthPostLinkRes = await fetch(`${BASE}/api/admin/bio/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauth Link", url: "https://example.com" }),
    });
    assert(
      "Test 4: Unauthenticated POST /api/admin/bio/links returns 401",
      unauthPostLinkRes.status === 401,
      `Status: ${unauthPostLinkRes.status}`
    );

    // 5. Admin Authentication
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ruchit@gmail.com", password: "ruchit@123" }),
    });
    const rawCookie = loginRes.headers.get("set-cookie");
    const authCookie = rawCookie ? rawCookie.split(";")[0] : "";
    assert(
      "Test 5: Admin authentication succeeds",
      loginRes.status === 200 && Boolean(authCookie),
      `Status: ${loginRes.status}, Has cookie: ${Boolean(authCookie)}`
    );

    // 6. Authenticated GET /admin/bio loads successfully
    const adminPageRes = await fetch(`${BASE}/admin/bio`, {
      headers: { Cookie: authCookie },
    });
    const adminPageText = await adminPageRes.text();
    assert(
      "Test 6: Authenticated /admin/bio renders complete interface",
      adminPageRes.status === 200 && adminPageText.includes("Link in Bio Management"),
      `Status: ${adminPageRes.status}, Has Title: ${adminPageText.includes("Link in Bio Management")}`
    );

    // 7. Authenticated GET /api/admin/bio returns profile & links
    const getBioRes = await fetch(`${BASE}/api/admin/bio`, {
      headers: { Cookie: authCookie },
    });
    const bioData = await getBioRes.json();
    assert(
      "Test 7: GET /api/admin/bio returns profile and links array",
      getBioRes.status === 200 &&
        Boolean(bioData.profile) &&
        Array.isArray(bioData.links) &&
        typeof bioData.stats?.totalLinks === "number",
      `Total links: ${bioData.stats?.totalLinks}, Display Name: ${bioData.profile?.displayName}`
    );

    // 8. Update profile settings (PUT /api/admin/bio)
    const originalProfile = bioData.profile;
    const testTimestamp = Date.now();
    const updatedTagline = `BUILD · CREATE · INNOVATE · ${testTimestamp}`;
    const updateBioRes = await fetch(`${BASE}/api/admin/bio`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        ...originalProfile,
        displayName: "Ravion Studio",
        shortBio: updatedTagline,
        status: "Published",
      }),
    });
    const updateBioData = await updateBioRes.json();
    assert(
      "Test 8: PUT /api/admin/bio updates profile settings",
      updateBioRes.status === 200 && updateBioData.profile?.shortBio === updatedTagline,
      `Status: ${updateBioRes.status}, Tagline: ${updateBioData.profile?.shortBio}`
    );

    // 9. URL Validation: Rejection of unsafe or malformed URLs
    const invalidUrlRes = await fetch(`${BASE}/api/admin/bio/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "Malicious Link",
        url: "javascript:alert('XSS')",
      }),
    });
    const invalidUrlData = await invalidUrlRes.json();
    assert(
      "Test 9a: Server rejects unsafe javascript: protocol with 400",
      invalidUrlRes.status === 400 && invalidUrlData.error?.includes("URL"),
      `Status: ${invalidUrlRes.status}, Error: ${invalidUrlData.error}`
    );

    const emptyTitleRes = await fetch(`${BASE}/api/admin/bio/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: "",
        url: "https://example.com",
      }),
    });
    assert(
      "Test 9b: Server rejects empty title with 400",
      emptyTitleRes.status === 400,
      `Status: ${emptyTitleRes.status}`
    );

    // 10. Create a new Link (POST /api/admin/bio/links)
    const testLinkTitle = `Test Showcase Link ${testTimestamp}`;
    const createLinkRes = await fetch(`${BASE}/api/admin/bio/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: testLinkTitle,
        url: "https://example.com/test-showcase",
        description: "Automated test link for Phase 7 verification",
        icon: "sparkles",
        isActive: true,
        isFeatured: true,
      }),
    });
    const createLinkData = await createLinkRes.json();
    const createdLinkId = createLinkData.link?._id;
    assert(
      "Test 10: Create new link succeeds with 201",
      createLinkRes.status === 201 && Boolean(createdLinkId) && createLinkData.link?.title === testLinkTitle,
      `Status: ${createLinkRes.status}, ID: ${createdLinkId}`
    );

    // 11. Edit Link (PUT /api/admin/bio/links/[id])
    const updatedLinkDesc = "Updated automated test description";
    const editLinkRes = await fetch(`${BASE}/api/admin/bio/links/${createdLinkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: testLinkTitle,
        url: "https://example.com/test-showcase-updated",
        description: updatedLinkDesc,
        isActive: true,
        isFeatured: true,
      }),
    });
    const editLinkData = await editLinkRes.json();
    assert(
      "Test 11: Edit link updates successfully (200)",
      editLinkRes.status === 200 && editLinkData.link?.description === updatedLinkDesc,
      `Status: ${editLinkRes.status}, Desc: ${editLinkData.link?.description}`
    );

    // 12. Create a second link & Test Reordering (PATCH /api/admin/bio/links/reorder)
    const secondLinkRes = await fetch(`${BASE}/api/admin/bio/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        title: `Second Link ${testTimestamp}`,
        url: "https://example.com/second",
        order: 99,
      }),
    });
    const secondLinkData = await secondLinkRes.json();
    const secondLinkId = secondLinkData.link?._id;

    const reorderRes = await fetch(`${BASE}/api/admin/bio/links/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({
        links: [
          { id: secondLinkId, order: 1 },
          { id: createdLinkId, order: 2 },
        ],
      }),
    });
    const reorderData = await reorderRes.json();
    assert(
      "Test 12: Reorder links bulk update succeeds (200)",
      reorderRes.status === 200 && reorderData.success === true,
      `Status: ${reorderRes.status}, Success: ${reorderData.success}`
    );

    // 13. Disabled link is not exposed publicly
    // Disable second link
    await fetch(`${BASE}/api/admin/bio/links/${secondLinkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ isActive: false }),
    });

    const publicBioRes = await fetch(`${BASE}/api/bio`);
    const publicBioData = await publicBioRes.json();
    const secondInPublic = (publicBioData.links || []).some((l) => l._id === secondLinkId);
    const firstInPublic = (publicBioData.links || []).some((l) => l._id === createdLinkId);
    assert(
      "Test 13: Disabled link is hidden from public API while active link is visible",
      publicBioRes.status === 200 && !secondInPublic && firstInPublic,
      `Public count: ${publicBioData.links?.length}, HasActive: ${firstInPublic}, HasDisabled: ${secondInPublic}`
    );

    // 14. Safe Deletion of Links
    const deleteLinkRes = await fetch(`${BASE}/api/admin/bio/links/${createdLinkId}`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });
    assert(
      "Test 14a: Authorized link deletion succeeds (200)",
      deleteLinkRes.status === 200,
      `Status: ${deleteLinkRes.status}`
    );

    // Clean up second link
    await fetch(`${BASE}/api/admin/bio/links/${secondLinkId}`, {
      method: "DELETE",
      headers: { Cookie: authCookie },
    });

    const verifyDeletedRes = await fetch(`${BASE}/api/admin/bio/links/${createdLinkId}`, {
      headers: { Cookie: authCookie },
    });
    assert(
      "Test 14b: Deleted link returns 404 upon re-fetch",
      verifyDeletedRes.status === 404,
      `Status: ${verifyDeletedRes.status}`
    );

    // 15. Public /bio page loads with 200 and renders brand identity
    const publicPageRes = await fetch(`${BASE}/bio`);
    const publicPageHtml = await publicPageRes.text();
    const hasDisplayName = publicPageHtml.includes("Ravion");
    const hasFooter = publicPageHtml.includes("Crafted with passion");
    assert(
      "Test 15: Public /bio page loads successfully with luxury branding",
      publicPageRes.status === 200 && hasDisplayName && hasFooter,
      `Status: ${publicPageRes.status}, Has Name: ${hasDisplayName}, Has Footer: ${hasFooter}`
    );

    // 16. Client-facing website preserved (Selected Work & Let's Talk intact)
    const homeRes = await fetch(`${BASE}/`);
    const homeHtml = await homeRes.text();
    const hasSelectedWork = homeHtml.includes("SELECTED WORK") || homeHtml.includes("Selected Work");
    const hasLetsTalk =
      homeHtml.includes("LET&#x27;S TALK") ||
      homeHtml.includes("LET'S TALK") ||
      homeHtml.includes("Start a Project Inquiry");
    assert(
      "Test 16: Public homepage preserved (Selected Work & Let's Talk intact)",
      homeRes.status === 200 && hasSelectedWork && hasLetsTalk,
      `Status: ${homeRes.status}, SelectedWork: ${hasSelectedWork}, LetsTalk: ${hasLetsTalk}`
    );

    // 17. Admin sidebar features active Link in Bio link
    const hasBioInSidebar = adminPageText.includes("/admin/bio") && adminPageText.includes("Link in Bio");
    assert(
      "Test 17: Admin sidebar features active Link in Bio route",
      hasBioInSidebar,
      `Found /admin/bio in sidebar: ${hasBioInSidebar}`
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

runBioTests();
