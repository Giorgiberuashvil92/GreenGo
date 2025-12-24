import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import apiService from "../utils/api";
import { USE_MOCK_DATA, mockUser } from "../utils/mockData";

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
  // Mock data helpers
  isMockMode: () => boolean;
  loginWithMockUser: () => Promise<void>;
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
      } else if (USE_MOCK_DATA) {
        // Auto-login with mock user in mock mode
        console.log('🔶 Mock mode: Auto-authenticating with mock user');
        await loginWithMockUser();
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      // In mock mode, still authenticate
      if (USE_MOCK_DATA) {
        await loginWithMockUser();
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithMockUser = async () => {
    const mockToken = "mock-jwt-token-" + Date.now();
    const mockUserData: User = {
      id: mockUser._id,
      phoneNumber: mockUser.phoneNumber,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      name: mockUser.name,
      email: mockUser.email,
    };

    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, mockToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUserData)),
    ]);

    setToken(mockToken);
    setUser(mockUserData);
    setIsAuthenticated(true);
    console.log('✅ Logged in with mock user:', mockUserData.name);
  };

  const isMockMode = () => {
    return USE_MOCK_DATA || apiService.isUsingMockData();
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
        await AsyncStorage.setItem(PHONE_KEY, fullPhoneNumber);
        
        // Return mock code in mock mode for easy testing
        if (USE_MOCK_DATA || apiService.isUsingMockData()) {
          console.log('🔶 Mock mode: Verification code is 1234');
          return "1234";
        }
        
        return response.code || "1234"; // Temporary for testing
      }
      throw new Error(response.error?.details || "Failed to send code");
    } catch (error: any) {
      console.error("Send verification code error:", error);
      
      // In mock mode, still return a code
      if (USE_MOCK_DATA || apiService.isUsingMockData()) {
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;
        await AsyncStorage.setItem(PHONE_KEY, fullPhoneNumber);
        console.log('🔶 Mock mode fallback: Verification code is 1234');
        return "1234";
      }
      
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
      
      // In mock mode, authenticate anyway
      if (USE_MOCK_DATA || apiService.isUsingMockData()) {
        console.log('🔶 Mock mode fallback: Logging in with mock user');
        await loginWithMockUser();
        return { isNewUser: false };
      }
      
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
      
      // In mock mode, update user locally
      if (USE_MOCK_DATA || apiService.isUsingMockData()) {
        const updatedUser: User = {
          id: mockUser._id,
          phoneNumber: user?.phoneNumber || mockUser.phoneNumber,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        console.log('🔶 Mock mode: Registration completed locally');
        return;
      }
      
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
      
      // In mock mode, use mock user
      if (USE_MOCK_DATA || apiService.isUsingMockData()) {
        const mockUserData: User = {
          id: mockUser._id,
          phoneNumber: mockUser.phoneNumber,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          name: mockUser.name,
          email: mockUser.email,
        };
        setUser(mockUserData);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUserData));
      }
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
    isMockMode,
    loginWithMockUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
