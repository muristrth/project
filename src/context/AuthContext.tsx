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
import { ToastContext } from './ToastContext';

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
  const toastContext = useContext(ToastContext);
  const showToast = toastContext?.showToast ?? (() => {});

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firestoreDb && isAuthReady) {
        const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
        // Listen to real-time updates for the user's profile
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ uid: firebaseUser.uid, ...docSnap.data() } as User);
          } else {
            // If user profile doesn't exist (e.g., new registration), create a basic one
            const newUserProfile: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || '',
              role: 'user', // Default role
              loyaltyPoints: 0,
              purchaseHistory: [],
              subscriptionStatus: 'inactive',
              createdAt: serverTimestamp(),
            };
            setDoc(userDocRef, newUserProfile, { merge: true })
              .then(() => setUser(newUserProfile))
              .catch(e => console.error("Error creating user profile:", e));
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          showToast("Error loading user data.", "error");
          setIsLoading(false);
        });
        return () => unsubscribeFirestore(); // Clean up Firestore listener
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Clean up Auth listener
  }, [firestoreDb, isAuthReady, showToast]); // Depend on firestoreDb and isAuthReady

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged listener
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      }
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Register function
  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      if (firestoreDb) {
        // Create user profile in Firestore
        const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${newUser.uid}/profile/data`);
        await setDoc(userDocRef, {
          name,
          email,
          role: 'user', // Default role for new registrations
          loyaltyPoints: 0,
          purchaseHistory: [],
          subscriptionStatus: 'inactive',
          createdAt: serverTimestamp(),
        });
      }
      // User state will be updated by onAuthStateChanged listener
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
  }, [firestoreDb, showToast]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
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
    if (!user || !firestoreDb) {
      showToast("User not logged in or Firestore not ready.", "error");
      return false;
    }
    try {
      const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${user.uid}/profile/data`);
      await updateDoc(userDocRef, data);
      showToast("Profile updated successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      showToast("Failed to update profile.", "error");
      return false;
    }
  }, [user, firestoreDb, showToast]);

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