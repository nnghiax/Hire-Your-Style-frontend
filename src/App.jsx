import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ForgetPasswordPage from "./components/auth/ForgetPasswordPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import FilterProduct from "./pages/customer/FilterProduct";
import StoreOwnerDashboard from "./components/store_owner/StoreOwnerDashboard";
import StoreOwnerSidebar from "./components/store_owner/StoreOwnerSidebar";
import StoreOwnerProducts from "./components/store_owner/ManageProducts";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProduct from "./components/admin/AdminProduct";
import RequestStore from "./components/customer/RequestStore";
import ProfilePage from "./components/auth/ProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import StoreOwnerProfile from "./components/store_owner/StoreOwnerProfile";
import AdminStoreRequest from "./components/admin/AdminStoreRequest";
import AdminStoreRequestDetail from "./components/admin/AdminStoreRequestDetail";
import AdminUsers from "./components/admin/AdminUsers";
import RentalHistory from "./components/customer/RentalHistory";
import RentalDashboard from "./components/admin/RentalDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forget-password" element={<ForgetPasswordPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/filter-product" element={<FilterProduct />} />
        <Route
          path="/product-detail/:productId/:storeId"
          element={<ProductDetailPage />}
        />
        <Route path="/rental-history" element={<RentalHistory />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/request" element={<RequestStore />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Route store-owner */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/store-owner/dashboard"
            element={<StoreOwnerDashboard />}
          />
          <Route path="/store-owner/sidebar" element={<StoreOwnerSidebar />} />
          <Route
            path="/store-owner/products"
            element={<StoreOwnerProducts />}
          />
          <Route path="/store-owner/profile" element={<StoreOwnerProfile />} />
        </Route>

        {/* Route admin */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProduct />} />
          <Route path="/admin/request" element={<AdminStoreRequest />} />
          <Route
            path="/admin/request/:requestId"
            element={<AdminStoreRequestDetail />}
          />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/rental-dashboard" element={<RentalDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
