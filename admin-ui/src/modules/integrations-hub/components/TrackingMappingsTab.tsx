import { useState } from 'react';
import { Toggle } from '../../../components/ui/Toggle';
import { Badge } from '../../../components/ui/Badge';
import { CARRIER_LABELS } from '../types';
import type { CarrierType } from '../types';

interface TrackingMapping {
  id: string;
  carrierStatus: string;
  carrierDescription: string;
  internalStatus: string;
  triggerNotification: boolean;
  isActive: boolean;
}

interface TrackingMappingsTabProps {
  carrier: CarrierType;
}

const sampleTrackingMappings: Record<CarrierType, TrackingMapping[]> = {
  fedex: [
    { id: '1', carrierStatus: 'PU', carrierDescription: 'Picked Up', internalStatus: 'In Transit', triggerNotification: true, isActive: true },
    { id: '2', carrierStatus: 'IT', carrierDescription: 'In Transit', internalStatus: 'In Transit', triggerNotification: false, isActive: true },
    { id: '3', carrierStatus: 'OD', carrierDescription: 'Out for Delivery', internalStatus: 'Out for Delivery', triggerNotification: true, isActive: true },
    { id: '4', carrierStatus: 'DL', carrierDescription: 'Delivered', internalStatus: 'Delivered', triggerNotification: true, isActive: true },
    { id: '5', carrierStatus: 'DE', carrierDescription: 'Delivery Exception', internalStatus: 'Exception', triggerNotification: true, isActive: true },
    { id: '6', carrierStatus: 'CA', carrierDescription: 'Shipment Cancelled', internalStatus: 'Cancelled', triggerNotification: true, isActive: true },
  ],
  ups: [
    { id: '1', carrierStatus: 'P', carrierDescription: 'Pickup Scan', internalStatus: 'In Transit', triggerNotification: true, isActive: true },
    { id: '2', carrierStatus: 'I', carrierDescription: 'In Transit', internalStatus: 'In Transit', triggerNotification: false, isActive: true },
    { id: '3', carrierStatus: 'O', carrierDescription: 'Out for Delivery', internalStatus: 'Out for Delivery', triggerNotification: true, isActive: true },
    { id: '4', carrierStatus: 'D', carrierDescription: 'Delivered', internalStatus: 'Delivered', triggerNotification: true, isActive: true },
    { id: '5', carrierStatus: 'X', carrierDescription: 'Exception', internalStatus: 'Exception', triggerNotification: true, isActive: true },
  ],
  usps: [
    { id: '1', carrierStatus: 'AC', carrierDescription: 'Accepted', internalStatus: 'In Transit', triggerNotification: true, isActive: true },
    { id: '2', carrierStatus: 'OF', carrierDescription: 'Out for Delivery', internalStatus: 'Out for Delivery', triggerNotification: true, isActive: true },
    { id: '3', carrierStatus: 'DL', carrierDescription: 'Delivered', internalStatus: 'Delivered', triggerNotification: true, isActive: true },
  ],
  dhl: [
    { id: '1', carrierStatus: 'PU', carrierDescription: 'Shipment Picked Up', internalStatus: 'In Transit', triggerNotification: true, isActive: true },
    { id: '2', carrierStatus: 'DF', carrierDescription: 'Departed Facility', internalStatus: 'In Transit', triggerNotification: false, isActive: true },
    { id: '3', carrierStatus: 'AR', carrierDescription: 'Arrived at Destination', internalStatus: 'In Transit', triggerNotification: false, isActive: true },
    { id: '4', carrierStatus: 'WC', carrierDescription: 'With Delivery Courier', internalStatus: 'Out for Delivery', triggerNotification: true, isActive: true },
    { id: '5', carrierStatus: 'OK', carrierDescription: 'Delivered', internalStatus: 'Delivered', triggerNotification: true, isActive: true },
  ],
};

const internalStatuses = ['In Transit', 'Out for Delivery', 'Delivered', 'Exception', 'Cancelled', 'Returned'];

export function TrackingMappingsTab({ carrier }: TrackingMappingsTabProps) {
  const [mappings, setMappings] = useState<TrackingMapping[]>(sampleTrackingMappings[carrier] || []);

  const handleToggleActive = (id: string) => {
    setMappings(mappings.map(mapping =>
      mapping.id === id ? { ...mapping, isActive: !mapping.isActive } : mapping
    ));
  };

  const handleToggleNotification = (id: string) => {
    setMappings(mappings.map(mapping =>
      mapping.id === id ? { ...mapping, triggerNotification: !mapping.triggerNotification } : mapping
    ));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Map {CARRIER_LABELS[carrier]} tracking statuses to your internal statuses
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <p className="text-sm text-blue-800">
              Tracking mappings translate carrier-specific status codes to your internal status system. Enable notifications to alert customers when specific statuses are received.
            </p>
          </div>
        </div>
      </div>

      {/* Mappings Table */}
      {mappings.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {CARRIER_LABELS[carrier]} Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Internal Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Notify
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {mappings.map((mapping) => (
                <tr
                  key={mapping.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !mapping.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 rounded bg-gray-100 text-sm font-mono text-text-primary">
                      {mapping.carrierStatus}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-text-secondary">{mapping.carrierDescription}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={
                      mapping.internalStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                      mapping.internalStatus === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                      mapping.internalStatus === 'In Transit' ? 'bg-gray-100 text-gray-700' :
                      mapping.internalStatus === 'Exception' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }>
                      {mapping.internalStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleNotification(mapping.id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        mapping.triggerNotification
                          ? 'text-brand-cyan bg-brand-cyan/10'
                          : 'text-text-muted hover:bg-gray-100'
                      }`}
                      title={mapping.triggerNotification ? 'Notification enabled' : 'Notification disabled'}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Toggle
                      checked={mapping.isActive}
                      onChange={() => handleToggleActive(mapping.id)}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {mappings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No tracking mappings</h3>
          <p className="text-text-secondary mb-4">Configure tracking status mappings for {CARRIER_LABELS[carrier]}</p>
        </div>
      )}
    </div>
  );
}
