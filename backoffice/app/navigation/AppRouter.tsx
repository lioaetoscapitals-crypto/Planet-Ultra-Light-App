import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layout/AdminLayout";
import LoginScreen from "../../modules/auth/screens/LoginScreen";
import DashboardScreen from "../../modules/dashboard/screens/DashboardScreen";
import UsersScreen from "../../modules/users/screens/UsersScreen";
import AnalyticsScreen from "../../modules/analytics/screens/AnalyticsScreen";
import SettingsScreen from "../../modules/settings/screens/SettingsScreen";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginScreen />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path={ROUTES.dashboard} element={<DashboardScreen />} />
          <Route path={ROUTES.users} element={<UsersScreen />} />
          <Route path={ROUTES.analytics} element={<AnalyticsScreen />} />
          <Route path={ROUTES.settings} element={<SettingsScreen />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
