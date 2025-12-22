import { useMockData } from '../../../contexts/MockDataContext';
import { Donor } from '../../../models/Donor';

const RejectDonorView = () => {
    const { donors } = useMockData();

    // In a real app, this would fetch rejected status from backend. 
    // Since mock data is static, I'm simulating that we might have some rejected ones, 
    // or relying on previous state changes if they persisted (which they don't in this simulated env).
    // For demonstration, I will filter for 'Rejected' even if mockData has none initially (unless I add one).
    const rejectedDonors = donors.filter(d => d.status === 'Rejected');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Rejected Donors</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {rejectedDonors.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No rejected donors found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason for Rejection</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rejectedDonors.map((donor) => (
                                    <tr key={donor.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{donor.fullName}</div>
                                            <div className="text-sm text-gray-500">{donor.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{donor.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-red-600">{donor.rejectionReason || 'No reason provided'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Rejected
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RejectDonorView;

