namespace DfrntAutomation.Core.DTOs;

public class AutomationExecutionLogDto
{
    public long Id { get; set; }
    public int RuleId { get; set; }
    public string RuleName { get; set; } = string.Empty;
    public int? JobId { get; set; }
    public DateTime EvaluatedAt { get; set; }
    public bool ConditionsMet { get; set; }
    public string TriggerType { get; set; } = string.Empty;
    public string? TriggerDetail { get; set; }
    public int ActionsExecuted { get; set; }
    public string? ActionsSummary { get; set; }
    public string? ErrorMessage { get; set; }
    public int DurationMs { get; set; }
    public List<ActionExecutionDetailDto> ActionDetails { get; set; } = new();
}

public class ActionExecutionDetailDto
{
    public long Id { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Detail { get; set; }
    public string? ErrorMessage { get; set; }
    public int DurationMs { get; set; }
}
