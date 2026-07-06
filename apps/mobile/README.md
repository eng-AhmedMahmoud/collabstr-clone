# Nakhla mobile (Expo SDK 54)

## API URL configuration

`src/api/client.ts` resolves the API base URL from `EXPO_PUBLIC_API_URL`.

- **Dev**: if the env var is unset, the app falls back to Expo's LAN `hostUri`
  (port 4000), so a phone on the same wifi reaches the mac automatically. If
  the env var points at `localhost` on a physical device, the LAN host from
  `hostUri` is swapped in while keeping the env port.
- **Production / preview builds**: the env var is **required** — the app
  throws at startup rather than shipping a build pointed at localhost.

> **CHANGE ME**: `eas.json` sets `EXPO_PUBLIC_API_URL` to the placeholder
> `https://api.nakhla.sa` in the `preview` and `production` build profiles
> (JSON can't carry comments, hence this note). Update it to the real
> deployed API origin before cutting any preview/production build.
