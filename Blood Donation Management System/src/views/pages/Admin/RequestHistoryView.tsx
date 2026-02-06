import { useEffect, useState } from 'react';
import { fetchRequests } from '../../../controllers/requestController';
import type { RecipientRequest } from '../../../models/RecipientRequest';

const RequestHistoryView = () => {
  const [requests, setRequests] = useState<RecipientRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RecipientRequest | null>(null);

  useEffect(() => {
    fetchRequests().then(data => {
      // Sort by date descending (newest first)
      const sorted = [...data].sort((a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
      setRequests(sorted);
    });
  }, []);

  const statusBadge: Record<RecipientRequest['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    matched: 'bg-blue-100 text-blue-800',
    fulfilled: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-purple-100 text-purple-800',
  };

  const urgencyBadge: Record<string, string> = {
    emergency: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    standard: 'bg-green-100 text-green-800',
  };

  // Helper to generate ID based on chronological order
  // Newest request = Total Count
  // Oldest request = 1
  const getDisplayId = (index: number) => {
    const num = requests.length - index;
    return `BR${num.toString().padStart(7, '0')}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Request History</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Blood Request History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No request history found
                  </td>
                </tr>
              ) : (
                requests.map((request, index) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getDisplayId(index)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.hospital}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {request.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.unitsNeeded}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[request.status]}`}>
                        {request.status === 'in_progress' ? 'In Progress' : request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedRequest.patient}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">{selectedRequest.bloodType}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Units Needed</p>
                  <p className="font-medium">{selectedRequest.unitsNeeded}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgency</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${urgencyBadge[selectedRequest.urgency]}`}>{selectedRequest.urgency}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[selectedRequest.status]}`}>
                    {selectedRequest.status === 'in_progress' ? 'In Progress' : selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium">{selectedRequest.hospital}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Request Date</p>
                  <p className="font-medium">{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                </div>

                {selectedRequest.note && (
                  <div className="col-span-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Additional Notes</p>
                    <p className="text-sm text-blue-700">{selectedRequest.note}</p>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="col-span-2 mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestHistoryView;
