import React, { useState, useContext } from 'react';
import { X, Store, Calculator, CreditCard, MapPin, Package, Users, DollarSign } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { FirebaseContext } from '../components/CashflowManagement'; // Import FirebaseContext
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Declare global variables for TypeScript (provided by Canvas environment)
declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

interface VendorBookingProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  eventTitle?: string;
}

interface VendorFormData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  spaceType: string;
  spaceSize: string;
  itemsForSale: string;
  specialRequirements: string;
  eventDate: string; // This should ideally be derived from the eventId
}

const VendorBooking: React.FC<VendorBookingProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle = "Selected Event"
}) => {
  const { showToast } = useToast();
  const { firestoreDb, isAuthReady, userId } = useContext(FirebaseContext); // Get Firebase context
  const [formData, setFormData] = useState<VendorFormData>({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: 'food',
    spaceType: 'table',
    spaceSize: 'small',
    itemsForSale: '',
    specialRequirements: '',
    eventDate: '' // Will try to set this from eventId if available
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessTypes = [
    { value: 'food', label: 'Food & Beverages', multiplier: 1.2 },
    { value: 'fashion', label: 'Fashion & Accessories', multiplier: 1.0 },
    { value: 'electronics', label: 'Electronics & Gadgets', multiplier: 1.1 },
    { value: 'beauty', label: 'Beauty & Cosmetics', multiplier: 1.0 },
    { value: 'art', label: 'Art & Crafts', multiplier: 0.9 },
    { value: 'services', label: 'Services', multiplier: 0.8 },
    { value: 'other', label: 'Other', multiplier: 1.0 }
  ];

  const spaceTypes = [
    { value: 'table', label: 'Table Space', basePrice: 5000 },
    { value: 'booth', label: 'Booth/Stand', basePrice: 8000 },
    { value: 'kiosk', label: 'Kiosk', basePrice: 12000 },
    { value: 'truck', label: 'Food Truck Space', basePrice: 15000 },
    { value: 'stage', label: 'Performance Stage', basePrice: 25000 }
  ];

  const spaceSizes = [
    { value: 'small', label: 'Small (2x2m)', multiplier: 1.0 },
    { value: 'medium', label: 'Medium (3x3m)', multiplier: 1.5 },
    { value: 'large', label: 'Large (4x4m)', multiplier: 2.0 },
    { value: 'extra-large', label: 'Extra Large (5x5m)', multiplier: 2.5 }
  ];

  const calculatePrice = () => {
    const businessType = businessTypes.find(bt => bt.value === formData.businessType);
    const spaceType = spaceTypes.find(st => st.value === formData.spaceType);
    const spaceSize = spaceSizes.find(ss => ss.value === formData.spaceSize);

    if (!businessType || !spaceType || !spaceSize) return 0;

    const basePrice = spaceType.basePrice;
    const businessMultiplier = businessType.multiplier;
    const sizeMultiplier = spaceSize.multiplier;

    return Math.round(basePrice * businessMultiplier * sizeMultiplier);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firestoreDb || !isAuthReady || !userId) {
      showToast("Firebase not ready or user not authenticated.", "error");
      return;
    }

    // Validation
    if (!formData.businessName || !formData.contactName || !formData.email || !formData.phone || !formData.eventDate) {
      showToast('Please fill in all required fields, including Event Date.', 'error');
      return;
    }

    setIsSubmitting(true);
    showToast('Submitting vendor booking request...', 'info');

    const totalPrice = calculatePrice();

    try {
      const vendorBookingsRef = collection(firestoreDb, `artifacts/${appId}/public/data/vendorBookings`);
      await addDoc(vendorBookingsRef, {
        ...formData,
        eventId: eventId || null,
        eventTitle: eventTitle,
        totalPrice: totalPrice,
        status: 'pending', // e.g., 'pending', 'approved', 'rejected'
        submittedBy: userId, // Record who submitted the request
        submissionDate: serverTimestamp(),
      });

      showToast(`Vendor space request submitted successfully! Total: KES ${totalPrice.toLocaleString()}`, 'success');
      onClose();
      // Reset form
      setFormData({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        businessType: 'food',
        spaceType: 'table',
        spaceSize: 'small',
        itemsForSale: '',
        specialRequirements: '',
        eventDate: ''
      });
    } catch (error) {
      console.error("Error submitting vendor booking:", error);
      showToast("Failed to submit vendor booking. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = calculatePrice();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Vendor Booking</h2>
              <p className="text-gray-400">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Form Section */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="bg-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Store className="w-5 h-5" />
                  <span>Business Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Business Name *</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter business name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+254 700 000 000"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-white font-medium mb-2">Business Type</label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Space Requirements */}
              <div className="bg-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Space Requirements</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Space Type</label>
                    <select
                      name="spaceType"
                      value={formData.spaceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {spaceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} - KES {type.basePrice.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Space Size</label>
                    <select
                      name="spaceSize"
                      value={formData.spaceSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {spaceSizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-white font-medium mb-2">Items for Sale</label>
                  <textarea
                    name="itemsForSale"
                    value={formData.itemsForSale}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={3}
                    placeholder="Describe what you'll be selling..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-white font-medium mb-2">Special Requirements</label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={2}
                    placeholder="Power supply, water access, etc."
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-white font-medium mb-2">Event Date *</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Pricing Summary */}
          <div className="lg:w-80 bg-gray-700 p-6">
            <div className="sticky top-0">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Pricing Summary</span>
              </h3>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Base Price</span>
                    <span className="text-white font-semibold">
                      KES {spaceTypes.find(st => st.value === formData.spaceType)?.basePrice.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Business Type</span>
                    <span className="text-white font-semibold">
                      {businessTypes.find(bt => bt.value === formData.businessType)?.multiplier}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Size Multiplier</span>
                    <span className="text-white font-semibold">
                      {spaceSizes.find(ss => ss.value === formData.spaceSize)?.multiplier}x
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center text-2xl font-bold text-white">
                    <span>Total</span>
                    <span className="text-green-400">KES {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-semibold mb-2">What's Included:</h4>
                  <ul className="text-green-300 text-sm space-y-1">
                    <li>• Designated space for duration of event</li>
                    <li>• Basic setup assistance</li>
                    <li>• Access to event attendees</li>
                    <li>• Marketing exposure</li>
                    <li>• Security coverage</li>
                  </ul>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Book Space - KES {totalPrice.toLocaleString()}</span>
                    </>
                  )}
                </button>

                <p className="text-gray-400 text-xs text-center">
                  Payment will be processed securely. You'll receive confirmation via email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBooking;
