import ModuleFormPage from "../../shared/ModuleFormPage";
import { ROUTES } from "../../../utils/constants";

export default function BookingsFormScreen() {
  return <ModuleFormPage moduleKey="bookings" baseRoute={ROUTES.bookings} />;
}
