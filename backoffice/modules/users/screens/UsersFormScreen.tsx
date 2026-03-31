import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function UsersFormScreen() {
  return <ModuleFormPage moduleKey="users" baseRoute={ROUTES.users} />;
}
