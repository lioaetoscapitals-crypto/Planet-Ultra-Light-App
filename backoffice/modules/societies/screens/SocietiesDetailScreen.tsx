import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function SocietiesDetailScreen() {
  return <ModuleDetailPage moduleKey="societies" baseRoute={ROUTES.societies} />;
}
