export const metadata = { title: "About — Nakhla · نخلة" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">
        About <span className="brand-text">Nakhla · نخلة</span>
      </h1>
      <p className="text-lg text-fg/80 mt-4 leading-relaxed">
        Nakhla (نخلة — &ldquo;palm tree&rdquo;) is an influencer marketplace built for the Kingdom of Saudi Arabia.
        Brands hire vetted Saudi creators on Instagram, TikTok, Snapchat, YouTube, and UGC. Payments settle in
        SAR, escrowed until content is approved.
      </p>
      <p className="text-fg/80 mt-4 leading-relaxed">
        نحن نخدم السوق السعودي بدفع آمن بالريال، دعم بالعربية والإنجليزية، وفواتير ضريبية معتمدة. مهمتنا أن
        نُسهّل التعاون بين العلامات التجارية وصنّاع المحتوى في المملكة.
      </p>
      <p className="text-muted mt-6 text-sm">
        Demo build · Next.js + NestJS + Prisma + PostgreSQL.
      </p>
    </div>
  );
}
