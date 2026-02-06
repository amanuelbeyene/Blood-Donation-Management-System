import { useEffect, useState } from 'react';
import { updateRequest, fetchRequests } from '../../../controllers/requestController';
import { fetchInventory, updateInventory } from '../../../controllers/inventoryController';
import type { RecipientRequest } from '../../../models/RecipientRequest';
import type { InventoryRecord } from '../../../models/Inventory';
import { useToast } from '../../../contexts/ToastContext';

const BloodRequestsView = () => {
  const [requests, setRequests] = useState<RecipientRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RecipientRequest | null>(null);

  // Rejection State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<RecipientRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Stock Alert State
  const [stockAlertOpen, setStockAlertOpen] = useState(false);
  const [alertBloodType, setAlertBloodType] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchRequests().then(setRequests);
    fetchInventory().then(setInventory);
  }, []);

  const urgencyBadge: Record<RecipientRequest['urgency'], string> = {
    emergency: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    standard: 'bg-green-100 text-green-800',
  };

  const statusBadge: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    matched: 'bg-blue-100 text-blue-800',
    fulfilled: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-purple-100 text-purple-800',
  };

  const handleStatusUpdate = async (id: string, newStatus: any, reason?: string) => {
    try {
      await updateRequest(id, { status: newStatus, rejectionReason: reason });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, rejectionReason: reason } : r));
      toast.success(`Request ${newStatus === 'rejected' ? 'rejected' : 'accepted'}`);

      // Reset rejection state
      if (newStatus === 'rejected') {
        setRejectModalOpen(false);
        setRejectionReason('');
        setRequestToReject(null);
      }
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error('Failed to update status');
    }
  };

  const initiateReject = (request: RecipientRequest) => {
    setRequestToReject(request);
    setRejectModalOpen(true);
  };

  const initiateAccept = async (request: RecipientRequest) => {
    // Check stock
    const stockItem = inventory.find(item => item.bloodType === request.bloodType);
    const currentStock = stockItem ? stockItem.unitsAvailable : 0;

    if (currentStock < request.unitsNeeded) {
      setAlertBloodType(request.bloodType);
      setStockAlertOpen(true);
      return;
    }

    // Deduct stock
    if (stockItem && stockItem.id) {
      try {
        await updateInventory(stockItem.id, { unitsAvailable: currentStock - request.unitsNeeded });
        // Proceed to update request status
        await handleStatusUpdate(request.id, 'in_progress');
        toast.success(`Stock deducted & Request Accepted`);
      } catch (error) {
        console.error("Failed to update inventory", error);
        toast.error("Failed to update inventory stock");
      }
    } else {
      toast.error("Inventory record not found");
    }
  };

  const getHospitalStatus = (status: string) => {
    if (status === 'fulfilled') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Done</span>;
    if (status === 'in_progress') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">In Progress</span>;
    if (status === 'rejected') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Pending</span>;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Blood Requests</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Blood Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Needed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.hospital}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {request.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.unitsNeeded}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${urgencyBadge[request.urgency]}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[request.status]}`}>
                        {request.status === 'in_progress' ? 'Accepted' : request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getHospitalStatus(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium transition"
                      >
                        View Details
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                      <button
                        onClick={() => initiateAccept(request)}
                        disabled={request.status !== 'pending'}
                        className={`p-1 rounded-full bg-green-100 text-green-600 transition ${request.status !== 'pending'
                          ? 'opacity-50 blur-[1px] cursor-not-allowed'
                          : 'hover:bg-green-200'
                          }`}
                        title="Accept / Put In Progress"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button
                        onClick={() => initiateReject(request)}
                        disabled={request.status !== 'pending'}
                        className={`p-1 rounded-full bg-red-100 text-red-600 transition ${request.status !== 'pending'
                          ? 'opacity-50 blur-[1px] cursor-not-allowed'
                          : 'hover:bg-red-200'
                          }`}
                        title="Deny / Reject"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'pending')}
                        disabled={request.status === 'fulfilled'}
                        className={`p-1 rounded-full transition ${request.status === 'fulfilled' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title="Clear Choice / Reset to Pending"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium">{selectedRequest.hospital}</p>
                </div>
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[selectedRequest.status]}`}>{selectedRequest.status}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested At</p>
                  <p className="font-medium">{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                </div>
                {selectedRequest.note && (
                  <div className="col-span-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Additional Notes</p>
                    <p className="text-sm text-blue-700">{selectedRequest.note}</p>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Rejection Reason</p>
                    <p className="font-medium text-red-600">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
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

      {/* Rejection Modal */}
      {rejectModalOpen && requestToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Request</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting the request from <span className="font-semibold">{requestToReject.hospital}</span>.
            </p>

            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectionReason('');
                  setRequestToReject(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(requestToReject.id, 'rejected', rejectionReason)}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded-lg text-white transition ${!rejectionReason.trim()
                  ? 'bg-red-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Alert Modal */}
      {stockAlertOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Insufficient Stock</h3>
            <p className="text-gray-600 mb-6">
              Not Enough <span className="font-bold text-gray-800">{alertBloodType}</span> Blood on the stock.
            </p>

            <button
              onClick={() => setStockAlertOpen(false)}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodRequestsView;

