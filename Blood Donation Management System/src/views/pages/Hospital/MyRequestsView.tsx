import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchRequests, updateRequest, deleteRequest } from '../../../controllers/requestController';
import { createDonation } from '../../../controllers/donationController';
import { fetchDonors, registerDonor } from '../../../controllers/donorController';
import { generateDonationId } from '../../../utils/idGenerator';
import type { RecipientRequest } from '../../../models/RecipientRequest';

const MyRequestsView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RecipientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RecipientRequest | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RecipientRequest | null>(null);
  const [editForm, setEditForm] = useState({
    patient: '',
    bloodType: '',
    unitsNeeded: '',
    urgency: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchRequests().then(data => {
        // Filter requests for this hospital
        const myRequests = data.filter(r => r.hospitalId === user.id);
        setRequests(myRequests);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user]);

  const handleArrived = async (request: RecipientRequest) => {
    try {
      // 1. Update Request Status
      await updateRequest(request.id, { status: 'fulfilled' });
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'fulfilled' } : r));
    } catch (error: any) {
      console.error("Failed to update request:", error);
      toast.error(`Failed to mark request as arrived: ${error.message || 'Unknown error'}`);
      return;
    }

    try {
      // 2. Find or Create Anonymous Donor
      let donorId = '';
      const donors = await fetchDonors();
      const anonymousDonor = donors.find(d => d.fullName.toLowerCase() === 'anonymous' || d.fullName.toLowerCase() === 'anonymous donor');

      if (anonymousDonor) {
        donorId = anonymousDonor.id;
      } else {
        // Create Anonymous Donor if not exists
        try {
          const newDonor = await registerDonor({
            fullName: 'Anonymous Donor',
            email: `anonymous_${Date.now()}@system.local`, // Unique dummy email
            phone: '0000000000',
            bloodType: request.bloodType, // Use request blood type or generic
            password: 'SystemPassword123!', // Dummy password
            age: 18,
            gender: 'Other',
            region: 'System',
            city: 'System',
            status: 'Active'
          });
          donorId = newDonor.id;
        } catch (regError) {
          console.error("Failed to register anonymous donor:", regError);
          // Fallback if registration fails (unlikely but safe to handle)
          throw new Error("Could not verifying anonymous donor record.");
        }
      }

      // 3. Create Donation Record with Valid IDs
      // We need a valid hospital ID. User context usually has it if logged in as hospital.
      // If user.id is the hospital ID (based on auth context logic for hospital role), use it.
      const hospitalId = user?.id;

      if (!hospitalId) throw new Error("Hospital ID not found in session.");

      await createDonation({
        donorId: donorId,
        hospitalId: hospitalId,
        units: request.unitsNeeded,
        status: 'in_progress'
      });

      toast.success("Marked as Arrived and Donation Recorded");

      // 4. Redirect to My Donations to show the record
      navigate('/hospital/my-donations');
    } catch (error: any) {
      console.error("Failed to create donation:", error);
      toast.error(`Request updated, but failed to record donation: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUndoArrived = async (request: RecipientRequest) => {
    try {
      await updateRequest(request.id, { status: 'in_progress' });
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'in_progress' } : r));
      toast.success("Status reverted to In Progress");
    } catch (error) {
      console.error(error);
      toast.error("Failed to undo status");
    }
  };

  const handleDelete = async (request: RecipientRequest) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      await deleteRequest(request.id);
      setRequests(prev => prev.filter(r => r.id !== request.id));
      toast.success("Request deleted successfully");
    } catch (error) {
      console.error("Failed to delete request:", error);
      toast.error("Failed to delete request");
    }
  };

  const handleEditClick = (request: RecipientRequest) => {
    setEditingRequest(request);
    setEditForm({
      patient: request.patient || '',
      bloodType: request.bloodType,
      unitsNeeded: request.unitsNeeded.toString(),
      urgency: request.urgency
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      const updatedData = {
        patient: editForm.patient,
        bloodType: editForm.bloodType,
        unitsNeeded: parseInt(editForm.unitsNeeded),
        urgency: editForm.urgency
      };

      await updateRequest(editingRequest.id, updatedData as any);

      setRequests(prev => prev.map(r => r.id === editingRequest.id ? { ...r, ...updatedData } : r));
      toast.success("Request updated successfully");
      setIsEditModalOpen(false);
      setEditingRequest(null);
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Failed to update request");
    }
  };

  const statusBadge: Record<string, string> = {
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">My Emergency Requests</h1>
        <p className="mt-2 text-slate-600">View and manage all your submitted emergency blood requests.</p>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <div className="mt-12 flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Requests Yet</h2>
            <p className="mt-2 text-slate-600">
              You haven't submitted any emergency requests. Create your first request to find matching donors.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="py-3 font-medium">Patient</th>
                  <th className="py-3 font-medium">Blood Type</th>
                  <th className="py-3 font-medium">Units</th>
                  <th className="py-3 font-medium">Urgency</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Confirm</th>
                  <th className="py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="text-sm hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-900">{req.patient}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        {req.bloodType}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{req.unitsNeeded}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${urgencyBadge[req.urgency]}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-3 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge[req.status]}`}>
                        {req.status === 'in_progress' ? 'In Progress' : req.status}
                      </span>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="text-slate-400 hover:text-blue-600 transition"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {req.status === 'fulfilled' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                            Done
                          </span>
                        ) : (
                          <button
                            onClick={() => handleArrived(req)}
                            disabled={req.status !== 'in_progress'}
                            className={`px-3 py-1 rounded text-xs font-medium text-white transition ${req.status === 'in_progress'
                              ? 'bg-green-600 hover:bg-green-700 shadow-sm'
                              : 'bg-gray-300 cursor-not-allowed'
                              }`}
                          >
                            Arrived
                          </button>
                        )}

                        <button
                          onClick={() => handleUndoArrived(req)}
                          disabled={req.status !== 'fulfilled'}
                          className={`px-3 py-1 rounded text-xs font-medium transition ${req.status === 'fulfilled'
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                          Clear
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(req)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit Request"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(req)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete Request"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        }
      </div >

      {/* Details Modal */}
      {
        selectedRequest && (
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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[selectedRequest.status]}`}>{selectedRequest.status}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium">{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                  </div>

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
        )
      }

      {/* Edit Modal */}
      {
        isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Request</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                  <input
                    type="text"
                    value={editForm.patient}
                    onChange={e => setEditForm({ ...editForm, patient: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                    <select
                      value={editForm.bloodType}
                      onChange={e => setEditForm({ ...editForm, bloodType: e.target.value })}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Units</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.unitsNeeded}
                      onChange={e => setEditForm({ ...editForm, unitsNeeded: e.target.value })}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Urgency</label>
                  <select
                    value={editForm.urgency}
                    onChange={e => setEditForm({ ...editForm, urgency: e.target.value })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="high">High</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default MyRequestsView;

