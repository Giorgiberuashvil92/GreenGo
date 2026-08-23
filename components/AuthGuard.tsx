import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const isPublicAuthRoute =
    pathname === "/screens/login" || pathname === "/screens/verification";

  useEffect(() => {
    // Wait for navigation to be ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && !loading) {
      if (!isAuthenticated && !isPublicAuthRoute) {
        router.replace("/screens/login");
      } else if (isAuthenticated && isPublicAuthRoute) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isPublicAuthRoute, isReady, loading]);

  // Show loading state while checking auth
  if (loading || !isReady) {
    return null; // Or show loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
