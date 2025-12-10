// src/modules/schedules/components/SideBySideOverrideEditor.tsx
import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { OverrideFieldRow } from './OverrideFieldRow';
import type { Schedule, DayOfWeek } from '../types';
import { OVERRIDABLE_FIELDS, DAYS_OF_WEEK } from '../types';
import { sampleSpeeds } from '../data/sampleData';

interface ClientReference {
  id: string;
  name: string;
  shortName?: string;
}

interface SideBySideOverrideEditorProps {
  baseSchedule: Schedule;
  clientId: string;
  client: ClientReference;
  existingOverride: Schedule | null;
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
}

export function SideBySideOverrideEditor({
  baseSchedule,
  clientId,
  client,
  existingOverride,
  onSave,
  onCancel,
}: SideBySideOverrideEditorProps) {
  // Initialize form state from existing override or base schedule
  const [formSchedule, setFormSchedule] = useState<Schedule>(() => {
    if (existingOverride) {
      return { ...existingOverride };
    }
    // Create new override from base
    return {
      ...baseSchedule,
      id: `override-${Date.now()}`,
      name: `${baseSchedule.name} (${client.shortName || client.name})`,
      isOverride: true,
      baseScheduleId: baseSchedule.id,
      overriddenFields: [],
      clientVisibility: 'specific',
      clientIds: [clientId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [overrideToggles, setOverrideToggles] = useState<Record<string, boolean>>(() => {
    const toggles: Record<string, boolean> = {};
    OVERRIDABLE_FIELDS.forEach((field) => {
      toggles[field.field] = formSchedule.overriddenFields.includes(field.field);
    });
    return toggles;
  });

  // Reset form when client changes
  useEffect(() => {
    if (existingOverride) {
      setFormSchedule({ ...existingOverride });
      const toggles: Record<string, boolean> = {};
      OVERRIDABLE_FIELDS.forEach((field) => {
        toggles[field.field] = existingOverride.overriddenFields.includes(field.field);
      });
      setOverrideToggles(toggles);
    } else {
      setFormSchedule({
        ...baseSchedule,
        id: `override-${Date.now()}`,
        name: `${baseSchedule.name} (${client.shortName || client.name})`,
        isOverride: true,
        baseScheduleId: baseSchedule.id,
        overriddenFields: [],
        clientVisibility: 'specific',
        clientIds: [clientId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const toggles: Record<string, boolean> = {};
      OVERRIDABLE_FIELDS.forEach((field) => {
        toggles[field.field] = false;
      });
      setOverrideToggles(toggles);
    }
  }, [clientId, existingOverride, baseSchedule, client]);

  const isFieldOverridden = (field: string): boolean => {
    return overrideToggles[field] || false;
  };

  const handleToggleOverride = (field: string) => {
    const newEnabled = !overrideToggles[field];
    setOverrideToggles((prev) => ({ ...prev, [field]: newEnabled }));

    if (newEnabled) {
      if (!formSchedule.overriddenFields.includes(field)) {
        setFormSchedule((prev) => ({
          ...prev,
          overriddenFields: [...prev.overriddenFields, field],
        }));
      }
    } else {
      // Reset to base value when disabled
      setFormSchedule((prev) => {
        const updated = { ...prev };
        updated.overriddenFields = updated.overriddenFields.filter((f) => f !== field);

        // Reset field value to base
        if (field === 'operatingSchedule.cutoffValue') {
          updated.operatingSchedule = {
            ...updated.operatingSchedule,
            cutoffValue: baseSchedule.operatingSchedule.cutoffValue,
          };
        } else if (field === 'operatingSchedule.days') {
          updated.operatingSchedule = {
            ...updated.operatingSchedule,
            days: { ...baseSchedule.operatingSchedule.days },
          };
        } else if (field === 'defaultDeliverySpeedId') {
          updated.defaultDeliverySpeedId = baseSchedule.defaultDeliverySpeedId;
        } else if (field === 'defaultPickupSpeedId') {
          updated.defaultPickupSpeedId = baseSchedule.defaultPickupSpeedId;
        } else if (field === 'defaultLinehaulSpeedId') {
          updated.defaultLinehaulSpeedId = baseSchedule.defaultLinehaulSpeedId;
        }

        return updated;
      });
    }
  };

  const handleCutoffChange = (value: number) => {
    setFormSchedule((prev) => ({
      ...prev,
      operatingSchedule: {
        ...prev.operatingSchedule,
        cutoffValue: value,
      },
    }));
  };

  const handleSpeedChange = (
    field: 'defaultDeliverySpeedId' | 'defaultPickupSpeedId' | 'defaultLinehaulSpeedId',
    value: string
  ) => {
    setFormSchedule((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleDayToggle = (day: DayOfWeek, enabled: boolean) => {
    setFormSchedule((prev) => ({
      ...prev,
      operatingSchedule: {
        ...prev.operatingSchedule,
        days: {
          ...prev.operatingSchedule.days,
          [day]: {
            ...prev.operatingSchedule.days[day],
            enabled,
          },
        },
      },
    }));
  };

  const handleSave = () => {
    onSave({
      ...formSchedule,
      updatedAt: new Date().toISOString(),
    });
  };

  // Get speed name by ID
  const getSpeedName = (speedId?: string) => {
    if (!speedId) return 'None';
    const speed = sampleSpeeds.find((s) => s.id === speedId);
    return speed?.name || speedId;
  };

  // Get active days string
  const getActiveDays = (schedule: Schedule) => {
    return DAYS_OF_WEEK.filter((day) => schedule.operatingSchedule.days[day.value]?.enabled)
      .map((day) => day.short)
      .join(', ') || 'None';
  };

  const hasChanges = formSchedule.overriddenFields.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-brand-purple/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-brand-purple">
              {client.shortName?.charAt(0) || client.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{client.name}</h3>
            <p className="text-xs text-text-muted">
              {existingOverride ? 'Edit Override' : 'Create Override'}
            </p>
          </div>
        </div>
      </div>

      {/* Override Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Timing Category */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Timing
          </h4>

          {/* Booking Cutoff */}
          <OverrideFieldRow
            label="Booking Cutoff"
            baseValue={`${baseSchedule.operatingSchedule.cutoffValue} ${baseSchedule.operatingSchedule.cutoffUnit}`}
            overrideValue={
              <Input
                type="number"
                value={formSchedule.operatingSchedule.cutoffValue}
                onChange={(e) => handleCutoffChange(parseInt(e.target.value) || 0)}
                className="w-24"
              />
            }
            isOverridden={isFieldOverridden('operatingSchedule.cutoffValue')}
            onToggleOverride={() => handleToggleOverride('operatingSchedule.cutoffValue')}
          />

          {/* Operating Days */}
          <div className="mt-2">
            <OverrideFieldRow
              label="Operating Days"
              baseValue={getActiveDays(baseSchedule)}
              overrideValue={
                <div className="flex flex-wrap gap-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      onClick={() =>
                        handleDayToggle(day.value, !formSchedule.operatingSchedule.days[day.value]?.enabled)
                      }
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        formSchedule.operatingSchedule.days[day.value]?.enabled
                          ? 'bg-brand-cyan text-white'
                          : 'bg-gray-200 text-text-muted'
                      }`}
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              }
              isOverridden={isFieldOverridden('operatingSchedule.days')}
              onToggleOverride={() => handleToggleOverride('operatingSchedule.days')}
            />
          </div>
        </div>

        {/* Speeds Category */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Speeds
          </h4>

          <OverrideFieldRow
            label="Delivery Speed"
            baseValue={getSpeedName(baseSchedule.defaultDeliverySpeedId)}
            overrideValue={
              <Select
                value={formSchedule.defaultDeliverySpeedId || ''}
                onChange={(e) => handleSpeedChange('defaultDeliverySpeedId', e.target.value)}
                options={[
                  { value: '', label: 'None' },
                  ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                ]}
                className="w-40"
              />
            }
            isOverridden={isFieldOverridden('defaultDeliverySpeedId')}
            onToggleOverride={() => handleToggleOverride('defaultDeliverySpeedId')}
          />

          <div className="mt-2">
            <OverrideFieldRow
              label="Pickup Speed"
              baseValue={getSpeedName(baseSchedule.defaultPickupSpeedId)}
              overrideValue={
                <Select
                  value={formSchedule.defaultPickupSpeedId || ''}
                  onChange={(e) => handleSpeedChange('defaultPickupSpeedId', e.target.value)}
                  options={[
                    { value: '', label: 'None' },
                    ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  className="w-40"
                />
              }
              isOverridden={isFieldOverridden('defaultPickupSpeedId')}
              onToggleOverride={() => handleToggleOverride('defaultPickupSpeedId')}
            />
          </div>

          <div className="mt-2">
            <OverrideFieldRow
              label="Linehaul Speed"
              baseValue={getSpeedName(baseSchedule.defaultLinehaulSpeedId)}
              overrideValue={
                <Select
                  value={formSchedule.defaultLinehaulSpeedId || ''}
                  onChange={(e) => handleSpeedChange('defaultLinehaulSpeedId', e.target.value)}
                  options={[
                    { value: '', label: 'None' },
                    ...sampleSpeeds.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  className="w-40"
                />
              }
              isOverridden={isFieldOverridden('defaultLinehaulSpeedId')}
              onToggleOverride={() => handleToggleOverride('defaultLinehaulSpeedId')}
            />
          </div>
        </div>

        {/* Non-Overridable Section */}
        <div className="bg-gray-50 rounded-lg p-4 opacity-60">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Cannot Override (Route-Level)
          </h4>
          <div className="text-sm text-gray-400 space-y-1">
            <p>Schedule Chain: {baseSchedule.legs.length} legs</p>
            <p>Origin: {baseSchedule.originType === 'depot' ? 'Depot' : 'Client Address'}</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-surface-cream flex items-center justify-between">
        <div className="text-sm text-text-muted">
          {hasChanges ? (
            <span className="text-yellow-600">
              {formSchedule.overriddenFields.length} field(s) overridden
            </span>
          ) : (
            'No overrides set'
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {existingOverride ? 'Save Changes' : 'Create Override'}
          </Button>
        </div>
      </div>
    </div>
  );
}
