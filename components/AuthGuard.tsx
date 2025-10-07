import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for navigation to be ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      if (!isAuthenticated) {
        router.replace("/screens/login");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, isReady]);

  return <>{children}</>;
};

export default AuthGuard;
