import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, Clock, User, Send, X } from 'lucide-react';

interface CustomerCareProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomerCare: React.FC<CustomerCareProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('contact');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      description: '24/7 Customer Support',
      action: 'tel:+254700000000',
      value: '+254 700 000 000',
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Instant messaging support',
      action: 'https://wa.me/254700000000',
      value: 'Chat Now',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Get detailed support',
      action: 'mailto:support@ignition.co.ke',
      value: 'support@ignition.co.ke',
      color: 'from-blue-600 to-blue-700'
    }
  ];

  const faqs = [
    {
      question: 'How do I get my tickets after purchase?',
      answer: 'Tickets are immediately available in your dashboard and sent to your email. You can also access them through the mobile app.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-PESA, Visa, Mastercard, and other major payment methods. All transactions are secure and encrypted.'
    },
    {
      question: 'Can I get a refund if I can\'t attend?',
      answer: 'Refunds are available up to 24 hours before the event. Contact our support team for assistance with refund requests.'
    },
    {
      question: 'What should I bring to the event?',
      answer: 'Bring a valid ID, your ticket (digital or printed), and come ready to have an amazing time! Check individual event pages for specific requirements.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Customer Care</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
              activeTab === 'contact'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
              activeTab === 'faq'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            FAQ
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'contact' && (
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactMethods.map((method, index) => (
                  <a
                    key={index}
                    href={method.action}
                    target={method.action.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className={`bg-gradient-to-r ${method.color} rounded-2xl p-6 text-white hover:scale-105 transition-all group`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <method.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{method.title}</h3>
                        <p className="text-sm opacity-90">{method.description}</p>
                        <p className="text-sm font-semibold mt-1">{method.value}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Operating Hours */}
              <div className="bg-gray-700 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Operating Hours</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 font-semibold">Phone Support</p>
                    <p className="text-gray-400">24/7 Available</p>
                  </div>
                  <div>
                    <p className="text-gray-300 font-semibold">Email Support</p>
                    <p className="text-gray-400">Response within 2 hours</p>
                  </div>
                </div>
              </div>

              {/* Quick Message */}
              <div className="bg-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Send Quick Message</h3>
                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                  />
                  <button
                    onClick={() => {
                      const subject = 'Customer Support Request';
                      const body = encodeURIComponent(message);
                      window.open(`mailto:support@ignition.co.ke?subject=${subject}&body=${body}`);
                      setMessage('');
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h3>
                <p className="text-gray-400">Find quick answers to common questions</p>
              </div>

              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-700 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">{faq.question}</h4>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}

              {/* Still Need Help */}
              <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-6 text-center">
                <h4 className="text-xl font-bold text-white mb-2">Still Need Help?</h4>
                <p className="text-gray-300 mb-4">Our support team is ready to assist you</p>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCare;