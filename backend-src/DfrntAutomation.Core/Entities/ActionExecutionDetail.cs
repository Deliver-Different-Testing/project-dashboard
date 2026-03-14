namespace DfrntAutomation.Core.Entities;

/// <summary>
/// Detail record for each action executed within a single automation evaluation.
/// </summary>
public class ActionExecutionDetail
{
    public long Id { get; set; }
    public long ExecutionLogId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Detail { get; set; }
    public string? ErrorMessage { get; set; }
    public int DurationMs { get; set; }

    // Navigation
    public AutomationExecutionLog ExecutionLog { get; set; } = null!;
}
