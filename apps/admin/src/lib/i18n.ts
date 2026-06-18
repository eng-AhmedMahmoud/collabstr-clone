import { cookies } from "next/headers";

export type Locale = "en" | "ar";
export const DEFAULT_LOCALE: Locale = "en";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get("locale")?.value;
  return v === "ar" ? "ar" : "en";
}

export function dirOf(l: Locale): "ltr" | "rtl" {
  return l === "ar" ? "rtl" : "ltr";
}

export const messages = {
  en: {
    brand: { name: "Nakhla", sub: "Admin console" },
    nav: {
      operate: "Operate",
      catalog: "Catalog",
      system: "System",
      overview: "Overview",
      orders: "Orders",
      disputes: "Disputes",
      payouts: "Payouts",
      audit: "Audit log",
      users: "Users",
      creators: "Creators",
      brands: "Brands",
      campaigns: "Campaigns",
      reviews: "Reviews",
      flowMap: "Flow map",
      broadcast: "Broadcast",
      settings: "Settings",
      marketplace: "Open marketplace ↗",
    },
    login: {
      title: "Sign in",
      sub: "Admin role required.",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      notAdmin: "That account doesn't have admin permissions.",
    },
    locale: { switchTo: "العربية" },
  },
  ar: {
    brand: { name: "نخلة", sub: "لوحة المدير" },
    nav: {
      operate: "العمليات",
      catalog: "السجل",
      system: "النظام",
      overview: "نظرة عامة",
      orders: "الطلبات",
      disputes: "النزاعات",
      payouts: "المدفوعات",
      audit: "سجل التدقيق",
      users: "المستخدمون",
      creators: "المؤثرون",
      brands: "العلامات التجارية",
      campaigns: "الحملات",
      reviews: "التقييمات",
      flowMap: "خريطة النظام",
      broadcast: "إشعار جماعي",
      settings: "الإعدادات",
      marketplace: "افتح السوق ↗",
    },
    login: {
      title: "تسجيل دخول المدير",
      sub: "صلاحيات المدير مطلوبة.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      submit: "تسجيل دخول",
      notAdmin: "هذا الحساب لا يملك صلاحيات المدير.",
    },
    locale: { switchTo: "English" },
  },
} as const;

export type Dict = (typeof messages)["en"];
export async function t(): Promise<Dict> {
  return messages[await getLocale()] as Dict;
}
