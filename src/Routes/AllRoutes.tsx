import { lazy } from "react";
import { Route, Routes } from "react-router";
import AuthProvider from "@/Providers/AuthProvider";

const HomeDash = lazy(() => import("../Pages/Dashboard/HomeDash"));
const NotFound = lazy(() => import("../Pages/NotFound"));

const AllRoutes = () => (
  <Routes>
    <Route
      path="/auth/dashboard"
      element={<AuthProvider element={<HomeDash />} />}
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AllRoutes;
