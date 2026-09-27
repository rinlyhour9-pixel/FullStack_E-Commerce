import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ProductArt } from "../components/product/ProductArt";
import { PriceTag } from "../components/ui/PriceTag";
import { StarRating } from "../components/ui/StarRating";
import { BagIcon, HeartIcon, TrashIcon } from "../components/ui/icons";
import { Link } from "react-router-dom";
import { getDefaultVariant, isProductInStock } from "../utils/inventory";

export function Wishlist() {
  const { items, remove, error, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();

  if (isLoading) return <div className="container-shop flex min-h-[45vh] items-center justify-center text-sm text-ink-soft" role="status">Loading your wishlist…</div>;
  if (items.length === 0) {
    return (
      <div className="container-shop py-20">
        {error && <p role="alert" className="mx-auto mb-4 max-w-xl rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>}
        <EmptyState
          icon={<HeartIcon className="h-7 w-7" />}
          title={t.wishlist.emptyTitle}
          description={t.wishlist.emptyDesc}
          action={
            <Button to="/shop" variant="secondary">
              {t.wishlist.discoverProducts}
            </Button>
          }
        />
      </div>
    );
  }

  const handleAddToCart = async (productId: string, variantId: string, name: string) => {
    if (!(await addToCart(productId, variantId, 1))) { showToast(t.checkout.requireSignIn, "error"); return; }
    showToast(`${name} ${t.common.addedToBagSuffix}`, "success");
  };

  const handleRemove = (productId: string, name: string) => {
    remove(productId);
    showToast(`${name} ${t.common.removedFromWishlistSuffix}`, "info");
  };

  return (
    <div className="container-shop py-10 sm:py-14">
      {error && <p role="alert" className="mb-4 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>}
      <h1 className="font-display text-3xl text-ink sm:text-4xl">{t.wishlist.title}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {items.length} {t.wishlist.countSuffix}
        {items.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => {
          const defaultVariant = getDefaultVariant(product);
          const productInStock = isProductInStock(product);
          return (
            <li key={product.id} className="flex gap-4 rounded-3xl border border-line bg-white p-4">
              <Link to={`/product/${product.slug}`} className="shrink-0">
                <ProductArt artKey={product.images[0]} label={product.name} className="h-28 w-28 rounded-2xl" />
              </Link>
              <div className="flex flex-1 flex-col">
                <Link to={`/product/${product.slug}`} className="font-display text-base text-ink hover:text-clay-dark">
                  {product.name}
                </Link>
                <div className="mt-1">
                  <StarRating rating={product.rating} />
                </div>
                <div className="mt-1.5">
                  <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
                </div>
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product.id, defaultVariant.id, product.name)}
                    disabled={!productInStock}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-forest px-3 py-2 text-xs font-semibold text-cream transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <BagIcon className="h-3.5 w-3.5" /> {t.wishlist.addToBag}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id, product.name)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition hover:border-clay hover:text-clay-dark"
                    aria-label={`${t.cart.remove}: ${product.name}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
