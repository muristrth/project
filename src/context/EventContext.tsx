import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { collection, query, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Ensure this path is correct for your firebase.ts
import { FirebaseContext } from '../components/CashflowManagement';
import { ToastContext } from './ToastContext';

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
    if (!isAuthReady || !firestoreDb) {
      console.log("Firebase not ready for event fetching.");
      setIsLoading(false);
      return;
    }

    // Initialize with sample events for demo
    const sampleEvents: Event[] = [
      {
        id: '1',
        title: 'AMAPIANO FRIDAY',
        description: 'The hottest Amapiano night in the city featuring top DJs and live performances',
        date: '2025-01-24',
        time: '9:00 PM',
        location: 'Nairobi',
        venue: 'Ignition Club',
        category: 'Amapiano',
        price: 1500,
        image: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/12/77/ea/8b.jpg',
        artists: ['DJ Maphorisa', 'Kabza De Small', 'Local Artists'],
        totalTickets: 500,
        soldTickets: 120,
        coordinates: { lat: -1.286389, lng: 36.817223 },
        createdAt: new Date()
      },
      {
        id: '2',
        title: '3STEP SATURDAY',
        description: 'Experience the new wave of 3Step music with exclusive performances',
        date: '2025-01-25',
        time: '8:00 PM',
        location: 'Nairobi',
        venue: 'Westlands Arena',
        category: '3Step',
        price: 2000,
        image: 'https://i.guim.co.uk/img/media/2b739bda5f193800f8dc1be58605866c622cf7ca/0_287_5351_3211/master/5351.jpg?width=465&dpr=1&s=none&crop=none',
        artists: ['3Step Kings', 'Rising Stars', 'Local Mix'],
        totalTickets: 400,
        soldTickets: 85,
        coordinates: { lat: -1.286389, lng: 36.817223 },
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'WEEKEND VIBES',
        description: 'The ultimate weekend experience with both Amapiano and 3Step',
        date: '2025-01-26',
        time: '7:00 PM',
        location: 'Nairobi',
        venue: 'Sky Lounge, CBD',
        category: 'Mixed',
        price: 1800,
        image: 'https://www.kenyanvibe.com/wp-content/uploads/2025/05/2-scaled.jpg',
        artists: ['Mixed Artists', 'Special Guests'],
        totalTickets: 300,
        soldTickets: 45,
        coordinates: { lat: -1.286389, lng: 36.817223 },
        createdAt: new Date()
      }
    ];
    
    setEvents(sampleEvents);
    setIsLoading(false);
  }, [firestoreDb, isAuthReady, showToast]);

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

  // Remove item from cart
  const removeFromCart = useCallback((index: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart.splice(index, 1);
      return newCart;
    });
    showToast("Item removed from cart.", "info");
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
    removeFromCart,
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
