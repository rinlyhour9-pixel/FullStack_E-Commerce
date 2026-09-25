import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import { useToast } from "../../context/ToastContext";
import { categoryLabels } from "../../data/products";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatPrice } from "../../utils/format";
import { getTotalStock, isLowStock } from "../../utils/inventory";
import { EditIcon, GridIcon, PlusIcon, SearchIcon, TrashIcon } from "../../components/ui/icons";

export function AdminProducts() {
  const { products, deleteProduct } = useProducts();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) => product.name.toLowerCase().includes(term) || product.category.includes(term),
    );
  }, [products, query]);

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    setPendingDeleteId(null);
    showToast(`${name} was removed from the catalog.`, "info");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">{products.length} products in your catalog</p>
        </div>
        <Button to="/admin/products/new" icon={<PlusIcon className="h-4 w-4" />}>
          Add product
        </Button>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<GridIcon className="h-6 w-6" />}
          title="No products found"
          description="Try a different search, or add a new product to your catalog."
          action={
            <Button to="/admin/products/new" variant="secondary">
              Add product
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-line bg-white">
          <table className="w-full min-w-180 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-semibold">Product</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const stock = getTotalStock(product);
                return (
                  <tr key={product.id} className="border-b border-line last:border-none hover:bg-cream/60">
                    <td className="px-5 py-3">
                      <Link to={`/admin/products/${product.id}/edit`} className="font-medium text-ink hover:text-clay-dark">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 capitalize text-ink-soft">{categoryLabels[product.category]}</td>
                    <td className="px-5 py-3 text-ink">{formatPrice(product.price)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          stock === 0
                            ? "bg-ink/10 text-ink-soft"
                            : isLowStock(product)
                              ? "bg-clay/10 text-clay-dark"
                              : "bg-sage-light text-forest-dark"
                        }`}
                      >
                        {stock === 0 ? "Out of stock" : `${stock} in stock`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                          aria-label={`Edit ${product.name}`}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Link>
                        {pendingDeleteId === product.id ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="rounded-full bg-clay px-3 py-1.5 text-xs font-semibold text-cream transition hover:bg-clay-dark"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition hover:bg-clay/10 hover:text-clay-dark"
                            aria-label={`Delete ${product.name}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
