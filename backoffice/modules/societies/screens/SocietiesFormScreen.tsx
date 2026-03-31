import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function SocietiesFormScreen() {
  return <ModuleFormPage moduleKey="societies" baseRoute={ROUTES.societies} />;
}
