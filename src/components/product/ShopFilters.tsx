import type { ProductCategory, SkinType } from "../../types/product";
import { useLanguage } from "../../context/LanguageContext";

export interface PriceBucket {
  id: string;
  min: number;
  max: number;
}

export const PRICE_BUCKETS: PriceBucket[] = [
  { id: "under-30", min: 0, max: 30 },
  { id: "30-50", min: 30, max: 50 },
  { id: "50-70", min: 50, max: 70 },
  { id: "over-70", min: 70, max: Infinity },
];

const SKIN_TYPES: SkinType[] = ["dry", "oily", "combination", "sensitive"];

interface ShopFiltersProps {
  categories: ProductCategory[];
  selectedCategories: ProductCategory[];
  onToggleCategory: (category: ProductCategory) => void;
  selectedPriceBuckets: string[];
  onTogglePriceBucket: (id: string) => void;
  selectedSkinTypes: SkinType[];
  onToggleSkinType: (skinType: SkinType) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  showHeading?: boolean;
}

export function ShopFilters({
  categories,
  selectedCategories,
  onToggleCategory,
  selectedPriceBuckets,
  onTogglePriceBucket,
  selectedSkinTypes,
  onToggleSkinType,
  onClearAll,
  hasActiveFilters,
  showHeading = true,
}: ShopFiltersProps) {
  const { t } = useLanguage();

  const priceBucketLabel = (id: string) => {
    switch (id) {
      case "under-30":
        return t.shop.priceUnder30;
      case "30-50":
        return t.shop.price30to50;
      case "50-70":
        return t.shop.price50to70;
      default:
        return t.shop.priceOver70;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className={`flex items-center ${showHeading ? "justify-between" : "justify-end"}`}>
        {showHeading && <h2 className="font-display text-lg text-ink">{t.shop.filtersTitle}</h2>}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold uppercase tracking-wide text-clay-dark transition hover:text-clay"
          >
            {t.shop.clearAll}
          </button>
        )}
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">{t.shop.categoryLabel}</legend>
        <div className="flex flex-col gap-1">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-1.5 py-1.5 text-sm text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onToggleCategory(category)}
                className="h-4 w-4 rounded border-ink/30 text-forest focus:ring-forest"
              />
              {t.categories[category]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">{t.shop.priceLabel}</legend>
        <div className="flex flex-col gap-1">
          {PRICE_BUCKETS.map((bucket) => (
            <label
              key={bucket.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-1.5 py-1.5 text-sm text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            >
              <input
                type="checkbox"
                checked={selectedPriceBuckets.includes(bucket.id)}
                onChange={() => onTogglePriceBucket(bucket.id)}
                className="h-4 w-4 rounded border-ink/30 text-forest focus:ring-forest"
              />
              {priceBucketLabel(bucket.id)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">{t.shop.skinTypeLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((skinType) => {
            const active = selectedSkinTypes.includes(skinType);
            return (
              <button
                key={skinType}
                type="button"
                onClick={() => onToggleSkinType(skinType)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-forest bg-forest text-cream"
                    : "border-ink/15 text-ink-soft hover:border-ink/30 hover:text-ink"
                }`}
              >
                {t.skinTypes[skinType]}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
