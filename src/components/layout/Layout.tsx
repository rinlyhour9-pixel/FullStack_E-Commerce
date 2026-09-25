import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileMenu } from "./MobileMenu";
import { SearchModal } from "./SearchModal";
import { CartDrawer } from "../cart/CartDrawer";
import { ToastViewport } from "../ui/ToastViewport";
import { useUI } from "../../context/UIContext";
import { useLanguage } from "../../context/LanguageContext";

export function Layout() {
  const { pathname } = useLocation();
  const { isSearchOpen, closeSearch, closeMobileMenu, closeCart } = useUI();
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    closeMobileMenu();
    closeCart();
  }, [pathname, closeMobileMenu, closeCart]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        {t.common.skipToContent}
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />

      <MobileMenu />
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
      <ToastViewport />
    </div>
  );
}
