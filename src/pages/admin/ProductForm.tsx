import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import { useToast } from "../../context/ToastContext";
import { categoryLabels } from "../../data/products";
import type { Product, ProductCategory, SkinType } from "../../types/product";
import { makeArtKey } from "../../utils/imageKey";
import type { ArtTint, BottleShape } from "../../utils/imageKey";
import { Button } from "../../components/ui/Button";
import { ProductArt } from "../../components/product/ProductArt";
import { PlusIcon, TrashIcon } from "../../components/ui/icons";

const CATEGORIES = Object.keys(categoryLabels) as ProductCategory[];
const SKIN_TYPES: SkinType[] = ["all", "dry", "oily", "combination", "sensitive"];
const SHAPES: BottleShape[] = ["pump", "dropper", "jar", "tube", "spray"];
const TINTS: ArtTint[] = ["forest", "sage", "clay", "gold", "ink"];
const BADGE_OPTIONS = ["new", "bestseller", "limited"] as const;

interface VariantRow {
  key: string;
  label: string;
  priceModifier: string;
  stock: string;
}

function makeVariantRow(): VariantRow {
  return { key: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: "", priceModifier: "0", stock: "0" };
}

export function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { getById, addProduct, updateProduct } = useProducts();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const existing = isEditing ? getById(id!) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [tagline, setTagline] = useState(existing?.tagline ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [category, setCategory] = useState<ProductCategory>(existing?.category ?? "cleansers");
  const [price, setPrice] = useState(String(existing?.price ?? 0));
  const [compareAtPrice, setCompareAtPrice] = useState(
    existing?.compareAtPrice !== undefined ? String(existing.compareAtPrice) : "",
  );
  const [skinTypes, setSkinTypes] = useState<SkinType[]>(existing?.skinTypes ?? ["all"]);
  const [badges, setBadges] = useState<string[]>(existing?.badges ?? []);
  const [shape, setShape] = useState<BottleShape>("jar");
  const [tint, setTint] = useState<ArtTint>("forest");
  const [howToUse, setHowToUse] = useState(existing?.howToUse.join("\n") ?? "");
  const [ingredients, setIngredients] = useState(existing?.ingredients.join(", ") ?? "");
  const [variants, setVariants] = useState<VariantRow[]>(
    existing
      ? existing.variants.map((v) => ({ key: v.id, label: v.label, priceModifier: String(v.priceModifier), stock: String(v.stock) }))
      : [makeVariantRow()],
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && !existing) {
      showToast("That product could not be found.", "error");
      navigate("/admin/products");
    }
  }, [isEditing, existing, navigate, showToast]);

  const toggleSkinType = (type: SkinType) => {
    setSkinTypes((current) => (current.includes(type) ? current.filter((t) => t !== type) : [...current, type]));
  };

  const toggleBadge = (badge: string) => {
    setBadges((current) => (current.includes(badge) ? current.filter((b) => b !== badge) : [...current, badge]));
  };

  const updateVariant = (key: string, patch: Partial<VariantRow>) => {
    setVariants((current) => current.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  };

  const removeVariant = (key: string) => {
    setVariants((current) => (current.length > 1 ? current.filter((v) => v.key !== key) : current));
  };

  const previewArtKey = makeArtKey(shape, tint, 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Product name is required.");
    if (!tagline.trim()) return setError("Tagline is required.");
    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) return setError("Enter a valid price.");
    if (variants.some((v) => !v.label.trim())) return setError("Every variant needs a size label.");
    if (skinTypes.length === 0) return setError("Select at least one skin type.");

    const compareValue = compareAtPrice.trim() ? Number(compareAtPrice) : undefined;

    const images = [0, 1, 2, 3].map((variant) => makeArtKey(shape, tint, variant));

    const productData: Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "reviews"> = {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      skinTypes,
      price: priceValue,
      compareAtPrice: compareValue,
      currency: "USD",
      images,
      variants: variants.map((v) => ({
        id: v.key,
        label: v.label.trim(),
        priceModifier: Number(v.priceModifier) || 0,
        stock: Math.max(0, Math.round(Number(v.stock) || 0)),
      })),
      badges: badges.length ? (badges as Product["badges"]) : undefined,
      howToUse: howToUse.split("\n").map((s) => s.trim()).filter(Boolean),
      ingredients: ingredients.split(",").map((s) => s.trim()).filter(Boolean),
    };

    if (isEditing && existing) {
      updateProduct(existing.id, productData);
      showToast(`${productData.name} was updated.`, "success");
    } else {
      addProduct(productData);
      showToast(`${productData.name} was added to your catalog.`, "success");
    }
    navigate("/admin/products");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">{isEditing ? "Edit product" : "Add product"}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isEditing ? "Update details, pricing, and stock for this product." : "Create a new product for your storefront."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">Product name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">Tagline</span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabels[c]}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink">Badges</span>
              <div className="flex flex-wrap gap-2">
                {BADGE_OPTIONS.map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => toggleBadge(badge)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                      badges.includes(badge)
                        ? "border-forest bg-forest text-cream"
                        : "border-ink/15 text-ink-soft hover:border-ink/30"
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-ink">Skin types</span>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleSkinType(type)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                    skinTypes.includes(type)
                      ? "border-forest bg-forest text-cream"
                      : "border-ink/15 text-ink-soft hover:border-ink/30"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">Pricing</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">Base price (USD)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">Compare-at price (optional)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Variants &amp; stock</h2>
            <button
              type="button"
              onClick={() => setVariants((current) => [...current, makeVariantRow()])}
              className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-forest hover:text-forest"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add variant
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {variants.map((variant) => (
              <div key={variant.key} className="grid grid-cols-1 gap-3 rounded-2xl border border-line p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <label>
                  <span className="mb-1 block text-xs font-medium text-ink-soft">Size label</span>
                  <input
                    value={variant.label}
                    onChange={(e) => updateVariant(variant.key, { label: e.target.value })}
                    placeholder="e.g. 50ml"
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-ink-soft">Price add-on</span>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.priceModifier}
                    onChange={(e) => updateVariant(variant.key, { priceModifier: e.target.value })}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-ink-soft">Stock</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.key, { stock: e.target.value })}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeVariant(variant.key)}
                  disabled={variants.length <= 1}
                  className="self-end rounded-lg p-2 text-ink-soft transition hover:bg-clay/10 hover:text-clay-dark disabled:opacity-30"
                  aria-label="Remove variant"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">Packaging image</h2>
          <p className="mb-4 text-sm text-ink-soft">
            This demo store illustrates products instead of using stock photos. Pick a packaging style and color.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
              <ProductArt artKey={previewArtKey} label="Preview" className="h-full w-full" />
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">Shape</span>
                <div className="flex flex-wrap gap-2">
                  {SHAPES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShape(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                        shape === s ? "border-forest bg-forest text-cream" : "border-ink/15 text-ink-soft hover:border-ink/30"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">Color</span>
                <div className="flex flex-wrap gap-2">
                  {TINTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTint(t)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                        tint === t ? "border-forest bg-forest text-cream" : "border-ink/15 text-ink-soft hover:border-ink/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">How to use &amp; ingredients</h2>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-ink">How to use (one step per line)</span>
            <textarea
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-ink">Ingredients (comma separated)</span>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
            />
          </label>
        </section>

        {error && (
          <p role="alert" className="rounded-xl bg-clay/10 px-4 py-3 text-sm font-medium text-clay-dark">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" size="lg">
            {isEditing ? "Save changes" : "Create product"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
