import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import apiService from "../utils/api";

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  balance?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    phoneNumber: string,
    verificationCode: string,
  ) => Promise<{ isNewUser: boolean }>;
  sendVerificationCode: (
    phoneNumber: string,
    countryCode?: string,
  ) => Promise<void>;
  completeRegistration: (
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@greengo:auth_token";
const USER_KEY = "@greengo:user";
const PHONE_KEY = "@greengo:phone_number";

function extractUserData(data: unknown): User | null {
  if (!data) return null;
  const maybeNested = data as { data?: unknown };
  return ((maybeNested.data || data) as User) || null;
}

function isAuthFailure(error: unknown): boolean {
  const err = error as {
    code?: string;
    status?: number;
    details?: string;
    error?: {
      code?: string;
      status?: number;
      details?: string;
    };
  };
  const code = err?.error?.code || err?.code;
  const status = err?.error?.status || err?.status;
  const details = err?.error?.details || err?.details || "";

  return (
    code === "AUTH_ERROR" ||
    status === 401 ||
    status === 403 ||
    details.includes("401") ||
    details.includes("403") ||
    details.includes("Unauthorized")
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearStoredAuth = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
      AsyncStorage.removeItem(PHONE_KEY),
    ]);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Refresh user data, but keep the saved login unless the token is truly invalid.
        try {
          const meResponse = await apiService.getMe();
          if (meResponse.success && meResponse.data) {
            const fullUserData = extractUserData(meResponse.data);
            if (fullUserData) {
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(fullUserData));
              setUser(fullUserData);
            }
          } else {
            if (isAuthFailure(meResponse.error)) {
              await clearStoredAuth();
            }
          }
        } catch (meError: any) {
          console.error("Error fetching user data on app load:", meError);
          if (isAuthFailure(meError)) {
            await clearStoredAuth();
          }
        }
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (
    phoneNumber: string,
    countryCode: string = "+995",
  ): Promise<void> => {
    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      const response = await apiService.sendVerificationCode(
        fullPhoneNumber,
        countryCode,
      );

      if (response.success) {
        await AsyncStorage.setItem(PHONE_KEY, fullPhoneNumber);
        return;
      }
      throw new Error(response.error?.details || "Failed to send code");
    } catch (error: any) {
      console.error("Send verification code error:", error);
      throw error;
    }
  };

  const login = async (
    phoneNumber: string,
    verificationCode: string,
  ): Promise<{ isNewUser: boolean }> => {
    try {
      // Get stored phone number or use provided
      const storedPhone = await AsyncStorage.getItem(PHONE_KEY);
      const fullPhoneNumber = storedPhone || `+995${phoneNumber}`;

      const response = await apiService.verifyCode(
        fullPhoneNumber,
        verificationCode,
      );

      if (response.success && response.access_token) {
        const { access_token, isNewUser = false } = response;

        // Store token first
        await AsyncStorage.setItem(TOKEN_KEY, access_token);
        setToken(access_token);
        setIsAuthenticated(true);

        // Fetch full user profile from /auth/me endpoint
        try {
          const meResponse = await apiService.getMe();
          if (meResponse.success && meResponse.data) {
            // Backend returns {success: true, data: {...}}
            // API service wraps it: {success: true, data: {success: true, data: {...}}}
            // So we need to check if meResponse.data has nested structure
            const userData = (meResponse.data as any).data || meResponse.data;
            const fullUserData = userData as User;
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(fullUserData));
            setUser(fullUserData);
          } else {
            // Fallback to user data from login response if available
            if (response.user) {
              const userData = response.user as User;
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
              setUser(userData);
            }
          }
        } catch (meError: any) {
          console.error("Error fetching user data:", meError);
          // Fallback to user data from login response
          if (response.user) {
            const userData = response.user as User;
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
          }
        }

        return { isNewUser };
      } else {
        throw new Error(response.error?.details || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const completeRegistration = async (
    firstName: string,
    lastName: string,
  ) => {
    try {
      const response = await apiService.completeRegistration(
        firstName,
        lastName,
      );

      if (response.success && response.data) {
        // Update user data
        setUser(response.data as User);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
      } else {
        throw new Error(response.error?.details || "Registration failed");
      }
    } catch (error: any) {
      console.error("Complete registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearStoredAuth();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiService.getProfile();
      console.log(
        "🔄 refreshUser - API response:",
        JSON.stringify(response, null, 2),
      );
      if (response.success && response.data) {
        const userData = (response.data as any).data || response.data;
        const finalUserData = userData as User;
        console.log(
          "✅ refreshUser - Setting user:",
          JSON.stringify(finalUserData, null, 2),
        );
        setUser((prev) => {
          if (
            prev &&
            JSON.stringify(prev) === JSON.stringify(finalUserData)
          ) {
            return prev;
          }
          return finalUserData;
        });
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUserData));
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  }, []);

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    sendVerificationCode,
    completeRegistration,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
