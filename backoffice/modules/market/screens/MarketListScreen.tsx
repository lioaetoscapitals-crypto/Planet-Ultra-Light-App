import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function MarketListScreen() {
  return <ModuleListPage moduleKey="market" baseRoute={ROUTES.market} />;
}
