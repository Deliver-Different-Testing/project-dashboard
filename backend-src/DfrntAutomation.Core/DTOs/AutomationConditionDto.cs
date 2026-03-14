namespace DfrntAutomation.Core.DTOs;

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
    public string PriorityFilter { get; set; } = "ALL";
    public string? FromSiteFilter { get; set; }
    public string? ToSiteFilter { get; set; }
    public string? FromRegionFilter { get; set; }
    public string? ToRegionFilter { get; set; }
    public int? TimeThreshold { get; set; }
}
