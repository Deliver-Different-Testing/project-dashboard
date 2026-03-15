import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AutomationScope, CustomerOption, SpeedOption, SiteOption, RegionOption, JobStatus } from '../types';

interface ScopeSelectorProps {
  scope: AutomationScope;
  customers: CustomerOption[];
  speeds: SpeedOption[];
  sites: SiteOption[];
  regions: RegionOption[];
  jobStatuses: JobStatus[];
  onChange: (scope: AutomationScope) => void;
}

const PRIORITY_OPTIONS = [
  { id: '1', name: 'Critical' },
  { id: '2', name: 'High' },
  { id: '3', name: 'Normal' },
  { id: '4', name: 'Low' },
];

/** Reusable collapsible "Apply to All" toggle + multi-select pill section */
function ScopeFilterSection({
  id,
  label,
  allChecked,
  selectedIds,
  options,
  onAllChange,
  onToggle,
  onClearAll,
}: {
  id: string;
  label: string;
  allChecked: boolean;
  selectedIds: string[];
  options: { id: string; name?: string; shortName?: string }[];
  onAllChange: (checked: boolean) => void;
  onToggle: (optionId: string) => void;
  onClearAll: () => void;
}) {
  // Default collapsed when not "apply to all" — user expands to pick items
  const [expanded, setExpanded] = useState(allChecked);

  // Summary of selected items for collapsed view
  const selectedNames = selectedIds
    .map((sid) => {
      const opt = options.find((o) => o.id === sid);
      return opt ? (opt.shortName || opt.name) : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={id}
          checked={allChecked}
          onChange={(e) => onAllChange(e.target.checked)}
          className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan"
        />
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          Apply to all {label.toLowerCase()}
        </label>

        {/* Collapse/expand toggle — only show when unchecked */}
        {!allChecked && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {expanded ? (
              <>Collapse <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Expand <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        )}
      </div>

      {/* Collapsed summary — show selected pills inline */}
      {!allChecked && !expanded && selectedIds.length > 0 && (
        <div className="ml-6 flex flex-wrap gap-1.5 items-center">
          {selectedNames.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border border-brand-cyan bg-brand-cyan/10 text-brand-cyan font-medium"
            >
              {name}
              <button
                type="button"
                onClick={() => onToggle(selectedIds[i])}
                className="w-3.5 h-3.5 inline-flex items-center justify-center rounded-full hover:bg-brand-cyan/20 transition-colors text-brand-cyan text-[10px]"
              >
                ✕
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs text-brand-cyan hover:underline"
          >
            + Edit
          </button>
        </div>
      )}

      {/* Collapsed with no selections */}
      {!allChecked && !expanded && selectedIds.length === 0 && (
        <p className="ml-6 text-xs text-text-muted">
          No {label.toLowerCase()} selected.{' '}
          <button type="button" onClick={() => setExpanded(true)} className="text-brand-cyan hover:underline">
            Select
          </button>
        </p>
      )}

      {/* Expanded picker */}
      {!allChecked && expanded && (
        <div className="ml-6 p-3 bg-white border border-border rounded-lg">
          {/* Selected items shown as removable tags */}
          {selectedIds.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-text-secondary font-medium">
                  Selected ({selectedIds.length}):
                </p>
                <button
                  type="button"
                  onClick={() => onClearAll()}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedIds.map((selId) => {
                  const opt = options.find((o) => o.id === selId);
                  if (!opt) return null;
                  return (
                    <span
                      key={selId}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full border border-brand-cyan bg-brand-cyan/10 text-brand-cyan font-medium"
                    >
                      {opt.shortName || opt.name}
                      <button
                        type="button"
                        onClick={() => onToggle(selId)}
                        className="ml-0.5 w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-brand-cyan/20 transition-colors text-brand-cyan"
                        title={`Remove ${opt.shortName || opt.name}`}
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available items to add */}
          <p className="text-xs text-text-secondary mb-1.5">
            {selectedIds.length > 0 ? 'Add more:' : `Select ${label.toLowerCase()}:`}
          </p>
          <div className="flex flex-wrap gap-2">
            {options
              .filter((opt) => !selectedIds.includes(opt.id))
              .map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToggle(opt.id)}
                  className="px-3 py-1.5 text-sm rounded-full border border-border bg-white text-text-secondary hover:border-brand-cyan hover:text-brand-cyan transition-colors"
                >
                  + {opt.shortName || opt.name}
                </button>
              ))}
            {options.filter((opt) => !selectedIds.includes(opt.id)).length === 0 && (
              <p className="text-xs text-text-muted italic">All {label.toLowerCase()} selected</p>
            )}
          </div>
          {selectedIds.length === 0 && (
            <p className="text-xs text-text-muted mt-2">
              Select specific {label.toLowerCase()} to restrict this automation, or check "Apply to all" above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function ScopeSelector({
  scope,
  customers,
  speeds,
  sites,
  regions,
  jobStatuses,
  onChange,
}: ScopeSelectorProps) {
  // Generic helpers
  const makeAllHandler = (allKey: keyof AutomationScope, idsKey: keyof AutomationScope) => (checked: boolean) => {
    onChange({ ...scope, [allKey]: checked, [idsKey]: checked ? [] : (scope as any)[idsKey] });
  };

  const makeToggleHandler = (idsKey: keyof AutomationScope) => (optionId: string) => {
    const current = (scope as any)[idsKey] as string[];
    const newIds = current.includes(optionId)
      ? current.filter((id: string) => id !== optionId)
      : [...current, optionId];
    onChange({ ...scope, [idsKey]: newIds });
  };

  const makeClearHandler = (idsKey: keyof AutomationScope) => () => {
    onChange({ ...scope, [idsKey]: [] });
  };

  // Build summary — only mention filters that have actual selections
  const filterSummaryParts: string[] = [];
  const addSummary = (allFlag: boolean, ids: string[], label: string) => {
    if (!allFlag && ids.length > 0) {
      filterSummaryParts.push(`${ids.length} ${label}`);
    }
  };
  addSummary(scope.allCustomers, scope.customerIds, 'customer(s)');
  addSummary(scope.allSpeeds, scope.speedIds, 'speed(s)');
  addSummary(scope.allJobStatuses, scope.jobStatusIds, 'status(es)');
  addSummary(scope.allPriorities, scope.priorityIds, 'priority(ies)');
  addSummary(scope.allFromSites, scope.fromSiteIds, 'from site(s)');
  addSummary(scope.allToSites, scope.toSiteIds, 'to site(s)');
  addSummary(scope.allFromRegions, scope.fromRegionIds, 'from region(s)');
  addSummary(scope.allToRegions, scope.toRegionIds, 'to region(s)');

  return (
    <div className="space-y-4">
      {/* Customers */}
      <ScopeFilterSection
        id="all-customers"
        label="Customers"
        allChecked={scope.allCustomers}
        selectedIds={scope.customerIds}
        options={customers}
        onAllChange={makeAllHandler('allCustomers', 'customerIds')}
        onToggle={makeToggleHandler('customerIds')}
        onClearAll={makeClearHandler('customerIds')}
      />

      {/* Speeds */}
      <ScopeFilterSection
        id="all-speeds"
        label="Speeds"
        allChecked={scope.allSpeeds}
        selectedIds={scope.speedIds}
        options={speeds}
        onAllChange={makeAllHandler('allSpeeds', 'speedIds')}
        onToggle={makeToggleHandler('speedIds')}
        onClearAll={makeClearHandler('speedIds')}
      />

      {/* Job Statuses, Priorities, Sites, Regions */}
      <div className="space-y-4">
          <ScopeFilterSection
            id="all-job-statuses"
            label="Job Statuses"
            allChecked={scope.allJobStatuses}
            selectedIds={scope.jobStatusIds}
            options={jobStatuses}
            onAllChange={makeAllHandler('allJobStatuses', 'jobStatusIds')}
            onToggle={makeToggleHandler('jobStatusIds')}
            onClearAll={makeClearHandler('jobStatusIds')}
          />

          <ScopeFilterSection
            id="all-priorities"
            label="Priorities"
            allChecked={scope.allPriorities}
            selectedIds={scope.priorityIds}
            options={PRIORITY_OPTIONS}
            onAllChange={makeAllHandler('allPriorities', 'priorityIds')}
            onToggle={makeToggleHandler('priorityIds')}
            onClearAll={makeClearHandler('priorityIds')}
          />

          <ScopeFilterSection
            id="all-from-sites"
            label="Origin Sites"
            allChecked={scope.allFromSites}
            selectedIds={scope.fromSiteIds}
            options={sites}
            onAllChange={makeAllHandler('allFromSites', 'fromSiteIds')}
            onToggle={makeToggleHandler('fromSiteIds')}
            onClearAll={makeClearHandler('fromSiteIds')}
          />

          <ScopeFilterSection
            id="all-to-sites"
            label="Destination Sites"
            allChecked={scope.allToSites}
            selectedIds={scope.toSiteIds}
            options={sites}
            onAllChange={makeAllHandler('allToSites', 'toSiteIds')}
            onToggle={makeToggleHandler('toSiteIds')}
            onClearAll={makeClearHandler('toSiteIds')}
          />

          <ScopeFilterSection
            id="all-from-regions"
            label="Origin Regions"
            allChecked={scope.allFromRegions}
            selectedIds={scope.fromRegionIds}
            options={regions}
            onAllChange={makeAllHandler('allFromRegions', 'fromRegionIds')}
            onToggle={makeToggleHandler('fromRegionIds')}
            onClearAll={makeClearHandler('fromRegionIds')}
          />

          <ScopeFilterSection
            id="all-to-regions"
            label="Destination Regions"
            allChecked={scope.allToRegions}
            selectedIds={scope.toRegionIds}
            options={regions}
            onAllChange={makeAllHandler('allToRegions', 'toRegionIds')}
            onToggle={makeToggleHandler('toRegionIds')}
            onClearAll={makeClearHandler('toRegionIds')}
          />

          {/* Time Threshold */}
          <div>
            <label className="text-xs text-text-secondary font-medium">Time Threshold (minutes)</label>
            <input
              type="number"
              value={scope.timeThreshold ?? ''}
              onChange={(e) =>
                onChange({ ...scope, timeThreshold: e.target.value ? parseInt(e.target.value, 10) : undefined })
              }
              placeholder="e.g. 15"
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
              min={0}
            />
            <p className="text-[10px] text-text-muted mt-0.5">
              Job must be in state for at least X minutes before rule fires.
            </p>
          </div>
      </div>

      {/* Scope Summary */}
      <div className="p-2 bg-surface-cream rounded text-xs text-text-secondary">
        <strong>Scope:</strong>{' '}
        {filterSummaryParts.length === 0 ? (
          'This automation applies to all jobs.'
        ) : (
          <>
            Filtered to{' '}
            {filterSummaryParts.map((part, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <span className="font-medium text-text-primary">{part}</span>
              </span>
            ))}
            .
          </>
        )}
        {scope.timeThreshold != null && scope.timeThreshold > 0 && (
          <> Time threshold: <span className="font-medium text-text-primary">{scope.timeThreshold} min</span>.</>
        )}
      </div>
    </div>
  );
}
