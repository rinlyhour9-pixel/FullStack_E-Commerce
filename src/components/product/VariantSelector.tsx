import type { ProductVariant } from "../../types/product";
import { isVariantInStock } from "../../utils/inventory";
import { useLanguage } from "../../context/LanguageContext";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onChange: (variantId: string) => void;
}

export function VariantSelector({ variants, selectedId, onChange }: VariantSelectorProps) {
  const { t } = useLanguage();
  if (variants.length <= 1) return null;

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-ink">{t.product.size}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {variants.map((variant) => {
          const isSelected = selectedId === variant.id;
          const inStock = isVariantInStock(variant);
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!inStock}
              onClick={() => onChange(variant.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "border-forest bg-forest text-cream"
                  : "border-ink/15 text-ink hover:border-ink/30"
              } ${!inStock ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {variant.label}
              {!inStock && ` (${t.common.soldOut})`}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
