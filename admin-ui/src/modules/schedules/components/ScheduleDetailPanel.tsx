// src/modules/schedules/components/ScheduleDetailPanel.tsx
import { useState } from 'react';
import { X, Edit2, Copy } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Toggle } from '../../../components/ui/Toggle';
import { ConnectionBadge } from '../../../components/tags/ConnectionBadge';
import { ChainBuilder } from './ChainBuilder';
import { PanelTabs } from './PanelTabs';
import type { PanelTab } from './PanelTabs';
import { ClientSearch } from './ClientSearch';
import type { Schedule } from '../types';
import { getBookingModeLabel, getActiveDaysSummary, getRouteDescription } from '../types';
import { sampleDepots, sampleSpeeds, sampleZones, sampleClients } from '../data/sampleData';

interface ScheduleDetailPanelProps {
  schedule: Schedule | null;
  allSchedules: Schedule[];
  onClose: () => void;
  onEdit: (schedule: Schedule) => void;
  onCreateOverride: (baseSchedule: Schedule) => void;
  onDuplicate: (schedule: Schedule) => void;
  onToggleActive: (schedule: Schedule, active: boolean) => void;
  onEditClientOverride: (baseSchedule: Schedule, clientId: string) => void;
  onConnectionsClick: (schedule: Schedule) => void;
}

export function ScheduleDetailPanel({
  schedule,
  allSchedules,
  onClose,
  onEdit,
  onCreateOverride: _onCreateOverride,
  onDuplicate,
  onToggleActive,
  onEditClientOverride,
  onConnectionsClick,
}: ScheduleDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('default');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  if (!schedule) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-light border-l border-border">
        <div className="text-center text-text-muted p-8">
          <div className="text-4xl mb-4">📋</div>
          <p>Select a schedule to view details</p>
        </div>
      </div>
    );
  }

  // For overrides, show simplified view
  if (schedule.isOverride) {
    const baseSchedule = allSchedules.find((s) => s.id === schedule.baseScheduleId);

    return (
      <div className="h-full flex flex-col bg-white border-l border-border">
        {/* Header - Purple themed for override */}
        <div className="flex items-start justify-between p-4 border-b border-border bg-brand-purple/5 border-l-4 border-l-brand-purple">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="system" className="bg-brand-purple text-white">Override</Badge>
            </div>
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {schedule.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Base: {baseSchedule?.name || 'Unknown'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-cream rounded transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Overridden fields list */}
          <div className="border border-brand-purple/20 bg-brand-purple/5 rounded-lg p-3">
            <h3 className="text-sm font-medium text-brand-purple mb-2">Overridden Fields</h3>
            <div className="flex flex-wrap gap-1">
              {schedule.overriddenFields.length > 0 ? (
                schedule.overriddenFields.map((field) => (
                  <span key={field} className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple text-xs rounded">
                    {field.split('.').pop()}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-muted">No fields overridden yet</span>
              )}
            </div>
          </div>

          {/* Client info */}
          <div className="border border-border rounded-lg p-3">
            <h3 className="text-sm font-medium text-text-primary mb-2">Assigned Clients</h3>
            <div className="flex flex-wrap gap-1">
              {schedule.clientIds.map((id) => {
                const client = sampleClients.find((c) => c.id === id);
                return (
                  <span key={id} className="px-2 py-0.5 bg-brand-cyan/10 text-brand-dark text-xs rounded">
                    {client?.name || id}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-light">
          <Button variant="primary" className="w-full" onClick={() => onEdit(schedule)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Edit Override
          </Button>
        </div>
      </div>
    );
  }

  // Base schedule view
  const route = getRouteDescription(schedule, sampleDepots);
  const days = getActiveDaysSummary(schedule.operatingSchedule);
  const mode = getBookingModeLabel(schedule.bookingMode);

  // Count client overrides for this schedule
  const clientOverrideCount = allSchedules.filter(
    (s) => s.isOverride && s.baseScheduleId === schedule.id
  ).length;

  // Count connected categories
  const connectionCount = Object.values(schedule.connections).filter(
    (c) => c.hasConnections
  ).length;

  return (
    <div className="h-full flex flex-col bg-white border-l border-border">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border bg-surface-light">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {schedule.name}
            </h2>
            <Toggle
              checked={schedule.isActive}
              onChange={(checked) => onToggleActive(schedule, checked)}
              size="sm"
            />
          </div>
          <p className="text-sm text-text-secondary">{route}</p>
          <div className="mt-2">
            <ConnectionBadge
              connectionCount={connectionCount}
              onClick={() => onConnectionsClick(schedule)}
              size="sm"
            />
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-surface-cream rounded transition-colors">
          <X className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      {/* Route Chain - Prominent position */}
      <div className="p-4 border-b border-border bg-surface-cream/50">
        <div className="text-xs text-text-muted uppercase font-medium mb-2">Route Chain</div>
        <div className="overflow-x-auto">
          <ChainBuilder
            schedule={schedule}
            selectedLegId={null}
            onSelectLeg={() => {}}
            onAddLeg={() => {}}
            onRemoveLeg={() => {}}
            depots={sampleDepots}
            speeds={sampleSpeeds}
            zones={sampleZones}
            readOnly
          />
        </div>
      </div>

      {/* Tabs */}
      <PanelTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clientOverrideCount={clientOverrideCount}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'default' ? (
          <div className="p-4 space-y-4">
            {/* Timing Section */}
            <div className="space-y-2">
              <h3 className="text-xs text-text-muted uppercase font-medium">Timing</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Mode</div>
                  <div className="text-sm font-medium text-text-primary">{mode}</div>
                </div>
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Days</div>
                  <div className="text-sm font-medium text-text-primary">{days}</div>
                </div>
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Cutoff</div>
                  <div className="text-sm font-medium text-text-primary">
                    {schedule.operatingSchedule.cutoffValue} {schedule.operatingSchedule.cutoffUnit}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-2">
              <h3 className="text-xs text-text-muted uppercase font-medium">Availability</h3>
              <div className="bg-surface-light rounded-lg p-3">
                <div className="text-xs text-text-muted mb-1">Clients</div>
                <div className="text-sm font-medium text-text-primary">
                  {schedule.clientVisibility === 'all'
                    ? 'Available to all clients'
                    : `${schedule.clientIds.length} specific clients`}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-2">
              <h3 className="text-xs text-text-muted uppercase font-medium">Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Legs</div>
                  <div className="text-sm font-medium text-text-primary">{schedule.legs.length}</div>
                </div>
                <div className="bg-surface-light rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">Overrides</div>
                  <div className="text-sm font-medium text-text-primary">{clientOverrideCount}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Clients Tab */
          <div className="p-4 space-y-4">
            <div className="text-sm text-text-secondary">
              Select a client to view or create an override for this schedule.
            </div>
            <ClientSearch
              clients={sampleClients}
              schedules={allSchedules}
              baseScheduleId={schedule.id}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
            />
            {selectedClientId && (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => onEditClientOverride(schedule, selectedClientId)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {allSchedules.some(
                  (s) =>
                    s.isOverride &&
                    s.baseScheduleId === schedule.id &&
                    s.clientIds.includes(selectedClientId)
                )
                  ? 'Edit Client Override'
                  : 'Create Client Override'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions - Only show on Default tab */}
      {activeTab === 'default' && (
        <div className="p-4 border-t border-border bg-surface-light">
          <div className="flex gap-2">
            <Button variant="primary" className="flex-1" onClick={() => onEdit(schedule)}>
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Default
            </Button>
            <Button variant="ghost" onClick={() => onDuplicate(schedule)}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
