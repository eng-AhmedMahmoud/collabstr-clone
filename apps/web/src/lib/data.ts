import type { Category } from "@collabstr/shared-types";

export const CATEGORIES: { label: Category; emoji: string }[] = [
  { label: "Fashion", emoji: "👗" },
  { label: "Beauty", emoji: "💄" },
  { label: "Travel", emoji: "✈️" },
  { label: "Fitness", emoji: "💪" },
  { label: "Food", emoji: "🍜" },
  { label: "Lifestyle", emoji: "🌿" },
  { label: "Tech", emoji: "💻" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Music", emoji: "🎵" },
  { label: "Family", emoji: "👨‍👩‍👧" },
  { label: "Comedy", emoji: "😂" },
  { label: "Pets", emoji: "🐶" },
];

export const PLATFORMS = [
  { value: "instagram" as const, label: "Instagram", icon: "📸" },
  { value: "tiktok" as const, label: "TikTok", icon: "🎬" },
  { value: "youtube" as const, label: "YouTube", icon: "▶️" },
  { value: "ugc" as const, label: "UGC", icon: "🎥" },
];
