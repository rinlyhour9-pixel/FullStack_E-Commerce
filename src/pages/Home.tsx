import { Hero } from "../components/home/Hero";
import { Categories } from "../components/home/Categories";
import { FeaturedProducts } from "../components/home/FeaturedProducts";
import { Promo } from "../components/home/Promo";
import { Testimonials } from "../components/home/Testimonials";
import { Newsletter } from "../components/home/Newsletter";
import { StoreInfoSection } from "../components/home/StoreInfoSection";

export function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Promo />
      <StoreInfoSection />
      <Testimonials />
      <Newsletter />
    </>
  );
}
