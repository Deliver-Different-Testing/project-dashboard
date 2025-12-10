// src/modules/schedules/components/ClientOverridesTab.tsx
import { useState, useMemo, useEffect } from 'react';
import { Search, Lock } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Toggle } from '../../../components/ui/Toggle';
import { Button } from '../../../components/ui/Button';
import { ChainBuilder } from './ChainBuilder';
import { OperatingScheduleSection } from './OperatingScheduleSection';
import type { Schedule } from '../types';
import { BOOKING_MODES, DAYS_OF_WEEK } from '../types';
import { sampleClients, sampleDepots, sampleSpeeds, sampleZones } from '../data/sampleData';

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

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let clients = sampleClients;
    if (clientSearch.trim()) {
      const search = clientSearch.toLowerCase();
      clients = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(search) ||
          client.shortName?.toLowerCase().includes(search)
      );
    }
    // Sort: those with overrides first
    return [...clients].sort((a, b) => {
      const aHasOverride = clientOverrideMap.has(a.id);
      const bHasOverride = clientOverrideMap.has(b.id);
      if (aHasOverride && !bHasOverride) return -1;
      if (!aHasOverride && bHasOverride) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [clientSearch, clientOverrideMap]);

  const selectedClient = selectedClientId
    ? sampleClients.find((c) => c.id === selectedClientId)
    : null;

  const existingOverride = selectedClientId
    ? clientOverrideMap.get(selectedClientId) || null
    : null;

  // Form state for the override
  const [formSchedule, setFormSchedule] = useState<Schedule | null>(null);

  // Initialize/reset form when client changes
  useEffect(() => {
    if (!selectedClientId || !selectedClient) {
      setFormSchedule(null);
      return;
    }

    if (existingOverride) {
      setFormSchedule({ ...existingOverride });
    } else {
      setFormSchedule({
        ...baseSchedule,
        id: `override-${Date.now()}`,
        name: `${baseSchedule.name} (${selectedClient.shortName || selectedClient.name})`,
        isOverride: true,
        baseScheduleId: baseSchedule.id,
        overriddenFields: [],
        clientVisibility: 'specific',
        clientIds: [selectedClientId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [selectedClientId, selectedClient, existingOverride, baseSchedule]);

  // Handlers for override form
  const handleOverrideChange = (field: keyof Schedule, value: any) => {
    if (!formSchedule) return;
    setFormSchedule((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleOperatingScheduleChange = (operatingSchedule: Schedule['operatingSchedule']) => {
    if (!formSchedule) return;
    setFormSchedule((prev) => prev ? { ...prev, operatingSchedule } : null);
  };

  const handleSave = () => {
    if (!formSchedule) return;

    // Track which fields differ from base
    const overriddenFields: string[] = [];
    if (formSchedule.name !== baseSchedule.name) overriddenFields.push('name');
    if (formSchedule.description !== baseSchedule.description) overriddenFields.push('description');
    if (formSchedule.isActive !== baseSchedule.isActive) overriddenFields.push('isActive');
    if (formSchedule.bookingMode !== baseSchedule.bookingMode) overriddenFields.push('bookingMode');
    if (formSchedule.defaultDeliverySpeedId !== baseSchedule.defaultDeliverySpeedId) overriddenFields.push('defaultDeliverySpeedId');
    if (formSchedule.defaultPickupSpeedId !== baseSchedule.defaultPickupSpeedId) overriddenFields.push('defaultPickupSpeedId');
    if (formSchedule.defaultLinehaulSpeedId !== baseSchedule.defaultLinehaulSpeedId) overriddenFields.push('defaultLinehaulSpeedId');
    if (JSON.stringify(formSchedule.operatingSchedule) !== JSON.stringify(baseSchedule.operatingSchedule)) {
      overriddenFields.push('operatingSchedule');
    }

    onSaveOverride({
      ...formSchedule,
      overriddenFields,
      updatedAt: new Date().toISOString(),
    });
  };

  const getSpeedName = (speedId?: string) => {
    if (!speedId) return 'None';
    return sampleSpeeds.find((s) => s.id === speedId)?.name || speedId;
  };

  const getActiveDays = (schedule: Schedule) => {
    return DAYS_OF_WEEK.filter((day) => schedule.operatingSchedule.days[day.value]?.enabled)
      .map((day) => day.short)
      .join(', ') || 'None';
  };

  const hasChanges = formSchedule && (
    formSchedule.name !== baseSchedule.name ||
    formSchedule.description !== baseSchedule.description ||
    formSchedule.isActive !== baseSchedule.isActive ||
    formSchedule.bookingMode !== baseSchedule.bookingMode ||
    formSchedule.defaultDeliverySpeedId !== baseSchedule.defaultDeliverySpeedId ||
    formSchedule.defaultPickupSpeedId !== baseSchedule.defaultPickupSpeedId ||
    formSchedule.defaultLinehaulSpeedId !== baseSchedule.defaultLinehaulSpeedId ||
    JSON.stringify(formSchedule.operatingSchedule) !== JSON.stringify(baseSchedule.operatingSchedule)
  );

  return (
    <div className="flex flex-col h-full">
      {/* TOP SECTION: Network Map & Client Search (Blue area) */}
      <div className="bg-brand-cyan/10 border-b-2 border-brand-cyan/30 p-4">
        <div className="flex items-start gap-6">
          {/* Network Map */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-text-primary">Network Map</h3>
              <span className="text-xs text-brand-cyan bg-brand-cyan/20 px-2 py-0.5 rounded">
                {baseSchedule.legs.length} legs • Same for all clients
              </span>
            </div>
            <div className="bg-white rounded-lg border border-brand-cyan/20 p-3">
              <ChainBuilder
                schedule={baseSchedule}
                selectedLegId={null}
                onSelectLeg={() => {}}
                readOnly={true}
                depots={sampleDepots}
                speeds={sampleSpeeds}
                zones={sampleZones}
              />
            </div>
          </div>

          {/* Client Search */}
          <div className="w-64">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Client
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan"
              />
            </div>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              size={5}
            >
              {filteredClients.map((client) => {
                const hasOverride = clientOverrideMap.has(client.id);
                return (
                  <option key={client.id} value={client.id}>
                    {hasOverride ? '● ' : ''}{client.shortName || client.name}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-text-muted mt-1">
              ● = has override • {existingOverrides.length} total overrides
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Default vs Override side-by-side */}
      {selectedClient && formSchedule ? (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Default/Base (Yellow area - read-only) */}
          <div className="flex-1 bg-yellow-50 border-r border-yellow-200 overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-yellow-800">Default Schedule</h3>
              <p className="text-sm text-yellow-600">Base values (read-only)</p>
            </div>

            {/* Schedule Details */}
            <div className="bg-white/80 rounded-lg border border-yellow-200 p-4 mb-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Schedule Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted">Name</label>
                  <p className="text-sm font-medium">{baseSchedule.name}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Description</label>
                  <p className="text-sm">{baseSchedule.description || '—'}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Status</label>
                  <p className="text-sm">{baseSchedule.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            {/* Booking & Speeds */}
            <div className="bg-white/80 rounded-lg border border-yellow-200 p-4 mb-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Booking & Speeds</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted">Booking Mode</label>
                  <p className="text-sm font-medium">
                    {BOOKING_MODES.find(m => m.value === baseSchedule.bookingMode)?.label || baseSchedule.bookingMode}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-text-muted">Delivery</label>
                    <p className="text-sm">{getSpeedName(baseSchedule.defaultDeliverySpeedId)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Pickup</label>
                    <p className="text-sm">{getSpeedName(baseSchedule.defaultPickupSpeedId)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Linehaul</label>
                    <p className="text-sm">{getSpeedName(baseSchedule.defaultLinehaulSpeedId)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Schedule */}
            <div className="bg-white/80 rounded-lg border border-yellow-200 p-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Operating Schedule</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-text-muted">Active Days</label>
                  <p className="text-sm font-medium">{getActiveDays(baseSchedule)}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Booking Cutoff</label>
                  <p className="text-sm">
                    {baseSchedule.operatingSchedule.cutoffValue} {baseSchedule.operatingSchedule.cutoffUnit} before
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Override (Green area - editable) */}
          <div className="flex-1 bg-green-50 overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-800">
                {selectedClient.name} Override
              </h3>
              <p className="text-sm text-green-600">
                {existingOverride ? 'Edit override values' : 'Create new override'}
              </p>
            </div>

            {/* Schedule Details - EDITABLE */}
            <div className="bg-white/80 rounded-lg border border-green-200 p-4 mb-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Schedule Details</h4>
              <div className="space-y-3">
                <Input
                  label="Name"
                  value={formSchedule.name}
                  onChange={(e) => handleOverrideChange('name', e.target.value)}
                  className={formSchedule.name !== baseSchedule.name ? 'ring-2 ring-green-400' : ''}
                />
                <div>
                  <label className="block text-xs text-text-muted mb-1">Description</label>
                  <textarea
                    value={formSchedule.description || ''}
                    onChange={(e) => handleOverrideChange('description', e.target.value)}
                    placeholder="Custom description..."
                    className={`w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-green-400 resize-none ${
                      formSchedule.description !== baseSchedule.description ? 'ring-2 ring-green-400' : ''
                    }`}
                    rows={2}
                  />
                </div>
                <Toggle
                  label="Active"
                  checked={formSchedule.isActive}
                  onChange={(checked) => handleOverrideChange('isActive', checked)}
                />
              </div>
            </div>

            {/* Booking & Speeds - EDITABLE */}
            <div className="bg-white/80 rounded-lg border border-green-200 p-4 mb-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Booking & Speeds</h4>
              <div className="space-y-3">
                <Select
                  label="Booking Mode"
                  value={formSchedule.bookingMode}
                  onChange={(e) => handleOverrideChange('bookingMode', e.target.value)}
                  options={BOOKING_MODES.map((m) => ({ value: m.value, label: m.label }))}
                  className={formSchedule.bookingMode !== baseSchedule.bookingMode ? 'ring-2 ring-green-400' : ''}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Select
                    label="Delivery"
                    value={formSchedule.defaultDeliverySpeedId || ''}
                    onChange={(e) => handleOverrideChange('defaultDeliverySpeedId', e.target.value || undefined)}
                    options={[
                      { value: '', label: 'None' },
                      ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                    className={formSchedule.defaultDeliverySpeedId !== baseSchedule.defaultDeliverySpeedId ? 'ring-2 ring-green-400' : ''}
                  />
                  <Select
                    label="Pickup"
                    value={formSchedule.defaultPickupSpeedId || ''}
                    onChange={(e) => handleOverrideChange('defaultPickupSpeedId', e.target.value || undefined)}
                    options={[
                      { value: '', label: 'None' },
                      ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                    className={formSchedule.defaultPickupSpeedId !== baseSchedule.defaultPickupSpeedId ? 'ring-2 ring-green-400' : ''}
                  />
                  <Select
                    label="Linehaul"
                    value={formSchedule.defaultLinehaulSpeedId || ''}
                    onChange={(e) => handleOverrideChange('defaultLinehaulSpeedId', e.target.value || undefined)}
                    options={[
                      { value: '', label: 'None' },
                      ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                    ]}
                    className={formSchedule.defaultLinehaulSpeedId !== baseSchedule.defaultLinehaulSpeedId ? 'ring-2 ring-green-400' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Operating Schedule - EDITABLE */}
            <div className="bg-white/80 rounded-lg border border-green-200 p-4 mb-4">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Operating Schedule</h4>
              <OperatingScheduleSection
                schedule={formSchedule.operatingSchedule}
                onChange={handleOperatingScheduleChange}
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm">
                {hasChanges ? (
                  <span className="text-green-700 font-medium">● Changes pending</span>
                ) : (
                  <span className="text-text-muted">No changes</span>
                )}
              </span>
              <Button variant="primary" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                {existingOverride ? 'Save Override' : 'Create Override'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* No client selected */
        <div className="flex-1 flex items-center justify-center bg-surface-light">
          <div className="text-center text-text-muted">
            <div className="text-4xl mb-2">👆</div>
            <div className="text-sm">Select a client above to view/edit overrides</div>
          </div>
        </div>
      )}
    </div>
  );
}
