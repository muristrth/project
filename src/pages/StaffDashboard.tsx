import React, { useState } from 'react';
import {
  Scan,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Updated import
import { useEvent } from '../context/EventContext'; // Updated import
import { useToast } from '../context/ToastContext';
import AccessControl from '../components/AccessControl';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events, updateEvent } = useEvent(); // Assuming updateEvent might be used for scanning
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('scan');
  const [scannedTickets, setScannedTickets] = useState<string[]>([]); // This would ideally be fetched from Firestore
  const [scanResult, setScanResult] = useState<string | null>(null);

  if (!user || user.role !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const todayEvents = events.filter(event =>
    new Date(event.date).toDateString() === new Date().toDateString()
  );

  const tabs = [
    { id: 'scan', label: 'Access Control', icon: Scan },
    { id: 'events', label: 'Today\'s Events', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: Users },
  ];

  const renderTodayEvents = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Today's Events</h2>
        <p className="text-gray-400">Events happening today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {todayEvents.length > 0 ? (
          todayEvents.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  Active
                </span>
              </div>
              
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{event.soldTickets} / {event.totalTickets} tickets</span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Scanned</span>
                  {/* This needs to come from actual scanned ticket data in Firestore */}
                  <span className="text-white font-semibold">
                    {Math.round(event.soldTickets * 0.8)} / {event.soldTickets}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: '80%' }} // This should be dynamic based on actual scans
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No events scheduled for today</p>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Upcoming Events</h3>
        <div className="space-y-4">
          {upcomingEvents.slice(0, 5).map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white">{event.title}</h4>
                  <p className="text-gray-400 text-sm">{event.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-400 text-sm">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Scan Statistics</h2>
        <p className="text-gray-400">Your scanning performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Tickets Scanned</p>
              <p className="text-3xl font-bold">{scannedTickets.length}</p>
            </div>
            <Scan className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Valid Scans</p>
              <p className="text-3xl font-bold">{scannedTickets.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Invalid Scans</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <XCircle className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Daily Performance</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Performance chart will be displayed here</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Shift Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Current Shift</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Start Time</span>
                <span className="text-white">6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End Time</span>
                <span className="text-white">2:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">8 hours</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Assigned Events</h4>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex justify-between">
                  <span className="text-gray-400">{event.title}</span>
                  <span className="text-white">Gate 1</span>
                </div>
              ))}
            </div>
          </div>
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
                  <p className="text-gray-400 text-sm">Staff Member</p>
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
            {activeTab === 'scan' && <AccessControl userRole={user?.role || 'user'} />}
            {activeTab === 'events' && renderTodayEvents()}
            {activeTab === 'stats' && renderStats()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
