import ModuleDetailPage from "../../shared/ModuleDetailPage";
import { ROUTES } from "../../../utils/constants";

export default function BookingsDetailScreen() {
  return <ModuleDetailPage moduleKey="bookings" baseRoute={ROUTES.bookings} />;
}
