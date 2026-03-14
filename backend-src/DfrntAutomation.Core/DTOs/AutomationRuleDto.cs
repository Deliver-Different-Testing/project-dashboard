namespace DfrntAutomation.Core.DTOs;

/// <summary>
/// Full automation rule response DTO including conditions, actions, and scope.
/// </summary>
public class AutomationRuleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string ConditionMatchMode { get; set; } = "all";
    public AutomationScopeDto Scope { get; set; } = new();
    public List<AutomationConditionDto> Conditions { get; set; } = new();
    public List<AutomationActionDto> Actions { get; set; } = new();
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
}
