import { useEffect, useState } from 'react';
import { fetchInventory } from '../../../controllers/inventoryController';
import type { InventoryRecord } from '../../../models/Inventory';
import SectionHeading from '../../components/common/SectionHeading';

const InventoryView = () => {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);

  useEffect(() => {
    fetchInventory().then(setInventory);
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeading
        align="left"
        eyebrow="Inventory"
        title="Monitor national blood supply"
        description="Real-time dashboards for blood banks to prevent shortages and ensure compliance."
      />

      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-primary/5 text-xs uppercase tracking-[0.3em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Blood Type</th>
              <th className="px-6 py-4">Units Available</th>
              <th className="px-6 py-4">Critical Threshold</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map((record) => {
              const isCritical = record.unitsAvailable <= record.criticalThreshold;
              return (
                <tr key={record.bloodType} className="text-slate-600">
                  <td className="px-6 py-4 text-lg font-semibold text-slate-900">{record.bloodType}</td>
                  <td className="px-6 py-4">{record.unitsAvailable} units</td>
                  <td className="px-6 py-4">{record.criticalThreshold} units</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        isCritical ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {isCritical ? 'Critical' : 'Healthy'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{record.lastUpdated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;


