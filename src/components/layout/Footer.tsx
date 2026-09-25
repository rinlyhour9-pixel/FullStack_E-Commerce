import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { LeafMarkIcon } from "../ui/icons";
import { Logo } from "./Logo";

export function Footer() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const km = language === "km";

  const columns = [
    {
      title: t.footer.shopColumn,
      links: [
        { label: t.footer.cleansers, to: "/shop?category=cleansers" },
        { label: t.footer.serums, to: "/shop?category=serums" },
        { label: t.footer.moisturizers, to: "/shop?category=moisturizers" },
        { label: t.footer.sunCare, to: "/shop?category=sun-care" },
        { label: t.footer.routineFinder, to: "/routine-finder" },
      ],
    },
    {
      title: t.footer.helpColumn,
      links: [
        { label: t.footer.storeInformation, to: "/store-information" },
        { label: t.footer.findYourRoutine, to: "/routine-finder" },
        { label: t.footer.shopAll, to: "/shop" },
      ],
    },
    {
      title: t.footer.companyColumn,
      links: [
        { label: t.footer.ourStory, to: "/" },
        { label: t.footer.ingredients, to: "/shop" },
        { label: t.footer.sustainability, to: "/" },
        { label: t.footer.wishlist, to: "/wishlist" },
        { label: t.footer.sellerLogin, to: "/admin/login" },
      ],
    },
  ];

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      showToast("Enter a valid email to subscribe.", "error");
      return;
    }
    showToast("You're on the list — welcome to TAMJIT.", "success");
    setEmail("");
  };

  return (
    <footer className="border-t border-line bg-cream-dark/60">
      <div className="container-shop grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr_1.2fr]">
        <div className="max-w-xs">
          <Logo />
          <p lang={km ? "km" : undefined} className={`mt-4 text-sm leading-relaxed text-ink-soft ${km ? "font-khmer" : ""}`}>
            {t.footer.description}
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs font-medium text-forest">
            <LeafMarkIcon className="h-4 w-4" />
            {t.footer.veganCrueltyFree}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-ink-soft transition hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-2 font-display text-lg text-ink">{t.footer.joinList}</h3>
          <p className="mb-4 text-sm text-ink-soft">{t.footer.joinDesc}</p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              {t.checkout.emailAddress}
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.footer.emailPlaceholder}
              className="w-full min-w-0 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-forest-dark"
            >
              {t.footer.join}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-line py-6">
        <div className="container-shop flex flex-col items-center justify-between gap-3 text-xs text-ink-soft sm:flex-row">
          <p>
            © {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <p>{t.footer.demoNotice}</p>
        </div>
      </div>
    </footer>
  );
}
