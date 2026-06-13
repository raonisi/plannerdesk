import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  FIREBASE_PUBLIC_CONFIG_ENV_KEYS,
  getFirebasePublicConfig,
  getMissingFirebasePublicConfigKeys,
  isFirebasePublicConfigConfigured,
} from "@/lib/firebase/project-config";

const ROOT = process.cwd();
const previousEnv = new Map<string, string | undefined>();

function rememberFirebaseEnv() {
  for (const key of FIREBASE_PUBLIC_CONFIG_ENV_KEYS) {
    if (!previousEnv.has(key)) previousEnv.set(key, process.env[key]);
  }
}

afterEach(() => {
  for (const [key, value] of previousEnv.entries()) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  previousEnv.clear();
});

describe("Firebase project config", () => {
  it("documents placeholder env keys without real Firebase values", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");

    for (const key of FIREBASE_PUBLIC_CONFIG_ENV_KEYS) {
      assert.match(example, new RegExp(`^${key}=`, "m"));
    }

    assert.doesNotMatch(example, /firebaseapp\.com\/__/);
    assert.doesNotMatch(example, /AIza[0-9A-Za-z_-]{20,}/);
  });

  it("returns null when the public Firebase config is incomplete", () => {
    rememberFirebaseEnv();
    for (const key of FIREBASE_PUBLIC_CONFIG_ENV_KEYS) delete process.env[key];
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "plannerdesk-dev";

    assert.equal(isFirebasePublicConfigConfigured(), false);
    assert.equal(getFirebasePublicConfig(), null);
    assert.deepEqual(
      getMissingFirebasePublicConfigKeys(),
      FIREBASE_PUBLIC_CONFIG_ENV_KEYS.filter(
        (key) => key !== "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      ),
    );
  });

  it("builds a complete Firebase public config from env", () => {
    rememberFirebaseEnv();
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "placeholder-api-key";
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "plannerdesk-dev.firebaseapp.com";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "plannerdesk-dev";
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "plannerdesk-dev.appspot.com";
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "1234567890";
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:1234567890:web:abcdef";

    assert.equal(isFirebasePublicConfigConfigured(), true);
    assert.deepEqual(getMissingFirebasePublicConfigKeys(), []);
    assert.deepEqual(getFirebasePublicConfig(), {
      apiKey: "placeholder-api-key",
      authDomain: "plannerdesk-dev.firebaseapp.com",
      projectId: "plannerdesk-dev",
      storageBucket: "plannerdesk-dev.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef",
    });
  });
});
