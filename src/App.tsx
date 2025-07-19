import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-900 text-white">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/staff" element={<StaffDashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </main>
              <Footer />
              <Toast />
            </div>
          </Router>
        </ToastProvider>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;