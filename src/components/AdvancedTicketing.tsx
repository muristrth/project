import React, { useState, useEffect } from 'react';
import { Users, Star, Clock, Gift, Zap, Crown, Check } from 'lucide-react';

interface TicketSegment {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  availability: number; // This would ideally come from event's remaining tickets
  maxPerPerson: number;
  color: string;
  icon: React.ElementType;
  badge?: string;
}

interface AdvancedTicketingProps {
  eventId: string;
  eventTitle: string;
  basePrice: number;
  onAddToCart: (ticket: TicketSegment, quantity: number) => void;
  userLoyaltyPoints?: number;
  userPurchaseHistory?: string[];
  // Add totalTickets and soldTickets here to dynamically adjust availability
  totalEventTickets: number;
  soldEventTickets: number;
}

const AdvancedTicketing: React.FC<AdvancedTicketingProps> = ({
  eventId,
  eventTitle,
  basePrice,
  onAddToCart,
  userLoyaltyPoints = 0,
  userPurchaseHistory = [],
  totalEventTickets,
  soldEventTickets
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string>('regular');
  const [quantity, setQuantity] = useState(1);

  const isLoyalCustomer = userPurchaseHistory.length > 2;
  const hasHighLoyaltyPoints = userLoyaltyPoints > 200;

  // Calculate remaining tickets for the event
  const remainingEventTickets = totalEventTickets - soldEventTickets;

  const ticketSegments: TicketSegment[] = [
    {
      id: 'early-bird',
      name: 'Early Bird',
      price: Math.round(basePrice * 0.8),
      originalPrice: basePrice,
      description: 'Limited time offer for early purchasers',
      features: [
        'Early entry (7:00 PM)',
        'Welcome drink included',
        'Digital wristband',
        'Social media shoutout'
      ],
      // Dynamically calculate availability based on remaining event tickets, capped at a segment-specific max
      availability: Math.min(50, remainingEventTickets),
      maxPerPerson: 4,
      color: 'from-green-600 to-emerald-600',
      icon: Clock,
      badge: 'Limited Time'
    },
    {
      id: 'regular',
      name: 'General Admission',
      price: basePrice,
      description: 'Standard event access with full experience',
      features: [
        'Full event access',
        'All performances',
        'General bar access',
        'Mobile ticket'
      ],
      availability: Math.min(800, remainingEventTickets),
      maxPerPerson: 8,
      color: 'from-purple-600 to-pink-600',
      icon: Users
    },
    {
      id: 'loyalty',
      name: 'Loyalty Exclusive',
      price: Math.round(basePrice * 0.75),
      originalPrice: basePrice,
      description: 'Special pricing for loyal customers',
      features: [
        'Exclusive loyalty discount',
        'Priority entry',
        'Bonus loyalty points',
        'Exclusive meetup area',
        'Loyalty badge'
      ],
      availability: isLoyalCustomer ? Math.min(100, remainingEventTickets) : 0,
      maxPerPerson: 6,
      color: 'from-yellow-600 to-orange-600',
      icon: Star,
      badge: 'Loyalty Members'
    },
    {
      id: 'vip',
      name: 'VIP Experience',
      price: basePrice * 2.5,
      description: 'Premium experience with exclusive access',
      features: [
        'VIP lounge access',
        'Premium bar service',
        'Meet & greet opportunities',
        'Reserved seating area',
        'VIP entrance',
        'Complimentary photos',
        'VIP merchandise'
      ],
      availability: Math.min(75, remainingEventTickets),
      maxPerPerson: 4,
      color: 'from-purple-800 to-pink-800',
      icon: Crown,
      badge: 'Premium'
    },
    {
      id: 'group',
      name: 'Group Package',
      price: Math.round(basePrice * 0.85),
      originalPrice: basePrice,
      description: 'Special rates for groups of 5 or more',
      features: [
        'Group discount applied',
        'Reserved group area',
        'Group photo session',
        'Dedicated entry point',
        'Group coordinator'
      ],
      availability: Math.min(200, remainingEventTickets),
      maxPerPerson: 20,
      color: 'from-blue-600 to-cyan-600',
      icon: Users,
      badge: 'Min 5 people'
    },
    {
      id: 'premium',
      name: 'Premium Plus',
      price: Math.round(basePrice * 1.8),
      description: 'Enhanced experience with extra perks',
      features: [
        'Premium viewing area',
        'Express entry',
        'Complimentary drinks (2)',
        'Premium restroom access',
        'Exclusive merchandise',
        'Priority customer service'
      ],
      availability: Math.min(150, remainingEventTickets),
      maxPerPerson: 6,
      color: 'from-indigo-600 to-purple-600',
      icon: Zap,
      badge: 'Popular'
    }
  ];

  const availableSegments = ticketSegments.filter(segment =>
    segment.availability > 0
  );

  const selectedTicket = availableSegments.find(s => s.id === selectedSegment);

  const handleQuantityChange = (change: number) => {
    if (selectedTicket) {
      // Ensure quantity does not exceed segment availability or max per person
      const newQuantity = Math.max(1, Math.min(selectedTicket.maxPerPerson, selectedTicket.availability, quantity + change));
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (selectedTicket) {
      onAddToCart(selectedTicket, quantity);
    }
  };

  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    let total = selectedTicket.price * quantity;

    // Apply additional discounts
    if (hasHighLoyaltyPoints && selectedTicket.id !== 'loyalty') {
      total *= 0.95; // 5% additional discount
    }

    return Math.round(total);
  };

  // If the currently selected segment becomes unavailable, default to 'regular' or first available
  useEffect(() => {
    if (selectedTicket && selectedTicket.availability === 0) {
      const firstAvailable = availableSegments.length > 0 ? availableSegments[0].id : '';
      setSelectedSegment(firstAvailable);
      setQuantity(1); // Reset quantity
    } else if (!selectedTicket && availableSegments.length > 0) {
        // If no segment is selected (e.g., initial load) and there are available segments
        setSelectedSegment(availableSegments[0].id);
        setQuantity(1);
    }
  }, [availableSegments, selectedSegment, selectedTicket]);


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Choose Your Experience</h3>
        <p className="text-gray-400">Select the perfect ticket for your night</p>
      </div>

      {/* Ticket Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {availableSegments.length > 0 ? (
          availableSegments.map((segment) => (
            <div
              key={segment.id}
              className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
                selectedSegment === segment.id
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              } ${segment.availability === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => segment.availability > 0 && setSelectedSegment(segment.id)}
            >
              {/* Badge */}
              {segment.badge && (
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {segment.badge}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${segment.color} rounded-xl flex items-center justify-center`}>
                    <segment.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{segment.name}</h4>
                    <p className="text-sm text-gray-400">{segment.availability} available</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    KES {segment.price.toLocaleString()}
                  </div>
                  {segment.originalPrice && (
                    <div className="text-sm text-gray-400 line-through">
                      KES {segment.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-4">{segment.description}</p>

              {/* Features */}
              <div className="space-y-2">
                {segment.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Selection Indicator */}
              {selectedSegment === segment.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">No ticket types available for this event.</p>
          </div>
        )}
      </div>

      {/* Quantity and Total */}
      {selectedTicket && selectedTicket.availability > 0 && (
        <div className="bg-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-bold text-white">{selectedTicket.name}</h4>
              <p className="text-gray-400">Max {selectedTicket.maxPerPerson} per person</p>
              <p className="text-gray-400">{selectedTicket.availability} tickets left</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="text-2xl font-bold text-white min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= selectedTicket.maxPerPerson || quantity >= selectedTicket.availability}
                className="w-10 h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Total Calculation */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">KES {(selectedTicket.price * quantity).toLocaleString()}</span>
            </div>

            {hasHighLoyaltyPoints && selectedTicket.id !== 'loyalty' && (
              <div className="flex justify-between">
                <span className="text-purple-400">Loyalty Bonus (5%)</span>
                <span className="text-purple-400">-KES {Math.round(selectedTicket.price * quantity * 0.05).toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between text-2xl font-bold text-white">
                <span>Total</span>
                <span>KES {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={quantity === 0 || selectedTicket.availability === 0}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      )}
      {selectedTicket && selectedTicket.availability === 0 && (
        <div className="bg-gray-700 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-semibold">This ticket type is currently sold out.</p>
        </div>
      )}

      {/* Loyalty Points Notice */}
      {hasHighLoyaltyPoints && (
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <h4 className="text-yellow-400 font-bold">Loyalty Reward Active!</h4>
          </div>
          <p className="text-gray-300">
            You have {userLoyaltyPoints} loyalty points. Enjoy additional discounts and exclusive access!
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedTicketing;