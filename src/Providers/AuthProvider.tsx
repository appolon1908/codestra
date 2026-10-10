import { Navigate, useLocation } from "react-router";
import { useSession } from "./SessionProvider";

interface AuthProps {
  element: React.ReactNode;
}

const AuthProvider = ({ element }: AuthProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <div className="hz-auth-page" aria-label="Checking session" />;
  }

  if (!isAuthenticated) {
    const requested = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(requested)}`} replace />;
  }

  return element;
};

export default AuthProvider;
