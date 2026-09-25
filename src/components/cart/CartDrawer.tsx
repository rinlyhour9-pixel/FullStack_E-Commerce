import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useUI } from "../../context/UIContext";
import { useLanguage } from "../../context/LanguageContext";
import { ProductArt } from "../product/ProductArt";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { QuantitySelector } from "../ui/QuantitySelector";
import { BagIcon, CloseIcon, TrashIcon } from "../ui/icons";
import { formatPrice } from "../../utils/format";

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUI();
  const { lineDetails, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isCartOpen) return;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-92" role="dialog" aria-modal="true" aria-label={t.cart.title}>
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-label={t.common.close}
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-card-hover">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl text-ink">
            {t.cart.title} ({itemCount})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-ink transition hover:bg-ink/5"
            aria-label={t.common.close}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lineDetails.length === 0 ? (
            <EmptyState
              icon={<BagIcon className="h-7 w-7" />}
              title={t.cart.emptyTitle}
              description={t.cart.drawerEmptyDesc}
              action={
                <Button
                  to="/shop"
                  variant="secondary"
                  onClick={closeCart}
                >
                  {t.account.startShopping}
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-5">
              {lineDetails.map(({ line, product, variant, unitPrice }) => (
                <li key={`${line.productId}-${line.variantId}`} className="flex gap-4">
                  <ProductArt
                    artKey={product.images[0]}
                    className="h-24 w-24 shrink-0 rounded-2xl"
                    label={product.name}
                  />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium leading-snug text-ink">{product.name}</p>
                        <p className="text-xs text-ink-soft">{variant.label}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.productId, line.variantId)}
                        className="shrink-0 rounded-full p-1.5 text-ink-soft transition hover:bg-clay/10 hover:text-clay-dark"
                        aria-label={`${t.cart.remove}: ${product.name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <QuantitySelector
                        size="sm"
                        quantity={line.quantity}
                        onChange={(quantity) => updateQuantity(line.productId, line.variantId, quantity)}
                        label={`${t.product.quantity}: ${product.name}`}
                      />
                      <span className="font-semibold text-ink">{formatPrice(unitPrice * line.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lineDetails.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-soft">{t.cart.subtotal}</span>
              <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
            </div>
            <p className="mb-4 text-xs text-ink-soft">{t.cart.shippingTaxNote}</p>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  closeCart();
                  navigate("/checkout");
                }}
              >
                {t.cart.checkout}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  closeCart();
                  navigate("/cart");
                }}
              >
                {t.cart.viewBag}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
