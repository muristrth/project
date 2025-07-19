import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Phone, Clock, Calendar } from 'lucide-react';
import { useToast } from '../components/CashflowManagement'; // Assuming ToastContext is available

interface EventMapProps {
  location: string;
  venue: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: string;
  eventDate?: string;
  eventTime?: string;
}

const EventMap: React.FC<EventMapProps> = ({
  location,
  venue,
  coordinates,
  address,
  eventDate,
  eventTime
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { showToast } = useToast();

  const handleGetDirections = () => {
    const encodedLocation = encodeURIComponent(`${venue}, ${location}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCallVenue = () => {
    // This would typically be a venue-specific number fetched from event data
    // For now, using a placeholder
    window.open('tel:+254700000000', '_self');
  };

  // Simulate map loading for visual effect
  React.useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-800 rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Location & Directions</h3>

      {/* Interactive Map Container */}
      <div className="aspect-video bg-gray-700 rounded-2xl mb-6 relative overflow-hidden">
        {mapLoaded ? (
          <div className="absolute inset-0">
            {/* Simulated Map Interface */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-white font-bold text-lg">{venue}</p>
                  <p className="text-gray-300 text-sm">{location}</p>
                  {coordinates && (
                    <p className="text-gray-400 text-xs mt-1">
                      {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Map Overlay Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-all">
                <span className="text-lg font-bold">+</span>
              </button>
              <button className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-all">
                <span className="text-lg font-bold">-</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-2xl p-6">
          <h4 className="text-white font-bold mb-4">Event Details</h4>
          <div className="space-y-3">
            {eventDate && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">{eventDate}</span>
              </div>
            )}
            {eventTime && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">{eventTime}</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">{venue}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-2xl p-6">
          <h4 className="text-white font-bold mb-4">Venue Information</h4>
          <div className="space-y-3">
            <p className="text-gray-300">{location}</p>
            {address && <p className="text-gray-400 text-sm">{address}</p>}
            <button
              onClick={handleCallVenue}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Venue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleGetDirections}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
        >
          <Navigation className="w-5 h-5" />
          <span>Get Directions</span>
        </button>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue}, ${location}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
        >
          <ExternalLink className="w-5 h-5" />
          <span>Open in Maps</span>
        </a>

        <button
          onClick={() => {
            const shareData = {
              title: `${venue} - ${location}`,
              text: `Check out this venue: ${venue} in ${location}`,
              url: window.location.href
            };

            if (navigator.share) {
              navigator.share(shareData);
            } else {
              // Fallback for browsers that don't support navigator.share
              const dummyTextArea = document.createElement('textarea');
              dummyTextArea.value = window.location.href;
              document.body.appendChild(dummyTextArea);
              dummyTextArea.select();
              document.execCommand('copy');
              document.body.removeChild(dummyTextArea);
              showToast('Link copied to clipboard!', 'success'); // Use showToast instead of alert
            }
          }}
          className="bg-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center space-x-2"
        >
          <span>Share Location</span>
        </button>
      </div>
    </div>
  );
};

export default EventMap;
