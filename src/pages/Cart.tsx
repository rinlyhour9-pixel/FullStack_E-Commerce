import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { ProductArt } from "../components/product/ProductArt";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { QuantitySelector } from "../components/ui/QuantitySelector";
import { BagIcon, ChevronRightIcon, ShieldIcon, TrashIcon, TruckIcon } from "../components/ui/icons";
import { formatPrice } from "../utils/format";

const FREE_SHIPPING_THRESHOLD = 50;

export function Cart() {
  const { lineDetails, subtotal, updateQuantity, removeFromCart, error, isLoading } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();

  if (isLoading) return <div className="container-shop flex min-h-[45vh] items-center justify-center text-sm text-ink-soft" role="status">Loading your cart…</div>;
  if (lineDetails.length === 0) {
    return (
      <div className="container-shop py-20">
        {error && <p role="alert" className="mx-auto mb-4 max-w-xl rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>}
        <EmptyState
          icon={<BagIcon className="h-7 w-7" />}
          title={t.cart.emptyTitle}
          description={t.cart.emptyDesc}
          action={
            <Button to="/shop" variant="secondary">
              {t.common.continueShopping}
            </Button>
          }
        />
      </div>
    );
  }

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleRemove = (productId: string, variantId: string, name: string) => {
    removeFromCart(productId, variantId);
    showToast(`${name} ${t.cart.removedFromBagSuffix}`, "info");
  };

  return (
    <div className="container-shop py-10 sm:py-14">
      {error && <p role="alert" className="mb-4 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-dark">{error}</p>}
      <h1 className="font-display text-3xl text-ink sm:text-4xl">{t.cart.title}</h1>

      <div className="mt-4 rounded-2xl border border-line bg-white p-4">
        {remainingForFreeShipping > 0 ? (
          <p className="mb-2 text-sm text-ink-soft">
            {t.cart.addMoreForFreeShipping.replace("{amount}", formatPrice(remainingForFreeShipping))}
          </p>
        ) : (
          <p className="mb-2 text-sm font-medium text-forest">{t.cart.unlockedFreeShipping}</p>
        )}
        <div className="h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-forest transition-all duration-500"
            style={{ width: `${shippingProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col divide-y divide-line">
          {lineDetails.map(({ line, product, variant, unitPrice, lineTotal }) => (
            <li key={`${line.productId}-${line.variantId}`} className="flex gap-4 py-6 first:pt-0">
              <Link to={`/product/${product.slug}`} className="shrink-0">
                <ProductArt artKey={product.images[0]} label={product.name} className="h-28 w-28 rounded-2xl sm:h-32 sm:w-32" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/product/${product.slug}`} className="font-display text-lg text-ink hover:text-clay-dark">
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-ink-soft">{variant.label}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {formatPrice(unitPrice)} {t.cart.each}
                    </p>
                  </div>
                  <span className="font-semibold text-ink">{formatPrice(lineTotal)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <QuantitySelector
                    size="sm"
                    quantity={line.quantity}
                    onChange={(quantity) => updateQuantity(line.productId, line.variantId, quantity)}
                    label={`${t.product.quantity}: ${product.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(line.productId, line.variantId, product.name)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-clay/10 hover:text-clay-dark"
                  >
                    <TrashIcon className="h-3.5 w-3.5" /> {t.cart.remove}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-xl text-ink">{t.cart.orderSummary}</h2>
          <dl className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.cart.subtotal}</dt>
              <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.cart.shipping}</dt>
              <dd className="font-medium text-ink">
                {remainingForFreeShipping > 0 ? t.cart.calculatedAtCheckout : t.cart.free}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.cart.estimatedTax}</dt>
              <dd className="font-medium text-ink">{t.cart.calculatedAtCheckout}</dd>
            </div>
          </dl>
          <div className="my-4 border-t border-line" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-ink">{t.cart.total}</span>
            <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <Button to="/checkout" variant="primary" fullWidth size="lg" className="mt-6" iconRight={<ChevronRightIcon className="h-4 w-4" />}>
            {t.cart.proceedToCheckout}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
            <ShieldIcon className="h-4 w-4" /> {t.cart.secureDemoNote}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
            <TruckIcon className="h-4 w-4" /> {t.cart.freeShippingOverPrefix} {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </div>
        </aside>
      </div>
    </div>
  );
}
