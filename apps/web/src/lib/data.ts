import type { Category } from "@collabstr/shared-types";

export const CATEGORIES: { label: Category; ar: string; emoji: string }[] = [
  { label: "Fashion", ar: "أزياء", emoji: "👗" },
  { label: "Beauty", ar: "جمال", emoji: "💄" },
  { label: "Travel", ar: "سفر", emoji: "✈️" },
  { label: "Fitness", ar: "لياقة", emoji: "💪" },
  { label: "Food", ar: "طعام", emoji: "🍽️" },
  { label: "Lifestyle", ar: "أسلوب حياة", emoji: "🌿" },
  { label: "Tech", ar: "تقنية", emoji: "💻" },
  { label: "Gaming", ar: "ألعاب", emoji: "🎮" },
  { label: "Music", ar: "موسيقى", emoji: "🎵" },
  { label: "Family", ar: "عائلة", emoji: "👨‍👩‍👧" },
  { label: "Comedy", ar: "كوميديا", emoji: "😂" },
  { label: "Pets", ar: "حيوانات أليفة", emoji: "🐾" },
];

export const PLATFORMS = [
  { value: "instagram" as const, label: "Instagram", ar: "إنستغرام", icon: "📸" },
  { value: "tiktok" as const, label: "TikTok", ar: "تيك توك", icon: "🎬" },
  { value: "youtube" as const, label: "YouTube", ar: "يوتيوب", icon: "▶️" },
  { value: "ugc" as const, label: "UGC", ar: "محتوى من المستخدم", icon: "🎥" },
];

export const KSA_CITIES = [
  { en: "Riyadh", ar: "الرياض" },
  { en: "Jeddah", ar: "جدة" },
  { en: "Dammam", ar: "الدمام" },
  { en: "Khobar", ar: "الخبر" },
  { en: "Mecca", ar: "مكة المكرمة" },
  { en: "Medina", ar: "المدينة المنورة" },
  { en: "Taif", ar: "الطائف" },
  { en: "Tabuk", ar: "تبوك" },
  { en: "Abha", ar: "أبها" },
  { en: "Buraidah", ar: "بريدة" },
  { en: "NEOM", ar: "نيوم" },
  { en: "AlUla", ar: "العُلا" },
];
