import { AppState, Platform } from "react-native";
import { QueryClient, focusManager } from "@tanstack/react-query";
import { ApiError } from "./client";

// RN has no window focus events — wire AppState into react-query's
// focusManager so foregrounding the app refetches stale queries.
AppState.addEventListener("change", (status) => {
  if (Platform.OS !== "web") focusManager.setFocused(status === "active");
});

// Shared across the app; wrapped in QueryClientProvider at root layout.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (count, err) => {
        if (err instanceof ApiError && err.status >= 400 && err.status < 500) return false;
        return count < 2;
      },
      // Refetch stale queries when the app returns to the foreground
      // (driven by the AppState → focusManager wiring above).
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});
