import type { Metadata } from "next";
import "./globals.css";
import { getLocale, dirOf, messages, type Dict } from "@/lib/i18n";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "Nakhla — Admin",
  description: "Operational control plane for the Nakhla marketplace.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dict = messages[locale] as Dict;
  return (
    <html lang={locale} dir={dirOf(locale)} className="h-full antialiased">
      <body className="min-h-full">
        <LocaleProvider locale={locale} t={dict}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
