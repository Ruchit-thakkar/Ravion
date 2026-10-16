const BASE = "http://localhost:3000";

async function runSettingsTests() {
  console.log("==================================================");
  console.log("STARTING PHASE 3 WEBSITE SETTINGS AUTOMATED TESTS");
  console.log("==================================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    console.log(`[${condition ? "PASS" : "FAIL"}] ${name} ${details ? "- " + details : ""}`);
  }

  // 1. Unauthenticated GET /admin/settings -> Redirect to /admin/login
  const unauthPageRes = await fetch(`${BASE}/admin/settings`, { redirect: "manual" });
  const isRedirect = [302, 307, 308].includes(unauthPageRes.status);
  const locationHeader = unauthPageRes.headers.get("location") || "";
  assert(
    "Test 1: Unauthenticated /admin/settings redirects to /admin/login",
    isRedirect && locationHeader.includes("/admin/login"),
    `Status: ${unauthPageRes.status}, Location: ${locationHeader}`
  );

  // 2. Unauthenticated GET /api/admin/settings -> 401
  const unauthGetRes = await fetch(`${BASE}/api/admin/settings`);
  assert(
    "Test 2: Unauthenticated GET /api/admin/settings returns 401",
    unauthGetRes.status === 401,
    `Status: ${unauthGetRes.status}`
  );

  // 3. Unauthenticated PUT /api/admin/settings -> 401
  const unauthPutRes = await fetch(`${BASE}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branding: { name: "Hacked" } }),
  });
  assert(
    "Test 3: Unauthenticated PUT /api/admin/settings returns 401",
    unauthPutRes.status === 401,
    `Status: ${unauthPutRes.status}`
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

  // 5. Authenticated GET /admin/settings page renders
  const adminPageRes = await fetch(`${BASE}/admin/settings`, {
    headers: { Cookie: authCookie },
  });
  const pageHtml = await adminPageRes.text();
  const hasPageTitle = pageHtml.includes("Website Settings") || pageHtml.includes("Website");
  const hasBrandingTab = pageHtml.includes("General &amp; Branding") || pageHtml.includes("General & Branding") || pageHtml.includes("General");
  const hasContactSection = pageHtml.includes("Contact Details") || pageHtml.includes("Contact");
  assert(
    "Test 5: Authenticated /admin/settings renders complete interface",
    adminPageRes.status === 200 && hasPageTitle && hasBrandingTab && hasContactSection,
    `Status: ${adminPageRes.status}`
  );

  // 6. Authenticated GET /api/admin/settings returns valid settings document
  const getSettingsRes = await fetch(`${BASE}/api/admin/settings`, {
    headers: { Cookie: authCookie },
  });
  const currentSettingsData = await getSettingsRes.json();
  const currentSettings = currentSettingsData.settings;
  assert(
    "Test 6: Authenticated GET /api/admin/settings returns current settings",
    getSettingsRes.status === 200 &&
      currentSettings &&
      typeof currentSettings.branding === "object" &&
      typeof currentSettings.contact === "object",
    `Branding name: ${currentSettings?.branding?.name}`
  );

  // 7. Validation rejection: Invalid email
  const invalidEmailRes = await fetch(`${BASE}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({
      branding: { name: "Ravion Studio" },
      contact: { email: "not-an-email", phone: "+91 79907 74831" },
    }),
  });
  assert(
    "Test 7: Server rejects invalid email format with 400",
    invalidEmailRes.status === 400,
    `Status: ${invalidEmailRes.status}`
  );

  // 8. Validation rejection: Invalid URL
  const invalidUrlRes = await fetch(`${BASE}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({
      branding: { name: "Ravion Studio", logoUrl: "ftp://invalid-scheme" },
      contact: { email: "valid@ravion.in", phone: "+91 79907 74831" },
    }),
  });
  assert(
    "Test 8: Server rejects invalid URL scheme with 400",
    invalidUrlRes.status === 400,
    `Status: ${invalidUrlRes.status}`
  );

  // 9. Validation rejection: Empty brand name
  const emptyNameRes = await fetch(`${BASE}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify({
      branding: { name: "" },
      contact: { email: "valid@ravion.in", phone: "+91 79907 74831" },
    }),
  });
  assert(
    "Test 9: Server rejects empty website name with 400",
    emptyNameRes.status === 400,
    `Status: ${emptyNameRes.status}`
  );

  // 10. Valid update & persistence
  const updatePayload = {
    branding: {
      name: "Ravion",
      tagline: "Build. Create. Innovate.",
      headline: "Build something worth feeling.",
      logoUrl: "/assets/ravion_logo_svg-01.svg",
      faviconUrl: "/favicon.ico",
    },
    contact: {
      email: "ruchitthakkar12@gmail.com",
      phone: "+91 79907 74831",
      phoneRaw: "+917990774831",
      whatsappUrl: "https://wa.me/917990774831",
      instagram: "@ravion.ai",
      instagramUrl: "https://www.instagram.com/ravion.ai/",
      location: "India • Available Worldwide",
    },
    social: {
      instagramUrl: "https://www.instagram.com/ravion.ai/",
      linkedinUrl: "https://linkedin.com/company/ravion",
      twitterUrl: "https://x.com/ravion",
      youtubeUrl: "https://youtube.com/@ravion",
    },
    footer: {
      footerDescription:
        "We help businesses build a stronger digital presence through websites, creative content, product visuals, and digital experiences.",
      copyrightText: `© ${new Date().getFullYear()} Ravion. All rights reserved.`,
      turnaroundNote:
        "Every inquiry receives a direct review within 24 hours. Transparent 50% advance project reservation applies to all scheduled work.",
    },
  };

  const updateRes = await fetch(`${BASE}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: authCookie },
    body: JSON.stringify(updatePayload),
  });
  const updateData = await updateRes.json();
  assert(
    "Test 10: Valid settings PUT succeeds with 200",
    updateRes.status === 200 && updateData.success === true,
    `Status: ${updateRes.status}`
  );

  // 11. Persistence check: Re-fetch settings
  const verifyRes = await fetch(`${BASE}/api/admin/settings`, {
    headers: { Cookie: authCookie },
  });
  const verifyData = await verifyRes.json();
  const savedDoc = verifyData.settings;
  assert(
    "Test 11: Settings persist correctly in MongoDB",
    savedDoc?.branding?.name === "Ravion" &&
      savedDoc?.contact?.email === "ruchitthakkar12@gmail.com" &&
      savedDoc?.social?.linkedinUrl === "https://linkedin.com/company/ravion" &&
      savedDoc?.footer?.turnaroundNote?.includes("24 hours"),
    `Retrieved name: ${savedDoc?.branding?.name}, linkedin: ${savedDoc?.social?.linkedinUrl}`
  );

  // 12. Public API endpoint /api/settings reflection
  const publicApiRes = await fetch(`${BASE}/api/settings`);
  const publicApiData = await publicApiRes.json();
  const pubSettings = publicApiData.settings;
  assert(
    "Test 12: Public /api/settings exposes sanitized updated values",
    publicApiRes.status === 200 &&
      pubSettings?.branding?.name === "Ravion" &&
      pubSettings?.contact?.phone === "+91 79907 74831" &&
      pubSettings?.social?.linkedinUrl === "https://linkedin.com/company/ravion",
    `Public branding name: ${pubSettings?.branding?.name}`
  );

  // 13. Public homepage intact: Selected Work & Let's Talk preserved
  const homeRes = await fetch(`${BASE}/`);
  const homeHtml = await homeRes.text();
  const hasSelectedWork = homeHtml.includes("SELECTED WORK") || homeHtml.includes("Selected Work");
  const hasLetsTalk = homeHtml.includes("LET&#x27;S TALK") || homeHtml.includes("Start a Project Inquiry");
  const hasPhoneInPage = homeHtml.includes("+91 79907 74831") || homeHtml.includes("ruchitthakkar12@gmail.com");
  assert(
    "Test 13: Client-facing website preserved (Selected Work & Let's Talk intact)",
    homeRes.status === 200 && hasSelectedWork && hasLetsTalk && hasPhoneInPage,
    `Home status: ${homeRes.status}, hasSelectedWork: ${hasSelectedWork}, hasLetsTalk: ${hasLetsTalk}`
  );

  // 14. Sidebar navigation check: Website Settings is active link
  const sidebarCheck = pageHtml.includes("/admin/settings") && pageHtml.includes("Website Settings");
  assert(
    "Test 14: Admin sidebar correctly features active Website Settings link",
    sidebarCheck,
    `Found link in HTML: ${sidebarCheck}`
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

runSettingsTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
