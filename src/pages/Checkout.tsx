import { cloneElement, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrdersContext";
import { useLanguage } from "../context/LanguageContext";
import type { Order } from "../types/order";
import type { Translations } from "../i18n/translations";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ProductArt } from "../components/product/ProductArt";
import { BagIcon, CheckIcon, ShieldIcon } from "../components/ui/icons";
import { formatPrice } from "../utils/format";

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const INITIAL_FORM: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState, errorText: Translations["checkout"]["errors"]): FormErrors {
  const errors: FormErrors = {};
  if (!form.email.includes("@")) errors.email = errorText.email;
  if (!form.firstName.trim()) errors.firstName = errorText.firstName;
  if (!form.lastName.trim()) errors.lastName = errorText.lastName;
  if (!form.address.trim()) errors.address = errorText.address;
  if (!form.city.trim()) errors.city = errorText.city;
  if (!/^[a-zA-Z0-9\- ]{3,10}$/.test(form.postalCode.trim())) errors.postalCode = errorText.postalCode;
  if (!form.country.trim()) errors.country = errorText.country;
  return errors;
}

export function Checkout() {
  const { lineDetails, subtotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (user) setForm((current) => ({ ...current, email: user.email, firstName: user.name.split(" ")[0] ?? "", lastName: user.name.split(" ").slice(1).join(" ") }));
  }, [user]);

  const shipping = subtotal > 0 && subtotal < 50 ? 6 : 0;
  const tax = useMemo(() => Math.round(subtotal * 0.08 * 100) / 100, [subtotal]);
  const total = subtotal + shipping + tax;

  const updateField = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(form, t.checkout.errors);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = document.querySelector<HTMLInputElement>("[aria-invalid='true']");
      firstErrorField?.focus();
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    try {
      const order = await placeOrder({
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: form.email,
        shippingAddress: { address: form.address, city: form.city, postalCode: form.postalCode, country: form.country },
      });
      setConfirmedOrder(order);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "We could not place your order. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  if (!user) {
    return (
      <div className="container-shop flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-3xl text-ink">{t.checkout.title}</h1>
        <p className="mt-3 max-w-md text-sm text-ink-soft">{t.checkout.requireSignIn}</p>
        <div className="mt-6 flex gap-3"><Link to="/sign-in" state={{ from: "/checkout" }} className="rounded-full bg-forest px-5 py-3 text-sm font-medium text-cream">{t.auth.signInButton}</Link><Link to="/register" state={{ from: "/checkout" }} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium text-ink">{t.auth.createAccountButton}</Link></div>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="container-shop py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forest text-cream">
            <CheckIcon className="h-8 w-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-clay-dark">
            {t.checkout.demoOrderBadge}
          </span>
          <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
            {t.checkout.thankYou} {form.firstName}!
          </h1>
          <p className="mt-3 text-ink-soft">
            <span className="font-semibold text-ink">#{confirmedOrder.id}</span> {t.checkout.confirmationNote}
          </p>

          <div className="mt-8 rounded-3xl border border-line bg-white p-6 text-left">
            <h2 className="mb-4 font-display text-lg text-ink">{t.checkout.orderSummary}</h2>
            <ul className="flex flex-col divide-y divide-line">
              {confirmedOrder.items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex items-center gap-4 py-3">
                  <ProductArt artKey={item.artKey} label={item.productName} className="h-14 w-14 shrink-0 rounded-xl" />
                  <span className="flex-1 text-sm text-ink">
                    {item.productName} <span className="text-ink-soft">× {item.quantity}</span>
                    <span className="block text-xs text-ink-soft">{item.variantLabel}</span>
                  </span>
                  <span className="text-sm font-semibold text-ink">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold text-ink">
              <span>{t.cart.total}</span>
              <span>{formatPrice(confirmedOrder.total)}</span>
            </div>
          </div>

          <Button to="/shop" variant="secondary" size="lg" className="mt-8">
            {t.common.continueShopping}
          </Button>
        </div>
      </div>
    );
  }

  if (lineDetails.length === 0) {
    return (
      <div className="container-shop py-20">
        <EmptyState
          icon={<BagIcon className="h-7 w-7" />}
          title={t.checkout.emptyTitle}
          description={t.checkout.emptyDesc}
          action={
            <Button to="/shop" variant="secondary">
              {t.checkout.browseProducts}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-shop py-10 sm:py-14">
      <h1 className="mb-8 font-display text-3xl text-ink sm:text-4xl">{t.checkout.title}</h1>

      <form onSubmit={handleSubmit} noValidate className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-4 font-display text-xl text-ink">{t.checkout.contact}</h2>
            <Field id="email-address" label={t.checkout.emailAddress} error={errors.email}>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={updateField("email")}
                aria-invalid={!!errors.email}
                className={inputClass(!!errors.email)}
              />
            </Field>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl text-ink">{t.checkout.deliveryDetails}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="first-name" label={t.checkout.firstName} error={errors.firstName}>
                <input
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={updateField("firstName")}
                  aria-invalid={!!errors.firstName}
                  className={inputClass(!!errors.firstName)}
                />
              </Field>
              <Field id="last-name" label={t.checkout.lastName} error={errors.lastName}>
                <input
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={updateField("lastName")}
                  aria-invalid={!!errors.lastName}
                  className={inputClass(!!errors.lastName)}
                />
              </Field>
              <Field id="street-address" label={t.checkout.streetAddress} error={errors.address} className="sm:col-span-2">
                <input
                  autoComplete="street-address"
                  value={form.address}
                  onChange={updateField("address")}
                  aria-invalid={!!errors.address}
                  className={inputClass(!!errors.address)}
                />
              </Field>
              <Field id="city" label={t.checkout.city} error={errors.city}>
                <input
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={updateField("city")}
                  aria-invalid={!!errors.city}
                  className={inputClass(!!errors.city)}
                />
              </Field>
              <Field id="postal-code" label={t.checkout.postalCode} error={errors.postalCode}>
                <input
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={updateField("postalCode")}
                  aria-invalid={!!errors.postalCode}
                  className={inputClass(!!errors.postalCode)}
                />
              </Field>
              <Field id="country" label={t.checkout.country} error={errors.country} className="sm:col-span-2">
                <input
                  autoComplete="country-name"
                  value={form.country}
                  onChange={updateField("country")}
                  aria-invalid={!!errors.country}
                  className={inputClass(!!errors.country)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-xl text-ink">{t.checkout.payment}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t.checkout.demoPaymentNote}</p>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-xl text-ink">{t.checkout.orderReview}</h2>
          <ul className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
            {lineDetails.map(({ line, product, variant, lineTotal }) => (
              <li key={`${line.productId}-${line.variantId}`} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <ProductArt artKey={product.images[0]} label={product.name} className="h-14 w-14 rounded-xl" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-cream">
                    {line.quantity}
                  </span>
                </div>
                <span className="flex-1 text-sm text-ink">
                  {product.name}
                  <span className="block text-xs text-ink-soft">{variant.label}</span>
                </span>
                <span className="text-sm font-semibold text-ink">{formatPrice(lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="my-4 border-t border-line" />

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.cart.subtotal}</dt>
              <dd className="text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.cart.shipping}</dt>
              <dd className="text-ink">{shipping === 0 ? t.cart.free : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.cart.estimatedTax}</dt>
              <dd className="text-ink">{formatPrice(tax)}</dd>
            </div>
          </dl>

          <div className="my-4 border-t border-line" />
          <div className="mb-6 flex justify-between text-base font-semibold text-ink">
            <span>{t.cart.total}</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>{t.checkout.placeOrder}</Button>
          {serverError && <p role="alert" className="mt-3 rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay-dark">{serverError}</p>}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft"><ShieldIcon className="h-4 w-4" /> {t.checkout.noRealPayment}</p>
        </aside>
      </form>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none ${
    hasError ? "border-clay focus:border-clay" : "border-ink/15 focus:border-forest"
  }`;
}

function Field({
  id,
  label,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string }>;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {cloneElement(children, { id, "aria-describedby": error ? `${id}-error` : undefined })}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-clay-dark">
          {error}
        </p>
      )}
    </div>
  );
}
