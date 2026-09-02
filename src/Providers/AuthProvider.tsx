import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import {
  hasUsableAccessToken,
  subscribeToAuthChanges,
} from "@/lib/auth";

interface AuthProps {
  element: React.ReactNode;
}

const AuthProvider = ({ element }: AuthProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(hasUsableAccessToken());

  useEffect(() => subscribeToAuthChanges(() => {
    setIsAuthenticated(hasUsableAccessToken());
  }), []);

  useEffect(() => {
    setIsAuthenticated(hasUsableAccessToken());
  }, [location.pathname, location.search]);

  if (!isAuthenticated) {
    const requested = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(requested)}`} replace />;
  }

  return element;
};

export default AuthProvider;
