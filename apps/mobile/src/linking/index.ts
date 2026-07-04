import * as Linking from "expo-linking";

// Universal-link host — must match what apps/web deploys to. When we share
// links from the mobile app we prefer https so recipients without the app
// still get a working web page.
export const WEB_HOST = "https://nakhla.dev";

// Build a deep link. Uses https when we have a public web page for the
// resource; falls back to the app scheme (nakhla://) otherwise. expo-router
// resolves both forms against the file-based route tree, so no extra route
// wiring is needed for creator/[username], orders/[id], campaigns/[id],
// messages/[threadId], (auth)/verify-email, (auth)/forgot-password, etc.
export function buildShareUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${WEB_HOST}${clean}`;
}

// nakhla://path/... — used for internal share sheets that MUST open the app.
export function buildAppUrl(path: string): string {
  return Linking.createURL(path);
}
