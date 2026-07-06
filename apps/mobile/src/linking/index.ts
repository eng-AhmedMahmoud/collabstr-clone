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

// Route patterns the app actually ships screens for. Notification hrefs come
// from the API in web-path form (e.g. "/orders/abc123") — anything outside
// this list has no mobile screen and must not be pushed.
const ROUTABLE_PATHS: RegExp[] = [
  /^\/orders\/[^/]+$/,
  /^\/campaigns\/[^/]+$/,
  /^\/creator\/[^/]+$/,
  /^\/messages\/[^/]+$/,
  /^\/notifications$/,
  /^\/saved$/,
  /^\/checkout$/,
  /^\/dashboard\/(brand|creator|packages)$/,
];

// Map an API-provided notification href (web path or absolute URL on our
// host) to an in-app route. Returns null when there's no matching screen.
export function mapNotificationHref(href?: string | null): string | null {
  if (!href) return null;
  let path = href.trim();
  const abs = path.match(/^https?:\/\/[^/]+(\/.*)?$/i);
  if (abs) path = abs[1] ?? "/";
  if (!path.startsWith("/")) path = `/${path}`;
  const clean = path.split(/[?#]/)[0];
  return ROUTABLE_PATHS.some((re) => re.test(clean)) ? path : null;
}
