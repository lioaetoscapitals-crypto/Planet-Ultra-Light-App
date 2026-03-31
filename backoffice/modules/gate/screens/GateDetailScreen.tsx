import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function GateDetailScreen() {
  return <ModuleDetailPage moduleKey="gate" baseRoute={ROUTES.gate} />;
}
