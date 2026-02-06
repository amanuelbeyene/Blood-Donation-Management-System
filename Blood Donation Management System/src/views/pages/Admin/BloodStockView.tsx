import { useEffect, useState } from 'react';
import { fetchInventory, checkAndProcessExpiry, fetchExpiredStock } from '../../../controllers/inventoryController';
import type { InventoryRecord } from '../../../models/Inventory';

const BloodStockView = () => {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [expiredStock, setExpiredStock] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    const [invData, expData] = await Promise.all([
      fetchInventory(),
      fetchExpiredStock()
    ]);
    setInventory(invData);
    setExpiredStock(expData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessExpiry = async () => {
    setIsProcessing(true);
    try {
      await checkAndProcessExpiry();
      await loadData(); // Refresh both lists
    } catch (e) {
      alert('Failed to process expiry');
    } finally {
      setIsProcessing(false);
    }
  };

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Blood Stock Management</h2>
        <button
          onClick={handleProcessExpiry}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : '⚠️ Check & Process Expired Blood'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allBloodTypes.map((type) => {
          const inv = getInventoryForType(type);
          const critical = isCritical(inv.unitsAvailable, inv.criticalThreshold);
          return (
            <div
              key={type}
              className={`bg-white rounded-lg p-4 shadow-sm border ${critical ? 'border-red-300 bg-red-50' : 'border-gray-200'
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

      {/* Active Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Blood Stock</h3>
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
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${critical ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
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

      {/* Expired Blood Table */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-200 bg-red-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-red-900">Expired Blood (Removed from Stock)</h3>
          <span className="text-xs text-red-700 font-medium">Auto-detected &gt; 45 Days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Donation Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Expiry Date (~45d)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Units Lost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-red-100">
              {expiredStock.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">
                    No expired blood records found.
                  </td>
                </tr>
              ) : (
                expiredStock.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-md text-xs font-bold">{item.bloodType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.donorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.donationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{item.units}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">EXPIRED</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BloodStockView;

