import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function ApartmentsFormScreen() {
  return <ModuleFormPage moduleKey="apartments" baseRoute={ROUTES.apartments} />;
}
