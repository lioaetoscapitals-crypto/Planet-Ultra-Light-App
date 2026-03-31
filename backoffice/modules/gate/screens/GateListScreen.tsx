import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function GateListScreen() {
  return <ModuleListPage moduleKey="gate" baseRoute={ROUTES.gate} />;
}
