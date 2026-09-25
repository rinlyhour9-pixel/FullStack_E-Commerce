import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LeafMarkIcon, LogOutIcon, MenuIcon, CloseIcon, ChartBarIcon, GridIcon, BagIcon, UsersIcon } from "../ui/icons";

const NAV_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: ChartBarIcon },
  { to: "/admin/products", label: "Products", icon: GridIcon },
  { to: "/admin/orders", label: "Orders", icon: BagIcon },
  { to: "/admin/customers", label: "Customers", icon: UsersIcon },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const navContent = (
    <>
      <div className="flex items-center gap-2 px-2 py-1">
        <LeafMarkIcon className="h-6 w-6 text-sage" />
        <span className="font-display text-lg text-cream">
          TAM<span className="text-clay">JIT</span>
        </span>
        <span className="ml-1 rounded-full bg-cream/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream/70">
          Seller
        </span>
      </div>

      <nav className="mt-8 flex flex-col gap-1" aria-label="Admin">
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
        <NavLink to="/" className="px-3 text-xs font-medium text-cream/50 transition hover:text-cream/80">
          ← View store
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
            aria-label="Sign out"
          >
            <LogOutIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream-dark/40">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-ink px-4 py-6 lg:flex">{navContent}</aside>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/50"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
            />
            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink px-4 py-6">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="mb-4 ml-auto flex h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
              {navContent}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-line bg-cream px-4 py-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-full p-2 text-ink transition hover:bg-ink/5"
              aria-label="Open admin menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <span className="font-display text-lg text-ink">Seller Dashboard</span>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
