import { StarIcon } from "./icons";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({ rating, reviewCount, size = "sm", showValue }: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5 stars`}>
      <div className="flex items-center gap-0.5 text-gold" aria-hidden="true">
        {stars.map((star) => {
          const fillAmount = Math.min(1, Math.max(0, rating - (star - 1)));
          return (
            <span key={star} className="relative">
              <StarIcon className={`${iconSize} text-ink/15`} />
              {fillAmount > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillAmount * 100}%` }}
                >
                  <StarIcon filled className={iconSize} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && <span className="text-sm font-medium text-ink-soft">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-sm text-ink-soft">({reviewCount})</span>
      )}
    </div>
  );
}
