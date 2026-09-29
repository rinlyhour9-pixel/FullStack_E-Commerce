import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProductGrid } from "../components/product/ProductGrid";
import { Button } from "../components/ui/Button";
import { useProducts } from "../context/ProductsContext";
import { useLanguage } from "../context/LanguageContext";
import type { Product, SkinType } from "../types/product";
import { ChevronRightIcon } from "../components/ui/icons";

const SKIN_TYPE_VALUES: SkinType[] = ["dry", "oily", "combination", "sensitive", "all"];

const CONCERN_VALUES = ["hydration", "calm", "glow", "balance", "aging", "sunProtection"] as const;
type Concern = (typeof CONCERN_VALUES)[number];

const CONCERN_WORDS: Record<Concern, string[]> = {
  hydration: ["hydration", "hydrate", "dry", "moisture", "hyaluronic", "plump"],
  calm: ["calm", "sooth", "sensitive", "redness", "oat", "barrier"],
  glow: ["bright", "glow", "vitamin c", "tone", "radiant", "dark spot"],
  balance: ["balance", "oil", "pore", "clay", "congestion", "cleanser"],
  aging: ["retinol", "bakuchiol", "peptide", "firm", "fine line", "renewal", "niacinamide"],
  sunProtection: ["spf", "sun", "mineral", "zinc", "broad-spectrum", "defense"],
};

const ROUTINE_STEP_CATEGORIES = ["cleansers", "serums", "moisturizers", "sun-care"] as const;

function scoreProduct(product: Product, skinType: SkinType, concern: Concern) {
  const text = [product.name, product.tagline, product.description, ...product.ingredients].join(" ").toLowerCase();
  const compatibility = skinType === "all" || product.skinTypes.includes("all") || product.skinTypes.includes(skinType);
  const concernScore = CONCERN_WORDS[concern].reduce((score, word) => score + (text.includes(word) ? 2 : 0), 0);
  const categoryScore = product.category === "cleansers" ? 2 : product.category === "serums" ? 3 : product.category === "moisturizers" ? 2 : 0;
  const popularityScore = product.rating >= 4.7 ? 1 : 0;
  return { compatibility, score: concernScore + categoryScore + popularityScore };
}

export function RoutineFinder() {
  const { products } = useProducts();
  const { t, language } = useLanguage();
  const km = language === "km";
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [concern, setConcern] = useState<Concern | null>(null);
  const [showResults, setShowResults] = useState(false);

  const skinTypeChoices = SKIN_TYPE_VALUES.map((value, index) => ({ value, ...t.routineFinder.skinTypes[index] }));
  const concernChoices = CONCERN_VALUES.map((value, index) => ({ value, ...t.routineFinder.concerns[index] }));

  const recommendations = useMemo(() => {
    if (!skinType || !concern) return [];
    return ROUTINE_STEP_CATEGORIES.flatMap((category) => {
      const match = products
        .filter((product) => product.category === category)
        .map((product) => ({ product, ...scoreProduct(product, skinType, concern) }))
        .filter((item) => item.compatibility)
        .sort((a, b) => b.score - a.score)[0];
      return match ? [match.product] : [];
    });
  }, [products, skinType, concern]);

  const reset = () => {
    setShowResults(false);
    setSkinType(null);
    setConcern(null);
  };

  const skinTypeLabel = skinTypeChoices.find((item) => item.value === skinType)?.label.toLowerCase();
  const concernLabel = concernChoices.find((item) => item.value === concern)?.label.toLowerCase();

  return (
    <div className={`min-h-[70vh] bg-cream ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
      <section className="relative overflow-hidden border-b border-line bg-cream-dark/60">
        <div className="container-shop relative py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-ink-soft">
            <Link to="/" className="transition hover:text-ink">
              {km ? "ទំព័រដើម" : "Home"}
            </Link>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-ink">{t.routineFinder.breadcrumb}</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-forest/20 bg-forest/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                {t.routineFinder.eyebrow}
              </span>
              <h1
                className={`mt-5 text-balance font-medium leading-tight text-ink ${
                  km ? "font-khmer-display text-3xl sm:text-4xl lg:text-5xl" : "font-display text-4xl sm:text-5xl lg:text-6xl"
                }`}
              >
                {t.routineFinder.titleStart} <span className={`${km ? "not-italic" : "italic"} text-clay`}>{t.routineFinder.titleItalic}</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{t.routineFinder.description}</p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-card sm:p-6">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-forest">
                <span>{t.routineFinder.quickCheckLabel}</span>
                <span>{t.routineFinder.oneMinute}</span>
              </div>
              <div className="mt-5 flex items-center gap-3" aria-hidden="true">
                {["01", "02", "03"].map((step, index) => (
                  <div key={step} className="flex flex-1 items-center gap-3 last:flex-none">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? "bg-forest text-white" : "bg-cream-dark text-ink-soft"}`}>{step}</span>
                    {index < 2 && <span className="h-px w-full bg-line" />}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-ink-soft">{t.routineFinder.stepsLabel}</p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sage/30 blur-3xl" />
      </section>

      <section className="container-shop py-10 sm:py-14">
        {!showResults ? (
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">{t.routineFinder.sectionEyebrow}</p>
              <h2 className={`mt-2 text-ink ${km ? "font-khmer-display text-2xl sm:text-3xl" : "font-display text-3xl sm:text-4xl"}`}>
                {t.routineFinder.sectionTitle}
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-ink">
                  01 <span className="ml-2">{t.routineFinder.skinTypeQuestion}</span>
                </legend>
                <div className="grid gap-2">
                  {skinTypeChoices.map((type) => (
                    <ChoiceCard
                      key={type.value}
                      selected={skinType === type.value}
                      onClick={() => setSkinType(type.value)}
                      title={type.label}
                      description={type.note}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-ink">
                  02 <span className="ml-2">{t.routineFinder.concernQuestion}</span>
                </legend>
                <div className="grid gap-2">
                  {concernChoices.map((item) => (
                    <ChoiceCard
                      key={item.value}
                      selected={concern === item.value}
                      onClick={() => setConcern(item.value)}
                      title={item.label}
                      description={t.routineFinder.concernNote}
                    />
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button disabled={!skinType || !concern} onClick={() => setShowResults(true)} iconRight={<ChevronRightIcon className="h-4 w-4" />}>
                    {t.routineFinder.buildButton}
                  </Button>
                  <p className="text-xs text-ink-soft">{t.routineFinder.noSignup}</p>
                </div>
              </fieldset>
            </div>
            <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-ink-soft">{t.routineFinder.disclaimer}</p>
          </div>
        ) : (
          <div>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">{t.routineFinder.resultsEyebrow}</p>
                <h2 className={`mt-2 text-ink ${km ? "font-khmer-display text-2xl sm:text-3xl" : "font-display text-3xl sm:text-4xl"}`}>
                  {t.routineFinder.resultsTitle}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  {t.routineFinder.resultsDescPrefix} {skinTypeLabel} {t.routineFinder.resultsDescMiddle} {concernLabel}.
                </p>
              </div>
              <Button variant="outline" onClick={reset}>
                {t.routineFinder.editAnswers}
              </Button>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {t.routineFinder.steps.map((label) => (
                <div key={label} className="rounded-2xl border border-line bg-white px-4 py-3 text-xs font-semibold uppercase tracking-widest text-forest">
                  {label}
                </div>
              ))}
            </div>
            {recommendations.length ? <ProductGrid products={recommendations} /> : <p className="text-ink-soft">{t.routineFinder.noMatch}</p>}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-forest p-6 text-cream sm:p-8">
              <div>
                <p className="font-display text-2xl">{t.routineFinder.ctaTitle}</p>
                <p className="mt-1 text-sm text-cream/75">{t.routineFinder.ctaDesc}</p>
              </div>
              <Button to="/shop" variant="outline" className="border-cream/50! text-cream! hover:bg-white/10!">
                {t.routineFinder.browseAll}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ChoiceCard({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${selected ? "border-forest bg-forest/5 ring-1 ring-forest" : "border-line bg-white hover:border-forest/40 hover:bg-white/80"}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-forest bg-forest" : "border-ink/25 bg-white"}`}>
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{description}</span>}
      </span>
    </button>
  );
}
