import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSession } from "./SessionProvider";

interface AuthProps {
  element: React.ReactNode;
}

const AuthProvider = ({ element }: AuthProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#080808]" aria-label="Checking session" />;
  }

  return isAuthenticated ? element : null;
};

export default AuthProvider;
