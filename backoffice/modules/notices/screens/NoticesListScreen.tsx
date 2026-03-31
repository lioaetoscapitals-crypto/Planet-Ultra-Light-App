import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function NoticesListScreen() {
  return <ModuleListPage moduleKey="notices" baseRoute={ROUTES.notices} />;
}
