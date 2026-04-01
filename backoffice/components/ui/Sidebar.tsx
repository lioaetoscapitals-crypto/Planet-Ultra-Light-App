import { NavLink } from "react-router-dom";
import type { NavItem } from "../../app/navigation/routeConfig";
import useAuth from "../../hooks/useAuth";
import { canAccess } from "../../utils/roles";
import PlanetLogo from "./PlanetLogo";

type Props = {
  items: NavItem[];
};

export default function Sidebar({ items }: Props) {
  const { user } = useAuth();
  const role = user?.role ?? "Admin";
  const visibleItems = items.filter((item) => canAccess(role, item.moduleKey));

  return (
    <aside className="bo-sidebar">
      <div className="bo-sidebar-brand">
        <PlanetLogo compact />
      </div>
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
