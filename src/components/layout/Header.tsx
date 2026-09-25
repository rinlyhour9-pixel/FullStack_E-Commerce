import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useUI } from "../../context/UIContext";
import { useLanguage } from "../../context/LanguageContext";
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "../ui/icons";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { itemCount } = useCart();
  const { ids } = useWishlist();
  const { openSearch, openCart, openMobileMenu } = useUI();
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.shopAll, to: "/shop" },
    { label: t.nav.cleansers, to: "/shop?category=cleansers" },
    { label: t.nav.serums, to: "/shop?category=serums" },
    { label: t.nav.moisturizers, to: "/shop?category=moisturizers" },
    { label: t.nav.sunCare, to: "/shop?category=sun-care" },
    { label: t.nav.routineFinder, to: "/routine-finder" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur supports-backdrop-filter:bg-cream/80">
      <div className="container-shop flex h-18 items-center gap-4 py-3">
        <button
          type="button"
          onClick={openMobileMenu}
          className="rounded-full p-2 text-ink transition hover:bg-ink/5 lg:hidden"
          aria-label={t.nav.openMenu}
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <Logo className="mr-2" />

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `relative py-1 text-sm font-medium text-ink-soft transition hover:text-ink ${
                  isActive ? "text-ink after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-clay" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={openSearch}
            className="rounded-full p-2.5 text-ink transition hover:bg-ink/5"
            aria-label={t.common.search}
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <NavLink
            to="/account"
            className="hidden rounded-full p-2.5 text-ink transition hover:bg-ink/5 sm:inline-flex"
            aria-label={t.common.account}
          >
            <UserIcon className="h-5 w-5" />
          </NavLink>
          <NavLink to="/wishlist" className="relative rounded-full p-2.5 text-ink transition hover:bg-ink/5" aria-label={`${t.common.wishlist}, ${ids.length}`}>
            <HeartIcon className="h-5 w-5" />
            {ids.length > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-cream">
                {ids.length}
              </span>
            )}
          </NavLink>
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2.5 text-ink transition hover:bg-ink/5"
            aria-label={`${t.common.cart}, ${itemCount}`}
          >
            <BagIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-cream">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
