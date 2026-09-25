import { useLanguage } from "../../context/LanguageContext";
import { ChevronDownIcon } from "../ui/icons";

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  const { t } = useLanguage();

  const options: { value: SortOption; label: string }[] = [
    { value: "featured", label: t.shop.sortFeatured },
    { value: "newest", label: t.shop.sortNewest },
    { value: "price-asc", label: t.shop.sortPriceAsc },
    { value: "price-desc", label: t.shop.sortPriceDesc },
    { value: "rating", label: t.shop.sortRating },
  ];

  return (
    <div className="relative">
      <label htmlFor="sort-select" className="sr-only">
        {t.shop.sortLabel}
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="appearance-none rounded-full border border-ink/15 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-ink transition hover:border-ink/30 focus:border-forest focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t.shop.sortLabel}: {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
    </div>
  );
}
