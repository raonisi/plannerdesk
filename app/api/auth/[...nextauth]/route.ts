/**
 * Auth.js catch-all route handler for PlannerDesk.
 *
 * Exposes GET/POST at /api/auth/* using handlers from auth.ts.
 * Admin routes enforce RBAC server-side; public MVP pages stay open.
 *
 * @see auth.ts
 * @see docs/AUTH_RBAC_PRODUCTION.md
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
