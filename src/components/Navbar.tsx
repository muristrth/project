import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ShoppingCart, Calendar, Settings, Phone, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import Cart from './Cart';
import VendorBooking from './VendorBooking';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showVendorBooking, setShowVendorBooking] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useEvent();
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Events', href: '/events', icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
  <img
    src="https://img.freepik.com/free-photo/excited-audience-watching-confetti-fireworks-having-fun-music-festival-night-copy-space_637285-559.jpg?semt=ais_hybrid&w=740"
    alt="IGNITION ENTERTAINMENT"
    className="w-full h-full object-cover rounded-lg"
  />
</div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                IGNITE THE HYPE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Customer Care */}
              <a
                href="tel:+254700000000"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">Support</span>
              </a>

              {/* Vendor Booking */}
              <button
                onClick={() => setShowVendorBooking(true)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Store className="w-4 h-4" />
                <span className="text-sm">Vendors</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Admin Panel
                      </Link>
                    )}
                    {user.role === 'staff' && (
                      <Link to="/staff" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Staff Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile Cart Button */}
                <button
                  onClick={() => {
                    setShowCart(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart ({cart.length})</span>
                </button>

                {/* Mobile Support */}
                <a
                  href="tel:+254700000000"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Customer Support</span>
                </a>
                
                {/* Mobile Vendor Button */}
                <button
                  onClick={() => {
                    setShowVendorBooking(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span>Vendor Booking</span>
                </button>
                
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    {user.role === 'staff' && (
                      <Link
                        to="/staff"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Staff Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all text-left"
                    >
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2 border-t border-gray-800">
                    <Link
                      to="/login"
                      className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Modal */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
      
      {/* Vendor Booking Modal */}
      <VendorBooking 
        isOpen={showVendorBooking} 
        onClose={() => setShowVendorBooking(false)}
        eventTitle="Upcoming Events"
      />
    </>
  );
};

export default Navbar;