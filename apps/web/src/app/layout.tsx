import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeScript } from "@/components/theme-script";
import { getLocale, dirOf, messages, type Dict } from "@/lib/i18n";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "Nakhla — Hire KSA Influencers & UGC Creators",
  description:
    "Hire creators in Saudi Arabia across Instagram, TikTok, YouTube, Snapchat, and UGC. Vetted talent, secure SAR payments, real results.",
  applicationName: "Nakhla",
  keywords: ["Saudi Arabia", "KSA", "influencer marketing", "UGC", "TikTok", "Instagram", "Snapchat", "Riyadh", "Jeddah", "نخلة", "مؤثرين", "السعودية"],
  openGraph: {
    title: "Nakhla — نخلة",
    description: "Hire vetted creators across the Kingdom. Pay in SAR. Ship campaigns in days.",
    locale: "en_SA",
    alternateLocale: ["ar_SA"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dict = messages[locale] as Dict;
  return (
    <html lang={locale} dir={dirOf(locale)} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <LocaleProvider locale={locale} t={dict}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
