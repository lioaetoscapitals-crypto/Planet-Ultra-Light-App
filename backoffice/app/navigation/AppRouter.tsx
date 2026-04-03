import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layout/AdminLayout";
import LoginScreen from "../../modules/auth/screens/LoginScreen";
import DashboardScreen from "../../modules/dashboard/screens/DashboardScreen";
import GateListScreen from "../../modules/gate/screens/GateListScreen";
import GateDetailScreen from "../../modules/gate/screens/GateDetailScreen";
import GateFormScreen from "../../modules/gate/screens/GateFormScreen";
import InvitationsListScreen from "../../modules/invitations/screens/InvitationsListScreen";
import InvitationsDetailScreen from "../../modules/invitations/screens/InvitationsDetailScreen";
import InvitationsFormScreen from "../../modules/invitations/screens/InvitationsFormScreen";
import BookingsListScreen from "../../modules/bookings/screens/BookingsListScreen";
import BookingsDetailScreen from "../../modules/bookings/screens/BookingsDetailScreen";
import BookingsFormScreen from "../../modules/bookings/screens/BookingsFormScreen";
import NoticesListScreen from "../../modules/notices/screens/NoticesListScreen";
import NoticesDetailScreen from "../../modules/notices/screens/NoticesDetailScreen";
import NoticesFormScreen from "../../modules/notices/screens/NoticesFormScreen";
import MarketListScreen from "../../modules/market/screens/MarketListScreen";
import MarketDetailScreen from "../../modules/market/screens/MarketDetailScreen";
import MarketFormScreen from "../../modules/market/screens/MarketFormScreen";
import UsersListScreen from "../../modules/users/screens/UsersListScreen";
import UsersDetailScreen from "../../modules/users/screens/UsersDetailScreen";
import UsersFormScreen from "../../modules/users/screens/UsersFormScreen";
import ApartmentsListScreen from "../../modules/apartments/screens/ApartmentsListScreen";
import ApartmentsDetailScreen from "../../modules/apartments/screens/ApartmentsDetailScreen";
import ApartmentsFormScreen from "../../modules/apartments/screens/ApartmentsFormScreen";
import SocietiesListScreen from "../../modules/societies/screens/SocietiesListScreen";
import SocietiesDetailScreen from "../../modules/societies/screens/SocietiesDetailScreen";
import SocietiesFormScreen from "../../modules/societies/screens/SocietiesFormScreen";
import RoleRoute from "./RoleRoute";
import SectionPlaceholderScreen from "../../modules/shared/screens/SectionPlaceholderScreen";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginScreen />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path={ROUTES.dashboard} element={<DashboardScreen />} />

          <Route path={ROUTES.approvalsSignup} element={<RoleRoute moduleKey="users"><UsersListScreen /></RoleRoute>} />
          <Route path={ROUTES.approvalsLease} element={<RoleRoute moduleKey="users"><SectionPlaceholderScreen title="Lease Approvals" /></RoleRoute>} />
          <Route path={ROUTES.approvalsActivities} element={<RoleRoute moduleKey="bookings"><BookingsListScreen /></RoleRoute>} />
          <Route path={ROUTES.approvalsTools} element={<RoleRoute moduleKey="users"><SectionPlaceholderScreen title="Tools Approvals" /></RoleRoute>} />
          <Route path={ROUTES.approvalsMarketPromos} element={<RoleRoute moduleKey="market"><MarketListScreen /></RoleRoute>} />
          <Route path={ROUTES.approvalsMarketPosts} element={<RoleRoute moduleKey="market"><NoticesListScreen /></RoleRoute>} />

          <Route path={ROUTES.operationsTowers} element={<RoleRoute moduleKey="apartments"><ApartmentsListScreen /></RoleRoute>} />
          <Route path={ROUTES.operationsApartments} element={<RoleRoute moduleKey="apartments"><ApartmentsListScreen /></RoleRoute>} />
          <Route path={ROUTES.operationsUsers} element={<RoleRoute moduleKey="users"><UsersListScreen /></RoleRoute>} />
          <Route path={ROUTES.operationsLocks} element={<RoleRoute moduleKey="gate"><GateListScreen /></RoleRoute>} />
          <Route path={ROUTES.operationsKeyfobs} element={<RoleRoute moduleKey="gate"><SectionPlaceholderScreen title="Keyfobs" /></RoleRoute>} />
          <Route path={ROUTES.operationsSecurity} element={<RoleRoute moduleKey="gate"><GateListScreen /></RoleRoute>} />

          <Route path={ROUTES.societyUsefulInformation} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Useful Information" /></RoleRoute>} />
          <Route path={ROUTES.societySmartSolutions} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Smart Solutions" /></RoleRoute>} />
          <Route path={ROUTES.societyAmenities} element={<RoleRoute moduleKey="bookings"><BookingsListScreen /></RoleRoute>} />
          <Route path={ROUTES.societyTools} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Society Tools" /></RoleRoute>} />
          <Route path={ROUTES.societySettings} element={<RoleRoute moduleKey="societies"><SocietiesListScreen /></RoleRoute>} />
          <Route path={ROUTES.societyLiveCamera} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Live Camera" /></RoleRoute>} />

          <Route path={ROUTES.communicationNotices} element={<RoleRoute moduleKey="notices"><NoticesListScreen /></RoleRoute>} />
          <Route path={ROUTES.communicationNews} element={<RoleRoute moduleKey="notices"><SectionPlaceholderScreen title="News" /></RoleRoute>} />
          <Route path={ROUTES.communicationNotifications} element={<RoleRoute moduleKey="notices"><SectionPlaceholderScreen title="Notifications" /></RoleRoute>} />
          <Route path={ROUTES.communicationDocStorage} element={<RoleRoute moduleKey="notices"><SectionPlaceholderScreen title="Doc Storage" /></RoleRoute>} />
          <Route path={ROUTES.communicationGroups} element={<RoleRoute moduleKey="notices"><SectionPlaceholderScreen title="Groups" /></RoleRoute>} />
          <Route path={ROUTES.communicationPollsAndSurvey} element={<RoleRoute moduleKey="notices"><SectionPlaceholderScreen title="Polls and Survey" /></RoleRoute>} />
          <Route path={ROUTES.communicationPlanetAds} element={<RoleRoute moduleKey="notices"><SectionPlaceholderScreen title="Planet Ads" /></RoleRoute>} />
          <Route path={ROUTES.communicationNewsFeeds} element={<RoleRoute moduleKey="notices"><SectionPlaceholderScreen title="News Feeds" /></RoleRoute>} />

          <Route path={ROUTES.paymentsInvoices} element={<RoleRoute moduleKey="bookings"><SectionPlaceholderScreen title="Invoices" /></RoleRoute>} />
          <Route path={ROUTES.paymentsReceipts} element={<RoleRoute moduleKey="bookings"><SectionPlaceholderScreen title="Receipts" /></RoleRoute>} />
          <Route path={ROUTES.paymentsReports} element={<RoleRoute moduleKey="bookings"><SectionPlaceholderScreen title="Reports" /></RoleRoute>} />

          <Route path={ROUTES.gateVisitorsLog} element={<RoleRoute moduleKey="gate"><GateListScreen /></RoleRoute>} />
          <Route path={ROUTES.gateGuards} element={<RoleRoute moduleKey="gate"><GateListScreen /></RoleRoute>} />
          <Route path={ROUTES.gateLinkedDevices} element={<RoleRoute moduleKey="gate"><SectionPlaceholderScreen title="Linked Devices" /></RoleRoute>} />
          <Route path={ROUTES.gateDailyHelp} element={<RoleRoute moduleKey="gate"><SectionPlaceholderScreen title="Daily Help" /></RoleRoute>} />

          <Route path={ROUTES.settingsCities} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Cities" /></RoleRoute>} />
          <Route path={ROUTES.settingsSocieties} element={<RoleRoute moduleKey="societies"><SocietiesListScreen /></RoleRoute>} />
          <Route path={ROUTES.settingsRoles} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Roles" /></RoleRoute>} />
          <Route path={ROUTES.settingsLogs} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Logs" /></RoleRoute>} />
          <Route path={ROUTES.settingsDeliveryItems} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Delivery Items" /></RoleRoute>} />
          <Route path={ROUTES.settingsCategories} element={<RoleRoute moduleKey="societies"><SectionPlaceholderScreen title="Categories" /></RoleRoute>} />

          <Route path={ROUTES.gate} element={<RoleRoute moduleKey="gate"><GateListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.gate}/new`} element={<RoleRoute moduleKey="gate"><GateFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.gate}/:id`} element={<RoleRoute moduleKey="gate"><GateDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.gate}/:id/edit`} element={<RoleRoute moduleKey="gate"><GateFormScreen /></RoleRoute>} />

          <Route path={ROUTES.invitations} element={<RoleRoute moduleKey="invitations"><InvitationsListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.invitations}/new`} element={<RoleRoute moduleKey="invitations"><InvitationsFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.invitations}/:id`} element={<RoleRoute moduleKey="invitations"><InvitationsDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.invitations}/:id/edit`} element={<RoleRoute moduleKey="invitations"><InvitationsFormScreen /></RoleRoute>} />

          <Route path={ROUTES.bookings} element={<RoleRoute moduleKey="bookings"><BookingsListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.bookings}/new`} element={<RoleRoute moduleKey="bookings"><BookingsFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.bookings}/:id`} element={<RoleRoute moduleKey="bookings"><BookingsDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.bookings}/:id/edit`} element={<RoleRoute moduleKey="bookings"><BookingsFormScreen /></RoleRoute>} />

          <Route path={ROUTES.notices} element={<RoleRoute moduleKey="notices"><NoticesListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.notices}/new`} element={<RoleRoute moduleKey="notices"><NoticesFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.notices}/:id`} element={<RoleRoute moduleKey="notices"><NoticesDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.notices}/:id/edit`} element={<RoleRoute moduleKey="notices"><NoticesFormScreen /></RoleRoute>} />

          <Route path={ROUTES.market} element={<RoleRoute moduleKey="market"><MarketListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.market}/new`} element={<RoleRoute moduleKey="market"><MarketFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.market}/:id`} element={<RoleRoute moduleKey="market"><MarketDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.market}/:id/edit`} element={<RoleRoute moduleKey="market"><MarketFormScreen /></RoleRoute>} />

          <Route path={ROUTES.users} element={<RoleRoute moduleKey="users"><UsersListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.users}/new`} element={<RoleRoute moduleKey="users"><UsersFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.users}/:id`} element={<RoleRoute moduleKey="users"><UsersDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.users}/:id/edit`} element={<RoleRoute moduleKey="users"><UsersFormScreen /></RoleRoute>} />

          <Route path={ROUTES.societies} element={<RoleRoute moduleKey="societies"><SocietiesListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.societies}/new`} element={<RoleRoute moduleKey="societies"><SocietiesFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.societies}/:id`} element={<RoleRoute moduleKey="societies"><SocietiesDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.societies}/:id/edit`} element={<RoleRoute moduleKey="societies"><SocietiesFormScreen /></RoleRoute>} />

          <Route path={ROUTES.apartments} element={<RoleRoute moduleKey="apartments"><ApartmentsListScreen /></RoleRoute>} />
          <Route path={`${ROUTES.apartments}/new`} element={<RoleRoute moduleKey="apartments"><ApartmentsFormScreen /></RoleRoute>} />
          <Route path={`${ROUTES.apartments}/:id`} element={<RoleRoute moduleKey="apartments"><ApartmentsDetailScreen /></RoleRoute>} />
          <Route path={`${ROUTES.apartments}/:id/edit`} element={<RoleRoute moduleKey="apartments"><ApartmentsFormScreen /></RoleRoute>} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
