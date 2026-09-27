import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categoryLabels } from "../data/products";
import { useLanguage } from "../context/LanguageContext";
import type { Product, ProductCategory, SkinType } from "../types/product";
import { ProductGrid } from "../components/product/ProductGrid";
import { ShopFilters } from "../components/product/ShopFilters";
import { SortSelect } from "../components/product/SortSelect";
import type { SortOption } from "../components/product/SortSelect";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { CloseIcon, SearchIcon } from "../components/ui/icons";
import { api } from "../api/client";

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
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryParam) setSelectedCategories([categoryParam as ProductCategory]);
  }, [categoryParam]);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => { setPage(1); }, [selectedCategories, selectedSkinTypes, sort, searchTerm]);

  useEffect(() => {
    let active = true;
    setIsLoading(true); setServerError(null);
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ page: String(page), limit: "12", sort });
      if (selectedCategories.length) params.set("category", selectedCategories.join(","));
      if (selectedSkinTypes.length) params.set("skinType", selectedSkinTypes.join(","));
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (selectedPriceBuckets.length) params.set("priceBuckets", selectedPriceBuckets.join(","));
      void api.get<{ items: Product[]; pageCount: number }>(`/products?${params}`).then((result) => { if (active) { setApiProducts(result.items); setPageCount(result.pageCount); } }).catch((e) => { if (active) setServerError(e instanceof Error ? e.message : "Could not load products"); }).finally(() => { if (active) setIsLoading(false); });
    }, 220);
    return () => { active = false; window.clearTimeout(timer); };
  }, [selectedCategories, selectedSkinTypes, selectedPriceBuckets, sort, searchTerm, page]);

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
    return sortProducts(apiProducts, sort);
  }, [sort, apiProducts]);

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
          {serverError && <p role="alert" className="mb-4 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{serverError}</p>}
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
          {!isLoading && !serverError && pageCount > 1 && <div className="mt-8 flex items-center justify-center gap-4"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button><span className="text-sm text-ink-soft">{page} / {pageCount}</span><Button variant="outline" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</Button></div>}
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
