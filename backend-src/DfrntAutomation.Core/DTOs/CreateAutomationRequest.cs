namespace DfrntAutomation.Core.DTOs;

public class CreateAutomationRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ConditionMatchMode { get; set; } = "all";
    public AutomationScopeDto Scope { get; set; } = new();
    public List<AutomationConditionDto> Conditions { get; set; } = new();
    public List<AutomationActionDto> Actions { get; set; } = new();
}
