import { router } from "expo-router";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/screens/login");
    } else {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default AuthGuard;
