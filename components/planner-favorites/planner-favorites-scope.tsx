"use client";

import { createContext, useContext } from "react";
import type { PlannerSignInPath } from "@/lib/auth/planner-sign-in-url";

const PlannerFavoritesScopeContext = createContext(false);
const PlannerSignInPathContext = createContext<PlannerSignInPath>(null);

export function PlannerSignInPathProvider({
  signInPath,
  children,
}: {
  signInPath: PlannerSignInPath;
  children: React.ReactNode;
}) {
  return (
    <PlannerSignInPathContext.Provider value={signInPath}>
      {children}
    </PlannerSignInPathContext.Provider>
  );
}

export function usePlannerSignInPath(): PlannerSignInPath {
  return useContext(PlannerSignInPathContext);
}

export function PlannerFavoritesScope({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <PlannerFavoritesScopeContext.Provider value={enabled}>
      {children}
    </PlannerFavoritesScopeContext.Provider>
  );
}

export function usePlannerFavoritesEnabled(): boolean {
  return useContext(PlannerFavoritesScopeContext);
}
