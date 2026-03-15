namespace DfrntAutomation.Core.DTOs;

/// <summary>
/// Condition DTO — filter fields (priority, site, region, threshold) have been
/// moved to AutomationScopeDto (rule level) to prevent conflicting filters.
/// </summary>
public class AutomationConditionDto
{
    public int? Id { get; set; }
    public string ConditionType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string JobTypeFilter { get; set; } = "all";
    public string? StatusConditionMode { get; set; }
    public int? StatusId { get; set; }
    public string? ScheduledTimeField { get; set; }
    public int? OffsetValue { get; set; }
    public string? OffsetUnit { get; set; }
    public List<string>? ScanTypes { get; set; }
}
