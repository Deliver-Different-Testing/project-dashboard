import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/filters/SearchInput';
import { TagSidebar } from '../../components/tags';
import { ImportExportButton } from '../../features/import-export/components/ImportExportButton';
import { schedulesSchema } from '../../features/import-export/schemas';
import { ScheduleTableView } from './components/ScheduleTableView';
import { ScheduleGroupsTab } from './components/ScheduleGroupsTab';
import type { SourceItem, EntityConnections } from '../territory/types';
import { createEmptyConnections } from '../territory/types';
import { sampleSchedules } from './data/sampleData';

const tabs = [
  { id: 'schedules', label: 'Schedules' },
  { id: 'groups', label: 'Schedule Groups' },
];

export function SchedulesPage() {
  const [activeTab, setActiveTab] = useState('schedules');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    id: '',
    type: 'schedule',
    name: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(
    createEmptyConnections()
  );

  const handleConnectionsClick = (sourceItem: SourceItem, connections: EntityConnections) => {
    setSidebarSourceItem(sourceItem);
    setSidebarConnections(connections);
    setTagSidebarOpen(true);
  };

  const handleNavigate = (targetRoute: string, searchQuery: string) => {
    // In a real app, this would navigate to the related module
    console.log('Navigate to', targetRoute, 'with search', searchQuery);
    setTagSearch(searchQuery);
    setTagSidebarOpen(false);
  };

  const handleNewSchedule = () => {
    // Will open the schedule editor modal/page
    console.log('Create new schedule');
  };

  const handleImportComplete = (result: {
    created: number;
    updated: number;
    deleted: number;
    errors: number;
  }) => {
    console.log('Import complete:', result);
    // Refresh data after import
  };

  // Transform schedule data for export
  const scheduleExportData = sampleSchedules.map(schedule => {
    // Get active days from the days object
    const activeDays = Object.entries(schedule.operatingSchedule.days)
      .filter(([_, daySchedule]) => daySchedule.enabled)
      .map(([day]) => day);

    return {
      id: schedule.id,
      name: schedule.name,
      isActive: schedule.isActive,
      isOverride: schedule.isOverride,
      baseScheduleId: schedule.baseScheduleId || '',
      originType: schedule.originType,
      originDepotId: schedule.originDepotId || '',
      bookingMode: schedule.bookingMode,
      clientVisibility: schedule.clientVisibility,
      clientIds: schedule.clientIds.join(','),
      defaultCollectionSpeedId: schedule.defaultPickupSpeedId || '',
      defaultDeliverySpeedId: schedule.defaultDeliverySpeedId || '',
      operatingDays: activeDays.join(','),
      cutoffValue: schedule.operatingSchedule.cutoffValue,
      cutoffUnit: schedule.operatingSchedule.cutoffUnit,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  });

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Schedules"
          subtitle="Configure delivery schedule templates and routing rules"
          actions={
            <div className="flex items-center gap-3">
              <ImportExportButton
                schema={schedulesSchema}
                data={scheduleExportData}
                onImportComplete={handleImportComplete}
              />
              <Button variant="primary" onClick={handleNewSchedule}>
                + New Schedule
              </Button>
            </div>
          }
        />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <Card padding="none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Search + Filters Section */}
          <div className="px-4 py-3 border-b border-border bg-white space-y-3">
            {/* Search Row - Full Width */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search schedules by name, route, or client..."
            />

            {/* Filter Row with Tag Search */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tag/Connection Filter */}
              <div className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md bg-white hover:border-gray-300 transition-colors">
                <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Connected entity..."
                  className="w-32 text-sm bg-transparent border-none outline-none placeholder:text-text-muted"
                />
              </div>

              {(searchQuery || tagSearch) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTagSearch('');
                  }}
                  className="text-sm text-text-muted hover:text-brand-cyan ml-2 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {activeTab === 'schedules' && (
            <ScheduleTableView
              onConnectionsClick={handleConnectionsClick}
              searchQuery={searchQuery}
              tagSearch={tagSearch}
            />
          )}
          {activeTab === 'groups' && (
            <div className="p-4">
              <ScheduleGroupsTab onConnectionsClick={handleConnectionsClick} />
            </div>
          )}
        </Card>
      </div>

      {/* Tag Sidebar */}
      <TagSidebar
        isOpen={tagSidebarOpen}
        onClose={() => setTagSidebarOpen(false)}
        sourceItem={sidebarSourceItem}
        connections={sidebarConnections}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default SchedulesPage;
