import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { useProducts } from "../../context/ProductsContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
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
  const { getById, addProduct, updateProduct, isLoading: productsLoading } = useProducts();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const km = language === "km";
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [howToUse, setHowToUse] = useState(existing?.howToUse.join("\n") ?? "");
  const [ingredients, setIngredients] = useState(existing?.ingredients.join(", ") ?? "");
  const [variants, setVariants] = useState<VariantRow[]>(
    existing
      ? existing.variants.map((v) => ({ key: v.id, label: v.label, priceModifier: String(v.priceModifier), stock: String(v.stock) }))
      : [makeVariantRow()],
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && !existing && !productsLoading) {
      showToast(t.admin.productForm.notFoundToast, "error");
      navigate("/admin/products");
    }
  }, [isEditing, existing, productsLoading, navigate, showToast, t]);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name); setTagline(existing.tagline); setDescription(existing.description); setCategory(existing.category);
    setPrice(String(existing.price)); setCompareAtPrice(existing.compareAtPrice === undefined ? "" : String(existing.compareAtPrice));
    setSkinTypes(existing.skinTypes); setBadges(existing.badges ?? []); setHowToUse(existing.howToUse.join("\n")); setIngredients(existing.ingredients.join(", "));
    setVariants(existing.variants.map((v) => ({ key: v.id, label: v.label, priceModifier: String(v.priceModifier), stock: String(v.stock) })));
  }, [existing]);

  useEffect(() => {
    const previews = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [imageFiles]);

  const selectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length > 4) return setError(t.admin.productForm.errorTooManyPhotos);
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      return setError(t.admin.productForm.errorPhotoType);
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) return setError(t.admin.productForm.errorPhotoSize);
    setError(null);
    setImageFiles(files);
  };

  const toggleSkinType = (type: SkinType) => {
    setSkinTypes((current) => (current.includes(type) ? current.filter((existingType) => existingType !== type) : [...current, type]));
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) return setError(t.admin.productForm.errorNameRequired);
    if (!tagline.trim()) return setError(t.admin.productForm.errorTaglineRequired);
    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) return setError(t.admin.productForm.errorPriceInvalid);
    if (variants.some((v) => !v.label.trim())) return setError(t.admin.productForm.errorVariantLabel);
    if (skinTypes.length === 0) return setError(t.admin.productForm.errorSkinType);

    const compareValue = compareAtPrice.trim() ? Number(compareAtPrice) : undefined;

    const images = existing?.images.length ? existing.images : [0, 1, 2, 3].map((variant) => makeArtKey(shape, tint, variant));

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

    setIsSaving(true);
    try {
      if (imageFiles.length) {
        productData.images = await Promise.all(imageFiles.map(async (file) => {
          const uploaded = await api.upload<{ path: string }>("/admin/products/upload-image", file);
          return uploaded.path;
        }));
      }
      if (isEditing && existing) { await updateProduct(existing.id, productData); showToast(`${productData.name} ${t.admin.productForm.updatedToastSuffix}`, "success"); }
      else { await addProduct(productData); showToast(`${productData.name} ${t.admin.productForm.createdToastSuffix}`, "success"); }
      navigate("/admin/products");
    } catch (e) { setError(e instanceof Error ? e.message : t.admin.productForm.errorSaveFailed); }
    finally { setIsSaving(false); }
  };

  return (
    <div className={`mx-auto flex max-w-3xl flex-col gap-6 ${km ? "font-khmer" : ""}`} lang={km ? "km" : undefined}>
      <div>
        <h1 className="font-display text-3xl text-ink">{isEditing ? t.admin.productForm.editTitle : t.admin.productForm.addTitle}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {isEditing ? t.admin.productForm.editSubtitle : t.admin.productForm.addSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">{t.admin.productForm.detailsSection}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.productName}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.tagline}</span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.description}</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.category}</span>
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
              <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.badges}</span>
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
                    {t.common[badge]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.skinTypes}</span>
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
                  {t.skinTypes[type]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">{t.admin.productForm.pricingSection}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.basePrice}</span>
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
              <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.compareAtPrice}</span>
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
            <h2 className="font-display text-lg text-ink">{t.admin.productForm.variantsSection}</h2>
            <button
              type="button"
              onClick={() => setVariants((current) => [...current, makeVariantRow()])}
              className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-forest hover:text-forest"
            >
              <PlusIcon className="h-3.5 w-3.5" /> {t.admin.productForm.addVariant}
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {variants.map((variant) => (
              <div key={variant.key} className="grid grid-cols-1 gap-3 rounded-2xl border border-line p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <label>
                  <span className="mb-1 block text-xs font-medium text-ink-soft">{t.admin.productForm.sizeLabel}</span>
                  <input
                    value={variant.label}
                    onChange={(e) => updateVariant(variant.key, { label: e.target.value })}
                    placeholder={t.admin.productForm.sizePlaceholder}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-ink-soft">{t.admin.productForm.priceAddOn}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={variant.priceModifier}
                    onChange={(e) => updateVariant(variant.key, { priceModifier: e.target.value })}
                    className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-ink-soft">{t.admin.productForm.stock}</span>
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
                  aria-label={t.admin.productForm.removeVariantAria}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">{t.admin.productForm.packagingSection}</h2>
          <p className="mb-4 text-sm text-ink-soft">
            {t.admin.productForm.packagingHint}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
              {imagePreviews[0] ? (
                <img src={imagePreviews[0]} alt={t.admin.productForm.photoPreviewAlt} className="h-full w-full object-cover" />
              ) : (
                <ProductArt artKey={isEditing && existing?.images[0] ? existing.images[0] : previewArtKey} label={t.admin.productForm.previewLabel} className="h-full w-full" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">{t.admin.productForm.photosLabel}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectImages} className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-medium file:text-cream hover:file:bg-forest-dark" />
                <span className="mt-1.5 block text-xs text-ink-soft">{t.admin.productForm.photosHint}</span>
              </label>
              {imagePreviews.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.slice(1).map((preview, index) => <img key={preview} src={preview} alt={`${t.admin.productForm.photoAlt} ${index + 2}`} className="h-16 w-16 rounded-xl object-cover" />)}
                </div>
              )}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">{t.admin.productForm.shapeLabel}</span>
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
                      {t.admin.productForm.shapes[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-ink-soft">{t.admin.productForm.colorLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {TINTS.map((tintOption) => (
                    <button
                      key={tintOption}
                      type="button"
                      onClick={() => setTint(tintOption)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                        tint === tintOption ? "border-forest bg-forest text-cream" : "border-ink/15 text-ink-soft hover:border-ink/30"
                      }`}
                    >
                      {t.admin.productForm.tints[tintOption]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-6">
          <h2 className="mb-4 font-display text-lg text-ink">{t.admin.productForm.usageSection}</h2>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.howToUseLabel}</span>
            <textarea
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm focus:border-forest focus:outline-none"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-medium text-ink">{t.admin.productForm.ingredientsLabel}</span>
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
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
            {isEditing ? t.admin.productForm.saveChanges : t.admin.productForm.createProduct}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate("/admin/products")}>
            {t.admin.productForm.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
