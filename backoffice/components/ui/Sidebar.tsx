import { NavLink } from "react-router-dom";
import type { NavItem } from "../../app/navigation/routeConfig";
import { APP_NAME } from "../../utils/constants";

type Props = {
  items: NavItem[];
};

export default function Sidebar({ items }: Props) {
  return (
    <aside className="bo-sidebar">
      <div className="bo-sidebar-brand">{APP_NAME}</div>
      <nav className="bo-sidebar-nav">
        {items.map((item) => (
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
