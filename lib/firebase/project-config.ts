/**
 * Firebase project configuration helpers.
 * Client SDK values are not treated as application secrets, but real values
 * still belong in ignored env files or deployment variables.
 */

export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export const FIREBASE_PUBLIC_CONFIG_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export type FirebasePublicConfigEnvKey = (typeof FIREBASE_PUBLIC_CONFIG_ENV_KEYS)[number];

const envKeyByConfigKey: Record<keyof FirebasePublicConfig, FirebasePublicConfigEnvKey> = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
};

export function getMissingFirebasePublicConfigKeys(): FirebasePublicConfigEnvKey[] {
  return FIREBASE_PUBLIC_CONFIG_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

export function isFirebasePublicConfigConfigured(): boolean {
  return getMissingFirebasePublicConfigKeys().length === 0;
}

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  if (!isFirebasePublicConfigConfigured()) return null;

  return {
    apiKey: process.env[envKeyByConfigKey.apiKey]!.trim(),
    authDomain: process.env[envKeyByConfigKey.authDomain]!.trim(),
    projectId: process.env[envKeyByConfigKey.projectId]!.trim(),
    storageBucket: process.env[envKeyByConfigKey.storageBucket]!.trim(),
    messagingSenderId: process.env[envKeyByConfigKey.messagingSenderId]!.trim(),
    appId: process.env[envKeyByConfigKey.appId]!.trim(),
  };
}
