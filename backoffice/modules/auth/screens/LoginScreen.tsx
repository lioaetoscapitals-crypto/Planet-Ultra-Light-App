import { Navigate } from "react-router-dom";
import LoginForm from "../../../components/forms/LoginForm";
import useAuth from "../../../hooks/useAuth";
import { ROUTES } from "../../../utils/constants";

export default function LoginScreen() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <div className="bo-login-page">
      <div className="bo-login-card">
        <h1 className="bo-login-title">Planet Backoffice</h1>
        <p className="bo-login-subtitle">Central admin workspace for residents, gate, notices and payments.</p>
        <LoginForm />
      </div>
    </div>
  );
}
