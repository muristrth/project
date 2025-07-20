import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Scan,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Clock,
  Shield,
  Search,
  Filter,
  Download,
  UserCheck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { FirebaseContext } from '../components/CashflowManagement';
import { useEvent, Event } from '../context/EventContext'; // Import Event and useEvent
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// Declare global variables for TypeScript (provided by Canvas environment)
declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

interface AccessControlProps {
  eventId?: string; // Optional: if scanning for a specific event
  userRole: 'admin' | 'staff' | 'user';
}

interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  ticketType: string;
  status: 'purchased' | 'used' | 'invalid'; // 'purchased' means valid and not yet used
  userName: string;
  purchaseDate: any; // Firestore Timestamp
}

interface ScanLog {
  id: string;
  ticketId: string;
  userId: string;
  eventId: string;
  userName: string;
  ticketType: string;
  scanStatus: 'valid_entry' | 'already_used' | 'invalid_ticket';
  timestamp: any; // Firestore Timestamp
  gateNumber: string;
  scannedBy: string; // User ID of the staff/admin who scanned
}

const AccessControl: React.FC<AccessControlProps> = ({ eventId, userRole }) => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [tickets, setTickets] = useState<Ticket[]>([]); // All tickets for the event (or all if no eventId)
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]); // Log of all scans
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanLog | null>(null);
  const [manualTicketId, setManualTicketId] = useState('');

  const { showToast } = useToast();
  const { firestoreDb, userId: currentUserId, isAuthReady } = useContext(FirebaseContext);
  const { events } = useEvent(); // To get event titles for display

  // Fetch tickets for the current event or all tickets if no eventId is provided
  useEffect(() => {
    if (!isAuthReady || !firestoreDb) return;

    let ticketsRef = collection(firestoreDb, `artifacts/${appId}/public/data/tickets`);
    let q = query(ticketsRef);

    // If an eventId is provided, filter tickets for that event
    if (eventId) {
      q = query(ticketsRef, where('eventId', '==', eventId));
    }

    const unsubscribeTickets = onSnapshot(q, (snapshot) => {
      const fetchedTickets: Ticket[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Ticket, 'id'>
      }));
      setTickets(fetchedTickets);
    }, (error) => {
      console.error("Error fetching tickets:", error);
      showToast("Error loading tickets.", "error");
    });

    // Fetch scan logs
    const scanLogsRef = collection(firestoreDb, `artifacts/${appId}/public/data/scanLogs`);
    let scanLogsQuery = query(scanLogsRef);
    if (eventId) {
      scanLogsQuery = query(scanLogsRef, where('eventId', '==', eventId));
    }
    const unsubscribeScanLogs = onSnapshot(scanLogsQuery, (snapshot) => {
      const fetchedScanLogs: ScanLog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<ScanLog, 'id'>,
        timestamp: doc.data().timestamp?.toDate() // Convert Firestore Timestamp to Date
      }));
      setScanLogs(fetchedScanLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())); // Sort by latest
    }, (error) => {
      console.error("Error fetching scan logs:", error);
      showToast("Error loading scan logs.", "error");
    });

    return () => {
      unsubscribeTickets();
      unsubscribeScanLogs();
    };
  }, [isAuthReady, firestoreDb, eventId, showToast]);

  const handleTicketScan = useCallback(async (ticketId: string) => {
    if (isScanning || !firestoreDb || !currentUserId) return;

    setIsScanning(true);
    setLastScanResult(null); // Clear previous result

    try {
      // 1. Find the ticket in Firestore
      const ticketDocRef = doc(firestoreDb, `artifacts/${appId}/public/data/tickets`, ticketId);
      const ticketSnap = await getDoc(ticketDocRef);

      let scanStatus: 'valid_entry' | 'already_used' | 'invalid_ticket';
      let ticketData: Ticket | undefined;

      if (!ticketSnap.exists()) {
        scanStatus = 'invalid_ticket';
        showToast('Invalid Ticket!', 'error');
      } else {
        ticketData = ticketSnap.data() as Ticket;
        if (ticketData.status === 'used') {
          scanStatus = 'already_used';
          showToast('Ticket Already Used!', 'info');
        } else if (ticketData.status === 'purchased') {
          scanStatus = 'valid_entry';
          // Update ticket status to 'used'
          await updateDoc(ticketDocRef, { status: 'used' });
          showToast('Ticket Valid! Entry Granted.', 'success');
        } else {
          // Should not happen if statuses are only 'purchased', 'used', 'invalid'
          scanStatus = 'invalid_ticket';
          showToast('Invalid Ticket Status!', 'error');
        }
      }

      // 2. Log the scan result
      const newScanLog: ScanLog = {
        id: '', // Firestore will generate
        ticketId: ticketId,
        userId: ticketData?.userId || 'N/A', // Use actual user ID from ticket
        eventId: ticketData?.eventId || eventId || 'N/A',
        userName: ticketData?.userName || 'Unknown User', // Use actual user name from ticket
        ticketType: ticketData?.ticketType || 'N/A',
        scanStatus: scanStatus,
        timestamp: serverTimestamp(),
        gateNumber: 'Gate 1', // This could be dynamic based on staff's assigned gate
        scannedBy: currentUserId,
      };

      const scanLogsRef = collection(firestoreDb, `artifacts/${appId}/public/data/scanLogs`);
      const docRef = await addDoc(scanLogsRef, newScanLog);
      setLastScanResult({ ...newScanLog, id: docRef.id, timestamp: new Date() }); // Update with generated ID and local timestamp

    } catch (error: any) {
      console.error("Error during ticket scan:", error);
      showToast(`Scan failed: ${error.message || 'An unexpected error occurred.'}`, 'error');
    } finally {
      setIsScanning(false);
    }
  }, [firestoreDb, currentUserId, eventId, showToast]);

  const renderScanner = () => (
    <div className="space-y-8">
      {/* Scanner Interface */}
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Ticket Scanner</h3>

        <div className="max-w-md mx-auto">
          {/* Camera View */}
          <div className="aspect-square bg-gray-700 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
            {isScanning ? (
              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white font-semibold">Scanning...</p>
                </div>
              </div>
            ) : lastScanResult ? (
              <div className={`absolute inset-0 flex items-center justify-center ${
                lastScanResult.scanStatus === 'valid_entry' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {lastScanResult.scanStatus === 'valid_entry' ? (
                  <CheckCircle className="w-24 h-24 text-green-400" />
                ) : (
                  <XCircle className="w-24 h-24 text-red-400" />
                )}
              </div>
            ) : (
              <div className="text-center">
                <Scan className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Camera view</p>
                <p className="text-gray-500 text-sm mt-2">Point at QR code</p>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter ticket ID manually"
              value={manualTicketId}
              onChange={(e) => setManualTicketId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && manualTicketId.trim()) {
                  handleTicketScan(manualTicketId.trim());
                  setManualTicketId('');
                }
              }}
            />

            <button
              onClick={() => handleTicketScan(manualTicketId.trim())}
              disabled={isScanning || !manualTicketId.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Scan Ticket'}
            </button>
          </div>
        </div>
      </div>

      {/* Scan Result Display */}
      {lastScanResult && (
        <div className={`bg-gray-800 rounded-2xl p-8 border-2 ${
          lastScanResult.scanStatus === 'valid_entry' ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-white">Scan Result</h4>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              lastScanResult.scanStatus === 'valid_entry'
                ? 'bg-green-900 text-green-300'
                : lastScanResult.scanStatus === 'already_used'
                ? 'bg-yellow-900 text-yellow-300'
                : 'bg-red-900 text-red-300'
            }`}>
              {lastScanResult.scanStatus.replace(/_/g, ' ').toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Ticket ID</p>
              <p className="text-white font-semibold">{lastScanResult.ticketId}</p>
            </div>
            <div>
              <p className="text-gray-400">User</p>
              <p className="text-white font-semibold">{lastScanResult.userName}</p>
            </div>
            <div>
              <div>
                <p className="text-gray-400">Ticket Type</p>
                <p className="text-white font-semibold">{lastScanResult.ticketType}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400">Time</p>
              <p className="text-white font-semibold">{lastScanResult.timestamp.toLocaleTimeString()}</p>
            </div>
            {lastScanResult.eventId && (
              <div>
                <p className="text-gray-400">Event</p>
                <p className="text-white font-semibold">
                  {events.find(e => e.id === lastScanResult.eventId)?.title || 'N/A'}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Gate</p>
              <p className="text-white font-semibold">{lastScanResult.gateNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats based on scanLogs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Valid Scans</p>
              <p className="text-2xl font-bold">{scanLogs.filter(r => r.scanStatus === 'valid_entry').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Invalid Scans</p>
              <p className="text-2xl font-bold">{scanLogs.filter(r => r.scanStatus === 'invalid_ticket').length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Already Used</p>
              <p className="text-2xl font-bold">{scanLogs.filter(r => r.scanStatus === 'already_used').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Scans</p>
              <p className="text-2xl font-bold">{scanLogs.length}</p>
            </div>
            <Scan className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEntryLog = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Entry Log</h3>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {scanLogs.length > 0 ? (
            scanLogs.map((result) => (
              <div key={result.id} className="bg-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    result.scanStatus === 'valid_entry' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-white font-semibold">{result.userName}</p>
                    <p className="text-gray-400 text-sm">{result.ticketType} • {result.ticketId}</p>
                    {result.eventId && (
                      <p className="text-gray-500 text-xs">Event: {events.find(e => e.id === result.eventId)?.title || 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">{result.timestamp.toLocaleTimeString()}</p>
                  <p className="text-gray-400 text-sm">{result.gateNumber} by {result.scannedBy.substring(0, 6)}...</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No scans recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Gate Analytics</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Analytics dashboard will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Access Control Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Offline Mode</p>
              <p className="text-gray-400 text-sm">Allow scanning without internet</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Auto-sync</p>
              <p className="text-gray-400 text-sm">Automatically sync scan data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  if (userRole === 'user') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Access control is available for staff and admin only.</p>
      </div>
    );
  }

  // Define tabs for navigation
  const tabs = [
    { id: 'scanner', label: 'Scanner', icon: Scan },
    { id: 'entry-log', label: 'Entry Log', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Users }
  ];

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
      {activeTab === 'scanner' && renderScanner()}
      {activeTab === 'entry-log' && renderEntryLog()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
};

export default AccessControl;
