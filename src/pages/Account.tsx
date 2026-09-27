import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { OrderStatusBadge } from "../components/admin/OrderStatusBadge";
import { ProductArt } from "../components/product/ProductArt";
import { formatDate, formatPrice } from "../utils/format";
import { BagIcon, ChartBarIcon, LeafMarkIcon, UserIcon } from "../components/ui/icons";

export function Account() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { orders, isLoading, error } = useOrders();
  const { showToast } = useToast();
  const { t } = useLanguage();

  if (authLoading) return <div className="container-shop flex min-h-[60vh] items-center justify-center text-sm text-ink-soft" role="status">Loading your account…</div>;
  if (!user) {
    return (
      <div className="container-shop flex min-h-[60vh] items-center justify-center py-16">
        <div className="w-full max-w-md text-center">
          <LeafMarkIcon className="mx-auto mb-4 h-8 w-8 text-forest" />
          <h1 className="font-display text-2xl text-ink">{t.account.notSignedInTitle}</h1>
          <p className="mt-2 text-sm text-ink-soft">{t.account.notSignedInDesc}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button to="/sign-in" variant="primary">
              {t.account.signIn}
            </Button>
            <Button to="/register" variant="outline">
              {t.account.createAccount}
            </Button>
          </div>
          <p className="mt-6 text-xs text-ink-soft">
            {t.account.sellerPrompt}{" "}
            <Link to="/admin/login" className="font-medium text-forest hover:underline">
              {t.account.sellerLink}
            </Link>
          </p>
        </div>
      </div>
    );
  }


  const handleSignOut = () => {
    signOut();
    showToast(t.account.signedOut, "info");
  };

  return (
    <div className="container-shop py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">
            {t.account.helloPrefix} {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          {t.account.signOut}
        </Button>
      </div>

      {user.role === "admin" && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-forest/20 bg-forest/5 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-forest-dark">
            <ChartBarIcon className="h-4 w-4" /> {t.account.sellerBannerText}
          </p>
          <Button to="/admin/dashboard" variant="secondary" size="sm">
            {t.account.sellerDashboardButton}
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-line bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-ink">
            <BagIcon className="h-5 w-5 text-forest" /> {t.account.orderHistory}
          </h2>
          {isLoading ? <p className="py-8 text-sm text-ink-soft" role="status">Loading your orders…</p> : error ? <p className="py-8 text-sm text-clay-dark" role="alert">{error}</p> : orders.length === 0 ? (
            <EmptyState
              icon={<BagIcon className="h-6 w-6" />}
              title={t.account.noOrdersTitle}
              description={t.account.noOrdersDesc}
              action={
                <Button to="/shop" variant="secondary" size="sm">
                  {t.account.startShopping}
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <ProductArt
                        key={`${item.productId}-${item.variantId}`}
                        artKey={item.artKey}
                        label={item.productName}
                        className="h-10 w-10 rounded-full border-2 border-white"
                      />
                    ))}
                  </div>
                  <div className="min-w-35 flex-1">
                    <p className="font-medium text-ink">#{order.id}</p>
                    <p className="text-xs text-ink-soft">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="font-semibold text-ink">{formatPrice(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-ink">
            <UserIcon className="h-5 w-5 text-forest" /> {t.account.profile}
          </h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-ink-soft">{t.account.name}</dt>
              <dd className="font-medium text-ink">{user.name}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">{t.account.email}</dt>
              <dd className="font-medium text-ink">{user.email}</dd>
            </div>
          </dl>
          <Link to="/wishlist" className="mt-5 inline-block text-sm font-medium text-forest hover:underline">
            {t.account.viewWishlist} →
          </Link>
        </section>
      </div>
    </div>
  );
}
