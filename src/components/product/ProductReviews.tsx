import type { Product } from "../../types/product";
import { formatDate } from "../../utils/format";
import { StarRating } from "../ui/StarRating";
import { CheckIcon } from "../ui/icons";
import { useLanguage } from "../../context/LanguageContext";

interface ProductReviewsProps {
  product: Product;
}

export function ProductReviews({ product }: ProductReviewsProps) {
  const { t } = useLanguage();
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = product.reviews.filter((review) => review.rating === stars).length;
    const percent = product.reviews.length ? (count / product.reviews.length) * 100 : 0;
    return { stars, count, percent };
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-white p-6">
        <div>
          <p className="font-display text-5xl text-ink">{product.rating.toFixed(1)}</p>
          <StarRating rating={product.rating} size="md" />
          <p className="mt-1 text-sm text-ink-soft">
            {t.product.basedOnReviewsPrefix} {product.reviewCount} {t.product.reviews.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          {distribution.map(({ stars, count, percent }) => (
            <div key={stars} className="flex items-center gap-2 text-xs text-ink-soft">
              <span className="w-3 shrink-0">{stars}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
              </div>
              <span className="w-5 shrink-0 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-6">
        {product.reviews.map((review) => (
          <li key={review.id} className="border-b border-line pb-6 last:border-none">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
              </div>
              <span className="text-xs text-ink-soft">{formatDate(review.date)}</span>
            </div>
            <h4 className="font-semibold text-ink">{review.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{review.body}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
              <span className="font-medium text-ink">{review.author}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-forest">
                  <CheckIcon className="h-3.5 w-3.5" /> {t.common.verifiedPurchase}
                </span>
              )}
            </div>
          </li>
        ))}
        {product.reviews.length === 0 && <p className="text-sm text-ink-soft">{t.product.noReviewsYet}</p>}
      </ul>
    </div>
  );
}
