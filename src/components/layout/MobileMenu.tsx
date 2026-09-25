import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useUI } from "../../context/UIContext";
import { useLanguage } from "../../context/LanguageContext";
import { CloseIcon, HeartIcon, UserIcon } from "../ui/icons";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUI();
  const { t } = useLanguage();

  const links = [
    { label: t.nav.shopAll, to: "/shop" },
    { label: t.categories.cleansers, to: "/shop?category=cleansers" },
    { label: t.categories.serums, to: "/shop?category=serums" },
    { label: t.categories.moisturizers, to: "/shop?category=moisturizers" },
    { label: t.categories.masks, to: "/shop?category=masks" },
    { label: t.categories["sun-care"], to: "/shop?category=sun-care" },
    { label: t.categories.body, to: "/shop?category=body" },
    { label: t.nav.routineFinder, to: "/routine-finder" },
  ];

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-95 lg:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={closeMobileMenu}
        aria-label={t.nav.closeMenu}
      />
      <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-cream p-6 shadow-card-hover">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={closeMobileMenu}
            className="rounded-full p-2 text-ink transition hover:bg-ink/5"
            aria-label={t.nav.closeMenu}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <LanguageSwitcher className="mb-6 self-start" />

        <nav className="flex flex-col gap-1" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `rounded-xl px-3 py-3 font-display text-lg text-ink transition hover:bg-ink/5 ${isActive ? "bg-sage-light/60" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-line pt-4">
          <NavLink
            to="/account"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition hover:bg-ink/5"
          >
            <UserIcon className="h-5 w-5" /> {t.common.account}
          </NavLink>
          <NavLink
            to="/wishlist"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition hover:bg-ink/5"
          >
            <HeartIcon className="h-5 w-5" /> {t.common.wishlist}
          </NavLink>
        </div>
      </div>
    </div>
  );
}
