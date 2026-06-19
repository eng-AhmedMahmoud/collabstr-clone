import { Controller, Get } from "@nestjs/common";
import { ReqLocale, type Locale } from "../common/locale";
import type { Category, OrderStatus } from "@prisma/client";

// Static dicts. Source of truth for human-readable labels of Prisma enums.
// Kept inside the API so the backend can localize push titles, emails, and
// system events without depending on a frontend bundle.
const CATEGORIES: Record<Category, { en: string; ar: string }> = {
  Fashion:   { en: "Fashion",       ar: "أزياء" },
  Beauty:    { en: "Beauty",        ar: "جمال" },
  Travel:    { en: "Travel",        ar: "سفر" },
  Fitness:   { en: "Fitness",       ar: "لياقة" },
  Food:      { en: "Food",          ar: "طعام" },
  Lifestyle: { en: "Lifestyle",     ar: "أسلوب حياة" },
  Tech:      { en: "Tech",          ar: "تقنية" },
  Gaming:    { en: "Gaming",        ar: "ألعاب" },
  Music:     { en: "Music",         ar: "موسيقى" },
  Family:    { en: "Family",        ar: "عائلة" },
  Comedy:    { en: "Comedy",        ar: "كوميديا" },
  Pets:      { en: "Pets",          ar: "حيوانات أليفة" },
};

const ORDER_STATUSES: Record<OrderStatus, { en: string; ar: string }> = {
  pending_payment:    { en: "Pending payment",     ar: "بانتظار الدفع" },
  awaiting_creator:   { en: "Awaiting creator",    ar: "بانتظار المؤثر" },
  in_progress:        { en: "In progress",         ar: "قيد التنفيذ" },
  submitted:          { en: "Submitted",           ar: "تم التسليم" },
  revision_requested: { en: "Revision requested",  ar: "طلب تعديل" },
  approved:           { en: "Approved",            ar: "موافق عليه" },
  released:           { en: "Released",            ar: "مُحرَّر" },
  cancelled:          { en: "Cancelled",           ar: "ملغى" },
  disputed:           { en: "Disputed",            ar: "نزاع" },
};

@Controller("i18n")
export class I18nController {
  @Get("categories")
  categories(@ReqLocale() locale: Locale) {
    return Object.entries(CATEGORIES).map(([key, v]) => ({ key, label: v[locale] }));
  }

  @Get("statuses/orders")
  orderStatuses(@ReqLocale() locale: Locale) {
    return Object.entries(ORDER_STATUSES).map(([key, v]) => ({ key, label: v[locale] }));
  }

  @Get("locales")
  locales() {
    return { supported: ["en", "ar"], default: "en" };
  }
}
