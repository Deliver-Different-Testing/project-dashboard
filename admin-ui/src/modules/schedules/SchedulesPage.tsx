import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { TagSidebar } from '../../components/tags';
import type { SourceItem, EntityConnections } from '../territory/types';
import { createEmptyConnections } from '../territory/types';

// Placeholder tabs - will be replaced with actual components
function SchedulesTabPlaceholder({ onConnectionsClick }: { onConnectionsClick?: (sourceItem: SourceItem, connections: EntityConnections) => void }) {
  // onConnectionsClick will be used when implementing the real component
  void onConnectionsClick; // Suppress unused warning
  return <div className="p-8 text-center text-text-secondary">Schedules list coming soon...</div>;
}

function ScheduleGroupsTabPlaceholder({ onConnectionsClick }: { onConnectionsClick?: (sourceItem: SourceItem, connections: EntityConnections) => void }) {
  // onConnectionsClick will be used when implementing the real component
  void onConnectionsClick; // Suppress unused warning
  return <div className="p-8 text-center text-text-secondary">Schedule groups coming soon...</div>;
}

const tabs = [
  { id: 'schedules', label: 'Schedules' },
  { id: 'groups', label: 'Schedule Groups' },
];

export function SchedulesPage() {
  const [activeTab, setActiveTab] = useState('schedules');
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
    setTagSidebarOpen(false);
  };

  const handleNewSchedule = () => {
    // Will open the schedule editor modal/page
    console.log('Create new schedule');
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Schedules"
          subtitle="Configure delivery schedule templates and routing rules"
          actions={
            <Button variant="primary" onClick={handleNewSchedule}>
              + New Schedule
            </Button>
          }
        />
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <Card padding="none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-4">
            {activeTab === 'schedules' && <SchedulesTabPlaceholder onConnectionsClick={handleConnectionsClick} />}
            {activeTab === 'groups' && <ScheduleGroupsTabPlaceholder onConnectionsClick={handleConnectionsClick} />}
          </div>
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
