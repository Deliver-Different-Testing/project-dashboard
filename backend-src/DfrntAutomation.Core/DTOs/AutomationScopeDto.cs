namespace DfrntAutomation.Core.DTOs;

/// <summary>
/// Scope DTO matching the frontend AutomationScope interface.
/// All filters at rule level — prevents conflicting condition-level filters.
/// </summary>
public class AutomationScopeDto
{
    public bool AllCustomers { get; set; } = true;
    public List<int> CustomerIds { get; set; } = new();
    public bool AllSpeeds { get; set; } = true;
    public List<int> SpeedIds { get; set; } = new();

    // Additional filters — default to false (no selection = applies to all)
    public bool AllJobStatuses { get; set; }
    public List<int> JobStatusIds { get; set; } = new();
    public bool AllPriorities { get; set; }
    public List<int> PriorityIds { get; set; } = new();
    public bool AllFromSites { get; set; }
    public List<int> FromSiteIds { get; set; } = new();
    public bool AllToSites { get; set; }
    public List<int> ToSiteIds { get; set; } = new();
    public bool AllFromRegions { get; set; }
    public List<int> FromRegionIds { get; set; } = new();
    public bool AllToRegions { get; set; }
    public List<int> ToRegionIds { get; set; } = new();
    public int? TimeThreshold { get; set; }
}
