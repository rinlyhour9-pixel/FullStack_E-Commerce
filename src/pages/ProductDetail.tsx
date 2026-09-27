import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { useUI } from "../context/UIContext";
import { useLanguage } from "../context/LanguageContext";
import { getDefaultVariant, isVariantInStock } from "../utils/inventory";
import { ProductGallery } from "../components/product/ProductGallery";
import { VariantSelector } from "../components/product/VariantSelector";
import { ProductReviews } from "../components/product/ProductReviews";
import { RelatedProducts } from "../components/product/RelatedProducts";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PriceTag } from "../components/ui/PriceTag";
import { QuantitySelector } from "../components/ui/QuantitySelector";
import { StarRating } from "../components/ui/StarRating";
import { ChevronRightIcon, HeartIcon, RefreshIcon, ShieldIcon, TruckIcon } from "../components/ui/icons";
import { EmptyState } from "../components/ui/EmptyState";

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug, getRelated, isLoading: productsLoading, error: productsError, refresh } = useProducts();
  const product = getBySlug(slug ?? "");
  const { addToCart } = useCart();
  const { isSaved, toggle } = useWishlist();
  const { showToast } = useToast();
  const { openCart } = useUI();
  const { t } = useLanguage();

  const badgeLabels = { new: t.common.new, bestseller: t.common.bestseller, limited: t.common.limited } as const;

  const [selectedVariantId, setSelectedVariantId] = useState(product?.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  if (productsLoading) return <div className="container-shop py-20 text-center text-sm text-ink-soft" role="status">Loading product…</div>;
  if (productsError) return <div className="container-shop py-20 text-center"><p role="alert" className="text-sm text-clay-dark">{productsError}</p><Button variant="outline" className="mt-4" onClick={() => void refresh()}>Try again</Button></div>;

  useEffect(() => {
    if (product) {
      setSelectedVariantId(getDefaultVariant(product).id);
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container-shop py-20">
        <EmptyState
          icon={<ChevronRightIcon className="h-7 w-7" />}
          title={t.product.notFoundTitle}
          description={t.product.notFoundDesc}
          action={
            <Button to="/shop" variant="secondary">
              {t.product.backToShop}
            </Button>
          }
        />
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const saved = isSaved(product.id);
  const related = getRelated(product);

  const handleAddToCart = async () => {
    if (!isVariantInStock(selectedVariant)) return;
    if (!(await addToCart(product.id, selectedVariant.id, quantity))) { showToast(t.checkout.requireSignIn, "error"); return; }
    showToast(`${quantity} × ${product.name} (${selectedVariant.label}) ${t.common.addedToBagSuffix}`, "success");
    openCart();
  };

  return (
    <div className="container-shop py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-ink-soft">
        <Link to="/shop" className="hover:text-ink">
          {t.product.breadcrumbShop}
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <Link to={`/shop?category=${product.category}`} className="hover:text-ink">
          {t.categories[product.category]}
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="max-w-xl">
          {product.badges && product.badges.length > 0 && (
            <div className="mb-3 flex gap-2">
              {product.badges.map((badge) => (
                <Badge key={badge} tone={badge === "bestseller" ? "clay" : badge === "new" ? "forest" : "gold"}>
                  {badgeLabels[badge]}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="font-display text-3xl text-ink sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-base text-ink-soft">{product.tagline}</p>

          <a href="#reviews" className="mt-3 inline-flex items-center gap-2">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} showValue />
          </a>

          <div className="mt-5">
            <PriceTag
              price={product.price + selectedVariant.priceModifier}
              compareAtPrice={product.compareAtPrice}
              size="lg"
            />
          </div>

          <div className="mt-6 flex flex-col gap-5">
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariant.id}
              onChange={setSelectedVariantId}
            />

            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector quantity={quantity} onChange={setQuantity} label={`${t.product.quantity}: ${product.name}`} />
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!isVariantInStock(selectedVariant)}
              >
                {isVariantInStock(selectedVariant) ? t.common.addToBag : t.common.soldOut}
              </Button>
              <button
                type="button"
                onClick={async () => {
                  if (!(await toggle(product.id))) { showToast(t.checkout.requireSignIn, "error"); return; }
                  showToast(`${product.name} ${saved ? t.common.removedFromWishlistSuffix : t.common.savedToWishlistSuffix}`, "info");
                }}
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-clay hover:text-clay-dark"
                aria-pressed={saved}
                aria-label={`${t.common.wishlist}: ${product.name}`}
              >
                <HeartIcon filled={saved} className={`h-5 w-5 ${saved ? "text-clay" : ""}`} />
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-ink-soft">
              <TruckIcon className="h-5 w-5 shrink-0 text-forest" /> {t.common.freeShippingOver50}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-soft">
              <ShieldIcon className="h-5 w-5 shrink-0 text-forest" /> {t.common.veganCrueltyFree}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-soft">
              <RefreshIcon className="h-5 w-5 shrink-0 text-forest" /> {t.common.returns30Day}
            </div>
          </div>

          <div className="mt-8 flex flex-col divide-y divide-line border-t border-line">
            <DetailAccordion title={t.product.description} defaultOpen>
              <p className="leading-relaxed text-ink-soft">{product.description}</p>
            </DetailAccordion>
            <DetailAccordion title={t.product.howToUse}>
              <ol className="list-decimal space-y-1.5 pl-4 text-ink-soft">
                {product.howToUse.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </DetailAccordion>
            <DetailAccordion title={t.product.ingredients}>
              <p className="leading-relaxed text-ink-soft">{product.ingredients.join(", ")}</p>
            </DetailAccordion>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-16 scroll-mt-24 sm:mt-20">
        <h2 className="mb-8 font-display text-3xl text-ink">{t.product.reviews}</h2>
        <ProductReviews product={product} />
      </section>

      <RelatedProducts products={related} />
    </div>
  );
}

function DetailAccordion({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group py-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
        {title}
        <ChevronRightIcon className="h-4 w-4 text-ink-soft transition-transform group-open:rotate-90" />
      </summary>
      <div className="mt-3 text-sm">{children}</div>
    </details>
  );
}
