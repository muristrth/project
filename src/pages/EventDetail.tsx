import React, { useState, useContext } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  CreditCard,
  Star,
  Navigation,
  Phone,
  Mail,
  ExternalLink,
  Store // Added for VendorBooking
} from 'lucide-react';
import { useEvent } from '../context/EventContext'; // Updated import
import { useAuth } from '../context/AuthContext'; // Updated import
import { useToast } from '../context/ToastContext';
import AdvancedTicketing from '../components/AdvancedTicketing';
import EventMap from '../components/EventMap';
import VendorBooking from '../components/VendorBooking';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { events, addToCart } = useEvent();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showVendorBooking, setShowVendorBooking] = useState(false);

  const event = events.find(e => e.id === id);

  if (!event) {
    return <Navigate to="/events" replace />;
  }

  const isUpcoming = new Date(event.date) > new Date();

  const handleAddToCart = async (ticket: any, quantity: number) => {
    if (!user) {
      showToast('Please login to purchase tickets', 'error');
      return;
    }

    // Add to cart instead of direct purchase
    const cartItem = {
      eventId: event.id,
      eventTitle: event.title,
      ticketType: ticket.name,
      quantity,
      price: ticket.price,
      total: ticket.price * quantity
    };
    
    addToCart(cartItem);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      document.execCommand('copy'); // Fallback for clipboard copy
      showToast('Link copied to clipboard!', 'success');
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <div className="relative mb-12">
          <div className="relative h-[500px] rounded-3xl overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-12 left-12 right-12">
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold mb-4">
                  {event.category.toUpperCase()}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-200">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6" />
                  <span className="text-lg">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6" />
                  <span className="text-lg">{event.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6" />
                  <span className="text-lg">{event.soldTickets} / {event.totalTickets}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Enhanced Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-3xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Event Details</h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Date & Time</p>
                      <p className="text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                      <p className="text-gray-400">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Venue</p>
                      <p className="text-gray-400">{event.venue}</p>
                      <p className="text-gray-400">{event.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Capacity</p>
                      <p className="text-gray-400">{event.totalTickets} people</p>
                      <p className="text-green-400">{event.totalTickets - event.soldTickets} tickets left</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Duration</p>
                      <p className="text-gray-400">8:00 PM - 6:00 AM</p>
                      <p className="text-gray-400">10 hours of non-stop music</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Artists Section */}
            <div className="bg-gray-800 rounded-3xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Featured Artists</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {event.artists.map((artist, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-lg">{artist.charAt(0)}</span>
                    </div>
                    <h4 className="text-white font-bold">{artist}</h4>
                    <p className="text-gray-400 text-sm">Headliner</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Location Map */}
            <EventMap
              location={event.location}
              venue={event.venue}
              coordinates={event.coordinates}
              eventDate={new Date(event.date).toLocaleDateString()}
              eventTime={event.time}
            />

            {/* Enhanced Contact & Support */}
            <div className="bg-gray-800 rounded-3xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a
                  href="tel:+254700000000"
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Phone className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-white font-bold">Customer Support</p>
                    <p className="text-purple-100">+254 700 000 000</p>
                  </div>
                </a>
                
                <a
                  href="https://wa.me/254700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-green-600">W</span>
                  <div>
                    <p className="text-white font-bold">WhatsApp</p>
                    <p className="text-green-100">Instant Support</p>
                  </div>
                </a>
                
                <button
                  onClick={() => setShowVendorBooking(true)}
                  className="flex items-center space-x-4 p-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all"
                >
                  <Store className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-white font-bold">Vendor Space</p>
                    <p className="text-orange-100">Book Your Stand</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Enhanced Share Section */}
            <div className="bg-gray-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Share this Event</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
                
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  <span>Facebook</span>
                </a>
                
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
                >
                  <span>Twitter</span>
                </a>
                
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${event.title} at ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Enhanced Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-3xl p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-white mb-8">Get Your Tickets</h3>
              
              {isUpcoming ? (
                <AdvancedTicketing
                  eventId={event.id}
                  eventTitle={event.title}
                  basePrice={event.price}
                  onAddToCart={handleAddToCart}
                  userLoyaltyPoints={user?.loyaltyPoints}
                  userPurchaseHistory={user?.purchaseHistory} totalEventTickets={0} soldEventTickets={0}                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-xl mb-2">Event has ended</p>
                  <p className="text-gray-500 text-sm">Check out our upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Vendor Booking Modal */}
      <VendorBooking
        isOpen={showVendorBooking}
        onClose={() => setShowVendorBooking(false)}
        eventId={event.id}
        eventTitle={event.title}
      />
    </div>
  );
};

export default EventDetail;
