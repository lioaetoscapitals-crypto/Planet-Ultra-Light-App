import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function InvitationsDetailScreen() {
  return <ModuleDetailPage moduleKey="invitations" baseRoute={ROUTES.invitations} />;
}
