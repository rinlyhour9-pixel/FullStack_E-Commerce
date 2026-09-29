import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";
import { LeafMarkIcon, LogOutIcon, MenuIcon, CloseIcon, ChartBarIcon, GridIcon, BagIcon, UsersIcon, ReportIcon } from "../ui/icons";

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const { t, language } = useLanguage();
  const km = language === "km";
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const NAV_LINKS = [
    { to: "/admin/dashboard", label: t.admin.nav.dashboard, icon: ChartBarIcon },
    { to: "/admin/pos", label: t.admin.nav.pos, icon: BagIcon },
    { to: "/admin/products", label: t.admin.nav.products, icon: GridIcon },
    { to: "/admin/inventory", label: t.admin.nav.inventory, icon: GridIcon },
    { to: "/admin/sales", label: t.admin.nav.sales, icon: ChartBarIcon },
    { to: "/admin/reports", label: t.admin.nav.reports, icon: ReportIcon },
    { to: "/admin/orders", label: t.admin.nav.orders, icon: BagIcon },
    { to: "/admin/customers", label: t.admin.nav.customers, icon: UsersIcon },
  ];

  const navContent = (
    <>
      <div className="flex items-center gap-2 px-2 py-1">
        <LeafMarkIcon className="h-6 w-6 text-sage" />
        <span className="font-display text-lg text-cream">
          TAM<span className="text-clay">JIT</span>
        </span>
        <span
          lang={km ? "km" : undefined}
          className={`ml-1 rounded-full bg-cream/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream/70 ${km ? "font-khmer" : ""}`}
        >
          {t.admin.nav.sellerBadge}
        </span>
      </div>

      <nav className={`mt-8 flex flex-col gap-1 ${km ? "font-khmer" : ""}`} aria-label={t.admin.nav.ariaLabel} lang={km ? "km" : undefined}>
        {NAV_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-cream/10 text-cream" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-cream/10 pt-4">
        <NavLink
          to="/"
          lang={km ? "km" : undefined}
          className={`px-3 text-xs font-medium text-cream/50 transition hover:text-cream/80 ${km ? "font-khmer" : ""}`}
        >
          ← {t.admin.nav.viewStore}
        </NavLink>
        <div className="flex items-center justify-between rounded-xl bg-cream/5 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream">{user?.name}</p>
            <p className="truncate text-xs text-cream/50">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 rounded-full p-2 text-cream/60 transition hover:bg-cream/10 hover:text-cream"
            aria-label={t.admin.nav.signOutAria}
          >
            <LogOutIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream-dark/40 print:bg-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-ink px-4 py-6 lg:flex print:hidden">{navContent}</aside>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/50"
              onClick={() => setMobileNavOpen(false)}
              aria-label={t.admin.nav.closeMenuAria}
            />
            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink px-4 py-6">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="mb-4 ml-auto flex h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                aria-label={t.admin.nav.closeMenuAria}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              {navContent}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-line bg-cream px-4 py-4 print:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-full p-2 text-ink transition hover:bg-ink/5 lg:hidden"
              aria-label={t.admin.nav.openMenuAria}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <span
              lang={km ? "km" : undefined}
              className={`font-display text-lg text-ink lg:hidden ${km ? "font-khmer" : ""}`}
            >
              {t.admin.nav.header}
            </span>
            <div className="ml-auto">
              <LanguageSwitcher />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 print:p-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
