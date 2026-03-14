using DfrntAutomation.Core.DTOs;

namespace DfrntAutomation.Core.Interfaces;

/// <summary>
/// Core automation engine — replaces sp_AutomationEngine.
/// </summary>
public interface IAutomationEngineService
{
    /// <summary>
    /// Event-driven evaluation: called on status changes, scan events, support events, manual triggers.
    /// </summary>
    Task EvaluateEventAsync(AutomationEvent automationEvent, CancellationToken ct = default);

    /// <summary>
    /// Time-based evaluation: called by the timer service every N minutes.
    /// </summary>
    Task EvaluateTimeBasedRulesAsync(CancellationToken ct = default);

    /// <summary>
    /// Dry-run a specific rule against a job (evaluate only, no execute).
    /// </summary>
    Task<AutomationExecutionLogDto> TestRuleAsync(int ruleId, int jobId, CancellationToken ct = default);
}
