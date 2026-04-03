import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
import { allNavItems, dashboardItem, navSections } from "../navigation/routeConfig";

function resolveTitle(pathname: string) {
  const sorted = [...allNavItems].sort((a, b) => b.path.length - a.path.length);
  return sorted.find((item) => pathname.startsWith(item.path))?.label ?? "Dashboard";
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = resolveTitle(pathname);

  return (
    <div className="bo-layout">
      <Sidebar dashboard={dashboardItem} sections={navSections} />
      <div className="bo-content-shell">
        <Header title={title} />
        <main className="bo-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
