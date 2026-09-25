import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";
import { useLanguage } from "../../context/LanguageContext";
import { ChevronRightIcon } from "../ui/icons";

export function StoreInfoSection() {
  const { t, language } = useLanguage();
  const km = language === "km";

  return (
    <section id="store-information" className="khmer-weave border-y border-line py-16 sm:py-20">
      <div className="container-shop" lang={km ? "km" : undefined}>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.5fr] lg:items-end">
            <div>
              <p className={`text-sm font-semibold text-clay-dark ${km ? "font-khmer" : "uppercase tracking-widest"}`}>
                {t.storeInfo.eyebrow}
              </p>
              <h2 className={`mt-2 text-ink ${km ? "font-khmer-display text-2xl sm:text-3xl" : "font-display text-3xl sm:text-4xl"}`}>
                {t.storeInfo.title}
              </h2>
              <p className={`mt-3 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base ${km ? "font-khmer" : ""}`}>
                {t.storeInfo.intro}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {t.storeInfo.items.map((detail, index) => (
                <article key={detail.title} className="rounded-2xl border border-white/80 bg-cream/90 p-4 shadow-card sm:p-5">
                  <span className="font-display text-sm italic text-clay">{`0${index + 1}`}</span>
                  <h3 className={`mt-3 text-base font-semibold text-ink ${km ? "font-khmer-display" : ""}`}>{detail.title}</h3>
                  <p className={`mt-2 text-xs leading-relaxed text-ink-soft ${km ? "font-khmer" : ""}`}>{detail.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="mt-8 flex flex-col gap-3 border-t border-krama/15 pt-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p className={km ? "font-khmer" : ""}>{t.storeInfo.footerNote}</p>
          <Link to="/routine-finder" className="inline-flex items-center gap-1 font-semibold text-forest transition hover:text-clay-dark">
            {t.storeInfo.cta} <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
