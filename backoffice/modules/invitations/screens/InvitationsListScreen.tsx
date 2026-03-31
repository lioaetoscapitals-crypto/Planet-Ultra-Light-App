import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function InvitationsListScreen() {
  return <ModuleListPage moduleKey="invitations" baseRoute={ROUTES.invitations} />;
}
