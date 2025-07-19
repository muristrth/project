import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CreditCard,
  User,
  Star,
  History,
  Crown,
  Ticket,
  Settings,
  Gift,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Updated import
import { useEvent } from '../context/EventContext'; // Updated import

const Dashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { events } = useEvent();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to access your dashboard</h2>
          <Link to="/login" className="bg-purple-600 text-white px-6 py-3 rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Filter events based on user's purchase history from Firebase
  const userEvents = events.filter(event =>
    user.purchaseHistory.includes(event.id)
  );

  const upcomingEvents = userEvents.filter(event =>
    new Date(event.date) > new Date()
  );

  const pastEvents = userEvents.filter(event =>
    new Date(event.date) < new Date()
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h2>
            <p className="text-purple-200 mt-2">Ready for your next Amapiano experience?</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-yellow-400">
              <Star className="w-5 h-5" />
              <span className="font-semibold">{user.loyaltyPoints} Points</span>
            </div>
            <p className="text-purple-200 text-sm mt-1">Loyalty Balance</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-white">{userEvents.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Loyalty Points</p>
              <p className="text-2xl font-bold text-white">{user.loyaltyPoints}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-2xl font-bold text-white capitalize">{user.subscriptionStatus}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Upcoming Events</h3>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{event.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/events/${event.id}`}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No upcoming events</p>
            <Link to="/events" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
              Browse events
            </Link>
          </div>
        )}
      </div>

      {/* Loyalty Program */}
      <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Loyalty Program</h3>
            <p className="text-yellow-200 mt-2">Earn points with every purchase and unlock exclusive rewards</p>
          </div>
          <Gift className="w-12 h-12 text-yellow-400" />
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-yellow-200">Current Points: {user.loyaltyPoints}</span>
            <span className="text-yellow-200">Next Reward: 500 points</span>
          </div>
          <div className="w-full bg-yellow-800 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((user.loyaltyPoints / 500) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">My Tickets</h3>
        {userEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userEvents.map((event) => (
              <div key={event.id} className="bg-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">{event.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    new Date(event.date) > new Date()
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-900 text-gray-300'
                  }`}>
                    {new Date(event.date) > new Date() ? 'Valid' : 'Used'}
                  </span>
                </div>
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-gray-800 font-mono text-xs">QR CODE</span>
                    </div>
                    <p className="text-xs text-gray-400">Ticket ID: {event.id.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No tickets found</p>
            <Link to="/events" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
              Browse events
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubscription = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Subscription Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="text-center">
              <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white">
                {user.subscriptionStatus === 'active' ? 'Premium Active' : 'No Subscription'}
              </h4>
              <p className="text-gray-400 mt-2">
                {user.subscriptionStatus === 'active'
                  ? 'Unlimited access to all events'
                  : 'Subscribe for unlimited access'
                }
              </p>
            </div>
            
            {user.subscriptionStatus === 'active' ? (
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-6">
                <h5 className="font-semibold text-green-400 mb-2">Benefits</h5>
                <ul className="space-y-2 text-sm text-green-300">
                  <li>✓ Unlimited event access</li>
                  <li>✓ Priority booking</li>
                  <li>✓ Exclusive events</li>
                  <li>✓ VIP support</li>
                  <li>✓ Special discounts</li>
                </ul>
              </div>
            ) : (
              <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-6">
                <h5 className="font-semibold text-purple-400 mb-2">Premium Benefits</h5>
                <ul className="space-y-2 text-sm text-purple-300">
                  <li>• Unlimited event access</li>
                  <li>• Priority booking</li>
                  <li>• Exclusive events</li>
                  <li>• VIP support</li>
                  <li>• Special discounts</li>
                </ul>
                <button
                  onClick={() => updateUser({ subscriptionStatus: 'active' })}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Subscribe Now - KES 2,500/month
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-gray-700 rounded-xl p-6">
            <h5 className="font-semibold text-white mb-4">Subscription Analytics</h5>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Events Attended</span>
                <span className="text-white font-semibold">{userEvents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Money Saved</span>
                <span className="text-green-400 font-semibold">KES {userEvents.length * 500}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Member Since</span>
                <span className="text-white font-semibold">Dec 2024</span> {/* This should come from user.createdAt */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Purchase History</h3>
        {pastEvents.length > 0 ? (
          <div className="space-y-4">
            {pastEvents.map((event) => (
              <div key={event.id} className="bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{event.title}</h4>
                    <p className="text-sm text-gray-400">{event.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">KES {event.price}</p>
                  <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No purchase history</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={user.name}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                readOnly
              />
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Notifications</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox text-purple-600" defaultChecked />
                <span className="text-gray-300">Email notifications for new events</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox text-purple-600" defaultChecked />
                <span className="text-gray-300">SMS notifications for ticket confirmations</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox text-purple-600" />
                <span className="text-gray-300">Marketing emails</span>
              </label>
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
                  <span className="text-white font-bold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <p className="text-gray-400 text-sm capitalize">{user.role}</p>
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
            {activeTab === 'tickets' && renderTickets()}
            {activeTab === 'subscription' && renderSubscription()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
