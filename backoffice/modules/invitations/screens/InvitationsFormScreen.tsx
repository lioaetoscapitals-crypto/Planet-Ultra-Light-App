import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function InvitationsFormScreen() {
  return <ModuleFormPage moduleKey="invitations" baseRoute={ROUTES.invitations} />;
}
