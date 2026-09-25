import { Button } from "../ui/Button";
import { ProductArt } from "../product/ProductArt";
import { Reveal } from "../ui/Reveal";
import { useLanguage } from "../../context/LanguageContext";

export function Promo() {
  const { t, language } = useLanguage();
  const km = language === "km";

  const blocks = [
    {
      art: "jar:forest:2",
      eyebrow: t.home.promoRitualEyebrow,
      title: t.home.promoRitualTitle,
      body: t.home.promoRitualBody,
      cta: { label: t.home.promoRitualCta, to: "/shop" },
      reverse: false,
    },
    {
      art: "dropper:clay:3",
      eyebrow: t.home.promoCleanEyebrow,
      title: t.home.promoCleanTitle,
      body: t.home.promoCleanBody,
      cta: { label: t.home.promoCleanCta, to: "/shop" },
      reverse: true,
    },
  ];

  return (
    <section className={`container-shop flex flex-col gap-16 py-16 sm:py-20 ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
      {blocks.map((block) => (
        <Reveal key={block.title}>
          <div
            className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
              block.reverse ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="overflow-hidden rounded-[2rem]">
              <ProductArt artKey={block.art} label={block.title} className="aspect-4/3 w-full" />
            </div>
            <div className="max-w-lg">
              <p className={`text-sm font-semibold text-clay-dark ${km ? "" : "text-xs uppercase tracking-widest"}`}>{block.eyebrow}</p>
              <h2 className={`mt-2 text-balance text-ink ${km ? "font-khmer-display text-2xl sm:text-3xl" : "font-display text-3xl sm:text-4xl"}`}>
                {block.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">{block.body}</p>
              <Button to={block.cta.to} variant="secondary" size="md" className="mt-6">
                {block.cta.label}
              </Button>
            </div>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
