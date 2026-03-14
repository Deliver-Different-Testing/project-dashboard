namespace DfrntAutomation.Core.Entities;

/// <summary>
/// Logs every evaluation of the automation engine against a rule+job combination.
/// </summary>
public class AutomationExecutionLog
{
    public long Id { get; set; }
    public int RuleId { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public int? JobId { get; set; }
    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
    public bool ConditionsMet { get; set; }
    public string TriggerType { get; set; } = string.Empty;
    public string? TriggerDetail { get; set; }
    public int ActionsExecuted { get; set; }
    public string? ActionsSummary { get; set; }
    public string? ErrorMessage { get; set; }
    public int DurationMs { get; set; }

    // Navigation
    public List<ActionExecutionDetail> ActionDetails { get; set; } = new();
}
