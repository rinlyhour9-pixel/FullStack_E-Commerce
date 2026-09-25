import type { Product } from "../../types/product";
import { Reveal } from "../ui/Reveal";
import { ProductCard } from "./ProductCard";
import { useLanguage } from "../../context/LanguageContext";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export function RelatedProducts({ products, title }: RelatedProductsProps) {
  const { t } = useLanguage();
  const heading = title ?? t.product.relatedTitle;
  if (products.length === 0) return null;

  return (
    <section className="container-shop py-16 sm:py-20">
      <Reveal>
        <h2 className="mb-8 font-display text-3xl text-ink">{heading}</h2>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {products.map((product, index) => (
          <Reveal key={product.id} delay={index * 60}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
