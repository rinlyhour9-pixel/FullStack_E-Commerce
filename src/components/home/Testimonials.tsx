import { StarRating } from "../ui/StarRating";
import { Reveal } from "../ui/Reveal";
import { useLanguage } from "../../context/LanguageContext";

const TESTIMONIALS = [
  {
    name: "Marina T.",
    quote:
      "The Barrier Repair Cream completely changed how my skin handles winter. No more flaking, no more redness — just calm, resilient skin.",
    rating: 5,
  },
  {
    name: "Joon P.",
    quote:
      "I've tried every serum on the market. The Bakuchiol Renewal is the first one that actually delivered results without irritation.",
    rating: 5,
  },
  {
    name: "Yara H.",
    quote:
      "Finally a sunscreen that doesn't leave a cast on deeper skin tones. It's become a non-negotiable in my routine.",
    rating: 5,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="bg-forest py-16 text-cream sm:py-20">
      <div className="container-shop">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">{t.home.testimonialsEyebrow}</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t.home.testimonialsTitle}</h2>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 90}>
              <figure className="flex h-full flex-col rounded-3xl bg-cream/10 p-6 backdrop-blur-sm">
                <StarRating rating={testimonial.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cream/90">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-ink">
                    {initials(testimonial.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{testimonial.name}</span>
                    <span className="block text-xs text-cream/70">{t.common.verifiedPurchase}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
