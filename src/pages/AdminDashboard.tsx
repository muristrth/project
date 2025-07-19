import React, { useState, useContext } from 'react';
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  UserPlus,
  Mail,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  Shield,
  Scan,
  Store // Added for VendorBooking in EventDetail, also useful here
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent, Event } from '../context/EventContext'; // Import Event interface
import { useToast, AccountingContext, CashflowManagement } from '../components/CashflowManagement'; // Import AccountingContext and CashflowManagement
import MarketingTools from '../components/MarketingTools';
import AccessControl from '../components/AccessControl';

// Re-using Modal component from CashflowManagement
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
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

// Create Event Modal (simplified, can be expanded)
interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { addEvent } = useEvent(); // Use addEvent from EventContext
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [artists, setArtists] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!time) newErrors.time = "Time is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!venue.trim()) newErrors.venue = "Venue is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = "Price must be a positive number.";
    if (!image.trim()) newErrors.image = "Image URL is required.";
    if (!totalTickets || isNaN(parseInt(totalTickets)) || parseInt(totalTickets) <= 0) newErrors.totalTickets = "Total tickets must be a positive number.";
    
    try {
      if (coordinates.trim()) {
        const parsedCoords = JSON.parse(coordinates);
        if (typeof parsedCoords.lat !== 'number' || typeof parsedCoords.lng !== 'number') {
          newErrors.coordinates = "Coordinates must be a valid JSON object like { 'lat': 1.23, 'lng': 4.56 }";
        }
      } else {
        newErrors.coordinates = "Coordinates are required (e.g., { 'lat': 1.23, 'lng': 4.56 })";
      }
    } catch (e) {
      newErrors.coordinates = "Coordinates must be a valid JSON object.";
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
      const parsedArtists = artists.split(',').map(a => a.trim()).filter(a => a);
      const parsedCoordinates = JSON.parse(coordinates);

      const success = await addEvent({
        title,
        description,
        date,
        time,
        location,
        venue,
        category,
        price: parseFloat(price),
        image,
        artists: parsedArtists,
        totalTickets: parseInt(totalTickets),
        coordinates: parsedCoordinates,
      });
      if (success) {
        onClose();
        // Reset form fields
        setTitle(''); setDescription(''); setDate(''); setTime(''); setLocation(''); setVenue('');
        setCategory(''); setPrice(''); setImage(''); setArtists(''); setTotalTickets(''); setCoordinates('');
        setErrors({});
      }
    } catch (error) {
      console.error("Error creating event:", error);
      showToast("Failed to create event. Please check inputs.", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-300 text-sm font-bold mb-2">Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.title ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="Event Title" required />
          {errors.title && <p className="text-red-400 text-xs italic mt-1">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Description:</label>
          <textarea id="description" value={description} onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.description ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="Event Description" rows={3} required />
          {errors.description && <p className="text-red-400 text-xs italic mt-1">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-gray-300 text-sm font-bold mb-2">Date:</label>
            <input type="date" id="date" value={date} onChange={(e) => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.date ? 'border-red-500' : 'focus:border-purple-500'}`} required />
            {errors.date && <p className="text-red-400 text-xs italic mt-1">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="time" className="block text-gray-300 text-sm font-bold mb-2">Time:</label>
            <input type="time" id="time" value={time} onChange={(e) => { setTime(e.target.value); setErrors(prev => ({ ...prev, time: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.time ? 'border-red-500' : 'focus:border-purple-500'}`} required />
            {errors.time && <p className="text-red-400 text-xs italic mt-1">{errors.time}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="location" className="block text-gray-300 text-sm font-bold mb-2">Location (City/Area):</label>
          <input type="text" id="location" value={location} onChange={(e) => { setLocation(e.target.value); setErrors(prev => ({ ...prev, location: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.location ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="e.g., Nairobi" required />
          {errors.location && <p className="text-red-400 text-xs italic mt-1">{errors.location}</p>}
        </div>
        <div>
          <label htmlFor="venue" className="block text-gray-300 text-sm font-bold mb-2">Venue Name:</label>
          <input type="text" id="venue" value={venue} onChange={(e) => { setVenue(e.target.value); setErrors(prev => ({ ...prev, venue: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.venue ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="e.g., The Alchemist" required />
          {errors.venue && <p className="text-red-400 text-xs italic mt-1">{errors.venue}</p>}
        </div>
        <div>
          <label htmlFor="category" className="block text-gray-300 text-sm font-bold mb-2">Category:</label>
          <input type="text" id="category" value={category} onChange={(e) => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.category ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="e.g., Amapiano, EDM, Jazz" required />
          {errors.category && <p className="text-red-400 text-xs italic mt-1">{errors.category}</p>}
        </div>
        <div>
          <label htmlFor="price" className="block text-gray-300 text-sm font-bold mb-2">Base Ticket Price (KES):</label>
          <input type="number" id="price" value={price} onChange={(e) => { setPrice(e.target.value); setErrors(prev => ({ ...prev, price: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.price ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="e.g., 1500" required />
          {errors.price && <p className="text-red-400 text-xs italic mt-1">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="totalTickets" className="block text-gray-300 text-sm font-bold mb-2">Total Tickets Available:</label>
          <input type="number" id="totalTickets" value={totalTickets} onChange={(e) => { setTotalTickets(e.target.value); setErrors(prev => ({ ...prev, totalTickets: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.totalTickets ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="e.g., 500" required />
          {errors.totalTickets && <p className="text-red-400 text-xs italic mt-1">{errors.totalTickets}</p>}
        </div>
        <div>
          <label htmlFor="image" className="block text-gray-300 text-sm font-bold mb-2">Image URL:</label>
          <input type="url" id="image" value={image} onChange={(e) => { setImage(e.target.value); setErrors(prev => ({ ...prev, image: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.image ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder="https://example.com/event.jpg" required />
          {errors.image && <p className="text-red-400 text-xs italic mt-1">{errors.image}</p>}
        </div>
        <div>
          <label htmlFor="artists" className="block text-gray-300 text-sm font-bold mb-2">Artists (comma-separated):</label>
          <input type="text" id="artists" value={artists} onChange={(e) => setArtists(e.target.value)} className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500" placeholder="e.g., DJ Maphorisa, Kabza De Small" />
        </div>
        <div>
          <label htmlFor="coordinates" className="block text-gray-300 text-sm font-bold mb-2">Coordinates (JSON: {'{"lat": 1.23, "lng": 4.56}'}):</label>
          <input type="text" id="coordinates" value={coordinates} onChange={(e) => { setCoordinates(e.target.value); setErrors(prev => ({ ...prev, coordinates: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${errors.coordinates ? 'border-red-500' : 'focus:border-purple-500'}`} placeholder='{"lat": -1.286389, "lng": 36.817223}' required />
          {errors.coordinates && <p className="text-red-400 text-xs italic mt-1">{errors.coordinates}</p>}
        </div>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
        >
          Create Event
        </button>
      </form>
    </Modal>
  );
};


const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events, deleteEvent, updateEvent } = useEvent(); // Use updateEvent from useEvent
  const { showToast } = useToast();
  const { addEvent: addEventToAccounting } = useContext(AccountingContext); // Use addEvent from AccountingContext
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); // Store full event object
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);

  // State for edit form
  const [editFormData, setEditFormData] = useState<Partial<Event>>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic data based on fetched events
  const totalRevenue = events.reduce((sum, event) => sum + (event.soldTickets * event.price), 0);
  const totalTicketsSold = events.reduce((sum, event) => sum + event.soldTickets, 0);
  const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const pastEvents = events.filter(event => new Date(event.date) < new Date());

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'staff', label: 'Staff', icon: UserPlus },
    { id: 'marketing', label: 'Marketing', icon: Mail },
    { id: 'access', label: 'Access Control', icon: Shield },
    { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setEditFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      venue: event.venue,
      category: event.category,
      price: event.price,
      image: event.image,
      artists: event.artists,
      totalTickets: event.totalTickets,
      coordinates: event.coordinates,
    });
    setShowEditEvent(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const newErrors: { [key: string]: string } = {};
    // Basic validation for edit form
    if (!editFormData.title?.trim()) newErrors.title = "Title is required.";
    if (!editFormData.description?.trim()) newErrors.description = "Description is required.";
    if (!editFormData.date) newErrors.date = "Date is required.";
    if (!editFormData.time) newErrors.time = "Time is required.";
    if (!editFormData.location?.trim()) newErrors.location = "Location is required.";
    if (!editFormData.venue?.trim()) newErrors.venue = "Venue is required.";
    if (!editFormData.category?.trim()) newErrors.category = "Category is required.";
    if (editFormData.price === undefined || isNaN(editFormData.price) || editFormData.price <= 0) newErrors.price = "Price must be a positive number.";
    if (editFormData.totalTickets === undefined || isNaN(editFormData.totalTickets) || editFormData.totalTickets <= 0) newErrors.totalTickets = "Total tickets must be a positive number.";
    if (!editFormData.image?.trim()) newErrors.image = "Image URL is required.";
    
    // Coordinates validation for edit form
    try {
      if (editFormData.coordinates) {
        const coordsString = typeof editFormData.coordinates === 'string' ? editFormData.coordinates : JSON.stringify(editFormData.coordinates);
        const parsedCoords = JSON.parse(coordsString);
        if (typeof parsedCoords.lat !== 'number' || typeof parsedCoords.lng !== 'number') {
          newErrors.coordinates = "Coordinates must be a valid JSON object like { 'lat': 1.23, 'lng': 4.56 }";
        }
      } else {
        newErrors.coordinates = "Coordinates are required (e.g., { 'lat': 1.23, 'lng': 4.56 })";
      }
    } catch (e) {
      newErrors.coordinates = "Coordinates must be a valid JSON object.";
    }

    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("Please correct the errors in the form.", "error");
      return;
    }

    try {
      const updatedData = {
        ...editFormData,
        artists: Array.isArray(editFormData.artists)
          ? editFormData.artists
          : typeof editFormData.artists === 'string'
            ? editFormData.artists.split(',').map((a: string) => a.trim()).filter((a: string) => a)
            : (editFormData.artists !== undefined && editFormData.artists !== null)
              ? [String(editFormData.artists)]
              : [],
        coordinates: typeof editFormData.coordinates === 'string' ? JSON.parse(editFormData.coordinates) : editFormData.coordinates,
      } as Partial<Event>; // Cast to Partial<Event>

      const success = await updateEvent(selectedEvent.id, updatedData);
      if (success) {
        setShowEditEvent(false);
        setSelectedEvent(null);
        showToast('Event updated successfully!', 'success');
      }
    } catch (error) {
      console.error("Error updating event:", error);
      showToast('Failed to update event.', 'error');
    }
  };


  const renderOverview = () => (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Revenue</p>
              <p className="text-3xl font-bold">KES {totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Tickets Sold</p>
              <p className="text-3xl font-bold">{totalTicketsSold}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Events</p>
              <p className="text-3xl font-bold">{upcomingEvents.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg. Ticket Price</p>
              <p className="text-3xl font-bold">KES {Math.round(averageTicketPrice)}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Analytics chart will be displayed here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Event Performance</h3>
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{event.title}</h4>
                  <p className="text-gray-400 text-sm">{event.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{event.soldTickets} sold</p>
                  <p className="text-gray-400 text-sm">
                    {Math.round((event.soldTickets / event.totalTickets) * 100)}% capacity
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold text-white mb-2">Prediction</h4>
            <p className="text-purple-200">
              Based on historical data, your next event is likely to sell {Math.round(averageTicketPrice * 1.2)} tickets
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold text-white mb-2">Optimization</h4>
            <p className="text-purple-200">
              Consider pricing VIP tickets 15% higher based on demand patterns
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h4 className="font-semibold text-white mb-2">Trend</h4>
            <p className="text-purple-200">
              Weekend events show 40% higher attendance than weekday events
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Event Management</h2>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-gray-700 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white">{event.title}</h3>
                  <p className="text-gray-400">{event.location}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()} | {event.soldTickets}/{event.totalTickets} sold
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditClick(event)} // Pass the full event object
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this event?')) { // Consider replacing with custom modal
                      const success = await deleteEvent(event.id);
                      if (success) {
                        showToast('Event deleted successfully', 'success');
                      } else {
                        showToast('Failed to delete event', 'error');
                      }
                    }
                  }}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal isOpen={showCreateEvent} onClose={() => setShowCreateEvent(false)} />

      {/* Edit Event Modal */}
      {selectedEvent && (
        <Modal isOpen={showEditEvent} onClose={() => setShowEditEvent(false)} title={`Edit ${selectedEvent.title}`}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="editTitle" className="block text-gray-300 text-sm font-bold mb-2">Title:</label>
              <input type="text" id="editTitle" value={editFormData.title || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, title: e.target.value })); setEditErrors(prev => ({ ...prev, title: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.title ? 'border-red-500' : 'focus:border-purple-500'}`} required />
              {editErrors.title && <p className="text-red-400 text-xs italic mt-1">{editErrors.title}</p>}
            </div>
            <div>
              <label htmlFor="editDescription" className="block text-gray-300 text-sm font-bold mb-2">Description:</label>
              <textarea id="editDescription" value={editFormData.description || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, description: e.target.value })); setEditErrors(prev => ({ ...prev, description: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.description ? 'border-red-500' : 'focus:border-purple-500'}`} rows={3} required />
              {editErrors.description && <p className="text-red-400 text-xs italic mt-1">{editErrors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editDate" className="block text-gray-300 text-sm font-bold mb-2">Date:</label>
                <input type="date" id="editDate" value={editFormData.date || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, date: e.target.value })); setEditErrors(prev => ({ ...prev, date: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.date ? 'border-red-500' : 'focus:border-purple-500'}`} required />
                {editErrors.date && <p className="text-red-400 text-xs italic mt-1">{editErrors.date}</p>}
              </div>
              <div>
                <label htmlFor="editTime" className="block text-gray-300 text-sm font-bold mb-2">Time:</label>
                <input type="time" id="editTime" value={editFormData.time || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, time: e.target.value })); setEditErrors(prev => ({ ...prev, time: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.time ? 'border-red-500' : 'focus:border-purple-500'}`} required />
                {editErrors.time && <p className="text-red-400 text-xs italic mt-1">{editErrors.time}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="editLocation" className="block text-gray-300 text-sm font-bold mb-2">Location:</label>
              <input type="text" id="editLocation" value={editFormData.location || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, location: e.target.value })); setEditErrors(prev => ({ ...prev, location: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.location ? 'border-red-500' : 'focus:border-purple-500'}`} required />
              {editErrors.location && <p className="text-red-400 text-xs italic mt-1">{editErrors.location}</p>}
            </div>
            <div>
              <label htmlFor="editVenue" className="block text-gray-300 text-sm font-bold mb-2">Venue:</label>
              <input type="text" id="editVenue" value={editFormData.venue || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, venue: e.target.value })); setEditErrors(prev => ({ ...prev, venue: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.venue ? 'border-red-500' : 'focus:border-purple-500'}`} required />
              {editErrors.venue && <p className="text-red-400 text-xs italic mt-1">{editErrors.venue}</p>}
            </div>
            <div>
              <label htmlFor="editCategory" className="block text-gray-300 text-sm font-bold mb-2">Category:</label>
              <input type="text" id="editCategory" value={editFormData.category || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, category: e.target.value })); setEditErrors(prev => ({ ...prev, category: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.category ? 'border-red-500' : 'focus:border-purple-500'}`} required />
              {editErrors.category && <p className="text-red-400 text-xs italic mt-1">{editErrors.category}</p>}
            </div>
            <div>
              <label htmlFor="editPrice" className="block text-gray-300 text-sm font-bold mb-2">Base Ticket Price (KES):</label>
              <input type="number" id="editPrice" value={editFormData.price ?? ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) })); setEditErrors(prev => ({ ...prev, price: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.price ? 'border-red-500' : 'focus:border-purple-500'}`} required />
              {editErrors.price && <p className="text-red-400 text-xs italic mt-1">{editErrors.price}</p>}
            </div>
            <div>
              <label htmlFor="editTotalTickets" className="block text-gray-300 text-sm font-bold mb-2">Total Tickets Available:</label>
              <input type="number" id="editTotalTickets" value={editFormData.totalTickets ?? ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, totalTickets: parseInt(e.target.value) })); setEditErrors(prev => ({ ...prev, totalTickets: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.totalTickets ? 'border-red-500' : 'focus:border-purple-500'}`} required />
              {editErrors.totalTickets && <p className="text-red-400 text-xs italic mt-1">{editErrors.totalTickets}</p>}
            </div>
            <div>
              <label htmlFor="editImage" className="block text-gray-300 text-sm font-bold mb-2">Image URL:</label>
              <input type="url" id="editImage" value={editFormData.image || ''} onChange={(e) => { setEditFormData(prev => ({ ...prev, image: e.target.value })); setEditErrors(prev => ({ ...prev, image: '' })); }} className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.image ? 'border-red-500' : 'focus:border-purple-500'}`} required />
              {editErrors.image && <p className="text-red-400 text-xs italic mt-1">{editErrors.image}</p>}
            </div>
            <div>
              <label htmlFor="editArtists" className="block text-gray-300 text-sm font-bold mb-2">Artists (comma-separated):</label>
              <input type="text" id="editArtists" value={Array.isArray(editFormData.artists) ? editFormData.artists.join(', ') : editFormData.artists || ''} onChange={(e) => setEditFormData(prev => ({ ...prev, artists: e.target.value.split(',').map(a => a.trim()).filter(a => a) }))} className="shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500" />
            </div>
            <div>
              <label htmlFor="editCoordinates" className="block text-gray-300 text-sm font-bold mb-2">Coordinates (JSON: {'{"lat": 1.23, "lng": 4.56}'}):</label>
              <input
                type="text"
                id="editCoordinates"
                value={JSON.stringify(editFormData.coordinates) || ''}
                onChange={(e) => {
                  let parsed;
                  try {
                    parsed = JSON.parse(e.target.value);
                  } catch {
                    parsed = undefined;
                  }
                  setEditFormData(prev => ({
                    ...prev,
                    coordinates: parsed
                  }));
                  setEditErrors(prev => ({ ...prev, coordinates: '' }));
                }}
                className={`shadow appearance-none border rounded-lg w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline ${editErrors.coordinates ? 'border-red-500' : 'focus:border-purple-500'}`}
                required
              />
              {editErrors.coordinates && <p className="text-red-400 text-xs italic mt-1">{editErrors.coordinates}</p>}
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors"
            >
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
          Export Users
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-purple-400">2,847</p> {/* This should come from a user count in Firestore */}
          <p className="text-sm text-gray-400">+12% from last month</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-2">Active Subscribers</h3>
          <p className="text-3xl font-bold text-green-400">456</p> {/* This should come from user data in Firestore */}
          <p className="text-sm text-gray-400">+8% from last month</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-2">Avg. Age</h3>
          <p className="text-3xl font-bold text-orange-400">22.5</p> {/* This would require user age data */}
          <p className="text-sm text-gray-400">Target: 18-25</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">User Analytics</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">User demographics chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Staff Management</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2">
          <UserPlus className="w-5 h-5" />
          <span>Add Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Admin', 'Manager', 'Gate Staff'].map((role) => (
          <div key={role} className="bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">{role}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-semibold">
                  {role === 'Admin' ? '3' : role === 'Manager' ? '8' : '15'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active</span>
                <span className="text-green-400 font-semibold">
                  {role === 'Admin' ? '3' : role === 'Manager' ? '7' : '12'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Staff List</h3>
        <div className="space-y-4">
          {[
            { name: 'John Doe', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
            { name: 'Jane Smith', role: 'Manager', status: 'Active', lastLogin: '5 hours ago' },
            { name: 'Mike Johnson', role: 'Gate Staff', status: 'Active', lastLogin: '1 day ago' },
          ].map((staff, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{staff.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{staff.name}</h4>
                  <p className="text-gray-400 text-sm">{staff.role}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-400 text-sm">{staff.status}</span>
                <p className="text-gray-400 text-sm">{staff.lastLogin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Revenue</span>
              <span className="text-white font-semibold">KES {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Costs</span>
              <span className="text-white font-semibold">KES {Math.round(totalRevenue * 0.6).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-3">
              <span className="text-gray-400">Net Profit</span>
              <span className="text-green-400 font-semibold">KES {Math.round(totalRevenue * 0.4).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Event Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg. Attendance</span>
              <span className="text-white font-semibold">85%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Customer Satisfaction</span>
              <span className="text-white font-semibold">4.8/5</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-3">
              <span className="text-gray-400">Repeat Customers</span>
              <span className="text-green-400 font-semibold">68%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Generated Reports</h3>
        <div className="space-y-4">
          {[
            { name: 'Monthly Revenue Report', date: '2025-01-15', type: 'Financial' },
            { name: 'Event Performance Analysis', date: '2025-01-12', type: 'Analytics' },
            { name: 'Customer Demographics', date: '2025-01-10', type: 'CRM' },
          ].map((report, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">{report.name}</h4>
                <p className="text-gray-400 text-sm">{report.type} | Generated on {report.date}</p>
              </div>
              <button className="text-purple-400 hover:text-purple-300 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-2">
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{user?.name}</h3>
                  <p className="text-gray-400 text-sm">Administrator</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'staff' && renderStaff()}
            {activeTab === 'marketing' && <MarketingTools userRole={user?.role || 'user'} />}
            {activeTab === 'access' && <AccessControl userRole={user?.role || 'user'} />}
            {activeTab === 'cashflow' && <CashflowManagement userRole={user?.role || 'user'} />}
            {activeTab === 'reports' && renderReports()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
