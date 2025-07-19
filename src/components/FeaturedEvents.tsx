"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const featuredEvents = [
  {
    id: 1,
    title: "AMAPIANO FRIDAY",
    date: "2025-01-24",
    time: "9:00 PM",
    venue: "Ignition Club, Nairobi",
    description: "The hottest Amapiano night in the city featuring top DJs and live performances",
    image: "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/77/ea/8b.jpg",
    price: "KSH 1,500",
    vipPrice: "KSH 3,000",
    artists: ["DJ Maphorisa", "Kabza De Small", "Local Artists"],
    status: "selling"
  },
  {
    id: 2,
    title: "3STEP SATURDAY",
    date: "2025-01-25",
    time: "8:00 PM",
    venue: "Westlands Arena, Nairobi",
    description: "Experience the new wave of 3Step music with exclusive performances",
    image: "https://i.guim.co.uk/img/media/2b739bda5f193800f8dc1be58605866c622cf7ca/0_287_5351_3211/master/5351.jpg?width=465&dpr=1&s=none&crop=none",
    price: "KSH 2,000",
    vipPrice: "KSH 4,000",
    artists: ["3Step Kings", "Rising Stars", "Local Mix"],
    status: "hot"
  },
  {
    id: 3,
    title: "WEEKEND VIBES",
    date: "2025-01-26",
    time: "7:00 PM",
    venue: "Sky Lounge, CBD",
    description: "The ultimate weekend experience with both Amapiano and 3Step",
    image: "https://www.kenyanvibe.com/wp-content/uploads/2025/05/2-scaled.jpg",
    price: "KSH 1,800",
    vipPrice: "KSH 3,500",
    artists: ["Mixed Artists", "Special Guests"],
    status: "new"
  }
];

export default function FeaturedEvents() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              FEATURED
            </span>{" "}
            <span className="text-white">EVENTS</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Don't miss out on the hottest Amapiano & 3Step events in Nairobi
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEvents.map((event) => (
            <Link to={`/events/${event.id}`}>
              <Card className="group cursor-pointer hover:scale-105 transition-all duration-300">
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge
                    variant={event.status === 'hot' ? 'destructive' : event.status === 'new' ? 'default' : 'secondary'}
                    className="text-xs font-bold"
                  >
                    {event.status === 'hot' ? '🔥 HOT' : event.status === 'new' ? '✨ NEW' : '🎵 SELLING FAST'}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <CardHeader>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription>
                  <div className="space-y-2">
                    <div className="flex items-center text-purple-300">
                      <span className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      <span className="mx-2">•</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="text-slate-400">📍 {event.venue}</div>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {event.description}
                </p>

                {/* Artists */}
                <div className="mb-4">
                  <p className="text-xs text-purple-300 font-semibold mb-2">FEATURING:</p>
                  <div className="flex flex-wrap gap-1">
                    {event.artists.map((artist, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {artist}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-slate-400">Regular: </span>
                    <span className="text-white font-bold">{event.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">VIP: </span>
                    <span className="text-purple-300 font-bold">{event.vipPrice}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Share Event
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Get Tickets
                </Button>
              </CardFooter>
            </Card>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button variant="glow" size="lg" className="min-w-[250px]">
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
}
