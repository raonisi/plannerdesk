import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PlannerFavoritesLoginPrompt } from "@/components/planner-favorites/planner-favorites-login-prompt";
import { PlannerSignInPathProvider } from "@/components/planner-favorites/planner-favorites-scope";
import {
  PLANNER_SIGN_IN_PATHS,
  type PlannerSignInPath,
} from "@/lib/auth/planner-sign-in-url";

const SignInPathProviderForTest = PlannerSignInPathProvider as ComponentType<{
  signInPath: PlannerSignInPath;
}>;

function restoreEnv(name: "AUTH_GOOGLE_ID" | "AUTH_GOOGLE_SECRET", value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

describe("PR-PD-HYDRATION-STABILITY-01 login UI initial markup contract", () => {
  it("OAuth sign-in CTA uses native anchors and preserves safe callback markup", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "components/planner-favorites/planner-favorites-login-prompt.tsx",
      ),
      "utf8",
    );
    const compactMarkup = renderToStaticMarkup(
      createElement(
        SignInPathProviderForTest,
        { signInPath: PLANNER_SIGN_IN_PATHS.google },
        createElement(PlannerFavoritesLoginPrompt, {
          callbackPath: "/directory",
          compact: true,
        }),
      ),
    );
    const fullMarkup = renderToStaticMarkup(
      createElement(
        SignInPathProviderForTest,
        { signInPath: PLANNER_SIGN_IN_PATHS.google },
        createElement(PlannerFavoritesLoginPrompt, {
          callbackPath: "/directory",
        }),
      ),
    );

    assert.doesNotMatch(source, /from\s+["']next\/link["']/);
    assert.doesNotMatch(source, /<Link\b/);
    assert.equal(source.match(/<a\b/g)?.length, 2);
    assert.match(
      compactMarkup,
      /^<a[^>]+href="\/api\/auth\/signin\/google\?callbackUrl=%2Fdirectory"/,
    );
    assert.match(
      fullMarkup,
      /<a[^>]+href="\/api\/auth\/signin\/google\?callbackUrl=%2Fdirectory"/,
    );
  });

  it("keeps unavailable markup when the server snapshot has no sign-in path", () => {
    const compactMarkup = renderToStaticMarkup(
      createElement(
        SignInPathProviderForTest,
        { signInPath: null },
        createElement(PlannerFavoritesLoginPrompt, { compact: true }),
      ),
    );
    const fullMarkup = renderToStaticMarkup(
      createElement(
        SignInPathProviderForTest,
        { signInPath: null },
        createElement(PlannerFavoritesLoginPrompt),
      ),
    );

    assert.match(compactMarkup, /^<span\b/);
    assert.doesNotMatch(compactMarkup, /<a\b/);
    assert.match(fullMarkup, /^<div\b/);
    assert.doesNotMatch(fullMarkup, /<a\b/);
  });

  it("reuses one server-selected non-sensitive sign-in path across runtime env differences", () => {
    const originalId = process.env.AUTH_GOOGLE_ID;
    const originalSecret = process.env.AUTH_GOOGLE_SECRET;

    try {
      process.env.AUTH_GOOGLE_ID = "hydration-test-id";
      process.env.AUTH_GOOGLE_SECRET = "hydration-test-secret";
      // Browser hydration is validated separately; this test isolates the initial markup contract.
      const authConfiguredMarkup = renderToStaticMarkup(
        createElement(
          SignInPathProviderForTest,
          { signInPath: PLANNER_SIGN_IN_PATHS.google },
          createElement(PlannerFavoritesLoginPrompt, {
            callbackPath: "/",
            compact: true,
          }),
        ),
      );

      delete process.env.AUTH_GOOGLE_ID;
      delete process.env.AUTH_GOOGLE_SECRET;
      const authEnvMissingMarkup = renderToStaticMarkup(
        createElement(
          SignInPathProviderForTest,
          { signInPath: PLANNER_SIGN_IN_PATHS.google },
          createElement(PlannerFavoritesLoginPrompt, {
            callbackPath: "/",
            compact: true,
          }),
        ),
      );

      assert.equal(authEnvMissingMarkup, authConfiguredMarkup);
      assert.match(
        authConfiguredMarkup,
        /<a[^>]+href="\/api\/auth\/signin\/google\?callbackUrl=%2F"/,
      );
      assert.doesNotMatch(authEnvMissingMarkup, /^<span/);
    } finally {
      restoreEnv("AUTH_GOOGLE_ID", originalId);
      restoreEnv("AUTH_GOOGLE_SECRET", originalSecret);
    }
  });
});
