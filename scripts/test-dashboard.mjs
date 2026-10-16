const BASE = 'http://localhost:3000';

async function runDashboardTests() {
  console.log('--- STARTING PHASE 2 ADMIN DASHBOARD TESTS ---\n');

  // Test 1: Unauthenticated request to /admin -> Redirect to /admin/login
  const unauthRes = await fetch(BASE + '/admin', { redirect: 'manual' });
  console.log('Test 1 - Unauthenticated /admin redirect status:', unauthRes.status, 'Location:', unauthRes.headers.get('location'));
  const test1Passed = (unauthRes.status === 307 || unauthRes.status === 308 || unauthRes.status === 302) && (unauthRes.headers.get('location') || '').includes('/admin/login');
  console.log('Test 1 Passed:', test1Passed);

  // Test 2: Unauthenticated request to /api/admin/metrics -> 401 Unauthorized
  const unauthApi = await fetch(BASE + '/api/admin/metrics');
  console.log('Test 2 - Unauthenticated /api/admin/metrics status:', unauthApi.status);
  console.log('Test 2 Passed:', unauthApi.status === 401);

  // Test 3: Authenticate with Phase 1 credentials
  const loginRes = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ruchit@gmail.com', password: 'ruchit@123' })
  });
  const loginData = await loginRes.json();
  const rawCookie = loginRes.headers.get('set-cookie');
  const authCookie = rawCookie ? rawCookie.split(';')[0] : '';
  console.log('Test 3 - Login status:', loginRes.status, 'Has Cookie:', !!authCookie);
  console.log('Test 3 Passed:', loginRes.status === 200 && !!authCookie);

  // Test 4: Authenticated /admin page load
  const adminPageRes = await fetch(BASE + '/admin', {
    headers: { 'Cookie': authCookie }
  });
  const html = await adminPageRes.text();
  console.log('Test 4 - Authenticated /admin status:', adminPageRes.status);
  const hasSidebar = html.includes('Dashboard') && html.includes('Website Settings') && html.includes('Client Inquiries') && html.includes('Portfolio Samples') && html.includes('Categories');
  const hasCards = html.includes('PORTFOLIO SAMPLES') && html.includes('CATEGORIES') && html.includes('TOTAL INQUIRIES') && html.includes('NEW INQUIRIES');
  const hasRecentInquiries = html.includes('Recent Client Inquiries');
  const hasRecentSamples = html.includes('Recent Portfolio Samples');
  const hasRoadmap = html.includes('Quick Actions &amp; Roadmap Modules') || html.includes('Quick Actions');
  console.log('Test 4 Passed:', adminPageRes.status === 200 && hasSidebar && hasCards && hasRecentInquiries && hasRecentSamples && hasRoadmap);

  // Test 5: Authenticated /api/admin/metrics endpoint
  const metricsRes = await fetch(BASE + '/api/admin/metrics', {
    headers: { 'Cookie': authCookie }
  });
  const metricsData = await metricsRes.json();
  console.log('Test 5 - /api/admin/metrics status:', metricsRes.status);
  console.log('Test 5 - Stats:', metricsData.stats);
  console.log('Test 5 - Inquiries count:', metricsData.recentInquiries?.length);
  console.log('Test 5 - Samples count:', metricsData.recentSamples?.length);
  const test5Passed = metricsRes.status === 200 &&
    typeof metricsData.stats?.totalSamples === 'number' &&
    typeof metricsData.stats?.totalCategories === 'number' &&
    typeof metricsData.stats?.totalInquiries === 'number' &&
    typeof metricsData.stats?.newInquiries === 'number' &&
    Array.isArray(metricsData.recentInquiries) &&
    Array.isArray(metricsData.recentSamples);
  console.log('Test 5 Passed:', test5Passed);

  // Test 6: Verify real data matching MongoDB
  console.log('Test 6 - Real data check: totalSamples =', metricsData.stats.totalSamples, ', totalInquiries =', metricsData.stats.totalInquiries);
  console.log('Test 6 Passed:', metricsData.stats.totalSamples === 2 && metricsData.stats.totalInquiries >= 3);

  // Test 7: Logout functionality
  const logoutRes = await fetch(BASE + '/api/auth/logout', {
    method: 'POST',
    headers: { 'Cookie': authCookie }
  });
  const logoutCookie = logoutRes.headers.get('set-cookie');
  console.log('Test 7 - Logout status:', logoutRes.status);
  console.log('Test 7 Passed:', logoutRes.status === 200);

  // Test 8: Post-logout request to /admin -> Redirect to /admin/login
  const postLogoutAdmin = await fetch(BASE + '/admin', {
    headers: { 'Cookie': logoutCookie ? logoutCookie.split(';')[0] : '' },
    redirect: 'manual'
  });
  console.log('Test 8 - Post-logout /admin redirect status:', postLogoutAdmin.status, 'Location:', postLogoutAdmin.headers.get('location'));
  console.log('Test 8 Passed:', (postLogoutAdmin.status === 307 || postLogoutAdmin.status === 308 || postLogoutAdmin.status === 302));

  // Test 9: Public website preservation (Selected Work, Let's Talk, /samples)
  const homeRes = await fetch(BASE + '/');
  const homeText = await homeRes.text();
  const samplesRes = await fetch(BASE + '/api/samples');
  const samplesData = await samplesRes.json();
  const hasSelectedWork = homeText.includes('SELECTED WORK') || homeText.includes('Selected Work');
  const hasLetsTalk = homeText.includes('LET&#x27;S TALK') || homeText.includes('Start a Project Inquiry');
  console.log('Test 9 - Public site check: home 200 =', homeRes.status === 200, ', hasSelectedWork =', hasSelectedWork, ', hasLetsTalk =', hasLetsTalk, ', samplesCount =', samplesData.length);
  console.log('Test 9 Passed:', homeRes.status === 200 && hasSelectedWork && hasLetsTalk && samplesData.length > 0);

  console.log('\n--- ALL DASHBOARD TESTS COMPLETE ---');
}

runDashboardTests().catch(console.error);
