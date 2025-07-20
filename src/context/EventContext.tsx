import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { collection, query, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Ensure this path is correct for your firebase.ts
import { FirebaseContext } from '../components/CashflowManagement';
import { ToastContext } from '../context/ToastContext';

// Declare global variables for TypeScript (provided by Canvas environment)
declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Event Data Model ---
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  location: string;
  venue: string;
  category: string;
  price: number;
  image: string; // URL to event image
  artists: string[];
  totalTickets: number;
  soldTickets: number;
  coordinates: { lat: number; lng: number }; // For map integration
  createdAt?: any; // Firestore Timestamp
}

// --- Cart Item Data Model ---
export interface CartItem {
  eventId: string;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  price: number;
  total: number;
}

// --- Event Context Interface ---
interface EventContextType {
  events: Event[];
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
  updateEvent: (eventId: string, data: Partial<Event>) => Promise<boolean>;
  addEvent: (eventData: Omit<Event, 'id' | 'createdAt' | 'soldTickets'>) => Promise<boolean>; // Admin can add events
  deleteEvent: (eventId: string) => Promise<boolean>;
  isLoading: boolean;
}

// Create the Event Context
const EventContext = createContext<EventContextType | undefined>(undefined);

// --- Event Provider Component ---
export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { firestoreDb, isAuthReady, userId } = useContext(FirebaseContext);
  const toastContext = useContext(ToastContext);
  const showToast = toastContext?.showToast ?? (() => {});

  // Fetch events from Firestore in real-time
  useEffect(() => {
    if (!isAuthReady || !firestoreDb || !userId) {
      console.log("Firebase or user not ready for event fetching.");
      setIsLoading(false);
      return;
    }

    // Events are public data for the app, stored under /artifacts/{appId}/public/data/events
    const eventsCollectionRef = collection(firestoreDb, `artifacts/${appId}/public/data/events`);
    const q = query(eventsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: Event[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Event, 'id'> // Cast data to Event type, omitting 'id'
      }));
      setEvents(fetchedEvents);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      showToast("Error loading events.", "error");
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [firestoreDb, isAuthReady, userId, showToast]);

  // Add item to cart
  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.eventId === item.eventId && cartItem.ticketType === item.ticketType
      );

      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        updatedCart[existingItemIndex].total += item.total;
        return updatedCart;
      } else {
        // Add new item if it doesn't exist
        return [...prevCart, item];
      }
    });
    showToast(`${item.quantity} ${item.eventTitle} tickets added to cart!`, 'success');
  }, [showToast]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    showToast("Cart cleared.", "info");
  }, [showToast]);

  // Update an existing event in Firestore
  const updateEvent = useCallback(async (eventId: string, data: Partial<Event>) => {
    if (!firestoreDb) {
      showToast("Firestore not ready.", "error");
      return false;
    }
    try {
      const eventDocRef = doc(firestoreDb, `artifacts/${appId}/public/data/events`, eventId);
      await updateDoc(eventDocRef, data);
      showToast("Event updated successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error updating event:", error);
      showToast("Failed to update event.", "error");
      return false;
    }
  }, [firestoreDb, showToast]);

  // Add a new event to Firestore (for admin)
  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt' | 'soldTickets'>) => {
    if (!firestoreDb) {
      showToast("Firestore not ready.", "error");
      return false;
    }
    try {
      const eventsCollectionRef = collection(firestoreDb, `artifacts/${appId}/public/data/events`);
      await addDoc(eventsCollectionRef, {
        ...eventData,
        soldTickets: 0, // Initialize sold tickets for new events
        createdAt: serverTimestamp(),
      });
      showToast("Event added successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error adding event:", error);
      showToast("Failed to add event.", "error");
      return false;
    }
  }, [firestoreDb, showToast]);

  // Delete an event from Firestore (for admin)
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!firestoreDb) {
      showToast("Firestore not ready.", "error");
      return false;
    }
    try {
      const eventDocRef = doc(firestoreDb, `artifacts/${appId}/public/data/events`, eventId);
      await deleteDoc(eventDocRef);
      showToast("Event deleted successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event.", "error");
      return false;
    }
  }, [firestoreDb, showToast]);


  const contextValue = {
    events,
    cart,
    addToCart,
    clearCart,
    updateEvent,
    addEvent,
    deleteEvent,
    isLoading,
  };

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

// Custom hook to use the Event Context
export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
