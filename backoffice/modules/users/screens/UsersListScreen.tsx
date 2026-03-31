import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function UsersListScreen() {
  return <ModuleListPage moduleKey="users" baseRoute={ROUTES.users} />;
}
