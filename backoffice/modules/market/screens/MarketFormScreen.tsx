import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function MarketFormScreen() {
  return <ModuleFormPage moduleKey="market" baseRoute={ROUTES.market} />;
}
