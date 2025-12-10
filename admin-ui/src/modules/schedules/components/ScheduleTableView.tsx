// src/modules/schedules/components/ScheduleTableView.tsx
import { useState, useCallback } from 'react';
import { ScheduleTable } from './ScheduleTable';
import { ScheduleDetailPanel } from './ScheduleDetailPanel';
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

type PanelMode = 'view' | 'edit' | 'override';

export function ScheduleTableView({
  onConnectionsClick: _onConnectionsClick,
  searchQuery = '',
  tagSearch = '',
}: ScheduleTableViewProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [collapsedBaseIds, setCollapsedBaseIds] = useState<Set<string>>(new Set());

  // Panel mode: view (compact), edit (expanded), override (expanded)
  const [panelMode, setPanelMode] = useState<PanelMode>('view');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Client override editing
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const handleSelectSchedule = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setPanelMode('view');
    setEditingSchedule(null);
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

  const handleClosePanel = useCallback(() => {
    setSelectedSchedule(null);
    setPanelMode('view');
    setEditingSchedule(null);
  }, []);

  const handleEdit = useCallback((schedule: Schedule) => {
    setEditingSchedule({ ...schedule });
    setPanelMode(schedule.isOverride ? 'override' : 'edit');
  }, []);

  const handleCreateOverride = useCallback((baseSchedule: Schedule) => {
    // Create a new override schedule based on the base
    const newOverride: Schedule = {
      ...baseSchedule,
      id: `override-${Date.now()}`,
      name: `${baseSchedule.name} (New Override)`,
      isOverride: true,
      baseScheduleId: baseSchedule.id,
      overriddenFields: [],
      clientVisibility: 'specific',
      clientIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingSchedule(newOverride);
    setPanelMode('override');
  }, []);

  const handleDuplicate = useCallback((schedule: Schedule) => {
    const duplicate: Schedule = {
      ...schedule,
      id: `dup-${Date.now()}`,
      name: `${schedule.name} (Copy)`,
      isOverride: false,
      baseScheduleId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingSchedule(duplicate);
    setPanelMode('edit');
  }, []);

  const handleEditClientOverride = useCallback((baseSchedule: Schedule, clientId: string) => {
    // Find existing override for this client, or create new
    const existingOverride = schedules.find(
      (s) => s.isOverride && s.baseScheduleId === baseSchedule.id && s.clientIds.includes(clientId)
    );

    if (existingOverride) {
      setEditingSchedule({ ...existingOverride });
    } else {
      const client = sampleClients.find((c) => c.id === clientId);
      const newOverride: Schedule = {
        ...baseSchedule,
        id: `override-${Date.now()}`,
        name: `${baseSchedule.name} (${client?.shortName || client?.name || clientId})`,
        isOverride: true,
        baseScheduleId: baseSchedule.id,
        overriddenFields: [],
        clientVisibility: 'specific',
        clientIds: [clientId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEditingSchedule(newOverride);
    }
    setEditingClientId(clientId);
    setPanelMode('override');
  }, [schedules]);

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

  const handleConnectionsClick = useCallback((schedule: Schedule) => {
    console.log('Connections clicked for:', schedule.name, schedule.connections);
    // Full implementation would open TagSidebar via prop from SchedulesPage
  }, []);

  const handleToggleActive = useCallback((schedule: Schedule, active: boolean) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? { ...s, isActive: active } : s))
    );
    if (selectedSchedule?.id === schedule.id) {
      setSelectedSchedule({ ...schedule, isActive: active });
    }
  }, [selectedSchedule]);

  const handleSaveSchedule = useCallback((updatedSchedule: Schedule) => {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === updatedSchedule.id);
      if (exists) {
        return prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s));
      } else {
        return [...prev, updatedSchedule];
      }
    });
    setPanelMode('view');
    setEditingSchedule(null);
    setEditingClientId(null);
    setSelectedSchedule(updatedSchedule);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setPanelMode('view');
    setEditingSchedule(null);
    setEditingClientId(null);
  }, []);

  // Find base schedule for override editing
  const baseScheduleForOverride = editingSchedule?.isOverride
    ? schedules.find((s) => s.id === editingSchedule.baseScheduleId) || null
    : null;

  // Panel is expanded when editing
  const isEditing = panelMode === 'edit' || panelMode === 'override';
  const showPanel = selectedSchedule || isEditing;

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

      {/* Right: Detail/Edit Panel */}
      {showPanel && (
        <div className={`${isEditing ? 'w-[600px]' : 'w-[450px]'} flex-shrink-0 transition-all duration-200 flex flex-col h-full overflow-hidden`}>
          {panelMode === 'view' && selectedSchedule && (
            <ScheduleDetailPanel
              schedule={selectedSchedule}
              allSchedules={schedules}
              onClose={handleClosePanel}
              onEdit={handleEdit}
              onCreateOverride={handleCreateOverride}
              onDuplicate={handleDuplicate}
              onToggleActive={handleToggleActive}
              onEditClientOverride={handleEditClientOverride}
              onConnectionsClick={handleConnectionsClick}
            />
          )}

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
