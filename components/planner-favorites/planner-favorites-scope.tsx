"use client";

import { createContext, useContext } from "react";

const PlannerFavoritesScopeContext = createContext(false);

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
