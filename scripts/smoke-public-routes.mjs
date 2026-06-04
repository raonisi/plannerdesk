import { exit } from "node:process";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/** PR110: expanded public route smoke (requires running server — `npm run start`). */
const routes = [
  { path: "/", expectedStatus: 200 },
  { path: "/directory", expectedStatus: 200 },
  { path: "/claim-documents", expectedStatus: 200 },
  { path: "/disclosure-links", expectedStatus: 200 },
  { path: "/message-templates", expectedStatus: 200 },
  { path: "/search", expectedStatus: 200 },
  { path: "/knowledge", expectedStatus: 200 },
  { path: "/community", expectedStatus: 200 },
  { path: "/search?q=test", expectedStatus: 200 },
  { path: "/knowledge/nonexistent-fixture-slug-pr110", expectedStatus: 404 },
];

console.log(`[plannerdesk] Starting smoke test against BASE_URL: ${BASE_URL}`);

let failures = 0;

for (const route of routes) {
  const url = `${BASE_URL}${route.path}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const status = res.status;
    const isExpected = Array.isArray(route.expectedStatus)
      ? route.expectedStatus.includes(status)
      : status === route.expectedStatus;

    if (isExpected) {
      console.log(`[PASS] ${route.path} -> Status ${status} (Expected: ${route.expectedStatus})`);
    } else {
      console.error(`[FAIL] ${route.path} -> Status ${status} (Expected: ${route.expectedStatus})`);
      failures++;
    }
  } catch (error) {
    console.error(`[ERROR] ${route.path} -> Fetch failed: ${error.message}`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`[FAIL] Smoke test completed with ${failures} failure(s).`);
  exit(1);
} else {
  console.log("[PASS] All public route smoke tests passed successfully!");
  exit(0);
}
