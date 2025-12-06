import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import apiService from "../utils/api";

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phoneNumber: string, verificationCode: string) => Promise<{ isNewUser: boolean }>;
  sendVerificationCode: (phoneNumber: string, countryCode?: string) => Promise<string>;
  completeRegistration: (firstName: string, lastName: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@greengo:auth_token";
const USER_KEY = "@greengo:user";
const PHONE_KEY = "@greengo:phone_number";

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

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (
    phoneNumber: string,
    countryCode: string = "+995"
  ): Promise<string> => {
    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      const response = await apiService.sendVerificationCode(
        fullPhoneNumber,
        countryCode
      );

      if (response.success) {
        // Store phone number for verification
        await AsyncStorage.setItem(PHONE_KEY, fullPhoneNumber);
        
        // In development, return the code from response (remove in production!)
        // For now, backend returns code in response for testing
        return response.code || "1234"; // Temporary for testing
      }
      throw new Error(response.error?.details || "Failed to send code");
    } catch (error: any) {
      console.error("Send verification code error:", error);
      throw error;
    }
  };

  const login = async (phoneNumber: string, verificationCode: string): Promise<{ isNewUser: boolean }> => {
    try {
      // Get stored phone number or use provided
      const storedPhone = await AsyncStorage.getItem(PHONE_KEY);
      const fullPhoneNumber = storedPhone || `+995${phoneNumber}`;
      
      const response = await apiService.verifyCode(
        fullPhoneNumber,
        verificationCode
      );

      if (response.success && response.access_token && response.user) {
        const { access_token, user: userData, isNewUser = false } = response;

        // Store token and user
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, access_token),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
        ]);

        setToken(access_token);
        setUser(userData);
        setIsAuthenticated(true);

        return { isNewUser };
      } else {
        throw new Error(response.error?.details || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const completeRegistration = async (firstName: string, lastName: string, email: string) => {
    try {
      const response = await apiService.completeRegistration(firstName, lastName, email);

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
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem(PHONE_KEY),
      ]);

      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setUser(response.data as User);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

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
