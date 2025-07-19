import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
// Import Firebase services from your utility file
import { db, auth } from '../lib/firebase'; // <--- UPDATED IMPORT PATH to use the firebase.ts file
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  // getFirestore, // No longer needed here, 'db' is imported directly
  doc,
  setDoc,
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  Transaction
} from 'firebase/firestore';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Download,
  RefreshCw,
  PlusCircle,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Users,
  Ticket
} from 'lucide-react';

// Declare global variables for TypeScript
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

interface IFirebaseContext {
  firestoreDb: typeof db | null;
  firebaseAuth: typeof auth | null;
  userId: string | null;
  isAuthReady: boolean;
}

// Export FirebaseContext so it can be used by other components
export const FirebaseContext = createContext<IFirebaseContext>({
  firestoreDb: null,
  firebaseAuth: null,
  userId: null,
  isAuthReady: false,
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firestoreDb, setFirestoreDb] = useState<typeof db | null>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<typeof auth | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        if (initialAuthToken) {
          // Sign in with custom token provided by the environment
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          // Fallback to anonymous sign-in if no custom token (e.g., local dev)
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase authentication failed:", error);
      }
    };

    // Listen for auth state changes to get the current user ID
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // If no user (shouldn't happen with signInAnonymously), generate a random ID
        setUserId(crypto.randomUUID());
      }
      setIsAuthReady(true);
      setFirestoreDb(db); // Use the imported 'db'
      setFirebaseAuth(auth); // Use the imported 'auth'
    });

    initializeFirebase();
    return () => unsubscribe(); // Cleanup auth listener on unmount
  }, []);

  return (
    <FirebaseContext.Provider value={{ firestoreDb, firebaseAuth, userId, isAuthReady }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// --- Toast Context for Messages ---
type ToastContextType = {
  showToast: (msg: React.SetStateAction<string>, msgType?: string) => () => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined); // Export ToastContext

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}; // Export useToast hook

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState('info'); // 'info', 'success', 'error'

  const showToast = useCallback((msg: React.SetStateAction<string>, msgType = 'info') => {
    setMessage(msg);
    setType(msgType);
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setMessage('');
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isVisible && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white
          ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
          transition-opacity duration-300 ease-in-out`}>
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// --- Accounting Context for Data and Logic ---
// Move AddTransactionData interface above IAccountingContext
interface AddTransactionData {
  type: 'revenue' | 'cost' | 'payout' | 'refund';
  amount: number | string;
  description: string;
  event_id?: string | null;
  payment_method: string;
  customer_id?: string | null;
  category: string;
  flow_type: 'operating' | 'investing' | 'financing';
  status?: string;
}

// Define Account interface above IAccountingContext
interface Account {
  id: string;
  name: string;
  type: string;
  category: string;
  balance: number;
}

// Define Customer interface above IAccountingContext
interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

// Define UserTransaction interface above IAccountingContext
interface UserTransaction {
  id: string;
  amount: number;
  description: string;
  date?: any; // Firestore Timestamp or Date
  type: string;
  category: string;
  event_id?: string;
  payment_method: string;
  customer_id?: string;
  flow_type: string;
  status?: string;
  // Add other fields as needed
}

// Define AppEvent interface above IAccountingContext
interface AppEvent {
  id: string;
  [key: string]: any;
}

interface IAccountingContext {
  transactions: UserTransaction[];
  accounts: Account[];
  events: AppEvent[];
  customers: Customer[];
  addTransaction: (transactionData: AddTransactionData) => Promise<void>;
  addEvent: (eventData: any) => Promise<void>;
  addCustomer: (customerData: any) => Promise<void>;
  updateAccountBalance: (accountId: string | undefined, amount: number) => Promise<void>;
  generateCashFlowStatement: (startDate: number, endDate: number) => any;
  generateIncomeStatement: (startDate: number, endDate: number) => any;
  generateBalanceSheet: (asOfDate: number) => any;
  generateSalesReports: (startDate: number, endDate: number) => any;
}
export const AccountingContext = createContext<IAccountingContext | undefined>(undefined); // Export AccountingContext

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firestoreDb, userId, isAuthReady } = useContext(FirebaseContext);
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Initial accounts setup - a basic Chart of Accounts
  const defaultAccounts = [
    { id: 'cash', name: 'Cash', type: 'asset', category: 'current_asset', balance: 0 },
    { id: 'bank', name: 'Bank Account', type: 'asset', category: 'current_asset', balance: 0 },
    { id: 'accounts_receivable', name: 'Accounts Receivable', type: 'asset', category: 'current_asset', balance: 0 },
    { id: 'ticket_sales_revenue', name: 'Ticket Sales Revenue', type: 'revenue', category: 'income', balance: 0 },
    { id: 'sponsorship_revenue', name: 'Sponsorship Revenue', type: 'revenue', category: 'income', balance: 0 },
    { id: 'venue_expenses', name: 'Venue Expenses', type: 'expense', category: 'operating_expense', balance: 0 },
    { id: 'artist_fees', name: 'Artist Fees', type: 'expense', category: 'operating_expense', balance: 0 },
    { id: 'marketing_expenses', name: 'Marketing Expenses', type: 'expense', category: 'operating_expense', balance: 0 },
    { id: 'other_operating_expenses', name: 'Other Operating Expenses', type: 'expense', category: 'operating_expense', balance: 0 },
    { id: 'accounts_payable', name: 'Accounts Payable', type: 'liability', category: 'current_liability', balance: 0 },
    { id: 'owner_equity', name: 'Owner\'s Equity', type: 'equity', category: 'equity', balance: 0 },
    { id: 'retained_earnings', name: 'Retained Earnings', type: 'equity', category: 'equity', balance: 0 },
  ];

  // --- Firestore Collection References ---
  // All collections are stored under a user-specific path for data isolation.
  const getCollectionRef = useCallback((collectionName: any) => {
    if (!firestoreDb || !userId) return null;
    return collection(firestoreDb, `artifacts/${appId}/users/${userId}/${collectionName}`);
  }, [firestoreDb, userId]);

  // --- Data Fetching with onSnapshot ---
  // Each useEffect hook sets up a real-time listener for a specific collection.
  // Data is fetched only when Firebase authentication is ready.
  useEffect(() => {
    if (!isAuthReady || !firestoreDb || !userId) {
      console.log("Firebase not ready for data fetching.");
      return;
    }

    // Fetch Accounts
    const accountsRef = getCollectionRef('accounts');
    if (accountsRef) {
      const unsubscribeAccounts = onSnapshot(accountsRef, (snapshot) => {
        const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
        if (fetchedAccounts.length === 0) {
          // If no accounts exist, initialize with default accounts
          defaultAccounts.forEach(async (account) => {
            await setDoc(doc(accountsRef, account.id), account);
          });
          setAccounts(defaultAccounts);
        } else {
          setAccounts(fetchedAccounts);
        }
      }, (error) => {
        console.error("Error fetching accounts:", error);
        showToast("Error fetching accounts.", "error");
      });
      return () => unsubscribeAccounts();
    }
  }, [isAuthReady, firestoreDb, userId, getCollectionRef, showToast]); // Added showToast to dependencies

  useEffect(() => {
    if (!isAuthReady || !firestoreDb || !userId) return;

    // Fetch Transactions
    const transactionsRef = getCollectionRef('transactions');
    if (transactionsRef) {
      const unsubscribeTransactions = onSnapshot(query(transactionsRef), (snapshot) => {
        const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserTransaction));
        setTransactions(fetchedTransactions.sort((a, b) => b.date?.toDate().getTime() - a.date?.toDate().getTime())); // Sort by date descending
      }, (error) => {
        console.error("Error fetching transactions:", error);
        showToast("Error fetching transactions.", "error");
      });
      return () => unsubscribeTransactions();
    }
  }, [isAuthReady, firestoreDb, userId, getCollectionRef, showToast]);

  useEffect(() => {
    if (!isAuthReady || !firestoreDb || !userId) return;

    const eventsRef = getCollectionRef('events');
    if (eventsRef) {
      const unsubscribeEvents = onSnapshot(query(eventsRef), (snapshot) => {
        const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppEvent));
        setEvents(fetchedEvents);
      }, (error) => {
        console.error("Error fetching events:", error);
        showToast("Error fetching events.", "error");
      });
      return () => unsubscribeEvents();
    }
  }, [isAuthReady, firestoreDb, userId, getCollectionRef, showToast]);

  useEffect(() => {
    if (!isAuthReady || !firestoreDb || !userId) return;

    // Fetch Customers
    const customersRef = getCollectionRef('customers');
    if (customersRef) {
      const unsubscribeCustomers = onSnapshot(query(customersRef), (snapshot) => {
        const fetchedCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomers(fetchedCustomers);
      }, (error) => {
        console.error("Error fetching customers:", error);
        showToast("Error fetching customers.", "error");
      });
      return () => unsubscribeCustomers();
    }
  }, [isAuthReady, firestoreDb, userId, getCollectionRef, showToast]);

  // --- CRUD Operations & Accounting Logic ---

  /**
   * Updates the balance of a specific account.
   * @param {string} accountId The ID of the account to update.
   * @param {number} amount The amount to add to the account balance. Can be positive or negative.
   */
  const updateAccountBalance = useCallback(async (accountId: string | undefined, amount: number) => {
    const accountRef = getCollectionRef('accounts');
    if (!accountRef) {
      showToast("Firestore not ready for account update.", "error");
      return;
    }
    const accountDocRef = doc(accountRef, accountId);
    try {
      const currentAccount = accounts.find(acc => acc.id === accountId);
      if (currentAccount) {
        await updateDoc(accountDocRef, {
          balance: currentAccount.balance + amount
        });
      } else {
        console.warn(`Account with ID ${accountId} not found for balance update.`);
      }
    } catch (error) {
      console.error("Error updating account balance:", error);
      showToast(`Failed to update balance for ${accountId}.`, "error");
    }
  }, [accounts, getCollectionRef, showToast]);

  /**
   * Adds a new financial transaction and updates relevant account balances.
   * Implements a simplified double-entry system.
   * @param {object} transactionData
   * @param {'revenue'|'cost'|'payout'|'refund'} transactionData.type Type of transaction.
   * @param {number} transactionData.amount Amount of the transaction.
   * @param {string} transactionData.description Description of the transaction.
   * @param {string} [transactionData.event_id] Optional ID of the associated event.
   * @param {string} transactionData.payment_method How the transaction was paid/received (e.g., 'cash', 'bank transfer', 'card').
   * @param {string} [transactionData.customer_id] Optional ID of the associated customer.
   * @param {string} transactionData.category General category (e.g., 'ticket_sales', 'venue_rental', 'marketing').
   * @param {'operating'|'investing'|'financing'} transactionData.flow_type Cash flow statement classification.
   */
  const addTransaction = useCallback(async (transactionData: AddTransactionData) => {
    const transactionsRef = getCollectionRef('transactions');
    if (!transactionsRef) {
      showToast("Firestore not ready for transaction.", "error");
      return;
    }

    try {
      const newTransaction = {
        ...transactionData,
        amount: typeof transactionData.amount === 'string' ? parseFloat(transactionData.amount) : transactionData.amount,
        date: serverTimestamp(),
        status: transactionData.status || 'completed',
      };

      await addDoc(transactionsRef, newTransaction);
      showToast("Transaction added successfully!", "success");

      // --- Automated Journal Entries (Simplified) ---
      // This is a basic representation. A full accounting system would have more complex rules.

      const { type, amount, payment_method, category } = newTransaction;

      // Determine the primary cash account affected
      const cashAccount = payment_method === 'cash' ? 'cash' : 'bank';

      if (type === 'revenue') {
        // Debit Cash/Bank, Credit Revenue Account
        await updateAccountBalance(cashAccount, amount);
        await updateAccountBalance(category, amount); // e.g., 'ticket_sales_revenue' or 'sponsorship_revenue'
      } else if (type === 'cost') {
        // Debit Expense Account, Credit Cash/Bank
        await updateAccountBalance(category, -amount); // Expense reduces the category account
        await updateAccountBalance(cashAccount, -amount); // Cash/Bank decreases
      } else if (type === 'payout') {
        // Debit Expense/Equity (depending on payout type), Credit Cash/Bank
        // For simplicity, let's treat payouts as a type of cost affecting cash/bank
        await updateAccountBalance(cashAccount, -amount); // Amount will be negative for payout
        // Optionally, debit an equity or specific payout account if tracking
      } else if (type === 'refund') {
        // Debit Revenue Account (reversal), Credit Cash/Bank
        await updateAccountBalance(category, -amount); // e.g., 'ticket_sales_revenue' (negative amount for revenue reversal)
        await updateAccountBalance(cashAccount, -amount); // Amount will be negative for refund
      }

    } catch (error) {
      console.error("Error adding transaction:", error);
      showToast("Failed to add transaction.", "error");
    }
  }, [getCollectionRef, updateAccountBalance, showToast]);


  /**
   * Adds a new event.
   * @param {object} eventData
   */
  const addEvent = useCallback(async (eventData: any) => {
    const eventsRef = getCollectionRef('events');
    if (!eventsRef) {
      showToast("Firestore not ready for event.", "error");
      return;
    }
    try {
      await addDoc(eventsRef, { ...eventData, createdAt: serverTimestamp() });
      showToast("Event added successfully!", "success");
    } catch (error) {
      console.error("Error adding event:", error);
      showToast("Failed to add event.", "error");
    }
  }, [getCollectionRef, showToast]);

  /**
   * Adds a new customer.
   * @param {object} customerData
   */
  const addCustomer = useCallback(async (customerData: any) => {
    const customersRef = getCollectionRef('customers');
    if (!customersRef) {
      showToast("Firestore not ready for customer.", "error");
      return;
    }
    try {
      await addDoc(customersRef, { ...customerData, createdAt: serverTimestamp() });
      showToast("Customer added successfully!", "success");
    } catch (error) {
      console.error("Error adding customer:", error);
      showToast("Failed to add customer.", "error");
    }
  }, [getCollectionRef, showToast]);

  // --- Reporting Logic ---

  /**
   * Generates a Cash Flow Statement for a given period.
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {object} Categorized cash flows.
   */
  const generateCashFlowStatement = useCallback((startDate: number, endDate: number) => {
    const filteredTransactions = transactions.filter(t =>
      t.date && t.date.toDate() >= startDate && t.date.toDate() <= endDate
    );

    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;

    filteredTransactions.forEach(t => {
      const amount = t.type === 'cost' || t.type === 'payout' || t.type === 'refund' ? -Math.abs(t.amount) : Math.abs(t.amount);
      if (t.flow_type === 'operating') {
        operatingActivities += amount;
      } else if (t.flow_type === 'investing') {
        investingActivities += amount;
      } else if (t.flow_type === 'financing') {
        financingActivities += amount;
      }
    });

    const netCashFlow = operatingActivities + investingActivities + financingActivities;

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow,
    };
  }, [transactions]);

  /**
   * Generates an Income Statement (Profit & Loss) for a given period.
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {object} Income and expenses.
   */
  const generateIncomeStatement = useCallback((startDate: number, endDate: number) => {
    const filteredTransactions = transactions.filter(t =>
      t.date && t.date.toDate() >= startDate && t.date.toDate() <= endDate
    );

    let totalRevenue = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'revenue') {
        totalRevenue += Math.abs(t.amount);
      } else if (t.type === 'cost') {
        totalExpenses += Math.abs(t.amount);
      }
      // Refunds would reduce revenue, payouts are usually not on income statement directly
    });

    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
    };
  }, [transactions]);

  /**
   * Generates a Balance Sheet at a specific date.
   * Note: This is a simplified balance sheet. A real one requires more complex accounting.
   * @param {Date} asOfDate
   * @returns {object} Assets, Liabilities, Equity.
   */
  const generateBalanceSheet = useCallback((asOfDate: number) => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    accounts.forEach(account => {
      // For a balance sheet at a specific point, we need to calculate balances up to that date.
      // This simplified version uses current balances, which is not strictly correct for a historical balance sheet.
      // A proper implementation would re-calculate balances based on transactions up to asOfDate.
      const balance = account.balance; // Using current balance for simplicity

      if (account.type === 'asset') {
        totalAssets += balance;
      } else if (account.type === 'liability') {
        totalLiabilities += balance;
      } else if (account.type === 'equity') {
        totalEquity += balance;
      }
    });

    // For simplicity, retained earnings would be net profit accumulated over time
    const { netProfit } = generateIncomeStatement(new Date(0).getTime(), asOfDate); // Income up to asOfDate
    totalEquity += netProfit; // Add current period profit to equity

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      // The accounting equation should hold: Assets = Liabilities + Equity
      // Due to simplification, it might not perfectly balance with just current account balances.
    };
  }, [accounts, generateIncomeStatement]);

  /**
   * Generates sales reports.
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {object} Sales data.
   */
  const generateSalesReports = useCallback((startDate: number, endDate: number) => {
    const salesTransactions = transactions.filter(t =>
      t.type === 'revenue' && t.category === 'ticket_sales_revenue' &&
      t.date && t.date.toDate() >= startDate && t.date.toDate() <= endDate
    );

    const totalTicketSales = salesTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const salesByCategory = salesTransactions.reduce((acc: Record<string, number>, t) => {
      const event = events.find(e => e.id === t.event_id);
      const category = event ? event.category : 'Uncategorized';
      acc[category] = (acc[category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const salesByEvent = salesTransactions.reduce((acc: Record<string, number>, t) => {
      const event = events.find(e => e.id === t.event_id);
      const eventTitle = event ? event.title : 'Unknown Event';
      acc[eventTitle] = (acc[eventTitle] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);


    return {
      totalTicketSales,
      salesByCategory,
      salesByEvent,
      salesTransactions,
    };
  }, [transactions, events]);


  const accountingContextValue = {
    transactions,
    accounts,
    events,
    customers,
    addTransaction,
    addEvent,
    addCustomer,
    updateAccountBalance, // Exposed for direct balance updates if needed (e.g., initial cash deposit)
    generateCashFlowStatement,
    generateIncomeStatement,
    generateBalanceSheet,
    generateSalesReports,
  };

  return (
    <AccountingContext.Provider value={accountingContextValue}>
      {children}
    </AccountingContext.Provider>
  );
};


// --- UI Components ---

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

// Add Transaction Modal
const AddTransactionModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addTransaction, accounts, events, customers } = useContext(AccountingContext)!;
  const { showToast } = useContext(ToastContext)!;

  const [type, setType] = useState('revenue');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [eventId, setEventId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [customerId, setCustomerId] = useState('');
  const [category, setCategory] = useState('');
  const [flowType, setFlowType] = useState('operating');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be a positive number.";
    }
    if (!description.trim()) {
      newErrors.description = "Description cannot be empty.";
    }
    if (!category) {
      newErrors.category = "Please select an accounting category.";
    }
    if (!flowType) {
      newErrors.flowType = "Please select a cash flow type.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please correct the errors in the form.", "error");
      return;
    }

    try {
      await addTransaction({
        type: type as 'revenue' | 'cost' | 'payout' | 'refund',
        amount: parseFloat(amount), // Ensure amount is parsed here
        description,
        event_id: eventId || null,
        payment_method: paymentMethod,
        customer_id: customerId || null,
        category,
        flow_type: flowType as 'operating' | 'investing' | 'financing',
      });
      onClose(); // Close modal on success
      // Reset form
      setType('revenue');
      setAmount('');
      setDescription('');
      setEventId('');
      setPaymentMethod('bank');
      setCustomerId('');
      setCategory('');
      setFlowType('operating');
      setErrors({});
    } catch (error) {
      // Error handled by addTransaction, just log here if needed
      console.error("Error submitting transaction form:", error);
    }
  };

  // Filter accounts for categories based on transaction type
  const getCategoryOptions = () => {
    if (type === 'revenue') {
      return accounts.filter(acc => acc.type === 'revenue');
    } else if (type === 'cost' || type === 'payout' || type === 'refund') {
      return accounts.filter(acc => acc.type === 'expense');
    }
    return [];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-gray-300 text-sm font-bold mb-2">Transaction Type:</label>
          <select
            id="type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              // Reset category when type changes
              setCategory('');
              setErrors(prev => ({ ...prev, category: '' })); // Clear category error
            }}
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
          >
            <option value="revenue">Revenue</option>
            <option value="cost">Cost/Expense</option>
            <option value="payout">Payout</option>
            <option value="refund">Refund</option>
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-gray-300 text-sm font-bold mb-2">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrors(prev => ({ ...prev, amount: '' })); // Clear error on change
            }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.amount ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="e.g., 1500"
            required
          />
          {errors.amount && <p className="text-red-400 text-xs italic mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Description:</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors(prev => ({ ...prev, description: '' })); // Clear error on change
            }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.description ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="e.g., Ticket sale for Amapiano Night"
            required
          />
          {errors.description && <p className="text-red-400 text-xs italic mt-1">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-gray-300 text-sm font-bold mb-2">Accounting Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setErrors(prev => ({ ...prev, category: '' })); // Clear error on change
            }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.category ? 'border-red-500' : 'focus:border-purple-500'}`}
            required
          >
            <option value="">Select Category</option>
            {getCategoryOptions().map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-400 text-xs italic mt-1">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-gray-300 text-sm font-bold mb-2">Payment Method:</label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
          >
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="card">Card Payment</option>
          </select>
        </div>

        <div>
          <label htmlFor="flowType" className="block text-gray-300 text-sm font-bold mb-2">Cash Flow Type:</label>
          <select
            id="flowType"
            value={flowType}
            onChange={(e) => {
              setFlowType(e.target.value);
              setErrors(prev => ({ ...prev, flowType: '' })); // Clear error on change
            }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.flowType ? 'border-red-500' : 'focus:border-purple-500'}`}
            required
          >
            <option value="operating">Operating</option>
            <option value="investing">Investing</option>
            <option value="financing">Financing</option>
          </select>
          {errors.flowType && <p className="text-red-400 text-xs italic mt-1">{errors.flowType}</p>}
        </div>

        <div>
          <label htmlFor="eventId" className="block text-gray-300 text-sm font-bold mb-2">Associated Event (Optional):</label>
          <select
            id="eventId"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
          >
            <option value="">None</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="customerId" className="block text-gray-300 text-sm font-bold mb-2">Associated Customer (Optional):</label>
          <select
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
          >
            <option value="">None</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
        >
          Add Transaction
        </button>
      </form>
    </Modal>
  );
};


// Add Event Modal
const AddEventModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addEvent } = useContext(AccountingContext)!;
  const { showToast } = useContext(ToastContext)!;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title cannot be empty.";
    if (!description.trim()) newErrors.description = "Description cannot be empty.";
    if (!date) newErrors.date = "Date is required.";
    if (!location.trim()) newErrors.location = "Location cannot be empty.";
    if (!category.trim()) newErrors.category = "Category cannot be empty.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please correct the errors in the form.", "error");
      return;
    }

    try {
      await addEvent({ title, description, date, location, category });
      onClose();
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setCategory('');
      setErrors({});
    } catch (error) {
      console.error("Error submitting event form:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="eventTitle" className="block text-gray-300 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="eventTitle"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.title ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="e.g., Summer Music Fest"
            required
          />
          {errors.title && <p className="text-red-400 text-xs italic mt-1">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="eventDescription" className="block text-gray-300 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="eventDescription"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.description ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="Brief description of the event"
            rows={3}
            required
          ></textarea>
          {errors.description && <p className="text-red-400 text-xs italic mt-1">{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="eventDate" className="block text-gray-300 text-sm font-bold mb-2">Date:</label>
          <input
            type="date"
            id="eventDate"
            value={date}
            onChange={(e) => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })); }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.date ? 'border-red-500' : 'focus:border-purple-500'}`}
            required
          />
          {errors.date && <p className="text-red-400 text-xs italic mt-1">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="eventLocation" className="block text-gray-300 text-sm font-bold mb-2">Location:</label>
          <input
            type="text"
            id="eventLocation"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setErrors(prev => ({ ...prev, location: '' })); }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.location ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="e.g., Nairobi Arena"
            required
          />
          {errors.location && <p className="text-red-400 text-xs italic mt-1">{errors.location}</p>}
        </div>
        <div>
          <label htmlFor="eventCategory" className="block text-gray-300 text-sm font-bold mb-2">Category:</label>
          <input
            type="text"
            id="eventCategory"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.category ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="e.g., Music, Sports, Conference"
            required
          />
          {errors.category && <p className="text-red-400 text-xs italic mt-1">{errors.category}</p>}
        </div>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
        >
          Add Event
        </button>
      </form>
    </Modal>
  );
};

// Events View Component
const EventsView = () => {
  const { events } = useContext(AccountingContext)!;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">All Events</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6">
        {events.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No events found. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {event.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                      {event.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};


// Add Customer Modal
const AddCustomerModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addCustomer } = useContext(AccountingContext)!;
  const { showToast } = useContext(ToastContext)!;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name cannot be empty.";
    if (!email.trim()) newErrors.email = "Email cannot be empty.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please correct the errors in the form.", "error");
      return;
    }

    try {
      await addCustomer({ name, email, phone });
      onClose();
      setName('');
      setEmail('');
      setPhone('');
      setErrors({});
    } catch (error) {
      console.error("Error submitting customer form:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Customer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-gray-300 text-sm font-bold mb-2">Name:</label>
          <input
            type="text"
            id="customerName"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="e.g., Jane Doe"
            required
          />
          {errors.name && <p className="text-red-400 text-xs italic mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="customerEmail" className="block text-gray-300 text-sm font-bold mb-2">Email:</label>
          <input
            type="email"
            id="customerEmail"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
            className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : 'focus:border-purple-500'}`}
            placeholder="e.g., jane.doe@example.com"
            required
          />
          {errors.email && <p className="text-red-400 text-xs italic mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="customerPhone" className="block text-gray-300 text-sm font-bold mb-2">Phone (Optional):</label>
          <input
            type="tel"
            id="customerPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
            placeholder="e.g., +254712345678"
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
        >
          Add Customer
        </button>
      </form>
    </Modal>
  );
};

// Customers View Component
const CustomersView = () => {
  const { customers } = useContext(AccountingContext)!;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">All Customers</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6">
        {customers.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No customers found. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {customer.phone || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddCustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};


// Transactions View Component
const TransactionsView = () => {
  const { transactions, accounts } = useContext(AccountingContext)!; // Added accounts here
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">All Transactions</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6">
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No transactions found. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">
                    Amount (KES)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.date?.toDate().toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                      {accounts.find(acc => acc.id === transaction.category)?.name || transaction.category}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      transaction.type === 'revenue' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'revenue' ? '+' : '-'}KES {Math.abs(transaction.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

// Accounts View Component
const AccountsView = () => {
  const { accounts } = useContext(AccountingContext)!;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Chart of Accounts</h3>
      <div className="bg-gray-800 rounded-2xl p-6">
        {accounts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No accounts found. Initializing default accounts...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">
                    Account Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">
                    Balance (KES)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                      {account.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                      {account.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
                      KES {account.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Reports View Component
const ReportsView = () => {
  const {
    generateCashFlowStatement,
    generateIncomeStatement,
    generateBalanceSheet,
    generateSalesReports
  } = useContext(AccountingContext)!;

  const [reportType, setReportType] = useState('cashflow');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // Default to last month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day

    let data;
    switch (reportType) {
      case 'cashflow':
        data = generateCashFlowStatement(start.getTime(), end.getTime());
        break;
      case 'income':
        data = generateIncomeStatement(start.getTime(), end.getTime());
        break;
      case 'balance_sheet':
        data = generateBalanceSheet(end.getTime()); // Balance sheet is as of a date
        break;
      case 'sales':
        data = generateSalesReports(start.getTime(), end.getTime());
        break;
      default:
        data = null;
    }
    setReportData(data);
  };

  useEffect(() => {
    handleGenerateReport(); // Generate report on initial load and date/type change
  }, [reportType, startDate, endDate, generateCashFlowStatement, generateIncomeStatement, generateBalanceSheet, generateSalesReports]);


  const renderReportContent = () => {
    if (!reportData) {
      return <p className="text-gray-400 text-center py-8">Select a report type and period, then click Generate.</p>;
    }

    switch (reportType) {
      case 'cashflow':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">Cash Flow Statement</h4>
            <p className="text-gray-400">For the period: {startDate} to {endDate}</p>
            <div className="bg-gray-700 rounded-xl p-4">
              <p className="text-gray-300">Operating Activities: <span className="font-semibold text-white">KES {reportData.operatingActivities.toLocaleString()}</span></p>
              <p className="text-gray-300">Investing Activities: <span className="font-semibold text-white">KES {reportData.investingActivities.toLocaleString()}</span></p>
              <p className="text-gray-300">Financing Activities: <span className="font-semibold text-white">KES {reportData.financingActivities.toLocaleString()}</span></p>
              <p className="text-lg font-bold text-white mt-4">Net Cash Flow: <span className="text-green-400">KES {reportData.netCashFlow.toLocaleString()}</span></p>
            </div>
          </div>
        );
      case 'income':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">Income Statement (Profit & Loss)</h4>
            <p className="text-gray-400">For the period: {startDate} to {endDate}</p>
            <div className="bg-gray-700 rounded-xl p-4">
              <p className="text-gray-300">Total Revenue: <span className="font-semibold text-green-400">KES {reportData.totalRevenue.toLocaleString()}</span></p>
              <p className="text-gray-300">Total Expenses: <span className="font-semibold text-red-400">KES {reportData.totalExpenses.toLocaleString()}</span></p>
              <p className="text-lg font-bold text-white mt-4">Net Profit: <span className={`text-${reportData.netProfit >= 0 ? 'green' : 'red'}-400`}>KES {reportData.netProfit.toLocaleString()}</span></p>
            </div>
          </div>
        );
      case 'balance_sheet':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">Balance Sheet</h4>
            <p className="text-gray-400">As of: {endDate}</p>
            <div className="bg-gray-700 rounded-xl p-4">
              <p className="text-gray-300">Total Assets: <span className="font-semibold text-white">KES {reportData.totalAssets.toLocaleString()}</span></p>
              <p className="text-gray-300">Total Liabilities: <span className="font-semibold text-white">KES {reportData.totalLiabilities.toLocaleString()}</span></p>
              <p className="text-gray-300">Total Equity: <span className="font-semibold text-white">KES {reportData.totalEquity.toLocaleString()}</span></p>
              <p className="text-sm text-gray-500 mt-2">Assets = Liabilities + Equity (approximate for simplified model)</p>
            </div>
          </div>
        );
      case 'sales':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-white">Sales Report</h4>
            <p className="text-gray-400">For the period: {startDate} to {endDate}</p>
            <div className="bg-gray-700 rounded-xl p-4">
              <p className="text-gray-300">Total Ticket Sales: <span className="font-semibold text-green-400">KES {reportData.totalTicketSales.toLocaleString()}</span></p>
              <h5 className="text-lg font-bold text-white mt-4 mb-2">Sales by Category:</h5>
              {Object.entries(reportData.salesByCategory).map(([cat, val]) => (
                <p key={cat} className="text-gray-300 ml-4">{cat}: <span className="font-semibold text-white">KES {(val as number).toLocaleString()}</span></p>
              ))}
              <h5 className="text-lg font-bold text-white mt-4 mb-2">Sales by Event:</h5>
              {Object.entries(reportData.salesByEvent).map(([eventTitle, val]) => (
                <p key={eventTitle} className="text-gray-300 ml-4">{eventTitle}: <span className="font-semibold text-white">KES {(val as number).toLocaleString()}</span></p>
              ))}
            </div>
          </div>
        );
      default:
        return <p className="text-gray-400 text-center py-8">Select a report type to view.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Financial Reports</h3>
      <div className="bg-gray-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="reportType" className="block text-gray-300 text-sm font-bold mb-2">Report Type:</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
            >
              <option value="cashflow">Cash Flow Statement</option>
              <option value="income">Income Statement (P&L)</option>
              <option value="balance_sheet">Balance Sheet</option>
              <option value="sales">Sales Report</option>
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-gray-300 text-sm font-bold mb-2">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-300 text-sm font-bold mb-2">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500"
            />
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
        >
          Generate Report
        </button>
        <div className="mt-6 p-4 bg-gray-700 rounded-xl">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

// Accounting Dashboard Component
const AccountingDashboard = () => {
  const [activeTab, setActiveTab] = useState('transactions');

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'accounts', label: 'Accounts', icon: BookOpen },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Accounting Dashboard</h3>
      
      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'transactions' && <TransactionsView />}
      {activeTab === 'accounts' && <AccountsView />}
      {activeTab === 'events' && <EventsView />}
      {activeTab === 'customers' && <CustomersView />}
      {activeTab === 'reports' && <ReportsView />}
    </div>
  );
};

// Main Accounting Dashboard Component
interface CashflowManagementProps {
  userRole: string;
}

export const CashflowManagement: React.FC<CashflowManagementProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Use the AccountingContext to get real data
  const { transactions, accounts, generateIncomeStatement } = useContext(AccountingContext)!;

  // Calculate mock data based on actual transactions for demonstration
  const calculateCashflowData = useCallback(() => { // Made useCallback
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const { totalRevenue, totalExpenses, netProfit } = generateIncomeStatement(thirtyDaysAgo.getTime(), today.getTime());

    // Simplified calculation for other metrics - you'd refine this
    const totalCosts = totalExpenses;
    const availableBalance = accounts.find(acc => acc.id === 'bank')?.balance || 0; // Correctly using accounts from context
    const pendingPayouts = transactions.filter(t => t.type === 'payout' && t.status === 'pending').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const growthRate = 15.2; // Placeholder, calculate from historical data
    const projectedRevenue = totalRevenue * 1.1; // Simple projection

    return {
      totalRevenue,
      totalCosts,
      netProfit,
      pendingPayouts,
      availableBalance,
      growthRate,
      projectedRevenue
    };
  }, [transactions, accounts, generateIncomeStatement]); // Dependencies for useCallback

  const cashflowData = calculateCashflowData(); // Call the memoized function

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'projections', label: 'Projections', icon: TrendingUp },
    { id: 'payouts', label: 'Payouts', icon: Wallet },
    { id: 'accounting', label: 'Accounting', icon: LayoutDashboard }, // New tab for accounting
  ];

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Revenue</p>
              <p className="text-3xl font-bold">KES {cashflowData.totalRevenue.toLocaleString()}</p>
            </div>
            <ArrowUpRight className="w-10 h-10 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-200 mr-1" />
            <span className="text-green-200 text-sm">+{cashflowData.growthRate}% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Total Costs</p>
              <p className="text-3xl font-bold">KES {cashflowData.totalCosts.toLocaleString()}</p>
            </div>
            <ArrowDownRight className="w-10 h-10 text-red-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="w-4 h-4 text-red-200 mr-1" />
            <span className="text-red-200 text-sm">-2.1% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Net Profit</p>
              <p className="text-3xl font-bold">KES {cashflowData.netProfit.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-purple-200 mr-1" />
            <span className="text-purple-200 text-sm">+{((cashflowData.netProfit / cashflowData.totalRevenue) * 100).toFixed(1)}% margin</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Available Balance</p>
              <p className="text-3xl font-bold">KES {cashflowData.availableBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-10 h-10 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-blue-200 text-sm">Instant access available</span>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-gray-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Cash Flow Trends</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="h-64 flex items-center justify-center bg-gray-700 rounded-xl">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Cash flow chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4">Request Payout</h4>
          <p className="text-gray-400 mb-4">Get instant access to your earnings</p>
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all">
            Request Payout
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4">Financial Reports</h4>
          <p className="text-gray-400 mb-4">Download detailed financial reports</p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all">
            <Download className="w-5 h-5 inline mr-2" />
            Download
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4">Cash Flow Forecast</h4>
          <p className="text-gray-400 mb-4">AI-powered revenue predictions</p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
            View Forecast
          </button>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
        </div>

        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => ( // Displaying recent 5 transactions
            <div key={transaction.id} className="bg-gray-700 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  transaction.type === 'revenue' ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {transaction.type === 'revenue' ? (
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  ) : (
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">{transaction.description}</p>
                  <p className="text-gray-400 text-sm">{transaction.date?.toDate().toLocaleDateString() || 'N/A'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  transaction.type === 'revenue' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'revenue' ? '+' : ''}KES {Math.abs(transaction.amount).toLocaleString()}
                </p>
                <p className={`text-sm ${
                  transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {transaction.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProjections = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Revenue Projections</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Next 30 Days</h4>
              <p className="text-3xl font-bold text-green-400">KES {cashflowData.projectedRevenue.toLocaleString()}</p>
              <p className="text-gray-400 mt-2">Projected revenue</p>
            </div>

            <div className="bg-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Growth Rate</h4>
              <p className="text-3xl font-bold text-purple-400">+{cashflowData.growthRate}%</p>
              <p className="text-gray-400 mt-2">Month over month</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center bg-gray-700 rounded-xl">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Projection chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayouts = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Payout Management</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-2">Available for Payout</h4>
            <p className="text-3xl font-bold text-green-400">KES {cashflowData.availableBalance.toLocaleString()}</p>
            <p className="text-gray-400 mt-2">Instant access available</p>
          </div>

          <div className="bg-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-2">Pending Payouts</h4>
            <p className="text-3xl font-bold text-yellow-400">KES {cashflowData.pendingPayouts.toLocaleString()}</p>
            <p className="text-gray-400 mt-2">Processing within 24 hours</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl p-6">
          <h4 className="text-xl font-bold text-white mb-4">Request Instant Payout</h4>
          <p className="text-gray-300 mb-6">
            Get immediate access to your earnings with our instant payout feature.
            Funds are typically available within minutes.
          </p>
          <button className="bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Request Payout
          </button>
        </div>
      </div>
    </div>
  );

  if (userRole !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Cash flow management is available for admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Cash Flow Management</h2>
        <p className="text-gray-400">Manage your finances with confidence and get instant access to your earnings</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'transactions' && renderTransactions()}
      {activeTab === 'projections' && renderProjections()}
      {activeTab === 'payouts' && renderPayouts()}
      {activeTab === 'accounting' && <AccountingDashboard />} {/* Render AccountingDashboard */}
    </div>
  );
};
