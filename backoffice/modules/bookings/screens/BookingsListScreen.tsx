import ModuleListPage from "../../shared/ModuleListPage";
import { ROUTES } from "../../../utils/constants";

export default function BookingsListScreen() {
  return <ModuleListPage moduleKey="bookings" baseRoute={ROUTES.bookings} />;
}
