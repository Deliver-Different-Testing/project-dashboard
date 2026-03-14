using DfrntAutomation.Core.Enums;

namespace DfrntAutomation.Core.Entities;

/// <summary>
/// A condition attached to an automation rule. Maps to the AutomationCondition table.
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

    // Advanced filters
    /// <summary>Priority filter — 'ALL' or specific speed ID. Maps to AutomationConditions.PriorityFilter.</summary>
    public string PriorityFilter { get; set; } = "ALL";

    /// <summary>Comma-separated site IDs for origin filter. Maps to AutomationConditions.FromSiteFilter.</summary>
    public string? FromSiteFilter { get; set; }

    /// <summary>Comma-separated site IDs for destination filter. Maps to AutomationConditions.ToSiteFilter.</summary>
    public string? ToSiteFilter { get; set; }

    /// <summary>Comma-separated region IDs for origin filter. Maps to AutomationConditions.FromRegionFilter.</summary>
    public string? FromRegionFilter { get; set; }

    /// <summary>Comma-separated region IDs for destination filter. Maps to AutomationConditions.ToRegionFilter.</summary>
    public string? ToRegionFilter { get; set; }

    /// <summary>Time threshold in minutes — job must be in state for at least this long. Used by UNASSIGNED/ASSIGNED conditions.</summary>
    public int? TimeThreshold { get; set; }

    // Navigation
    public AutomationRule Rule { get; set; } = null!;
}
