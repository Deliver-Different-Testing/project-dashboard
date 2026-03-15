using DfrntAutomation.Core.Enums;

namespace DfrntAutomation.Core.Entities;

/// <summary>
/// Maps to the tucAutomationRule table. Represents a single automation rule
/// with its conditions, actions, and scope.
/// All filters live at rule/scope level to prevent conflicting condition-level filters.
/// </summary>
public class AutomationRule
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }

    /// <summary>How multiple conditions are evaluated (ALL = AND, ANY = OR).</summary>
    public ConditionMatchMode ConditionMatchMode { get; set; } = ConditionMatchMode.All;

    // ── Scope: Customers & Speeds ──
    public bool AllCustomers { get; set; } = true;
    /// <summary>Comma-separated customer IDs. Null/empty when AllCustomers = true.</summary>
    public string? CustomerIds { get; set; }
    public bool AllSpeeds { get; set; } = true;
    /// <summary>Comma-separated speed IDs. Null/empty when AllSpeeds = true.</summary>
    public string? SpeedIds { get; set; }

    // ── Scope: Additional Filters ──
    public bool AllJobStatuses { get; set; }
    /// <summary>Comma-separated job status IDs.</summary>
    public string? JobStatusIds { get; set; }

    public bool AllPriorities { get; set; }
    /// <summary>Comma-separated priority IDs (1=Critical, 2=High, 3=Normal, 4=Low).</summary>
    public string? PriorityIds { get; set; }

    public bool AllFromSites { get; set; }
    /// <summary>Comma-separated origin site IDs.</summary>
    public string? FromSiteIds { get; set; }

    public bool AllToSites { get; set; }
    /// <summary>Comma-separated destination site IDs.</summary>
    public string? ToSiteIds { get; set; }

    public bool AllFromRegions { get; set; }
    /// <summary>Comma-separated origin region IDs.</summary>
    public string? FromRegionIds { get; set; }

    public bool AllToRegions { get; set; }
    /// <summary>Comma-separated destination region IDs.</summary>
    public string? ToRegionIds { get; set; }

    /// <summary>Time threshold in minutes — job must be in state for at least this long before rule fires.</summary>
    public int? TimeThreshold { get; set; }

    // ── Audit ──
    public string? CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDate { get; set; }

    // Navigation
    public List<AutomationCondition> Conditions { get; set; } = new();
    public List<AutomationAction> Actions { get; set; } = new();
}
