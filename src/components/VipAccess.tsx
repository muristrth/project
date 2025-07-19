"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const subscriptionPlans = [
  {
    name: "CLUB ACCESS",
    price: "KSH 5,000",
    period: "/month",
    description: "Always-entry access to Ignition Club",
    features: [
      "Unlimited club entry",
      "Skip the line privilege",
      "10% discount on drinks",
      "Exclusive member events",
      "Priority customer support"
    ],
    popular: false,
    color: "from-slate-600 to-slate-700"
  },
  {
    name: "ALL EVENTS VIP",
    price: "KSH 12,000",
    period: "/month",
    description: "Premium access to all Ignition Entertainment events",
    features: [
      "All club access benefits",
      "Free entry to ALL events",
      "VIP seating at events",
      "Meet & greet with artists",
      "Exclusive merchandise",
      "Free event photography",
      "Concierge service"
    ],
    popular: true,
    color: "from-purple-600 to-pink-600"
  },
  {
    name: "ULTIMATE EXPERIENCE",
    price: "KSH 25,000",
    period: "/month",
    description: "The complete Ignition Entertainment lifestyle",
    features: [
      "All VIP benefits included",
      "Private table reservations",
      "Complimentary bottle service",
      "Backstage access",
      "Personal event coordinator",
      "Exclusive after-parties",
      "Artist collaboration opportunities",
      "Annual VIP retreat"
    ],
    popular: false,
    color: "from-yellow-500 to-orange-600"
  }
];

export default function VipAccess() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900/30 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              VIP
            </span>{" "}
            <span className="text-white">ACCESS</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Elevate your nightlife experience with exclusive memberships designed for true music lovers
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative group hover:scale-105 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-4 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <span className="text-white text-2xl font-bold">
                    {plan.name.charAt(0)}
                  </span>
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                {/* Pricing */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-lg">{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-1">✓</span>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {plan.popular ? "Get VIP Access" : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 max-w-4xl mx-auto border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Why Choose VIP Access?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🎵</div>
                <h4 className="font-semibold text-white mb-2">Exclusive Events</h4>
                <p className="text-slate-300 text-sm">Access to members-only events and artist meet & greets</p>
              </div>
              <div>
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-white mb-2">Skip The Lines</h4>
                <p className="text-slate-300 text-sm">VIP entry and priority service at all venues</p>
              </div>
              <div>
                <div className="text-3xl mb-2">💎</div>
                <h4 className="font-semibold text-white mb-2">Premium Experience</h4>
                <p className="text-slate-300 text-sm">Enhanced amenities and personalized service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">Have questions about VIP memberships?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="ghost" size="lg">
              📞 Call +254 700 123 456
            </Button>
            <Button variant="ghost" size="lg">
              💬 WhatsApp Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
