import { Link } from "react-router-dom";
import type { Product } from "../../types/product";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { Badge } from "../ui/Badge";
import { PriceTag } from "../ui/PriceTag";
import { StarRating } from "../ui/StarRating";
import { BagIcon, HeartIcon } from "../ui/icons";
import { ProductArt } from "./ProductArt";
import { getDefaultVariant, isProductInStock, isVariantInStock } from "../../utils/inventory";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isSaved, toggle } = useWishlist();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const saved = isSaved(product.id);
  const defaultVariant = getDefaultVariant(product);
  const productInStock = isProductInStock(product);

  const badgeLabels: Record<NonNullable<Product["badges"]>[number], string> = {
    new: t.common.new,
    bestseller: t.common.bestseller,
    limited: t.common.limited,
  };

  const handleQuickAdd = async () => {
    if (!productInStock || !isVariantInStock(defaultVariant)) return;
    if (await addToCart(product.id, defaultVariant.id, 1)) showToast(`${product.name} ${t.common.addedToBagSuffix}`, "success");
    else showToast(t.checkout.requireSignIn, "error");
  };

  const handleWishlist = async () => {
    if (await toggle(product.id)) showToast(`${product.name} ${saved ? t.common.removedFromWishlistSuffix : t.common.savedToWishlistSuffix}`, "info");
    else showToast(t.checkout.requireSignIn, "error");
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-4/5 overflow-hidden bg-cream-dark">
        <Link to={`/product/${product.slug}`} className="absolute inset-0 block" tabIndex={-1} aria-hidden="true">
          <ProductArt
            artKey={product.images[0]}
            label={product.name}
            className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badges?.map((badge) => (
            <Badge key={badge} tone={badge === "bestseller" ? "clay" : badge === "new" ? "forest" : "gold"}>
              {badgeLabels[badge]}
            </Badge>
          ))}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:scale-105 hover:text-clay-dark"
          aria-pressed={saved}
          aria-label={`${t.common.wishlist}: ${product.name}`}
        >
          <HeartIcon filled={saved} className={`h-4.5 w-4.5 ${saved ? "text-clay" : ""}`} />
        </button>

        {!productInStock && (
          <div className="absolute inset-x-3 bottom-3 rounded-full bg-ink/80 px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wider text-cream backdrop-blur">
            {t.common.soldOut}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <Link to={`/product/${product.slug}`} className="focus-visible:outline-none">
          <h3 className="line-clamp-1 font-display text-lg text-ink transition-colors group-hover:text-clay-dark">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{product.tagline}</p>
        <div className="mt-2.5">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!productInStock || !isVariantInStock(defaultVariant)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-forest hover:bg-forest hover:text-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/15 disabled:hover:bg-transparent disabled:hover:text-ink"
            aria-label={`${t.common.addToBag}: ${product.name}`}
            title={productInStock ? t.common.quickAddToBag : t.common.outOfStock}
          >
            <BagIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
