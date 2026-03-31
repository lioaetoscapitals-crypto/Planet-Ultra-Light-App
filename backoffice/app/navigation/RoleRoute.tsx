import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { canAccess, type ModulePermissionKey } from "../../utils/roles";
import { ROUTES } from "../../utils/constants";

type Props = {
  moduleKey: ModulePermissionKey;
  children: React.ReactNode;
};

export default function RoleRoute({ moduleKey, children }: Props) {
  const { user } = useAuth();
  const role = user?.role ?? "Admin";

  if (!canAccess(role, moduleKey)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
}
