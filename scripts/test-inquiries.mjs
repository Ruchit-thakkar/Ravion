const BASE = "http://localhost:3000";

async function runInquiriesTests() {
  console.log("==================================================");
  console.log("STARTING PHASE 4 CLIENT INQUIRIES AUTOMATED TESTS");
  console.log("==================================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    console.log(`[${condition ? "PASS" : "FAIL"}] ${name} ${details ? "- " + details : ""}`);
  }

  // 1. Unauthenticated GET /admin/inquiries -> Redirect to /admin/login
  const unauthPageRes = await fetch(`${BASE}/admin/inquiries`, { redirect: "manual" });
  const isRedirect = [302, 307, 308].includes(unauthPageRes.status);
  const locationHeader = unauthPageRes.headers.get("location") || "";
  assert(
    "Test 1: Unauthenticated /admin/inquiries redirects to /admin/login",
    isRedirect && locationHeader.includes("/admin/login"),
    `Status: ${unauthPageRes.status}, Location: ${locationHeader}`
  );

  // 2. Unauthenticated GET /api/admin/inquiries -> 401
  const unauthGetRes = await fetch(`${BASE}/api/admin/inquiries`);
  assert(
    "Test 2: Unauthenticated GET /api/admin/inquiries returns 401",
    unauthGetRes.status === 401,
    `Status: ${unauthGetRes.status}`
  );

  // 3. Unauthenticated PATCH /api/admin/inquiries/[id] -> 401
  const unauthPatchRes = await fetch(`${BASE}/api/admin/inquiries/6a9858795f0f56c4f4263e57`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "read" }),
  });
  assert(
    "Test 3: Unauthenticated PATCH /api/admin/inquiries/[id] returns 401",
    unauthPatchRes.status === 401,
    `Status: ${unauthPatchRes.status}`
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

  // 5. Authenticated GET /admin/inquiries page renders
  const adminPageRes = await fetch(`${BASE}/admin/inquiries`, {
    headers: { Cookie: authCookie },
  });
  const pageHtml = await adminPageRes.text();
  const hasPageHeading = pageHtml.includes("Client Inquiries") || pageHtml.includes("Client");
  const hasSidebarLink = pageHtml.includes("/admin/inquiries");
  const hasPhaseBadge = pageHtml.includes("Phase 4 Active");
  assert(
    "Test 5: Authenticated /admin/inquiries page renders complete interface",
    adminPageRes.status === 200 && hasPageHeading && hasSidebarLink && hasPhaseBadge,
    `Status: ${adminPageRes.status}`
  );

  // 6. Authenticated GET /api/admin/inquiries returns inquiries and counts
  const getInquiriesRes = await fetch(`${BASE}/api/admin/inquiries`, {
    headers: { Cookie: authCookie },
  });
  const inquiriesData = await getInquiriesRes.json();
  const inquiries = inquiriesData.inquiries || [];
  const counts = inquiriesData.counts || {};
  assert(
    "Test 6: Authenticated GET /api/admin/inquiries returns inquiries array and counts",
    getInquiriesRes.status === 200 &&
      Array.isArray(inquiries) &&
      typeof counts.total === "number" &&
      typeof counts.new === "number",
    `Total: ${counts.total}, New: ${counts.new}, Returned items: ${inquiries.length}`
  );

  // 7. Search inquiries by client name
  const searchRes = await fetch(`${BASE}/api/admin/inquiries?q=Ruchit`, {
    headers: { Cookie: authCookie },
  });
  const searchData = await searchRes.json();
  const searchMatches = searchData.inquiries || [];
  const allMatchSearch = searchMatches.length > 0 && searchMatches.every(
    (i) =>
      i.name.toLowerCase().includes("ruchit") ||
      i.email.toLowerCase().includes("ruchit") ||
      i.message.toLowerCase().includes("ruchit")
  );
  assert(
    "Test 7: Search by keyword returns matching inquiries",
    searchRes.status === 200 && allMatchSearch,
    `Matches count: ${searchMatches.length}`
  );

  // 8. Filter inquiries by status
  const filterRes = await fetch(`${BASE}/api/admin/inquiries?status=new`, {
    headers: { Cookie: authCookie },
  });
  const filterData = await filterRes.json();
  const filteredItems = filterData.inquiries || [];
  const allNew = filteredItems.every((i) => i.status === "new");
  assert(
    "Test 8: Filter by status 'new' returns only new inquiries",
    filterRes.status === 200 && allNew,
    `Filtered count: ${filteredItems.length}`
  );

  // 9. Contact form public submission workflow
  const testName = `Phase4 Test Client ${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  const testPhone = "+91 98765 43210";
  const testService = "Website Development";
  const testMessage = "Hello Ravion team, testing the automated inquiry integration for Phase 4.";

  const submitRes = await fetch(`${BASE}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      phone: testPhone,
      service: testService,
      message: testMessage,
    }),
  });
  const submitData = await submitRes.json();
  const newInquiryId = submitData.id;
  assert(
    "Test 9: Public contact form submits successfully (POST /api/inquiries)",
    submitRes.status === 201 && submitData.success === true && Boolean(newInquiryId),
    `Status: ${submitRes.status}, Inserted ID: ${newInquiryId}`
  );

  // 10. Newly submitted inquiry immediately appears in Admin Inquiries API
  const singleInquiryRes = await fetch(`${BASE}/api/admin/inquiries/${newInquiryId}`, {
    headers: { Cookie: authCookie },
  });
  const singleData = await singleInquiryRes.json();
  const fetchedInq = singleData.inquiry;
  assert(
    "Test 10: Newly created inquiry is immediately retrievable via admin API",
    singleInquiryRes.status === 200 &&
      fetchedInq &&
      fetchedInq.name === testName &&
      fetchedInq.email === testEmail &&
      fetchedInq.status === "new",
    `Name: ${fetchedInq?.name}, Status: ${fetchedInq?.status}`
  );

  // 11. Status update: PATCH /api/admin/inquiries/[id] to 'in_progress'
  const patchRes = await fetch(`${BASE}/api/admin/inquiries/${newInquiryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({ status: "in_progress" }),
  });
  const patchData = await patchRes.json();
  assert(
    "Test 11: Status update PATCH succeeds with 200",
    patchRes.status === 200 && patchData.inquiry?.status === "in_progress",
    `Updated status: ${patchData.inquiry?.status}`
  );

  // 12. Verify status persistence by re-fetching
  const verifyPatchRes = await fetch(`${BASE}/api/admin/inquiries/${newInquiryId}`, {
    headers: { Cookie: authCookie },
  });
  const verifyPatchData = await verifyPatchRes.json();
  assert(
    "Test 12: Updated status persists in MongoDB upon re-fetch",
    verifyPatchData.inquiry?.status === "in_progress",
    `Persisted status: ${verifyPatchData.inquiry?.status}`
  );

  // 13. Rejection of invalid status update (e.g. status: 'invalid_status')
  const invalidStatusRes = await fetch(`${BASE}/api/admin/inquiries/${newInquiryId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({ status: "nonexistent_status" }),
  });
  assert(
    "Test 13: Server rejects invalid status with 400",
    invalidStatusRes.status === 400,
    `Status: ${invalidStatusRes.status}`
  );

  // 14. Safe deletion: DELETE /api/admin/inquiries/[id]
  const deleteRes = await fetch(`${BASE}/api/admin/inquiries/${newInquiryId}`, {
    method: "DELETE",
    headers: { Cookie: authCookie },
  });
  const deleteData = await deleteRes.json();
  assert(
    "Test 14: Authorized deletion succeeds with 200",
    deleteRes.status === 200 && deleteData.success === true,
    `Status: ${deleteRes.status}`
  );

  // 15. Verify deleted inquiry no longer exists (404)
  const verifyDeletedRes = await fetch(`${BASE}/api/admin/inquiries/${newInquiryId}`, {
    headers: { Cookie: authCookie },
  });
  assert(
    "Test 15: Re-fetching deleted inquiry returns 404",
    verifyDeletedRes.status === 404,
    `Status: ${verifyDeletedRes.status}`
  );

  // 16. Public website integrity: Homepage, Selected Work, Let's Talk preserved
  const homeRes = await fetch(`${BASE}/`);
  const homeHtml = await homeRes.text();
  const hasSelectedWork = homeHtml.includes("SELECTED WORK") || homeHtml.includes("Selected Work");
  const hasLetsTalk = homeHtml.includes("LET&#x27;S TALK") || homeHtml.includes("Start a Project Inquiry");
  assert(
    "Test 16: Client-facing website preserved (Selected Work & Let's Talk intact)",
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

runInquiriesTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
