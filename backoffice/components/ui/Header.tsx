import useAuth from "../../hooks/useAuth";
import Button from "./Button";

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bo-header">
      <div>
        <h2 className="bo-header-title">{title}</h2>
        <p className="bo-header-subtitle">Manage residents, operations and platform settings.</p>
      </div>
      <div className="bo-header-actions">
        <div className="bo-header-user">
          <span className="bo-header-user-name">{user?.name ?? "Admin"}</span>
          <span className="bo-header-user-role">{user?.role ?? "Super Admin"}</span>
        </div>
        <Button variant="secondary" onClick={() => void logout()} disabled={isLoading}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
