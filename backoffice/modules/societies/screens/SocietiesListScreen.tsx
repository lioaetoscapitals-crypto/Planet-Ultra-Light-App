import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function SocietiesListScreen() {
  return <ModuleListPage moduleKey="societies" baseRoute={ROUTES.societies} />;
}
