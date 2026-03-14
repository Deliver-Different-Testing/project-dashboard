using DfrntAutomation.Core.Enums;

namespace DfrntAutomation.Core.Entities;

/// <summary>
/// Maps to the tucAutomationRule table. Represents a single automation rule
/// with its conditions, actions, and scope.
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

    // Scope
    public bool AllCustomers { get; set; } = true;
    public string? CustomerIds { get; set; }
    public bool AllSpeeds { get; set; } = true;
    public string? SpeedIds { get; set; }

    /// <summary>Maps to AutomationRules.CreatedBy (nvarchar(100) in production DB).</summary>
    public string? CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    /// <summary>Maps to AutomationRules.ModifiedBy (nvarchar(100) in production DB).</summary>
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedDate { get; set; }

    // Navigation
    public List<AutomationCondition> Conditions { get; set; } = new();
    public List<AutomationAction> Actions { get; set; } = new();
}
