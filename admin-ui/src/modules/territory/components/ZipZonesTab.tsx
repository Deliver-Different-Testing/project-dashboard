import { useState, useMemo } from 'react';
import { DataTable } from '../../../components/data/DataTable';
import { Button } from '../../../components/ui/Button';
import { zipZonesData, zipZoneColumns } from '../data/sampleData';
import type { ZipZone } from '../types';

interface ZipZonesTabProps {
  activeFilters: Record<string, string[]>;
  searchQuery: string;
}

export function ZipZonesTab({ activeFilters, searchQuery }: ZipZonesTabProps) {
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

  // Filter zip zones based on active filters and search query
  const filteredZones = useMemo(() => {
    return zipZonesData.filter((zone: ZipZone) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          zone.zip.toLowerCase().includes(query) ||
          zone.zoneName.toLowerCase().includes(query) ||
          zone.zoneNumber.toLowerCase().includes(query) ||
          zone.depot.toLowerCase().includes(query) ||
          zone.customer.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Apply active filters
      for (const [filterId, values] of Object.entries(activeFilters)) {
        if (values.length === 0) continue;
        // Skip "All" options
        const nonAllValues = values.filter(v => !v.startsWith('All '));
        if (nonAllValues.length === 0) continue;

        const zoneValue = zone[filterId as keyof ZipZone];
        if (typeof zoneValue === 'string' && !nonAllValues.includes(zoneValue)) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilters, searchQuery]);

  return (
    <DataTable
      columns={zipZoneColumns}
      data={filteredZones}
      selectable
      selectedIds={selectedZones}
      onSelectionChange={setSelectedZones}
      pagination={{ page: 1, pageSize: 20, total: filteredZones.length }}
      actions={() => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">Delete</Button>
        </div>
      )}
    />
  );
}
