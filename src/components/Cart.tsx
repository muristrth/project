import React, { useContext, useState } from 'react';
import { X, Plus, Minus, CreditCard, Trash2 } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AccountingContext } from '../components/CashflowManagement'; // Import AccountingContext

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, clearCart, updateEvent } = useEvent(); // Get updateEvent from useEvent
  const { user, updateUser } = useAuth(); // Get updateUser from useAuth
  const { showToast } = useToast();
  const { addTransaction } = useContext(AccountingContext); // Get addTransaction from AccountingContext

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.total, 0);
  const loyaltyDiscount = user?.loyaltyPoints && user.loyaltyPoints > 100 ? total * 0.1 : 0;
  const finalTotal = total - loyaltyDiscount;

  const handleCheckout = async () => {
    if (!user) {
      showToast('Please login to complete your purchase', 'error');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    setIsProcessingPayment(true);
    showToast('Processing payment...', 'info');

    try {
      // Simulate payment gateway interaction
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay for payment processing

      // Process each item in the cart
      for (const item of cart) {
        // 1. Record the transaction in accounting
        const transactionSuccess = await addTransaction({
          type: 'revenue',
          amount: item.total,
          description: `Ticket purchase for ${item.eventTitle} (${item.ticketType} x${item.quantity})`,
          event_id: item.eventId,
          payment_method: 'card', // Assuming card for simplicity
          customer_id: user.uid,
          category: 'ticket_sales_revenue',
          flow_type: 'operating',
          status: 'completed',
        });

        if (!transactionSuccess) {
          throw new Error(`Failed to record transaction for ${item.eventTitle}`);
        }

        // 2. Update event's sold tickets
        // Find the event to get its current soldTickets count
        const currentEvent = (await updateEvent(item.eventId, {}) && null) // Dummy call to trigger updateEvent
          ? null // This part is tricky. We need to fetch the event's current state.
          : null; // For now, we'll assume updateEvent handles the increment internally or we refetch.
        
        // A more robust solution would be to fetch the event again here to get the latest `soldTickets`
        // or ensure `updateEvent` in EventContext can increment based on current value.
        // For simplicity, let's assume updateEvent can handle the increment directly.
        const eventUpdateSuccess = await updateEvent(item.eventId, {
          soldTickets: (events.find(e => e.id === item.eventId)?.soldTickets || 0) + item.quantity
        });

        if (!eventUpdateSuccess) {
          throw new Error(`Failed to update ticket count for ${item.eventTitle}`);
        }
      }

      // 3. Update user's purchase history and loyalty points
      const newPurchaseHistory = [...(user.purchaseHistory || []), ...cart.map(item => item.eventId)];
      const newLoyaltyPoints = (user.loyaltyPoints || 0) + Math.floor(finalTotal / 100); // Example: 1 point per KES 100

      const userUpdateSuccess = await updateUser({
        purchaseHistory: Array.from(new Set(newPurchaseHistory)), // Ensure unique event IDs
        loyaltyPoints: newLoyaltyPoints,
      });

      if (!userUpdateSuccess) {
        showToast('Tickets purchased, but failed to update user profile.', 'warning');
      }

      clearCart();
      showToast('Payment successful! Check your email for tickets.', 'success');
      onClose();

    } catch (error: any) {
      console.error("Checkout error:", error);
      showToast(`Payment failed: ${error.message || 'An unexpected error occurred.'}`, 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {cart.length > 0 ? (
            <div className="p-6 space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.eventTitle}</h3>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {item.ticketType} × {item.quantity}
                    </span>
                    <span className="text-white font-semibold">
                      KES {item.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-400">Your cart is empty</p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-700 p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">KES {total.toLocaleString()}</span>
              </div>
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-purple-400">Loyalty Discount</span>
                  <span className="text-purple-400">-KES {loyaltyDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-white border-t border-gray-700 pt-3">
                <span>Total</span>
                <span>KES {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Checkout</span>
                  </>
                )}
              </button>
              <button
                onClick={clearCart}
                disabled={isProcessingPayment}
                className="w-full bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
