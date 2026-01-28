import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Toggle } from '../../../components/ui/Toggle';
import { sampleServiceMappings } from '../data/sampleData';
import { CARRIER_LABELS, CARRIER_COLORS } from '../types';
import type { ServiceMapping } from '../types';

export function ServiceMappingsTab() {
  const [mappings, setMappings] = useState<ServiceMapping[]>(sampleServiceMappings);

  const handleToggleActive = (id: string) => {
    setMappings(mappings.map(mapping =>
      mapping.id === id ? { ...mapping, isActive: !mapping.isActive } : mapping
    ));
  };

  // Group mappings by job type
  const groupedMappings = mappings.reduce((acc, mapping) => {
    if (!acc[mapping.jobType]) {
      acc[mapping.jobType] = [];
    }
    acc[mapping.jobType].push(mapping);
    return acc;
  }, {} as Record<string, ServiceMapping[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {mappings.length} service mapping{mappings.length !== 1 ? 's' : ''} configured
        </p>
      </div>

      {/* Mappings Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Job Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Carrier Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Carrier
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                DIM Factor
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                Status
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
                  <span className="font-medium text-text-primary">{mapping.jobType}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-text-secondary">{mapping.carrierService}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge className={CARRIER_COLORS[mapping.carrier]}>
                    {CARRIER_LABELS[mapping.carrier]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-text-secondary">{mapping.dimensionalFactor}</span>
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

      {/* Summary by Job Type */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(groupedMappings).map(([jobType, typeMappings]) => {
          const activeCount = typeMappings.filter(m => m.isActive).length;
          return (
            <div key={jobType} className="p-4 rounded-lg bg-gray-50 border border-border">
              <h4 className="font-medium text-text-primary mb-1">{jobType}</h4>
              <p className="text-sm text-text-secondary">
                {activeCount} of {typeMappings.length} carrier{typeMappings.length !== 1 ? 's' : ''} active
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {mappings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No service mappings</h3>
          <p className="text-text-secondary mb-4">Map your job types to carrier services</p>
        </div>
      )}
    </div>
  );
}
