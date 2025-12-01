const DeleteHospitalView = () => {
  const hospitals = [
    { id: '1', name: 'Black Lion Hospital', location: 'Addis Ababa', phone: '+251 911 234 567' },
    { id: '2', name: 'St. Paul Hospital', location: 'Addis Ababa', phone: '+251 911 234 568' },
    { id: '3', name: 'Jimma University Hospital', location: 'Jimma', phone: '+251 911 234 569' },
  ];

  const handleDelete = (hospitalId: string, hospitalName: string) => {
    if (window.confirm(`Are you sure you want to delete ${hospitalName}? This action cannot be undone.`)) {
      alert(`Hospital ${hospitalName} deleted successfully! Backend integration coming soon.`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Delete Hospital Details</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Hospital to Delete</h3>
          <p className="text-sm text-gray-600 mt-1">Warning: This action cannot be undone.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hospitals.map((hospital) => (
                <tr key={hospital.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hospital.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(hospital.id, hospital.name)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeleteHospitalView;

