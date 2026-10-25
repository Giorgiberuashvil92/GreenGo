import type { Router } from "expo-router";

/** Redirect guests to login. Returns true when the user may continue. */
export function requireAuth(
  isAuthenticated: boolean,
  router: Pick<Router, "push">,
): boolean {
  if (isAuthenticated) return true;
  router.push("/screens/login");
  return false;
}
