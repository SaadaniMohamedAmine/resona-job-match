import { getTranslations } from "next-intl/server";

const CATEGORY_ITEMS = {
  frontend: ["Next.js 16", "React 19 + TypeScript", "Tailwind CSS v4"],
  ai: ["Groq — Llama 3.3 70B", "HuggingFace Inference"],
  data: ["PostgreSQL on Neon", "pgvector", "Prisma"],
  platform: [
    "NextAuth v5",
    "Stripe",
    "Upstash Redis",
    "UploadThing",
    "next-intl",
    "Sentry",
    "Vercel",
  ],
} as const;

export default async function BuiltWithPage() {
  const t = await getTranslations("builtWith");

  const stack = [
    { category: t("categoryFrontend"), prefix: "frontend", items: CATEGORY_ITEMS.frontend },
    { category: t("categoryAi"), prefix: "ai", items: CATEGORY_ITEMS.ai },
    { category: t("categoryData"), prefix: "data", items: CATEGORY_ITEMS.data },
    { category: t("categoryPlatform"), prefix: "platform", items: CATEGORY_ITEMS.platform },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-24 md:px-16">
      <div className="mb-16 text-center">
        <h1 className="font-display text-3xl font-bold text-base-light">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-16">
        {stack.map((group) => (
          <section key={group.category}>
            <h2 className="mb-6 font-display text-lg font-medium text-base-light">{group.category}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.items.map((name, i) => (
                <div
                  key={name}
                  className="rounded-(--radius-card) border border-track p-6 transition-colors hover:border-accent/40"
                >
                  <p className="font-display text-base font-medium text-base-light">{name}</p>
                  <p className="mt-2 text-sm text-muted">{t(`${group.prefix}Item${i + 1}Detail`)}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
