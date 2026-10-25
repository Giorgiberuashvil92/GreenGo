import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const GUEST_BROWSE_KEY = "@greengo:guest_browse";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading, guestBrowse } = useAuth();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const isPublicAuthRoute =
    pathname === "/screens/login" ||
    pathname === "/screens/verification" ||
    pathname === "/screens/registration";

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || loading) return;

    // Logged-in users should not stay on auth screens.
    if (isAuthenticated && isPublicAuthRoute) {
      router.replace("/(tabs)");
      return;
    }

    // Guests may browse after "გამოტოვება"; otherwise land on login.
    if (!isAuthenticated && !isPublicAuthRoute && !guestBrowse) {
      router.replace("/screens/login");
    }
  }, [guestBrowse, isAuthenticated, isPublicAuthRoute, isReady, loading]);

  if (loading || !isReady) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
