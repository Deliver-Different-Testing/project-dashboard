// src/modules/schedules/components/ScheduleTableView.tsx
import { useState, useCallback } from 'react';
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
    // Close panel entirely (no view mode to return to)
    setSelectedSchedule(null);
    setEditingSchedule(null);
    setEditingClientId(null);
  }, []);

  // Find base schedule for override editing
  const baseScheduleForOverride = editingSchedule?.isOverride
    ? schedules.find((s) => s.id === editingSchedule.baseScheduleId) || null
    : null;

  // Panel is always expanded (600px) since we go directly to edit mode
  const showPanel = editingSchedule !== null;

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
      {/* Left: Table */}
      <div className="flex-1 min-w-[400px] overflow-hidden border-r border-border transition-all duration-200">
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

      {/* Right: Edit Panel (always 600px - no view mode) */}
      {showPanel && (
        <div className="w-[600px] flex-shrink-0 transition-all duration-200 flex flex-col h-full overflow-hidden">
          {panelMode === 'edit' && editingSchedule && (
            <div className="h-full flex flex-col bg-white">
              <div className="flex items-center justify-between p-4 border-b border-border bg-surface-light">
                <h2 className="text-lg font-semibold text-text-primary">
                  {schedules.some((s) => s.id === editingSchedule.id) ? 'Edit Schedule' : 'New Schedule'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-text-muted hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ScheduleEditForm
                  schedule={editingSchedule}
                  allSchedules={schedules}
                  onSave={handleSaveSchedule}
                  onCancel={handleCancelEdit}
                  isNew={!schedules.some((s) => s.id === editingSchedule.id)}
                />
              </div>
            </div>
          )}

          {panelMode === 'override' && editingSchedule && baseScheduleForOverride && (
            <div className="h-full flex flex-col bg-white">
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
                <>
                  <div className="flex items-center justify-between p-4 border-b border-border bg-surface-light">
                    <h2 className="text-lg font-semibold text-text-primary">
                      {schedules.some((s) => s.id === editingSchedule.id) ? 'Edit Override' : 'New Override'}
                    </h2>
                    <button onClick={handleCancelEdit} className="text-sm text-text-muted hover:text-text-primary">
                      Cancel
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <OverrideEditor
                      schedule={editingSchedule}
                      baseSchedule={baseScheduleForOverride}
                      onSave={handleSaveSchedule}
                      onCancel={handleCancelEdit}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
