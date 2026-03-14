namespace DfrntAutomation.Core.DTOs;

public class UpdateAutomationRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public string ConditionMatchMode { get; set; } = "all";
    public AutomationScopeDto Scope { get; set; } = new();
    public List<AutomationConditionDto> Conditions { get; set; } = new();
    public List<AutomationActionDto> Actions { get; set; } = new();
}
