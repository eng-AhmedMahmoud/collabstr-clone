// Client-side form validation with localized, field-specific messages, plus a
// translator for the API's error responses (Zod field errors, Prisma 409s).
// Mirrors the server DTO rules in @collabstr/shared-types so users get instant
// feedback in their own language instead of a bare "Validation failed".

export type Locale = "en" | "ar";

type Msg = Record<Locale, string>;
const M = {
  nameRequired: { en: "Enter your full name.", ar: "أدخل اسمك الكامل." },
  nameShort: { en: "Name must be at least 2 characters.", ar: "يجب ألا يقل الاسم عن حرفين." },
  emailRequired: { en: "Enter your email address.", ar: "أدخل بريدك الإلكتروني." },
  emailInvalid: { en: "Enter a valid email address.", ar: "أدخل بريدًا إلكترونيًا صحيحًا." },
  passwordShort: { en: "Password must be at least 8 characters.", ar: "يجب ألا تقل كلمة المرور عن 8 أحرف." },
  handleRequired: { en: "Choose a handle.", ar: "اختر معرّفًا." },
  handleShort: { en: "Handle must be at least 3 characters.", ar: "يجب ألا يقل المعرّف عن 3 أحرف." },
  emailTaken: { en: "An account with this email already exists.", ar: "يوجد حساب بهذا البريد الإلكتروني بالفعل." },
  invalidCredentials: { en: "Wrong email or password.", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
  rateLimited: { en: "Too many attempts. Try again in a minute.", ar: "محاولات كثيرة. حاول مرة أخرى بعد دقيقة." },
  network: { en: "Network error. Check your connection and retry.", ar: "خطأ في الشبكة. تحقق من اتصالك وحاول مجددًا." },
  generic: { en: "Something went wrong. Please try again.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى." },
  conflict: { en: "You've already done that.", ar: "لقد قمت بذلك بالفعل." },
  // Campaign / listing fields
  titleRequired: { en: "Enter a title.", ar: "أدخل عنوانًا." },
  titleShort: { en: "Title must be at least 3 characters.", ar: "يجب ألا يقل العنوان عن 3 أحرف." },
  descriptionRequired: { en: "Add a description.", ar: "أضف وصفًا." },
  descriptionShort: { en: "Description must be at least 20 characters.", ar: "يجب ألا يقل الوصف عن 20 حرفًا." },
  platformsRequired: { en: "Select at least one platform.", ar: "اختر منصة واحدة على الأقل." },
  categoriesRequired: { en: "Select at least one category.", ar: "اختر فئة واحدة على الأقل." },
  budgetRequired: { en: "Enter a budget range.", ar: "أدخل نطاق الميزانية." },
  budgetInvalid: { en: "Enter a valid budget amount.", ar: "أدخل مبلغ ميزانية صحيحًا." },
  budgetOrder: { en: "Maximum budget must be greater than the minimum.", ar: "يجب أن يكون الحد الأقصى للميزانية أكبر من الحد الأدنى." },
  // Pricing (packages + applications)
  priceRequired: { en: "Enter a price.", ar: "أدخل السعر." },
  priceInt: { en: "Price must be a whole number.", ar: "يجب أن يكون السعر رقمًا صحيحًا." },
  priceMin: { en: "Price must be at least 10.", ar: "يجب ألا يقل السعر عن 10." },
  // Checkout brief + application pitch
  briefRequired: { en: "Add a brief for the creator.", ar: "أضف موجزًا للمُبدع." },
  briefShort: { en: "Brief must be at least 10 characters.", ar: "يجب ألا يقل الموجز عن 10 أحرف." },
  pitchRequired: { en: "Write a short pitch.", ar: "اكتب عرضًا موجزًا." },
  pitchShort: { en: "Pitch must be at least 10 characters.", ar: "يجب ألا يقل العرض عن 10 أحرف." },
  // Mawthooq license
  licenseRequired: { en: "Enter your license number.", ar: "أدخل رقم الترخيص." },
  licenseShort: { en: "License number must be at least 4 characters.", ar: "يجب ألا يقل رقم الترخيص عن 4 أحرف." },
  // Account + security
  currentPasswordRequired: { en: "Enter your current password.", ar: "أدخل كلمة المرور الحالية." },
  // Messaging
  messageEmpty: { en: "Type a message first.", ar: "اكتب رسالة أولًا." },
  // Profile editing (brand + creator)
  brandNameShort: { en: "Brand name must be at least 2 characters.", ar: "يجب ألا يقل اسم العلامة عن حرفين." },
  urlInvalid: { en: "Enter a valid URL (starting with http).", ar: "أدخل رابطًا صحيحًا (يبدأ بـ http)." },
  followersInvalid: { en: "Follower counts must be whole numbers (0 or more).", ar: "يجب أن تكون أعداد المتابعين أرقامًا صحيحة (صفر أو أكثر)." },
} satisfies Record<string, Msg>;

export type ValidationKey = keyof typeof M;
export const msg = (key: ValidationKey, locale: Locale) => M[key][locale];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldError = { field: string; message: string };

export function validateSignup(
  f: { name: string; email: string; password: string; handle?: string; role: "brand" | "creator" | null },
  locale: Locale,
): FieldError | null {
  if (!f.name.trim()) return { field: "name", message: msg("nameRequired", locale) };
  if (f.name.trim().length < 2) return { field: "name", message: msg("nameShort", locale) };
  if (!f.email.trim()) return { field: "email", message: msg("emailRequired", locale) };
  if (!EMAIL_RE.test(f.email.trim())) return { field: "email", message: msg("emailInvalid", locale) };
  if (f.password.length < 8) return { field: "password", message: msg("passwordShort", locale) };
  if (f.role === "creator") {
    const h = (f.handle ?? "").replace(/^@/, "").trim();
    if (!h) return { field: "handle", message: msg("handleRequired", locale) };
    if (h.length < 3) return { field: "handle", message: msg("handleShort", locale) };
  }
  return null;
}

export function validateLogin(
  f: { email: string; password: string },
  locale: Locale,
): FieldError | null {
  if (!f.email.trim()) return { field: "email", message: msg("emailRequired", locale) };
  if (!EMAIL_RE.test(f.email.trim())) return { field: "email", message: msg("emailInvalid", locale) };
  if (!f.password) return { field: "password", message: msg("passwordShort", locale) };
  return null;
}

const INT_PRICE_MIN = 10;

function validatePrice(price: string, locale: Locale): FieldError | null {
  const n = Number(price);
  if (!price.trim() || !Number.isFinite(n)) return { field: "price", message: msg("priceRequired", locale) };
  if (!Number.isInteger(n)) return { field: "price", message: msg("priceInt", locale) };
  if (n < INT_PRICE_MIN) return { field: "price", message: msg("priceMin", locale) };
  return null;
}

// New campaign brief + targeting + budget (multi-step form).
export function validateCampaign(
  f: { title: string; description: string; platforms: string[]; categories: string[]; budgetMin: string; budgetMax: string },
  locale: Locale,
): FieldError | null {
  if (!f.title.trim()) return { field: "title", message: msg("titleRequired", locale) };
  if (f.title.trim().length < 3) return { field: "title", message: msg("titleShort", locale) };
  if (!f.description.trim()) return { field: "description", message: msg("descriptionRequired", locale) };
  if (f.description.trim().length < 20) return { field: "description", message: msg("descriptionShort", locale) };
  if (f.platforms.length === 0) return { field: "platforms", message: msg("platformsRequired", locale) };
  if (f.categories.length === 0) return { field: "categories", message: msg("categoriesRequired", locale) };
  if (!f.budgetMin.trim() || !f.budgetMax.trim()) return { field: "budget", message: msg("budgetRequired", locale) };
  const min = Number(f.budgetMin), max = Number(f.budgetMax);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) return { field: "budget", message: msg("budgetInvalid", locale) };
  if (max < min) return { field: "budget", message: msg("budgetOrder", locale) };
  return null;
}

// Creator package (title + integer price ≥ 10).
export function validatePackage(f: { title: string; price: string }, locale: Locale): FieldError | null {
  if (!f.title.trim()) return { field: "title", message: msg("titleRequired", locale) };
  if (f.title.trim().length < 3) return { field: "title", message: msg("titleShort", locale) };
  return validatePrice(f.price, locale);
}

// Campaign application (integer price ≥ 10 + pitch).
export function validateApplication(f: { price: string; pitch: string }, locale: Locale): FieldError | null {
  const priceError = validatePrice(f.price, locale);
  if (priceError) return priceError;
  if (!f.pitch.trim()) return { field: "pitch", message: msg("pitchRequired", locale) };
  if (f.pitch.trim().length < 10) return { field: "pitch", message: msg("pitchShort", locale) };
  return null;
}

// Checkout brief (min length).
export function validateBrief(brief: string, locale: Locale): FieldError | null {
  if (!brief.trim()) return { field: "brief", message: msg("briefRequired", locale) };
  if (brief.trim().length < 10) return { field: "brief", message: msg("briefShort", locale) };
  return null;
}

// Mawthooq license number.
export function validateLicense(licenseNo: string, locale: Locale): FieldError | null {
  if (!licenseNo.trim()) return { field: "licenseNo", message: msg("licenseRequired", locale) };
  if (licenseNo.trim().length < 4) return { field: "licenseNo", message: msg("licenseShort", locale) };
  return null;
}

// Account display name.
export function validateName(name: string, locale: Locale): FieldError | null {
  if (!name.trim()) return { field: "name", message: msg("nameRequired", locale) };
  if (name.trim().length < 2) return { field: "name", message: msg("nameShort", locale) };
  return null;
}

// Password change (current present + next ≥ 8).
export function validatePasswordChange(f: { current: string; next: string }, locale: Locale): FieldError | null {
  if (!f.current) return { field: "current", message: msg("currentPasswordRequired", locale) };
  if (f.next.length < 8) return { field: "next", message: msg("passwordShort", locale) };
  return null;
}

// Chat message body (non-empty).
export function validateMessage(body: string, locale: Locale): FieldError | null {
  if (!body.trim()) return { field: "body", message: msg("messageEmpty", locale) };
  return null;
}

const URL_RE = /^https?:\/\/.+/i;

// Creator self-editing their profile. Most fields are free-form; we only guard
// the URL and the numeric follower counts (blank = "leave unset").
export function validateCreatorProfile(
  f: { coverUrl: string; followersIg: string; followersTt: string; followersYt: string },
  locale: Locale,
): FieldError | null {
  if (f.coverUrl.trim() && !URL_RE.test(f.coverUrl.trim())) return { field: "coverUrl", message: msg("urlInvalid", locale) };
  const followerFields = [
    ["followersIg", f.followersIg],
    ["followersTt", f.followersTt],
    ["followersYt", f.followersYt],
  ] as const;
  for (const [field, val] of followerFields) {
    if (val.trim()) {
      const n = Number(val);
      if (!Number.isInteger(n) || n < 0) return { field, message: msg("followersInvalid", locale) };
    }
  }
  return null;
}

// Brand self-editing their profile. Brand name is required (≥2, mirrors the
// API); website + logo URLs are optional but must look like URLs when present.
export function validateBrandProfile(
  f: { brandName: string; website: string; logoUrl: string },
  locale: Locale,
): FieldError | null {
  if (f.brandName.trim().length < 2) return { field: "brandName", message: msg("brandNameShort", locale) };
  if (f.website.trim() && !URL_RE.test(f.website.trim())) return { field: "website", message: msg("urlInvalid", locale) };
  if (f.logoUrl.trim() && !URL_RE.test(f.logoUrl.trim())) return { field: "logoUrl", message: msg("urlInvalid", locale) };
  return null;
}

// Map an API error response to a localized message. Covers Zod field errors
// ({message:"Validation failed", issues:{fieldErrors}}), Prisma 409 conflicts,
// 401 auth failures and 429 rate limits.
export function serverErrorMessage(
  status: number,
  body: any,
  locale: Locale,
  ctx: "signup" | "login" | "generic" = "generic",
): string {
  if (status === 429) return msg("rateLimited", locale);
  if (status === 401) return msg("invalidCredentials", locale);
  if (status === 409) return msg(ctx === "signup" ? "emailTaken" : "conflict", locale);
  // Zod field errors — surface the first offending field with our copy.
  const fe = body?.issues?.fieldErrors as Record<string, string[]> | undefined;
  if (fe) {
    if (fe.email) return msg("emailInvalid", locale);
    if (fe.password) return msg("passwordShort", locale);
    if (fe.name) return msg("nameShort", locale);
    if (fe.handle) return msg("handleShort", locale);
    if (fe.title) return msg("titleShort", locale);
    if (fe.description) return msg("descriptionShort", locale);
    if (fe.price) return msg("priceMin", locale);
    if (fe.pitch) return msg("pitchShort", locale);
    if (fe.brief) return msg("briefShort", locale);
    if (fe.licenseNo) return msg("licenseShort", locale);
    if (fe.body) return msg("messageEmpty", locale);
    if (fe.budgetMin || fe.budgetMax) return msg("budgetInvalid", locale);
  }
  if (ctx === "login") return msg("invalidCredentials", locale);
  return msg("generic", locale);
}
