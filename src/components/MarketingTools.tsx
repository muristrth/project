import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Mail,
  Users,
  TrendingUp,
  Target,
  Send,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { useToast, FirebaseContext } from '../components/CashflowManagement';
import { collection, query, onSnapshot, getDocs, where, serverTimestamp, addDoc, doc } from 'firebase/firestore';

// Declare global variables for TypeScript (provided by Canvas environment)
declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

interface MarketingToolsProps {
  eventId?: string;
  userRole: 'admin' | 'staff' | 'user';
}

interface User {
  createdAt: any;
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'staff';
  loyaltyPoints: number;
  purchaseHistory: string[];
  subscriptionStatus: 'active' | 'inactive';
}

const MarketingTools: React.FC<MarketingToolsProps> = ({ eventId, userRole }) => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaignData, setCampaignData] = useState({
    subject: '',
    content: '',
    segment: 'all',
    scheduledDate: ''
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const { showToast } = useToast();
  const { firestoreDb, isAuthReady } = useContext(FirebaseContext);

  // Fetch all users from Firestore to build audience segments
  useEffect(() => {
    if (!isAuthReady || !firestoreDb) {
      console.log("Firebase not ready for user fetching.");
      return;
    }

    // Users are private data, but for admin/staff marketing tools, we fetch all users
    // In a real app, you might have a separate 'users' collection at a public level
    // or aggregate user data for marketing purposes. For this example, we'll assume
    // an admin can access all user profiles.
    const usersCollectionRef = collection(firestoreDb, `artifacts/${appId}/users`);

    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
      const fetchedUsers: User[] = [];
      snapshot.docs.forEach(userDoc => {
        // Each user document represents a user's private data, so we need to go one level deeper
        const profileDocRef = doc(firestoreDb, `artifacts/${appId}/users/${userDoc.id}/profile/data`);
        onSnapshot(profileDocRef, (profileSnap: import('firebase/firestore').DocumentSnapshot) => {
          if (profileSnap.exists()) {
            fetchedUsers.push({ id: profileSnap.id, ...profileSnap.data() } as unknown as User);
          }
          // Only set users and stop loading after all sub-collections are processed
          // This is a simplified approach, a more robust solution would track all sub-collection fetches
          setAllUsers(fetchedUsers);
          setIsLoadingUsers(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          showToast("Error loading user data for segments.", "error");
          setIsLoadingUsers(false);
        });
      });
      if (snapshot.empty) {
        setAllUsers([]);
        setIsLoadingUsers(false);
      }
    }, (error) => {
      console.error("Error fetching users collection:", error);
      showToast("Error loading users for marketing.", "error");
      setIsLoadingUsers(false);
    });

    return () => unsubscribe();
  }, [isAuthReady, firestoreDb, showToast]);


  const tabs = [
    { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
    { id: 'segments', label: 'Audience Segments', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'social', label: 'Social Media', icon: Share2 },
  ];

  // Dynamically calculate audience segments based on fetched users
  const getAudienceSegments = useCallback(() => {
    const totalUsers = allUsers.length;
    const vipCustomers = allUsers.filter(user => user.loyaltyPoints > 500).length; // Example VIP criteria
    const loyalCustomers = allUsers.filter(user => user.purchaseHistory.length > 2).length; // Example Loyal criteria
    const newUsers = allUsers.filter(user => (new Date().getTime() - user.createdAt?.toDate().getTime()) / (1000 * 60 * 60 * 24) < 30).length; // Joined in last 30 days
    const inactiveUsers = allUsers.filter(user => user.subscriptionStatus === 'inactive' && user.purchaseHistory.length === 0).length; // Example Inactive criteria

    return [
      { id: 'all', name: 'All Users', count: totalUsers, color: 'bg-blue-500' },
      { id: 'vip', name: 'VIP Customers', count: vipCustomers, color: 'bg-purple-500' },
      { id: 'loyal', name: 'Loyal Customers', count: loyalCustomers, color: 'bg-yellow-500' },
      { id: 'new', name: 'New Users', count: newUsers, color: 'bg-green-500' },
      { id: 'inactive', name: 'Inactive Users', count: inactiveUsers, color: 'bg-gray-500' }
    ];
  }, [allUsers]);

  const audienceSegments = getAudienceSegments();


  const campaignTemplates = [
    {
      id: 'event-announcement',
      name: 'Event Announcement',
      description: 'Announce new events to your audience',
      template: 'Get ready for an incredible night at {eventName}! Join us on {eventDate} for an unforgettable experience.'
    },
    {
      id: 'early-bird',
      name: 'Early Bird Special',
      description: 'Promote early bird ticket sales',
      template: 'Limited time offer! Get your early bird tickets for {eventName} now and save up to 25%.'
    },
    {
      id: 'last-chance',
      name: 'Last Chance',
      description: 'Create urgency for ticket sales',
      template: 'Don\'t miss out! Only a few tickets left for {eventName}. Secure your spot now!'
    }
  ];

  const handleSendCampaign = async () => {
    if (!firestoreDb) {
      showToast("Firestore not ready.", "error");
      return;
    }
    if (!campaignData.subject.trim() || !campaignData.content.trim()) {
      showToast("Subject and content cannot be empty.", "error");
      return;
    }

    showToast("Sending campaign...", "info");

    try {
      // Simulate sending to selected segment by logging to Firestore
      const campaignLogsRef = collection(firestoreDb, `artifacts/${appId}/public/data/campaignLogs`);
      await addDoc(campaignLogsRef, {
        subject: campaignData.subject,
        content: campaignData.content,
        segment: campaignData.segment,
        scheduledDate: campaignData.scheduledDate ? new Date(campaignData.scheduledDate) : null,
        sentAt: serverTimestamp(),
        sentBy: userRole, // Log who sent it
        status: 'sent',
        // In a real app, you'd integrate with an email service (e.g., SendGrid, Mailgun) here
        // and track actual delivery/open rates.
      });
      showToast("Campaign sent successfully (simulated)!", "success");
      // Reset form
      setCampaignData({ subject: '', content: '', segment: 'all', scheduledDate: '' });
    } catch (error) {
      console.error("Error sending campaign:", error);
      showToast("Failed to send campaign.", "error");
    }
  };


  const renderCampaigns = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Sent</p>
              <p className="text-2xl font-bold">{(getAudienceSegments().find(s => s.id === 'all')?.count || 0).toLocaleString()}</p> {/* Using total users as proxy */}
            </div>
            <Mail className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Open Rate</p>
              <p className="text-2xl font-bold">42.3%</p> {/* Placeholder */}
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Click Rate</p>
              <p className="text-2xl font-bold">18.7%</p> {/* Placeholder */}
            </div>
            <Target className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Conversions</p>
              <p className="text-2xl font-bold">1,234</p> {/* Placeholder */}
            </div>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Campaign Templates */}
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Campaign Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaignTemplates.map((template) => (
            <div key={template.id} className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors cursor-pointer">
              <h4 className="text-lg font-bold text-white mb-2">{template.name}</h4>
              <p className="text-gray-400 text-sm mb-4">{template.description}</p>
              <div className="bg-gray-600 rounded-lg p-3 text-sm text-gray-300 mb-4">
                {template.template}
              </div>
              <button
                onClick={() => setCampaignData(prev => ({ ...prev, content: template.template }))}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Campaign */}
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Create Campaign</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">Subject Line</label>
              <input
                type="text"
                value={campaignData.subject}
                onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Target Audience</label>
              <select
                value={campaignData.segment}
                onChange={(e) => setCampaignData(prev => ({ ...prev, segment: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {audienceSegments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name} ({segment.count.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Email Content</label>
            <textarea
              value={campaignData.content}
              onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={8}
              placeholder="Enter your email content..."
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Schedule (Optional)</label>
            <input
              type="datetime-local"
              value={campaignData.scheduledDate}
              onChange={(e) => setCampaignData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSendCampaign}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Campaign</span>
            </button>
            <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSegments = () => (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Audience Segments</h3>
        {isLoadingUsers ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading audience data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audienceSegments.map((segment) => (
              <div key={segment.id} className="bg-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">{segment.name}</h4>
                  <div className={`w-4 h-4 rounded-full ${segment.color}`} />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{segment.count.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">Active users</p>
                <button className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Marketing Analytics</h3>
        <div className="h-64 flex items-center justify-center bg-gray-700 rounded-xl">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Analytics dashboard will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSocial = () => (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Social Media Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Quick Share</h4>
            <p className="text-gray-400 mb-4">Share event updates across all platforms</p>
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Share Now
            </button>
          </div>
          <div className="bg-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-4">Scheduled Posts</h4>
            <p className="text-gray-400 mb-4">Manage your social media calendar</p>
            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Schedule Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (userRole === 'user') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Marketing tools are available for admin and staff only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'campaigns' && renderCampaigns()}
      {activeTab === 'segments' && renderSegments()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'social' && renderSocial()}
    </div>
  );
};

export default MarketingTools;
