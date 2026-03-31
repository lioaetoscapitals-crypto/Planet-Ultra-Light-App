import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function MarketDetailScreen() {
  return <ModuleDetailPage moduleKey="market" baseRoute={ROUTES.market} />;
}
