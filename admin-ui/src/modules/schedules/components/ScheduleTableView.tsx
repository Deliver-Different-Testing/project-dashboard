// src/modules/schedules/components/ScheduleTableView.tsx
import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScheduleTable } from './ScheduleTable';
import { ScheduleEditForm } from './ScheduleEditForm';
import { OverrideEditor } from './OverrideEditor';
import { ClientOverrideEditor } from './ClientOverrideEditor';
import type { Schedule } from '../types';
import { sampleSchedules, sampleClients } from '../data/sampleData';

interface ScheduleTableViewProps {
  onConnectionsClick: (sourceItem: any, connections: any) => void;
  searchQuery?: string;
  tagSearch?: string;
}

// Removed 'view' mode - clicking a schedule now opens edit directly
type PanelMode = 'edit' | 'override';

export function ScheduleTableView({
  onConnectionsClick: _onConnectionsClick,
  searchQuery = '',
  tagSearch = '',
}: ScheduleTableViewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [collapsedBaseIds, setCollapsedBaseIds] = useState<Set<string>>(new Set());

  // Panel mode: edit (default), override (for client overrides)
  const [panelMode, setPanelMode] = useState<PanelMode>('edit');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Client override editing
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Clicking a schedule opens it directly in edit mode (no intermediate view)
  const handleSelectSchedule = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setEditingSchedule({ ...schedule });
    setPanelMode(schedule.isOverride ? 'override' : 'edit');
    setEditingClientId(null);
  }, []);

  const handleToggleCollapse = useCallback((baseId: string) => {
    setCollapsedBaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(baseId)) {
        next.delete(baseId);
      } else {
        next.add(baseId);
      }
      return next;
    });
  }, []);

  const handleCopyToClient = useCallback((targetClientId: string, sourceSchedule: Schedule) => {
    const targetClient = sampleClients.find((c) => c.id === targetClientId);
    const baseSchedule = schedules.find((s) => s.id === sourceSchedule.baseScheduleId);

    if (!baseSchedule) return;

    const copiedOverride: Schedule = {
      ...sourceSchedule,
      id: `override-${Date.now()}`,
      name: `${baseSchedule.name} (${targetClient?.shortName || targetClient?.name || targetClientId})`,
      clientIds: [targetClientId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingSchedule(copiedOverride);
    setEditingClientId(targetClientId);
    setPanelMode('override');
  }, [schedules]);

  const handleSaveSchedule = useCallback((updatedSchedule: Schedule) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === updatedSchedule.id);
      if (exists) {
        return prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s));
      } else {
        return [...prev, updatedSchedule];
      }
    });
    // Stay in edit mode after saving, update the editing state with saved data
    setSelectedSchedule(updatedSchedule);
    setEditingSchedule({ ...updatedSchedule });
    setEditingClientId(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    // Close edit view entirely, return to table
    setSelectedSchedule(null);
    setEditingSchedule(null);
    setEditingClientId(null);
  }, []);

  // Find base schedule for override editing
  const baseScheduleForOverride = editingSchedule?.isOverride
    ? schedules.find((s) => s.id === editingSchedule.baseScheduleId) || null
    : null;

  // Are we in edit mode?
  const isEditing = editingSchedule !== null;

  // Full-page edit mode: hide table, show edit form at full width
  if (isEditing) {
    return (
      <div className="h-[calc(100vh-200px)] min-h-[500px] flex flex-col bg-white">
        {/* Header with back button */}
        <div className="flex items-center gap-4 p-4 border-b border-border bg-surface-light">
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedules
          </button>
          <div className="h-4 w-px bg-border" />
          <h2 className="text-lg font-semibold text-text-primary">
            {panelMode === 'edit'
              ? (schedules.some((s) => s.id === editingSchedule.id) ? 'Edit Schedule' : 'New Schedule')
              : (schedules.some((s) => s.id === editingSchedule.id) ? 'Edit Override' : 'New Override')
            }
          </h2>
          <span className="text-sm text-text-muted">
            {editingSchedule.name}
          </span>
        </div>

        {/* Full-width edit content */}
        <div className="flex-1 overflow-y-auto">
          {panelMode === 'edit' && (
            <div className="max-w-6xl mx-auto p-6">
              <ScheduleEditForm
                schedule={editingSchedule}
                allSchedules={schedules}
                onSave={handleSaveSchedule}
                onCancel={handleCancelEdit}
                isNew={!schedules.some((s) => s.id === editingSchedule.id)}
              />
            </div>
          )}

          {panelMode === 'override' && baseScheduleForOverride && (
            <div className="max-w-6xl mx-auto p-6">
              {editingClientId ? (
                <ClientOverrideEditor
                  schedule={editingSchedule}
                  baseSchedule={baseScheduleForOverride}
                  client={sampleClients.find((c) => c.id === editingClientId) || { id: editingClientId, name: editingClientId }}
                  allClients={sampleClients}
                  allSchedules={schedules}
                  onSave={handleSaveSchedule}
                  onCancel={handleCancelEdit}
                  onCopyToClient={handleCopyToClient}
                />
              ) : (
                <OverrideEditor
                  schedule={editingSchedule}
                  baseSchedule={baseScheduleForOverride}
                  onSave={handleSaveSchedule}
                  onCancel={handleCancelEdit}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Table view (no schedule selected)
  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <ScheduleTable
        schedules={schedules}
        selectedId={selectedSchedule?.id || null}
        onSelectSchedule={handleSelectSchedule}
        collapsedBaseIds={collapsedBaseIds}
        onToggleCollapse={handleToggleCollapse}
        externalSearchQuery={searchQuery}
        externalTagSearch={tagSearch}
      />
    </div>
  );
}
