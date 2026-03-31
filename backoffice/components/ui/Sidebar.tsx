import { NavLink } from "react-router-dom";
import type { NavItem } from "../../app/navigation/routeConfig";
import { APP_NAME } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";
import { canAccess } from "../../utils/roles";

type Props = {
  items: NavItem[];
};

export default function Sidebar({ items }: Props) {
  const { user } = useAuth();
  const role = user?.role ?? "Admin";
  const visibleItems = items.filter((item) => canAccess(role, item.moduleKey));

  return (
    <aside className="bo-sidebar">
      <div className="bo-sidebar-brand">{APP_NAME}</div>
      <nav className="bo-sidebar-nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `bo-sidebar-link ${isActive ? "bo-sidebar-link-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
