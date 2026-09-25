import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { LanguageProvider } from "./context/LanguageContext";
import { ProductsProvider } from "./context/ProductsContext";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";
import { UIProvider } from "./context/UIContext";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { SignIn } from "./pages/SignIn";
import { Register } from "./pages/Register";
import { Account } from "./pages/Account";
import { Wishlist } from "./pages/Wishlist";
import { NotFound } from "./pages/NotFound";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminProducts } from "./pages/admin/Products";
import { AdminProductForm } from "./pages/admin/ProductForm";
import { AdminOrders } from "./pages/admin/Orders";
import { AdminCustomers } from "./pages/admin/Customers";
import { RoutineFinder } from "./pages/RoutineFinder";
import { StoreInformation } from "./pages/StoreInformation";

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <ProductsProvider>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              <AuthProvider>
                <OrdersProvider>
                  <UIProvider>
                    <Routes>
                      <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="routine-finder" element={<RoutineFinder />} />
                        <Route path="store-information" element={<StoreInformation />} />
                        <Route path="shop" element={<Shop />} />
                        <Route path="product/:slug" element={<ProductDetail />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="sign-in" element={<SignIn />} />
                        <Route path="register" element={<Register />} />
                        <Route path="account" element={<Account />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      <Route path="admin/login" element={<AdminLogin />} />
                      <Route path="admin" element={<RequireAdmin />}>
                        <Route element={<AdminLayout />}>
                          <Route index element={<Navigate to="dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="products/new" element={<AdminProductForm />} />
                          <Route path="products/:id/edit" element={<AdminProductForm />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="customers" element={<AdminCustomers />} />
                        </Route>
                      </Route>
                    </Routes>
                  </UIProvider>
                </OrdersProvider>
              </AuthProvider>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </ProductsProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
