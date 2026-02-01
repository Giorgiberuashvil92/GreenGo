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
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        
        // Fetch fresh user data from /auth/me endpoint
        try {
          const meResponse = await apiService.getMe();
          console.log('🔍 loadStoredAuth - /auth/me response:', JSON.stringify(meResponse, null, 2));
          if (meResponse.success && meResponse.data) {
            // Backend returns {success: true, data: {...}}
            // API service wraps it: {success: true, data: {success: true, data: {...}}}
            // So we need to check if meResponse.data has nested structure
            const userData = (meResponse.data as any).data || meResponse.data;
            const fullUserData = userData as User;
            console.log('✅ Setting user data:', JSON.stringify(fullUserData, null, 2));
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(fullUserData));
            setUser(fullUserData);
          } else {
            // If API call fails (401, 403, etc.), token is invalid - clear auth
            const errorCode = meResponse.error?.code;
            const errorStatus = meResponse.error?.status;
            const errorDetails = meResponse.error?.details || '';
            
            if (errorCode === 'AUTH_ERROR' || 
                (errorCode === 'API_ERROR' && 
                 (errorStatus === 401 || errorStatus === 403 ||
                  errorDetails.includes('401') || 
                  errorDetails.includes('403') ||
                  errorDetails.includes('Unauthorized')))) {
              console.warn('⚠️ Token validation failed (401/403), clearing auth');
              await Promise.all([
                AsyncStorage.removeItem(TOKEN_KEY),
                AsyncStorage.removeItem(USER_KEY),
                AsyncStorage.removeItem(PHONE_KEY),
              ]);
              setToken(null);
              setUser(null);
              setIsAuthenticated(false);
            } else {
              // For other errors, fallback to stored user data
              console.warn('⚠️ API call failed but not auth error, using stored user data');
              const storedUser = await AsyncStorage.getItem(USER_KEY);
              if (storedUser) {
                setUser(JSON.parse(storedUser));
              }
            }
          }
        } catch (meError: any) {
          console.error("Error fetching user data on app load:", meError);
          // If error is 401/403, token is invalid - clear auth
          const errorCode = meError?.error?.code;
          const errorStatus = meError?.error?.status;
          const errorDetails = meError?.error?.details || '';
          
          if (errorCode === 'AUTH_ERROR' || 
              (errorCode === 'API_ERROR' && 
               (errorStatus === 401 || errorStatus === 403 ||
                errorDetails.includes('401') || 
                errorDetails.includes('403') ||
                errorDetails.includes('Unauthorized')))) {
            console.warn('⚠️ Token expired or invalid, clearing auth');
            await Promise.all([
              AsyncStorage.removeItem(TOKEN_KEY),
              AsyncStorage.removeItem(USER_KEY),
              AsyncStorage.removeItem(PHONE_KEY),
            ]);
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          } else {
            // For other errors, fallback to stored user data
            const storedUser = await AsyncStorage.getItem(USER_KEY);
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
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
      console.log('🔄 refreshUser - API response:', JSON.stringify(response, null, 2));
      if (response.success && response.data) {
        // Backend returns {success: true, data: {...}}
        // API service wraps it: {success: true, data: {success: true, data: {...}}}
        // So we need to check if response.data has nested structure
        const userData = (response.data as any).data || response.data;
        const finalUserData = userData as User;
        console.log('✅ refreshUser - Setting user:', JSON.stringify(finalUserData, null, 2));
        setUser(finalUserData);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUserData));
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
