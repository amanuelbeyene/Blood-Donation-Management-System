import { useMockData } from '../../../contexts/MockDataContext';

const RejectHospitalView = () => {
    const { hospitals } = useMockData();
    const rejectedHospitals = hospitals.filter(h => h.status === 'Rejected');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Rejected Hospitals</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {rejectedHospitals.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No rejected hospitals found.</div>
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
                                {rejectedHospitals.map((hospital) => (
                                    <tr key={hospital.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                                            <div className="text-sm text-gray-500">{hospital.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{hospital.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-red-600">{hospital.rejectionReason || 'No reason provided'}</div>
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

export default RejectHospitalView;

