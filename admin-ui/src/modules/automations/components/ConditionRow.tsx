import { X } from 'lucide-react';
import type {
  Condition,
  ConditionType,
  JobTypeFilter,
  ScheduledTimeField,
  TimeUnit,
  StatusConditionMode,
  ScanType,
  SiteOption,
  RegionOption,
} from '../types';
import {
  CONDITION_TYPE_OPTIONS,
  JOB_TYPE_OPTIONS,
  SCHEDULED_TIME_OPTIONS,
  TIME_UNIT_OPTIONS,
  STATUS_CONDITION_MODES,
  SCAN_TYPE_OPTIONS,
  createEmptyCondition,
} from '../types';
import type { JobStatus } from '../types';

interface ConditionRowProps {
  condition: Condition;
  jobStatuses: JobStatus[];
  sites: SiteOption[];
  regions: RegionOption[];
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}

export function ConditionRow({
  condition,
  jobStatuses,
  sites,
  regions,
  onChange,
  onRemove,
}: ConditionRowProps) {
  // Handle condition type change - creates new condition with defaults
  const handleTypeChange = (type: ConditionType) => {
    const newCondition = createEmptyCondition(type);
    newCondition.id = condition.id; // Preserve ID
    newCondition.jobTypeFilter = condition.jobTypeFilter; // Preserve job type filter
    onChange(newCondition);
  };

  // Handle job type filter change
  const handleJobTypeChange = (jobTypeFilter: JobTypeFilter) => {
    onChange({ ...condition, jobTypeFilter });
  };

  // Render type-specific fields
  const renderTypeFields = () => {
    switch (condition.type) {
      case 'job_unassigned':
      case 'job_assigned':
        // No additional fields needed
        return null;

      case 'before_scheduled_time':
      case 'after_scheduled_time':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={condition.offsetValue}
              onChange={(e) =>
                onChange({
                  ...condition,
                  offsetValue: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-20 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
              min={0}
            />
            <select
              value={condition.offsetUnit}
              onChange={(e) =>
                onChange({
                  ...condition,
                  offsetUnit: e.target.value as TimeUnit,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {TIME_UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-text-secondary">
              {condition.type === 'before_scheduled_time' ? 'before' : 'after'}
            </span>
            <select
              value={condition.scheduledTimeField}
              onChange={(e) =>
                onChange({
                  ...condition,
                  scheduledTimeField: e.target.value as ScheduledTimeField,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {SCHEDULED_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'at_scheduled_time':
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">At</span>
            <select
              value={condition.scheduledTimeField}
              onChange={(e) =>
                onChange({
                  ...condition,
                  scheduledTimeField: e.target.value as ScheduledTimeField,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {SCHEDULED_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'status':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={condition.mode}
              onChange={(e) =>
                onChange({
                  ...condition,
                  mode: e.target.value as StatusConditionMode,
                  statusId: e.target.value === 'any_change' ? undefined : condition.statusId,
                })
              }
              className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              {STATUS_CONDITION_MODES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {condition.mode !== 'any_change' && (
              <select
                value={condition.statusId || ''}
                onChange={(e) =>
                  onChange({
                    ...condition,
                    statusId: e.target.value,
                  })
                }
                className="px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
              >
                <option value="">Select status...</option>
                {jobStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        );

      case 'scan':
        return (
          <div className="flex flex-wrap gap-2">
            {SCAN_TYPE_OPTIONS.map((opt) => {
              const isSelected = condition.scanTypes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const newTypes = isSelected
                      ? condition.scanTypes.filter((t) => t !== opt.value)
                      : [...condition.scanTypes, opt.value];
                    onChange({
                      ...condition,
                      scanTypes: newTypes as ScanType[],
                    });
                  }}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    isSelected
                      ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                      : 'border-border bg-white text-text-secondary hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-3 bg-white border border-border rounded-lg">
      <div className="flex items-start gap-3">
      {/* Condition Type */}
      <div className="flex-shrink-0">
        <select
          value={condition.type}
          onChange={(e) => handleTypeChange(e.target.value as ConditionType)}
          className="px-3 py-1.5 text-sm border border-border rounded bg-white text-text-primary font-medium focus:outline-none focus:border-brand-cyan"
        >
          {CONDITION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Details */}
      <div className="flex-1 space-y-2">
        {/* Job Type Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-secondary">Job type:</label>
          <select
            value={condition.jobTypeFilter}
            onChange={(e) => handleJobTypeChange(e.target.value as JobTypeFilter)}
            className="px-2 py-1 text-xs border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
          >
            {JOB_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type-specific fields */}
        {renderTypeFields()}
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 p-1 text-text-muted hover:text-error transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      </div>

      {/* Inline Filters — always visible below the condition */}
      <div className="col-span-full mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          {/* Job Status Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">Job Status Filter</label>
            <select
              value={condition.jobStatusFilter || ''}
              onChange={(e) => onChange({ ...condition, jobStatusFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              <option value="">All statuses</option>
              {jobStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs in this status. Leave empty for all.</p>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">Priority Filter</label>
            <select
              value={condition.priorityFilter || 'ALL'}
              onChange={(e) => onChange({ ...condition, priorityFilter: e.target.value === 'ALL' ? undefined : e.target.value })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              <option value="ALL">All priorities</option>
              <option value="1">Critical</option>
              <option value="2">High</option>
              <option value="3">Normal</option>
              <option value="4">Low</option>
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Filter by job priority.</p>
          </div>

          {/* From Site Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">From Site Filter</label>
            <select
              value={condition.fromSiteFilter || ''}
              onChange={(e) => onChange({ ...condition, fromSiteFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              <option value="">All origin sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs from these sites.</p>
          </div>

          {/* To Site Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">To Site Filter</label>
            <select
              value={condition.toSiteFilter || ''}
              onChange={(e) => onChange({ ...condition, toSiteFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              <option value="">All destination sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs going to these sites.</p>
          </div>

          {/* From Region Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">From Region Filter</label>
            <select
              value={condition.fromRegionFilter || ''}
              onChange={(e) => onChange({ ...condition, fromRegionFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              <option value="">All origin regions</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs from these regions.</p>
          </div>

          {/* To Region Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">To Region Filter</label>
            <select
              value={condition.toRegionFilter || ''}
              onChange={(e) => onChange({ ...condition, toRegionFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
            >
              <option value="">All destination regions</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs going to these regions.</p>
          </div>

          {/* Time Threshold */}
          {(condition.type === 'job_unassigned' || condition.type === 'job_assigned') && (
            <div>
              <label className="text-xs text-text-secondary font-medium">Time Threshold (minutes)</label>
              <input
                type="number"
                value={condition.timeThreshold ?? ''}
                onChange={(e) => onChange({ ...condition, timeThreshold: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                placeholder="e.g. 15"
                className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
                min={0}
              />
              <p className="text-[10px] text-text-muted mt-0.5">Job must be in this state for at least X minutes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
