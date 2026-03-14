namespace DfrntAutomation.Core.DTOs;

public class AutomationScopeDto
{
    public bool AllCustomers { get; set; } = true;
    public List<int> CustomerIds { get; set; } = new();
    public bool AllSpeeds { get; set; } = true;
    public List<int> SpeedIds { get; set; } = new();
}
