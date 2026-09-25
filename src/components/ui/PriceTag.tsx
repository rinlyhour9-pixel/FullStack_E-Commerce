import { formatPrice } from "../../utils/format";

interface PriceTagProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

export function PriceTag({ price, compareAtPrice, size = "md" }: PriceTagProps) {
  const hasDiscount = compareAtPrice !== undefined && compareAtPrice > price;
  const percentOff = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-semibold text-ink ${SIZE_CLASSES[size]}`}>{formatPrice(price)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-ink-soft/70 line-through">{formatPrice(compareAtPrice)}</span>
          <span className="rounded-full bg-clay/10 px-2 py-0.5 text-xs font-semibold text-clay-dark">
            −{percentOff}%
          </span>
        </>
      )}
    </div>
  );
}
