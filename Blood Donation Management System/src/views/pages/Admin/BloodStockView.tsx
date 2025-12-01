import { useEffect, useState } from 'react';
import { fetchInventory } from '../../../controllers/inventoryController';
import type { InventoryRecord } from '../../../models/Inventory';

const BloodStockView = () => {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);

  useEffect(() => {
    fetchInventory().then(setInventory);
  }, []);

  const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getInventoryForType = (bloodType: string) => {
    return inventory.find((inv) => inv.bloodType === bloodType) || {
      bloodType,
      unitsAvailable: 0,
      criticalThreshold: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  };

  const isCritical = (units: number, threshold: number) => units <= threshold;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Blood Stock</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allBloodTypes.map((type) => {
          const inv = getInventoryForType(type);
          const critical = isCritical(inv.unitsAvailable, inv.criticalThreshold);
          return (
            <div
              key={type}
              className={`bg-white rounded-lg p-4 shadow-sm border ${
                critical ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-gray-900">{type}</span>
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p className={`text-2xl font-bold ${critical ? 'text-red-600' : 'text-gray-900'}`}>
                {inv.unitsAvailable} units
              </p>
              {critical && <p className="text-xs text-red-600 mt-1">Critical Level!</p>}
            </div>
          );
        })}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Blood Stock Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Critical Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allBloodTypes.map((type) => {
                const inv = getInventoryForType(type);
                const critical = isCritical(inv.unitsAvailable, inv.criticalThreshold);
                return (
                  <tr key={type}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">{type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.unitsAvailable}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.criticalThreshold}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          critical ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {critical ? 'Critical' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-red-600 hover:text-red-800 font-semibold">Update Stock</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BloodStockView;

