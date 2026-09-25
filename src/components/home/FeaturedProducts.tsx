import { useProducts } from "../../context/ProductsContext";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";
import { ProductGrid } from "../product/ProductGrid";
import { ChevronRightIcon } from "../ui/icons";

export function FeaturedProducts() {
  const { products } = useProducts();
  const { t } = useLanguage();
  const featured = products.filter((product) => product.badges?.includes("bestseller")).slice(0, 4);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-shop">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">{t.home.bestsellersEyebrow}</p>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{t.home.bestsellersTitle}</h2>
            </div>
            <Button to="/shop" variant="ghost" iconRight={<ChevronRightIcon className="h-4 w-4" />}>
              {t.home.shopAllProducts}
            </Button>
          </div>
        </Reveal>

        <ProductGrid products={featured} />
      </div>
    </section>
  );
}
