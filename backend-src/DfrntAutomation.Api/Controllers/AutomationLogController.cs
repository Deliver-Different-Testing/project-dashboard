using DfrntAutomation.Core.DTOs;
using DfrntAutomation.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DfrntAutomation.Api.Controllers;

/// <summary>
/// Execution log queries for the automation engine.
/// </summary>
[ApiController]
[Route("api/automations")]
[Authorize]
public class AutomationLogController : ControllerBase
{
    private readonly IAutomationRepository _repository;

    public AutomationLogController(IAutomationRepository repository)
    {
        _repository = repository;
    }

    /// <summary>Query execution logs with filters.</summary>
    [HttpGet("logs")]
    public async Task<ActionResult<List<AutomationExecutionLogDto>>> GetLogs(
        [FromQuery] int? ruleId, [FromQuery] int? jobId,
        [FromQuery] DateTime? from, [FromQuery] DateTime? to,
        [FromQuery] string? triggerType, [FromQuery] bool? conditionsMet,
        [FromQuery] int skip = 0, [FromQuery] int take = 50,
        CancellationToken ct = default)
    {
        var logs = await _repository.GetLogsAsync(ruleId, jobId, from, to, triggerType, conditionsMet, skip, take, ct);
        return Ok(logs.Select(MapToDto));
    }

    /// <summary>Get a single execution log with action details.</summary>
    [HttpGet("logs/{id:long}")]
    public async Task<ActionResult<AutomationExecutionLogDto>> GetLogById(long id, CancellationToken ct)
    {
        var log = await _repository.GetLogByIdAsync(id, ct);
        if (log is null) return NotFound();
        return Ok(MapToDto(log));
    }

    /// <summary>Get logs for a specific rule.</summary>
    [HttpGet("{ruleId:int}/logs")]
    public async Task<ActionResult<List<AutomationExecutionLogDto>>> GetLogsByRule(
        int ruleId, [FromQuery] int skip = 0, [FromQuery] int take = 50, CancellationToken ct = default)
    {
        var logs = await _repository.GetLogsAsync(ruleId, null, null, null, null, null, skip, take, ct);
        return Ok(logs.Select(MapToDto));
    }

    private static AutomationExecutionLogDto MapToDto(Core.Entities.AutomationExecutionLog log) => new()
    {
        Id = log.Id,
        RuleId = log.RuleId,
        RuleName = log.RuleName,
        JobId = log.JobId,
        EvaluatedAt = log.EvaluatedAt,
        ConditionsMet = log.ConditionsMet,
        TriggerType = log.TriggerType,
        TriggerDetail = log.TriggerDetail,
        ActionsExecuted = log.ActionsExecuted,
        ActionsSummary = log.ActionsSummary,
        ErrorMessage = log.ErrorMessage,
        DurationMs = log.DurationMs,
        ActionDetails = log.ActionDetails.Select(d => new ActionExecutionDetailDto
        {
            Id = d.Id,
            ActionType = d.ActionType,
            Success = d.Success,
            Detail = d.Detail,
            ErrorMessage = d.ErrorMessage,
            DurationMs = d.DurationMs
        }).ToList()
    };
}
