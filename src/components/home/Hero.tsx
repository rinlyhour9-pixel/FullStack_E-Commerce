import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { ProductArt } from "../product/ProductArt";
import { useLanguage } from "../../context/LanguageContext";
import { ChevronRightIcon, RefreshIcon, ShieldIcon, TruckIcon } from "../ui/icons";

export function Hero() {
  const { t, language } = useLanguage();

  const trustPoints = [
    { icon: TruckIcon, label: t.common.freeShippingOver50 },
    { icon: ShieldIcon, label: t.common.veganCrueltyFree },
    { icon: RefreshIcon, label: t.common.returns30Day },
  ];

  return (
    <section className="relative overflow-hidden bg-cream-dark/50">
      <div className="khmer-divider" aria-hidden="true" />
      <div className="container-shop grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-8 lg:py-24">
        <div className={`relative z-10 max-w-xl ${language === "km" ? "font-khmer" : ""}`} lang={language === "km" ? "km" : undefined}>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-forest">
            {t.home.heroEyebrow}
          </span>
          <h1
            className={`text-balance font-medium leading-[1.08] text-ink ${
              language === "km" ? "font-khmer-display text-3xl sm:text-4xl lg:text-5xl" : "font-display text-4xl sm:text-5xl lg:text-6xl"
            }`}
          >
            {t.home.heroTitleStart}
            <span className="italic text-clay">{t.home.heroTitleItalic}</span>
            {t.home.heroTitleEnd}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">{t.home.heroDescription}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/shop" size="lg" iconRight={<ChevronRightIcon className="h-4 w-4" />}>
              {t.home.heroCtaPrimary}
            </Button>
            <Button to="/shop?category=serums" size="lg" variant="outline">
              {t.home.heroCtaSecondary}
            </Button>
          </div>

          <p className="mt-5 text-sm text-ink-soft">
            {t.home.heroRoutinePrompt}{" "}
            <Link to="/routine-finder" className="font-semibold text-forest underline decoration-forest/30 underline-offset-4 transition hover:text-clay-dark">
              {t.home.heroRoutineLink}
            </Link>
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-ink-soft">
                <Icon className="h-4.5 w-4.5 shrink-0 text-forest" />
                <dt className="sr-only">Benefit</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4 sm:gap-5">
          <div className="translate-y-6 overflow-hidden rounded-[2rem] border border-white/70 shadow-card-hover">
            <ProductArt artKey="dropper:gold:0" label="Bakuchiol Renewal Serum" className="aspect-3/4" />
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-white/70 shadow-card-hover">
            <ProductArt artKey="jar:forest:1" label="Barrier Repair Cream" className="aspect-3/4" />
          </div>
          <div className="col-span-2 -mt-6 overflow-hidden rounded-[2rem] border border-white/70 shadow-card-hover">
            <ProductArt artKey="tube:clay:2" label="Velvet Clay Cleanser" className="aspect-16/9" />
          </div>
          <div
            className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gold/30 blur-2xl sm:h-32 sm:w-32"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-sage/40 blur-2xl sm:h-36 sm:w-36"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
