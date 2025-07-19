import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Filter, Search, ArrowRight } from 'lucide-react';
import { useEvent } from '../context/EventContext'; // Updated import

const Events: React.FC = () => {
  const { events } = useEvent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' ||
                           (filterType === 'upcoming' && new Date(event.date) > new Date()) ||
                           (filterType === 'past' && new Date(event.date) < new Date());
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">All Events</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover the hottest Amapiano and 3Step events in Nairobi
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="title">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const isUpcoming = new Date(event.date) > new Date();
            
            return (
              <div
                key={event.id}
                className="bg-gray-800 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    KES {event.price}
                  </div>
                  {!isUpcoming && (
                    <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                      Past Event
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className={`w-full py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      isUpcoming
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span>{isUpcoming ? 'Get Tickets' : 'View Details'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
