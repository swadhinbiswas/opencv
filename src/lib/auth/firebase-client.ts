"use client";

import { env } from "@/lib/env-client";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Firebase client auth, initialised lazily and only when the SDK env is
 * present. When it isn't, the app uses its built-in dev-auth fallback
 * (see lib/auth/client-helpers.ts).
 */
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export function firebaseAuth(): Auth {
  if (authInstance) return authInstance;
  app = initializeApp({
    apiKey: env.firebaseClient.apiKey,
    authDomain: env.firebaseClient.authDomain,
    projectId: env.firebaseClient.projectId,
    storageBucket: env.firebaseClient.storageBucket,
    appId: env.firebaseClient.appId,
  });
  authInstance = getAuth(app);
  return authInstance!;
}

export function firebaseConfigured(): boolean {
  return Boolean(
    env.firebaseClient.apiKey &&
      env.firebaseClient.projectId,
  );
}