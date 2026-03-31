import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function GateFormScreen() {
  return <ModuleFormPage moduleKey="gate" baseRoute={ROUTES.gate} />;
}
