import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRyY0zwzL9efyCrR1n_UZndA1qEggI4qc",
  authDomain: "ignition-ent.firebaseapp.com",
  projectId: "ignition-ent",
  storageBucket: "ignition-ent.firebasestorage.app",
  messagingSenderId: "760493398278",
  appId: "1:760493398278:web:1c3f2db3ca53ee44b7a687",
  measurementId: "G-J3B2XT89HP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Firebase Context
interface FirebaseContextType {
  firestoreDb: Firestore | null;
  auth: Auth | null;
  isAuthReady: boolean;
  userId: string | null;
}

export const FirebaseContext = createContext<FirebaseContextType>({
  firestoreDb: null,
  auth: null,
  isAuthReady: false,
  userId: null,
});

// Transaction interface
interface Transaction {
  id?: string;
  type: 'revenue' | 'expense';
  amount: number;
  description: string;
  event_id?: string;
  payment_method?: string;
  customer_id?: string;
  category: string;
  flow_type: 'operating' | 'investing' | 'financing';
  status: 'pending' | 'completed' | 'failed';
  timestamp?: any;
}

// Accounting Context
interface AccountingContextType {
  addTransaction: (transaction: Transaction) => Promise<void>;
  transactions: Transaction[];
  isLoading: boolean;
}

export const AccountingContext = createContext<AccountingContextType | null>(null);

interface CashflowManagementProps {
  children: ReactNode;
  userRole: 'admin' | 'staff' | 'user';
}

export const CashflowManagement: React.FC<CashflowManagementProps> = ({ children, userRole }) => {
  const [firestoreDb, setFirestoreDb] = useState<Firestore | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Firebase services
    setFirestoreDb(db);
    setIsAuthReady(true);
    setUserId('demo-user-id');
  }, []);

  const addTransaction = async (transaction: Transaction): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate adding transaction
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const firebaseContextValue: FirebaseContextType = {
    firestoreDb,
    auth,
    isAuthReady,
    userId,
  };

  const accountingContextValue: AccountingContextType = {
    addTransaction,
    transactions,
    isLoading,
  };

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      <AccountingContext.Provider value={accountingContextValue}>
        {children}
      </AccountingContext.Provider>
    </FirebaseContext.Provider>
  );
};

export default CashflowManagement;