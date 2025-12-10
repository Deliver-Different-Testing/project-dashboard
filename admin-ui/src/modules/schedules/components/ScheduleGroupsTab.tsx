// src/modules/schedules/components/ScheduleGroupsTab.tsx
import { useState, useMemo } from 'react';
import { ExpandableRow } from '../../../components/data/ExpandableRow';
import { SearchInput } from '../../../components/filters/SearchInput';
import { Badge } from '../../../components/ui/Badge';
import { sampleScheduleGroups, sampleSchedules } from '../data/sampleData';
import type { SourceItem, EntityConnections } from '../../territory/types';
import { countConnectedCategories } from '../../territory/types';

interface ScheduleGroupsTabProps {
  onConnectionsClick: (sourceItem: SourceItem, connections: EntityConnections) => void;
}

export function ScheduleGroupsTab({ onConnectionsClick }: ScheduleGroupsTabProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = useMemo(() => {
    return sampleScheduleGroups.filter((group) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = group.name.toLowerCase().includes(searchLower);
        const matchesDescription = group.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) return false;
      }
      return true;
    });
  }, [searchTerm]);

  const handleToggle = (groupId: string) => {
    setExpandedItem(expandedItem === groupId ? null : groupId);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search schedule groups..."
      />

      {/* Results count */}
      <div className="text-sm text-text-secondary">
        Showing {filteredGroups.length} of {sampleScheduleGroups.length} schedule groups
      </div>

      {/* Groups List */}
      <div className="space-y-2">
        {filteredGroups.map((group) => {
          const memberSchedules = sampleSchedules.filter((s) =>
            group.scheduleIds.includes(s.id)
          );

          return (
            <ExpandableRow
              key={group.id}
              id={group.id}
              name={group.name}
              badge={{
                text: group.isActive ? 'Active' : 'Inactive',
                variant: group.isActive ? 'customized' : 'system',
              }}
              stats={[
                { label: 'Schedules', value: String(group.scheduleIds.length) },
                { label: 'Description', value: group.description || 'No description' },
              ]}
              connectionCount={countConnectedCategories(group.connections)}
              hasConnectionIssues={false}
              isExpanded={expandedItem === group.id}
              onToggle={() => handleToggle(group.id)}
              onConnectionsClick={() =>
                onConnectionsClick(
                  {
                    id: group.id,
                    type: 'schedule',
                    name: group.name,
                    subtitle: group.description,
                  },
                  group.connections
                )
              }
            >
              {/* Expanded content - show member schedules */}
              <div className="p-4 bg-surface-cream rounded-lg">
                <h4 className="text-sm font-semibold text-text-primary mb-3">
                  Member Schedules ({memberSchedules.length})
                </h4>
                {memberSchedules.length === 0 ? (
                  <div className="text-sm text-text-muted text-center py-4">
                    No schedules in this group
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={schedule.isActive ? 'customized' : 'system'}
                            size="sm"
                          >
                            {schedule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {schedule.name}
                            </div>
                            {schedule.description && (
                              <div className="text-xs text-text-muted">
                                {schedule.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-text-muted">
                            {schedule.legs.length} legs
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ExpandableRow>
          );
        })}

        {filteredGroups.length === 0 && (
          <div className="py-12 text-center text-text-muted">
            No schedule groups found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
