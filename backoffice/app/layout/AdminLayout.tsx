import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
import { navItems } from "../navigation/routeConfig";
import { ROUTES } from "../../utils/constants";

function resolveTitle(pathname: string) {
  if (pathname.startsWith(ROUTES.users)) return "Users";
  if (pathname.startsWith(ROUTES.analytics)) return "Analytics";
  if (pathname.startsWith(ROUTES.settings)) return "Settings";
  return "Dashboard";
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = resolveTitle(pathname);

  return (
    <div className="bo-layout">
      <Sidebar items={navItems} />
      <div className="bo-content-shell">
        <Header title={title} />
        <main className="bo-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
