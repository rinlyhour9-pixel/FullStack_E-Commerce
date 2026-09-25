import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatPrice } from "../../utils/format";
import { ProductArt } from "../product/ProductArt";
import { CloseIcon, SearchIcon } from "../ui/icons";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { products } = useProducts();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
    setQuery("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.tagline.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [query, products]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-90 animate-fade-in" role="dialog" aria-modal="true" aria-label={t.common.search}>
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t.common.close}
      />
      <div className="relative mx-auto mt-20 w-[92%] max-w-xl rounded-3xl bg-cream p-2 shadow-card-hover sm:mt-28">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-line px-4 py-3">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink-soft" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search.placeholder}
            className="w-full bg-transparent text-base text-ink placeholder:text-ink-soft/60 focus:outline-none"
            aria-label={t.common.search}
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            aria-label={t.common.close}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-ink-soft">
              {t.search.noResultsPrefix} “{query}”. {t.search.tryPrefix} “{t.search.popularTerms[0]}”.
            </p>
          )}
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                navigate(`/product/${product.slug}`);
                onClose();
              }}
              className="flex w-full items-center gap-4 rounded-2xl p-2 text-left transition hover:bg-ink/5"
            >
              <ProductArt artKey={product.images[0]} className="h-14 w-14 shrink-0 rounded-xl" label={product.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{product.name}</span>
                <span className="block truncate text-sm text-ink-soft">{product.tagline}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-ink">{formatPrice(product.price)}</span>
            </button>
          ))}
          {!query.trim() && (
            <div className="px-4 py-6 text-sm text-ink-soft">
              <p className="mb-2 font-medium text-ink">{t.search.popularSearches}</p>
              <div className="flex flex-wrap gap-2">
                {t.search.popularTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink/30 hover:text-ink"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
