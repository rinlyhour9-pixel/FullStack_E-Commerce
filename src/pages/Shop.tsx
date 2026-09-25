import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categoryLabels } from "../data/products";
import { useProducts } from "../context/ProductsContext";
import { useLanguage } from "../context/LanguageContext";
import type { Product, ProductCategory, SkinType } from "../types/product";
import { ProductGrid } from "../components/product/ProductGrid";
import { PRICE_BUCKETS, ShopFilters } from "../components/product/ShopFilters";
import { SortSelect } from "../components/product/SortSelect";
import type { SortOption } from "../components/product/SortSelect";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { CloseIcon, SearchIcon } from "../components/ui/icons";

const ALL_CATEGORIES = Object.keys(categoryLabels) as ProductCategory[];

function sortProducts(list: Product[], sort: SortOption): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => Number(!!b.badges?.includes("new")) - Number(!!a.badges?.includes("new")));
    case "featured":
    default:
      return copy.sort((a, b) => Number(!!b.badges?.includes("bestseller")) - Number(!!a.badges?.includes("bestseller")));
  }
}

export function Shop() {
  const { products } = useProducts();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("q") ?? "";

  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(
    categoryParam ? [categoryParam as ProductCategory] : [],
  );
  const [selectedPriceBuckets, setSelectedPriceBuckets] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<SkinType[]>([]);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [sort, setSort] = useState<SortOption>("featured");
  const [isMobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryParam) setSelectedCategories([categoryParam as ProductCategory]);
  }, [categoryParam]);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 320);
    return () => window.clearTimeout(timer);
  }, [selectedCategories, selectedPriceBuckets, selectedSkinTypes, sort, searchTerm]);

  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isMobileFiltersOpen]);

  const toggleCategory = (category: ProductCategory) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
    );
  };

  const togglePriceBucket = (id: string) => {
    setSelectedPriceBuckets((current) =>
      current.includes(id) ? current.filter((b) => b !== id) : [...current, id],
    );
  };

  const toggleSkinType = (skinType: SkinType) => {
    setSelectedSkinTypes((current) =>
      current.includes(skinType) ? current.filter((s) => s !== skinType) : [...current, skinType],
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedPriceBuckets([]);
    setSelectedSkinTypes([]);
    setSearchTerm("");
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice =
        selectedPriceBuckets.length === 0 ||
        selectedPriceBuckets.some((id) => {
          const bucket = PRICE_BUCKETS.find((b) => b.id === id);
          return bucket && product.price >= bucket.min && product.price < bucket.max;
        });
      const matchesSkinType =
        selectedSkinTypes.length === 0 ||
        selectedSkinTypes.some((type) => product.skinTypes.includes(type));
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.tagline.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);

      return matchesCategory && matchesPrice && matchesSkinType && matchesSearch;
    });
    return sortProducts(result, sort);
  }, [selectedCategories, selectedPriceBuckets, selectedSkinTypes, searchTerm, sort, products]);

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedPriceBuckets.length > 0 || selectedSkinTypes.length > 0;

  const pageTitle = selectedCategories.length === 1 ? t.categories[selectedCategories[0]] : t.shop.title;

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

  const renderFiltersPanel = (showHeading: boolean) => (
    <ShopFilters
      categories={ALL_CATEGORIES}
      selectedCategories={selectedCategories}
      onToggleCategory={toggleCategory}
      selectedPriceBuckets={selectedPriceBuckets}
      onTogglePriceBucket={togglePriceBucket}
      selectedSkinTypes={selectedSkinTypes}
      onToggleSkinType={toggleSkinType}
      onClearAll={clearAll}
      hasActiveFilters={hasActiveFilters || searchTerm.length > 0}
      showHeading={showHeading}
    />
  );

  return (
    <div className="container-shop py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{pageTitle}</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {isLoading ? t.shop.searchingLabel : `${filtered.length} ${t.shop.resultsSuffix}`}
          {searchTerm && !isLoading ? ` ${t.shop.searchForLabel} “${searchTerm}”` : ""}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t.shop.searchPlaceholder}
            aria-label={t.shop.searchPlaceholder}
            className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:border-ink/30 lg:hidden"
        >
          {t.shop.filtersButton}
          {hasActiveFilters ? ` (${selectedCategories.length + selectedPriceBuckets.length + selectedSkinTypes.length})` : ""}
        </button>
        <div className="ml-auto">
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <FilterChip key={category} label={t.categories[category]} onRemove={() => toggleCategory(category)} />
          ))}
          {selectedPriceBuckets.map((id) => (
            <FilterChip key={id} label={priceBucketLabel(id)} onRemove={() => togglePriceBucket(id)} />
          ))}
          {selectedSkinTypes.map((type) => (
            <FilterChip key={type} label={t.skinTypes[type]} onRemove={() => toggleSkinType(type)} />
          ))}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{renderFiltersPanel(true)}</aside>

        <div>
          {filtered.length === 0 && !isLoading ? (
            <EmptyState
              icon={<SearchIcon className="h-7 w-7" />}
              title={t.shop.noResultsTitle}
              description={t.shop.noResultsDesc}
              action={
                <Button variant="secondary" onClick={clearAll}>
                  {t.shop.clearFilters}
                </Button>
              }
            />
          ) : (
            <ProductGrid products={filtered} isLoading={isLoading} />
          )}
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-93 lg:hidden" role="dialog" aria-modal="true" aria-label={t.shop.filtersTitle}>
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label={t.common.close}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-cream p-6 shadow-card-hover">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">{t.shop.filtersTitle}</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-2 text-ink transition hover:bg-ink/5"
                aria-label={t.common.close}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            {renderFiltersPanel(false)}
            <Button variant="primary" fullWidth className="mt-8" onClick={() => setMobileFiltersOpen(false)}>
              {t.shop.showResults} {filtered.length}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 py-1.5 pl-3 pr-2 text-xs font-medium text-forest transition hover:bg-forest/15"
    >
      {label}
      <CloseIcon className="h-3 w-3" />
    </button>
  );
}
