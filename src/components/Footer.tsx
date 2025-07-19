import React from 'react';
import { Instagram, Phone, Mail, MapPin, Music, Calendar, Users } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">IE</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ignition
              </span>
            </div>
            <p className="text-gray-400">
              The ultimate Amapiano & 3Step experience in Nairobi. Creating unforgettable nights and building the music community.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/ignition.entertainment/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://www.facebook.com/ignition.entertainment/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Users className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/events" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </a></li>
              <li><a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/subscription" className="text-gray-400 hover:text-white transition-colors">Subscription</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/refund" className="text-gray-400 hover:text-white transition-colors">Refund Policy</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <a href="tel:+254700000000" className="text-gray-400 hover:text-white transition-colors">
                  +254 700 000 000
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <a href="mailto:support@ignition.co.ke" className="text-gray-400 hover:text-white transition-colors">
                  support@ignition.co.ke
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Instagram className="w-5 h-5 text-purple-400" />
                <a 
                  href="https://www.instagram.com/ignition.entertainment/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  @ignition.entertainment
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400">Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2025 Ignition Entertainment. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;