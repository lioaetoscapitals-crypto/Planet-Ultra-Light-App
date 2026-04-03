import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { NavLeafItem, NavSection } from "../../app/navigation/routeConfig";
import useAuth from "../../hooks/useAuth";
import { canAccess, type Role } from "../../utils/roles";
import PlanetLogo from "./PlanetLogo";

type Props = {
  dashboard: NavLeafItem;
  sections: NavSection[];
};

function SectionIcon({ id }: { id: string }) {
  const glyph = (() => {
    if (id === "dashboard") return "≡";
    if (id === "approvals") return "◌";
    if (id === "operations") return "⚡";
    if (id === "society") return "🏢";
    if (id === "communication") return "◉";
    if (id === "payments") return "◫";
    if (id === "gate") return "⌁";
    if (id === "settings") return "⚙";
    return "•";
  })();

  return <span className="bo-sidebar-item-icon">{glyph}</span>;
}

export default function Sidebar({ dashboard, sections }: Props) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const role: Role =
    user?.role === "Admin" || user?.role === "Manager" || user?.role === "Security"
      ? user.role
      : "Admin";

  const visibleSections = useMemo(
    () =>
      sections
        .filter((section) => canAccess(role, section.moduleKey))
        .map((section) => ({
          ...section,
          children: section.children.filter((item) => canAccess(role, item.moduleKey))
        }))
        .filter((section) => section.children.length > 0),
    [role, sections]
  );
  const activeSectionId = useMemo(
    () => visibleSections.find((section) => section.children.some((child) => pathname.startsWith(child.path)))?.id ?? null,
    [pathname, visibleSections]
  );
  const [openSectionId, setOpenSectionId] = useState<string | null>(activeSectionId);

  useEffect(() => {
    if (!activeSectionId) {
      return;
    }
    setOpenSectionId(activeSectionId);
  }, [activeSectionId]);

  return (
    <aside className="bo-sidebar">
      <div className="bo-sidebar-brand">
        <PlanetLogo compact />
      </div>

      <nav className="bo-sidebar-nav">
        <NavLink
          to={dashboard.path}
          className={({ isActive }) => `bo-sidebar-link bo-sidebar-row ${isActive ? "bo-sidebar-link-active" : ""}`}
        >
          <span className="bo-sidebar-row-content">
            <SectionIcon id="dashboard" />
            <span>{dashboard.label}</span>
          </span>
        </NavLink>

        {visibleSections.map((section) => {
          const isOpen = openSectionId === section.id;

          return (
            <div key={section.id} className={`bo-sidebar-group ${isOpen ? "bo-sidebar-group-open" : ""}`}>
              <button
                type="button"
                className="bo-sidebar-group-summary"
                aria-expanded={isOpen}
                onClick={() => setOpenSectionId((previous) => (previous === section.id ? null : section.id))}
              >
                <span className="bo-sidebar-row-content">
                  <SectionIcon id={section.id} />
                  <span>{section.label}</span>
                </span>
                <span className="bo-sidebar-group-chevron">▾</span>
              </button>
              <div className={`bo-sidebar-group-list-wrap ${isOpen ? "is-open" : ""}`}>
                <div className="bo-sidebar-group-list">
                  {section.children.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `bo-sidebar-sublink bo-sidebar-row ${isActive ? "bo-sidebar-sublink-active" : ""}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
