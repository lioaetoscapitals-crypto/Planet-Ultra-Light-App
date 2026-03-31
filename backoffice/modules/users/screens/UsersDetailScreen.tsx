import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function UsersDetailScreen() {
  return <ModuleDetailPage moduleKey="users" baseRoute={ROUTES.users} />;
}
