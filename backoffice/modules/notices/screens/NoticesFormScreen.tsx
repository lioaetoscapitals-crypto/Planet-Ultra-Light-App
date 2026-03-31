import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function NoticesFormScreen() {
  return <ModuleFormPage moduleKey="notices" baseRoute={ROUTES.notices} />;
}
