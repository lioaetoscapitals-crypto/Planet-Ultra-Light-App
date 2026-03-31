import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function ApartmentsDetailScreen() {
  return <ModuleDetailPage moduleKey="apartments" baseRoute={ROUTES.apartments} />;
}
