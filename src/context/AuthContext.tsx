import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseAuthUser // Alias to avoid conflict with our custom User type
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase'; // Ensure this path is correct for your firebase.ts
import { FirebaseContext } from '../components/CashflowManagement';
import { useToast } from './ToastContext';

// Declare global variables for TypeScript (provided by Canvas environment)
declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- User Data Model ---
interface User {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'staff';
  loyaltyPoints: number;
  purchaseHistory: string[]; // Array of event IDs
  subscriptionStatus: 'active' | 'inactive';
  createdAt: any; // Firestore Timestamp
}

// --- Auth Context Interface ---
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Auth Provider Component ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial auth check
  const { firestoreDb, isAuthReady, userId: firebaseUserId } = useContext(FirebaseContext);
  const { showToast } = useToast();

  // Listen for Firebase Auth state changes
  useEffect(() => {
    // Initialize with demo users for development
    setIsLoading(false);
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Demo login logic
      let demoUser: User;
      if (email === 'admin@ignition.com') {
        demoUser = {
          uid: 'admin-123',
          name: 'Admin User',
          email: 'admin@ignition.com',
          role: 'admin',
          loyaltyPoints: 1000,
          purchaseHistory: ['1', '2'],
          subscriptionStatus: 'active',
          createdAt: new Date(),
        };
      } else if (email === 'staff@ignition.com') {
        demoUser = {
          uid: 'staff-123',
          name: 'Staff User',
          email: 'staff@ignition.com',
          role: 'staff',
          loyaltyPoints: 500,
          purchaseHistory: ['1'],
          subscriptionStatus: 'inactive',
          createdAt: new Date(),
        };
      } else {
        demoUser = {
          uid: 'user-123',
          name: 'Demo User',
          email: 'user@ignition.com',
          role: 'user',
          loyaltyPoints: 250,
          purchaseHistory: [],
          subscriptionStatus: 'inactive',
          createdAt: new Date(),
        };
      }
      setUser(demoUser);
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      showToast("Login failed. Please check your credentials.", 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Register function
  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Demo registration logic
      const newUser: User = {
        uid: 'new-user-' + Date.now(),
        name,
        email,
        role: 'user',
        loyaltyPoints: 0,
        purchaseHistory: [],
        subscriptionStatus: 'inactive',
        createdAt: new Date(),
      };
      setUser(newUser);
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(null); // Clear user state immediately
      showToast("Logged out successfully!", "info");
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Failed to log out.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Update user profile function
  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) {
      showToast("User not logged in.", "error");
      return false;
    }
    try {
      setUser(prev => prev ? { ...prev, ...data } : null);
      showToast("Profile updated successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      showToast("Failed to update profile.", "error");
      return false;
    }
  }, [user, showToast]);

  const contextValue = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};