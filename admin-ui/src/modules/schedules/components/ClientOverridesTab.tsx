// src/modules/schedules/components/ClientOverridesTab.tsx
import { useState, useMemo, useCallback } from 'react';
import { Search, Copy } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SideBySideOverrideEditor } from './SideBySideOverrideEditor';
import type { Schedule } from '../types';
import { sampleClients } from '../data/sampleData';

interface ClientOverridesTabProps {
  baseSchedule: Schedule;
  allSchedules: Schedule[];
  onSaveOverride: (schedule: Schedule) => void;
}

export function ClientOverridesTab({
  baseSchedule,
  allSchedules,
  onSaveOverride,
}: ClientOverridesTabProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

  // Get existing overrides for this base schedule
  const existingOverrides = useMemo(() => {
    return allSchedules.filter(
      (s) => s.isOverride && s.baseScheduleId === baseSchedule.id
    );
  }, [allSchedules, baseSchedule.id]);

  // Map clientId to their override
  const clientOverrideMap = useMemo(() => {
    const map = new Map<string, Schedule>();
    existingOverrides.forEach((override) => {
      override.clientIds.forEach((clientId) => {
        map.set(clientId, override);
      });
    });
    return map;
  }, [existingOverrides]);

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return sampleClients;
    const search = clientSearch.toLowerCase();
    return sampleClients.filter(
      (client) =>
        client.name.toLowerCase().includes(search) ||
        client.shortName?.toLowerCase().includes(search)
    );
  }, [clientSearch]);

  // Sort clients: those with overrides first, then alphabetically
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      const aHasOverride = clientOverrideMap.has(a.id);
      const bHasOverride = clientOverrideMap.has(b.id);
      if (aHasOverride && !bHasOverride) return -1;
      if (!aHasOverride && bHasOverride) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredClients, clientOverrideMap]);

  const selectedClient = selectedClientId
    ? sampleClients.find((c) => c.id === selectedClientId)
    : null;

  const existingOverrideForSelected = selectedClientId
    ? clientOverrideMap.get(selectedClientId) || null
    : null;

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
  }, []);

  const handleToggleClientSelection = useCallback((clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  }, []);

  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedClientId) return;

      const currentIndex = sortedClients.findIndex((c) => c.id === selectedClientId);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        setSelectedClientId(sortedClients[currentIndex - 1].id);
      } else if (e.key === 'ArrowDown' && currentIndex < sortedClients.length - 1) {
        e.preventDefault();
        setSelectedClientId(sortedClients[currentIndex + 1].id);
      }
    },
    [selectedClientId, sortedClients]
  );

  const handleCopyToSelected = useCallback(() => {
    // Copy current override to selected clients
    if (!existingOverrideForSelected || selectedClientIds.size === 0) return;

    selectedClientIds.forEach((targetClientId) => {
      if (targetClientId === selectedClientId) return;
      const targetClient = sampleClients.find((c) => c.id === targetClientId);
      if (!targetClient) return;

      const copiedOverride: Schedule = {
        ...existingOverrideForSelected,
        id: `override-${Date.now()}-${targetClientId}`,
        name: `${baseSchedule.name} (${targetClient.shortName || targetClient.name})`,
        clientIds: [targetClientId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveOverride(copiedOverride);
    });

    setSelectedClientIds(new Set());
  }, [existingOverrideForSelected, selectedClientIds, selectedClientId, baseSchedule.name, onSaveOverride]);

  const handleSaveOverride = useCallback(
    (schedule: Schedule) => {
      onSaveOverride(schedule);
    },
    [onSaveOverride]
  );

  const overrideCount = existingOverrides.length;

  return (
    <div className="flex h-full" onKeyDown={handleKeyNavigation} tabIndex={0}>
      {/* Left: Client List */}
      <div className="w-64 border-r border-border flex flex-col bg-white">
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
            />
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto">
          {sortedClients.map((client) => {
            const hasOverride = clientOverrideMap.has(client.id);
            const override = clientOverrideMap.get(client.id);
            const isSelected = selectedClientId === client.id;
            const isChecked = selectedClientIds.has(client.id);

            return (
              <div
                key={client.id}
                onClick={() => handleSelectClient(client.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-border/50 transition-colors
                  ${isSelected ? 'bg-brand-cyan/10 border-l-2 border-l-brand-cyan' : 'hover:bg-surface-cream'}
                `}
              >
                {/* Checkbox for bulk selection */}
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  onClick={(e) => handleToggleClientSelection(client.id, e)}
                  className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan"
                />

                {/* Client Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {client.shortName || client.name}
                  </div>
                  {hasOverride && (
                    <div className="text-xs text-yellow-600">
                      {override?.overriddenFields.length || 0} override(s)
                    </div>
                  )}
                </div>

                {/* Override indicator */}
                {hasOverride && (
                  <div className="w-2 h-2 rounded-full bg-yellow-400" title="Has override" />
                )}
              </div>
            );
          })}

          {sortedClients.length === 0 && (
            <div className="p-4 text-sm text-text-muted text-center">No clients found</div>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="p-3 border-t border-border bg-surface-light space-y-2">
          <div className="text-xs text-text-muted">
            {selectedClientIds.size > 0
              ? `${selectedClientIds.size} client(s) selected`
              : `${overrideCount} override(s) total`}
          </div>
          {selectedClientIds.size > 0 && existingOverrideForSelected && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleCopyToSelected}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy to Selected ({selectedClientIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Right: Override Editor */}
      <div className="flex-1 flex flex-col bg-surface-light">
        {selectedClient ? (
          <SideBySideOverrideEditor
            baseSchedule={baseSchedule}
            clientId={selectedClient.id}
            client={selectedClient}
            existingOverride={existingOverrideForSelected}
            onSave={handleSaveOverride}
            onCancel={() => setSelectedClientId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <div className="text-4xl mb-2">👈</div>
              <div className="text-sm">Select a client to view/edit overrides</div>
              <div className="text-xs mt-1">
                Use arrow keys to navigate, checkboxes for bulk operations
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
