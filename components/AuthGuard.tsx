import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for navigation to be ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && !loading) {
      if (!isAuthenticated) {
        router.replace("/screens/login");
      }
    }
  }, [isAuthenticated, isReady, loading]);

  // Show loading state while checking auth
  if (loading || !isReady) {
    return null; // Or show loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
