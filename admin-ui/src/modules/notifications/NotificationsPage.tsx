import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { TagSidebar } from '../../components/tags';
import { NotificationGroupsTab } from './components/NotificationGroupsTab';
import { AttachmentBuilderTab } from './components/AttachmentBuilderTab';
import { sampleNotificationGroups, sampleAttachmentTemplates } from './data/sampleData';
import type { SourceItem, EntityConnections } from './types';
import { createEmptyConnections } from './types';

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('groups');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    type: 'service',
    id: '',
    name: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(createEmptyConnections());

  const tabs = [
    { id: 'groups', label: 'Notification Groups' },
    { id: 'attachments', label: 'Attachment Builder' },
  ];

  const handleConnectionsClick = (sourceItem: SourceItem, connections: EntityConnections) => {
    setSidebarSourceItem(sourceItem);
    setSidebarConnections(connections);
    setTagSidebarOpen(true);
  };

  const handleNavigate = (targetRoute: string, _searchQuery: string) => {
    console.log(`Navigate to ${targetRoute}`);
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="p-8 pb-0">
        <PageHeader
          title="Notification Center"
          subtitle="Configure automated notifications, templates, and attachments"
          actions={
            <>
              <Button variant="secondary" onClick={() => setTagSidebarOpen(true)}>
                Tags
              </Button>
              <Button variant="primary">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add New
              </Button>
            </>
          }
        />
      </div>

      {/* Summary Stats */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{sampleNotificationGroups.length}</div>
                <div className="text-sm text-text-secondary">Notification Groups</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {sampleNotificationGroups.filter(g => g.isActive).length}
                </div>
                <div className="text-sm text-text-secondary">Active</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-purple/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {sampleNotificationGroups.reduce((acc, g) => acc + g.templates.length, 0)}
                </div>
                <div className="text-sm text-text-secondary">Templates</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{sampleAttachmentTemplates.length}</div>
                <div className="text-sm text-text-secondary">Attachments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8">
        <Card padding="none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {activeTab === 'groups' && (
              <NotificationGroupsTab
                groups={sampleNotificationGroups}
                onConnectionsClick={handleConnectionsClick}
              />
            )}
            {activeTab === 'attachments' && (
              <AttachmentBuilderTab templates={sampleAttachmentTemplates} />
            )}
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

export default NotificationsPage;
