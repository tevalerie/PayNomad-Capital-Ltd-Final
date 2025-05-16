/**
 * Utility functions for authentication
 */
import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
} from "./localStorageUtils";

// Constants for localStorage keys
const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

// User interface
export interface User {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
  status?: string;
}

/**
 * Save authentication token to localStorage
 * @param token The authentication token
 */
export const saveAuthToken = (token: string): void => {
  saveToLocalStorage(AUTH_TOKEN_KEY, token);
};

/**
 * Get authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
  return getFromLocalStorage<string | null>(AUTH_TOKEN_KEY, null);
};

/**
 * Save user data to localStorage
 * @param userData The user data to save
 */
export const saveUserData = (userData: User): void => {
  saveToLocalStorage(USER_DATA_KEY, userData);
};

/**
 * Get user data from localStorage
 * @returns The user data or null if not found
 */
export const getUserData = (): User | null => {
  return getFromLocalStorage<User | null>(USER_DATA_KEY, null);
};

/**
 * Check if user is authenticated
 * @returns True if user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Log out user by removing auth data from localStorage
 */
export const logout = (): void => {
  removeFromLocalStorage(AUTH_TOKEN_KEY);
  removeFromLocalStorage(USER_DATA_KEY);
};
