import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Star,
  ArrowRight,
  Users,
  Shield,
  TrendingUp,
  DollarSign,
  MapPin,
  Phone,
  Music,
  Zap
} from 'lucide-react';
import FeaturedEvents from '@/components/FeaturedEvents';
import VipAccess from '@/components/VipAccess';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🎥 Hero Section with Background Video */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
        >
          <source
            src="https://assets.mixkit.co/videos/4344/4344-720.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-black/60 to-orange-900/80 z-0" />

        {/* 🔥 Hero Content */}
        <div className="relative z-10 px-4 text-center max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-extrabold uppercase tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-transparent bg-clip-text">
            Ignition
          </h1>
          <h2 className="text-4xl md:text-5xl font-black uppercase mt-2 drop-shadow-lg">
            Entertainment
          </h2>

          <p className="mt-6 text-lg md:text-xl font-light text-gray-200">
            Nairobi’s wildest <span className="text-pink-400 font-semibold">Amapiano</span> &
            <span className="text-orange-400 font-semibold"> 3Step</span> parties are calling.
          </p>
          <p className="mt-2 text-md md:text-lg text-gray-400 font-medium">
            If you're 18+, love insane beats, and want a night to remember — you belong here.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/events"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold hover:scale-105 transition transform shadow-lg flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Explore Events
            </Link>

            <Link
              to="/vip"
              className="px-8 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition backdrop-blur-md flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              Get VIP Access
            </Link>
          </div>

          <div className="flex justify-center mt-10 gap-10 text-gray-300 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">10K+</p>
              <p>Youth Ravers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">75+</p>
              <p>Monthly Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">4.9★</p>
              <p>Rated Vibes</p>
            </div>
          </div>
        </div>

        {/* 📣 FOMO Pop */}
        <div className="absolute top-6 right-6 bg-black/70 px-4 py-2 text-xs text-white rounded shadow-md animate-bounce z-20">
          🎉 Rooftop rave this Friday. Don’t miss it.
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h2 className="text-4xl font-bold text-white mb-4">
      Tired of Missing Out? Your Solution is Here.
    </h2>
    <p className="text-gray-400 max-w-2xl mx-auto">
      The Nairobi event scene is buzzing, but finding *your* perfect night shouldn't be a hassle. We cut through the noise so you can jump straight into the good times.
    </p>
  </div>
</section>

      {/* 💥 CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-5xl font-extrabold text-white mb-4">
            Be Part of the Movement
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of partygoers making memories every weekend.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/register"
              className="px-10 py-5 bg-white text-purple-900 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            >
              Start Free Trial
            </Link>
            <Link
              to="/events"
              className="px-10 py-5 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <FeaturedEvents />

      {/* VIP Access Section */}
      <VipAccess />
    </div>
  );
};

// 📦 Reusable Feature Card Component
const Feature: React.FC<{ icon: JSX.Element; title: string; desc: string }> = ({
  icon,
  title,
  desc
}) => (
  <div className="group bg-gray-800 rounded-2xl p-8 hover:bg-gray-700 transition-all duration-300 hover:scale-105">
    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse">
      {React.cloneElement(icon, { className: 'w-8 h-8 text-white' })}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400">{desc}</p>
  </div>
);
export default Home;
