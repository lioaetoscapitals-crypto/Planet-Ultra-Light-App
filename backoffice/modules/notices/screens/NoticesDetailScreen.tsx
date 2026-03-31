import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function NoticesDetailScreen() {
  return <ModuleDetailPage moduleKey="notices" baseRoute={ROUTES.notices} />;
}
