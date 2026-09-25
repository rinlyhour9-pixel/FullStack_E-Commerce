import { Link } from "react-router-dom";
import type { ProductCategory } from "../../types/product";
import { ChevronRightIcon } from "../ui/icons";
import { ProductArt } from "../product/ProductArt";
import { Reveal } from "../ui/Reveal";
import { useLanguage } from "../../context/LanguageContext";

const CATEGORY_ART: Record<ProductCategory, string> = {
  cleansers: "tube:clay:0",
  serums: "dropper:gold:1",
  moisturizers: "jar:forest:0",
  masks: "jar:sage:2",
  "sun-care": "spray:gold:0",
  body: "spray:forest:1",
};

const FEATURED_CATEGORIES: ProductCategory[] = [
  "cleansers",
  "serums",
  "moisturizers",
  "masks",
  "sun-care",
  "body",
];

export function Categories() {
  const { t } = useLanguage();

  return (
    <section className="container-shop py-16 sm:py-20">
      <Reveal>
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">{t.home.categoriesEyebrow}</p>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{t.home.categoriesTitle}</h2>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-6">
        {FEATURED_CATEGORIES.map((category, index) => (
          <Reveal key={category} delay={index * 60}>
            <Link
              to={`/shop?category=${category}`}
              className="group flex flex-col items-center gap-3 rounded-3xl border border-line bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover sm:p-5"
            >
              <ProductArt
                artKey={CATEGORY_ART[category]}
                label={t.categories[category]}
                className="aspect-square w-full rounded-2xl"
              />
              <span className="flex items-center gap-1 text-sm font-semibold text-ink">
                {t.categories[category]}
                <ChevronRightIcon className="h-3.5 w-3.5 text-ink-soft transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
