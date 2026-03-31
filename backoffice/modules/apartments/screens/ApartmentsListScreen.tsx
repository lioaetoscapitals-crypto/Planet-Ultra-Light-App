import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function ApartmentsListScreen() {
  return <ModuleListPage moduleKey="apartments" baseRoute={ROUTES.apartments} />;
}
