import { cookies } from "next/headers";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get("locale")?.value;
  return v === "ar" ? "ar" : "en";
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export const messages = {
  en: {
    brand: { name: "Nakhla", tagline: "Influencer marketing for KSA — finally easy." },
    nav: {
      find: "Find Creators",
      campaigns: "Campaigns",
      forCreators: "For Creators",
      pricing: "Pricing",
      login: "Log in",
      signup: "Sign up",
    },
    home: {
      badge: "Made in KSA · 910,000+ vetted creators",
      headline: "Influencer marketing in KSA,",
      headlineAccent: "finally easy.",
      sub: "Hire top KSA creators on Instagram, TikTok, Snapchat, YouTube, and UGC. Browse vetted Saudi talent, pay securely in SAR, and ship content that converts in Riyadh, Jeddah, Dammam, and beyond.",
      searchPlaceholder: "Search niche, name, or city",
      searchButton: "Search",
      featuredTitle: "Featured creators",
      featuredSub: "Top talent across every platform",
    },
    home_steps: [
      { t: "Browse for free", d: "Filter vetted KSA creators by niche, city, and audience demographics. No subscription." },
      { t: "Pay safely in SAR", d: "Funds held in escrow and released only on approval. Mada, Apple Pay, and bank transfer ready." },
      { t: "Get content fast", d: "Receive ready-to-publish content shaped for Saudi audiences in your dashboard." },
    ],
    login: {
      title: "Log in",
      sub: "Welcome back.",
      email: "Email",
      password: "Password",
      submit: "Log in",
      newHere: "New here?",
      createOne: "Create an account",
      forgot: "Forgot password?",
      remember: "Remember me",
      welcome: "Welcome back",
      heroH2: "Pick up where you left off.",
      googleSoon: "Continue with Google (soon)",
      appleSoon: "Continue with Apple (soon)",
      or: "or",
    },
    footer: {
      blurb: "Hire vetted creators in KSA across Instagram, TikTok, Snapchat, YouTube, and UGC. Pay safely in SAR.",
      brands: "Brands",
      creators: "Creators",
      company: "Company",
      findCreators: "Find creators",
      postCampaign: "Post a campaign",
      pricing: "Pricing",
      dashboard: "Dashboard",
      joinCreator: "Join as a creator",
      earnings: "Earnings",
      inbox: "Inbox",
      about: "About",
      blog: "Blog",
      contact: "Contact",
      terms: "Terms",
      privacy: "Privacy",
    },
    locale: { en: "EN", ar: "AR", switchTo: "العربية" },
  },
  ar: {
    brand: { name: "نخلة", tagline: "تسويق المؤثرين في المملكة، أسهل من أي وقت." },
    nav: {
      find: "ابحث عن مؤثر",
      campaigns: "الحملات",
      forCreators: "للمبدعين",
      pricing: "الأسعار",
      login: "تسجيل دخول",
      signup: "إنشاء حساب",
    },
    home: {
      badge: "صنع في السعودية · أكثر من 910 ألف مؤثر موثوق",
      headline: "تسويق المؤثرين في المملكة،",
      headlineAccent: "أسهل من أي وقت.",
      sub: "وظّف أفضل المؤثرين السعوديين على إنستغرام، تيك توك، سناب شات، يوتيوب ومحتوى UGC. تصفح المواهب الموثوقة، وادفع بأمان بالريال، واطلق محتوى يحقق نتائج في الرياض وجدة والدمام وغيرها.",
      searchPlaceholder: "ابحث عن مؤثر أو تخصص أو مدينة",
      searchButton: "بحث",
      featuredTitle: "مؤثرون مميزون",
      featuredSub: "أبرز المواهب عبر المنصات",
    },
    home_steps: [
      { t: "تصفح مجاناً", d: "صنّف المؤثرين حسب التخصص والمدينة والجمهور. بدون اشتراك ولا عقد." },
      { t: "ادفع بأمان بالريال", d: "أموالك في ضمان حتى موافقتك على التسليم. ندعم مدى وApple Pay والتحويل البنكي." },
      { t: "احصل على المحتوى بسرعة", d: "محتوى جاهز للنشر مُصمَّم للجمهور السعودي في لوحة تحكمك." },
    ],
    login: {
      title: "تسجيل دخول",
      sub: "أهلاً بعودتك.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      submit: "تسجيل دخول",
      newHere: "جديد هنا؟",
      createOne: "أنشئ حساباً",
      forgot: "نسيت كلمة المرور؟",
      remember: "تذكّرني",
      welcome: "أهلاً بعودتك",
      heroH2: "أكمل من حيث توقفت.",
      googleSoon: "المتابعة بحساب Google (قريباً)",
      appleSoon: "المتابعة بحساب Apple (قريباً)",
      or: "أو",
    },
    footer: {
      blurb: "وظّف مؤثرين موثوقين في المملكة على إنستغرام وتيك توك وسناب شات ويوتيوب وUGC. ادفع بأمان بالريال.",
      brands: "العلامات التجارية",
      creators: "المبدعون",
      company: "الشركة",
      findCreators: "ابحث عن مؤثر",
      postCampaign: "أنشر حملة",
      pricing: "الأسعار",
      dashboard: "لوحة التحكم",
      joinCreator: "انضم كمؤثر",
      earnings: "الأرباح",
      inbox: "الرسائل",
      about: "من نحن",
      blog: "المدونة",
      contact: "تواصل معنا",
      terms: "الشروط",
      privacy: "الخصوصية",
    },
    locale: { en: "EN", ar: "AR", switchTo: "English" },
  },
} as const;

export type Dict = (typeof messages)["en"];
export async function t(): Promise<Dict> {
  const locale = await getLocale();
  return messages[locale] as Dict;
}
