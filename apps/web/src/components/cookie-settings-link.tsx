"use client";

import { useT } from "@/components/locale-provider";
import { openConsentManager } from "@/components/cookie-consent";

export function CookieSettingsLink() {
  const i = useT();
  return (
    <button type="button" onClick={openConsentManager} className="hover:text-white transition-colors">
      {i.privacyData.cookieTitle}
    </button>
  );
}
