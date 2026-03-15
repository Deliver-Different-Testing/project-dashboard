using DfrntAutomation.Core.Enums;

namespace DfrntAutomation.Core.Entities;

/// <summary>
/// A condition attached to an automation rule. Maps to the AutomationCondition table.
/// Advanced filters (priority, site, region, time threshold) have been moved to
/// AutomationRule (scope level) to prevent conflicting condition-level filters.
/// </summary>
public class AutomationCondition
{
    public int Id { get; set; }
    public int RuleId { get; set; }
    public ConditionType ConditionType { get; set; }
    public int SortOrder { get; set; }

    /// <summary>Filter by job type (all, pickup, delivery, etc.).</summary>
    public JobTypeFilter JobTypeFilter { get; set; } = JobTypeFilter.All;

    // Status condition fields
    public StatusConditionMode? StatusConditionMode { get; set; }
    public int? StatusId { get; set; }

    // Time-based condition fields
    public ScheduledTimeField? ScheduledTimeField { get; set; }
    public int? OffsetValue { get; set; }
    public string? OffsetUnit { get; set; }

    // Scan condition fields
    public string? ScanTypes { get; set; }

    // Navigation
    public AutomationRule Rule { get; set; } = null!;
}
