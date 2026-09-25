import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../ui/icons";
import { ProductArt } from "./ProductArt";
import { useLanguage } from "../../context/LanguageContext";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLanguage();

  const goTo = (index: number) => {
    setActiveIndex(((index % images.length) + images.length) % images.length);
  };

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row lg:sticky lg:top-24 lg:self-start">
      <div className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col sm:overflow-visible" role="tablist" aria-label="Product images">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            onClick={() => goTo(index)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-18 sm:w-18 ${
              activeIndex === index ? "border-clay" : "border-transparent hover:border-ink/20"
            }`}
          >
            <ProductArt artKey={image} label={`${productName} view ${index + 1}`} className="h-full w-full" />
          </button>
        ))}
      </div>

      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-cream-dark">
        <div key={activeIndex} className="h-full w-full animate-fade-in">
          <ProductArt artKey={images[activeIndex]} label={`${productName}, view ${activeIndex + 1}`} className="h-full w-full" />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
              aria-label={t.product.previousImage}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
              aria-label={t.product.nextImage}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === index ? "w-5 bg-clay" : "w-1.5 bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
