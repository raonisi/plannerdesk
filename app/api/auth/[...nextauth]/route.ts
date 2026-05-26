/**
 * Auth.js catch-all route handler for PlannerDesk.
 *
 * This exposes the GET and POST handlers required by Auth.js v5
 * at /api/auth/*. No real login providers are configured yet,
 * so these endpoints will not perform actual authentication.
 *
 * This route handler:
 * - Does not expose secrets.
 * - Does not connect to BOA CRM, Aiven, or any customer data source.
 * - Does not require database tables.
 * - Does not block public MVP pages.
 *
 * @see auth.ts for the Auth.js configuration.
 * @see docs/AUTH_FOUNDATION_PLAN.md
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
