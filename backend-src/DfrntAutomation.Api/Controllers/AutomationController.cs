using DfrntAutomation.Core.DTOs;
using DfrntAutomation.Core.Entities;
using DfrntAutomation.Core.Enums;
using DfrntAutomation.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DfrntAutomation.Api.Controllers;

/// <summary>
/// CRUD API for automation rules.
/// </summary>
[ApiController]
[Route("api/automations")]
[Authorize]
public class AutomationController : ControllerBase
{
    private readonly IAutomationRepository _repository;
    private readonly IAutomationEngineService _engineService;
    private readonly ILogger<AutomationController> _logger;

    public AutomationController(IAutomationRepository repository, IAutomationEngineService engineService, ILogger<AutomationController> logger)
    {
        _repository = repository;
        _engineService = engineService;
        _logger = logger;
    }

    /// <summary>List all rules with optional filters.</summary>
    [HttpGet]
    public async Task<ActionResult<List<AutomationRuleDto>>> GetAll(
        [FromQuery] int? customerId, [FromQuery] int? speedId,
        [FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken ct)
    {
        var rules = await _repository.GetAllAsync(customerId, speedId, search, isActive, ct);
        return Ok(rules.Select(MapToDto));
    }

    /// <summary>Get a single rule with conditions and actions.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AutomationRuleDto>> GetById(int id, CancellationToken ct)
    {
        var rule = await _repository.GetByIdAsync(id, ct);
        if (rule is null) return NotFound();
        return Ok(MapToDto(rule));
    }

    /// <summary>Create a new automation rule.</summary>
    [HttpPost]
    public async Task<ActionResult<AutomationRuleDto>> Create([FromBody] CreateAutomationRequest request, CancellationToken ct)
    {
        var rule = new AutomationRule
        {
            Name = request.Name,
            Description = request.Description,
            ConditionMatchMode = Enum.Parse<ConditionMatchMode>(request.ConditionMatchMode, true),
            AllCustomers = request.Scope.AllCustomers,
            CustomerIds = request.Scope.CustomerIds.Any() ? string.Join(",", request.Scope.CustomerIds) : null,
            AllSpeeds = request.Scope.AllSpeeds,
            SpeedIds = request.Scope.SpeedIds.Any() ? string.Join(",", request.Scope.SpeedIds) : null,
            Conditions = request.Conditions.Select((c, i) => new AutomationCondition
            {
                ConditionType = Enum.Parse<ConditionType>(c.ConditionType, true),
                SortOrder = c.SortOrder > 0 ? c.SortOrder : i + 1,
                JobTypeFilter = Enum.Parse<JobTypeFilter>(c.JobTypeFilter, true),
                StatusConditionMode = c.StatusConditionMode is not null ? Enum.Parse<StatusConditionMode>(c.StatusConditionMode, true) : null,
                StatusId = c.StatusId,
                ScheduledTimeField = c.ScheduledTimeField is not null ? Enum.Parse<ScheduledTimeField>(c.ScheduledTimeField, true) : null,
                OffsetValue = c.OffsetValue,
                OffsetUnit = c.OffsetUnit,
                ScanTypes = c.ScanTypes is not null ? string.Join(",", c.ScanTypes) : null,
                PriorityFilter = c.PriorityFilter ?? "ALL",
                FromSiteFilter = c.FromSiteFilter,
                ToSiteFilter = c.ToSiteFilter,
                FromRegionFilter = c.FromRegionFilter,
                ToRegionFilter = c.ToRegionFilter,
                TimeThreshold = c.TimeThreshold
            }).ToList(),
            Actions = request.Actions.Select((a, i) => new AutomationAction
            {
                ActionType = Enum.Parse<ActionType>(a.ActionType, true),
                SortOrder = a.SortOrder > 0 ? a.SortOrder : i + 1,
                ToStatusId = a.ToStatusId,
                FromStatusId = a.FromStatusId,
                TaskTemplateId = a.TaskTemplateId,
                TaskAssigneeId = a.TaskAssigneeId,
                TaskAssigneeGroupId = a.TaskAssigneeGroupId,
                TaskDueOffsetMinutes = a.TaskDueOffsetMinutes,
                NotificationTemplateId = a.NotificationTemplateId,
                SmsRecipientType = a.SmsRecipientType is not null ? Enum.Parse<SmsRecipientType>(a.SmsRecipientType, true) : null,
                SmsFixedNumber = a.SmsFixedNumber,
                SmsMessageContent = a.SmsMessageContent
            }).ToList()
        };

        var created = await _repository.CreateAsync(rule, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToDto(created));
    }

    /// <summary>Update an existing rule.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<AutomationRuleDto>> Update(int id, [FromBody] UpdateAutomationRequest request, CancellationToken ct)
    {
        var rule = await _repository.GetByIdAsync(id, ct);
        if (rule is null) return NotFound();

        rule.Name = request.Name;
        rule.Description = request.Description;
        rule.IsActive = request.IsActive;
        rule.ConditionMatchMode = Enum.Parse<ConditionMatchMode>(request.ConditionMatchMode, true);
        rule.AllCustomers = request.Scope.AllCustomers;
        rule.CustomerIds = request.Scope.CustomerIds.Any() ? string.Join(",", request.Scope.CustomerIds) : null;
        rule.AllSpeeds = request.Scope.AllSpeeds;
        rule.SpeedIds = request.Scope.SpeedIds.Any() ? string.Join(",", request.Scope.SpeedIds) : null;

        // Replace conditions and actions
        rule.Conditions.Clear();
        rule.Conditions.AddRange(request.Conditions.Select((c, i) => new AutomationCondition
        {
            RuleId = id,
            ConditionType = Enum.Parse<ConditionType>(c.ConditionType, true),
            SortOrder = c.SortOrder > 0 ? c.SortOrder : i + 1,
            JobTypeFilter = Enum.Parse<JobTypeFilter>(c.JobTypeFilter, true),
            StatusConditionMode = c.StatusConditionMode is not null ? Enum.Parse<StatusConditionMode>(c.StatusConditionMode, true) : null,
            StatusId = c.StatusId,
            ScheduledTimeField = c.ScheduledTimeField is not null ? Enum.Parse<ScheduledTimeField>(c.ScheduledTimeField, true) : null,
            OffsetValue = c.OffsetValue,
            OffsetUnit = c.OffsetUnit,
            ScanTypes = c.ScanTypes is not null ? string.Join(",", c.ScanTypes) : null,
            PriorityFilter = c.PriorityFilter ?? "ALL",
            FromSiteFilter = c.FromSiteFilter,
            ToSiteFilter = c.ToSiteFilter,
            FromRegionFilter = c.FromRegionFilter,
            ToRegionFilter = c.ToRegionFilter,
            TimeThreshold = c.TimeThreshold
        }));

        rule.Actions.Clear();
        rule.Actions.AddRange(request.Actions.Select((a, i) => new AutomationAction
        {
            RuleId = id,
            ActionType = Enum.Parse<ActionType>(a.ActionType, true),
            SortOrder = a.SortOrder > 0 ? a.SortOrder : i + 1,
            ToStatusId = a.ToStatusId,
            FromStatusId = a.FromStatusId,
            TaskTemplateId = a.TaskTemplateId,
            TaskAssigneeId = a.TaskAssigneeId,
            TaskAssigneeGroupId = a.TaskAssigneeGroupId,
            TaskDueOffsetMinutes = a.TaskDueOffsetMinutes,
            NotificationTemplateId = a.NotificationTemplateId,
            SmsRecipientType = a.SmsRecipientType is not null ? Enum.Parse<SmsRecipientType>(a.SmsRecipientType, true) : null,
            SmsFixedNumber = a.SmsFixedNumber,
            SmsMessageContent = a.SmsMessageContent
        }));

        await _repository.UpdateAsync(rule, ct);
        return Ok(MapToDto(rule));
    }

    /// <summary>Soft delete a rule.</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _repository.SoftDeleteAsync(id, ct);
        return NoContent();
    }

    /// <summary>Toggle a rule active/inactive.</summary>
    [HttpPost("{id:int}/toggle")]
    public async Task<IActionResult> Toggle(int id, CancellationToken ct)
    {
        await _repository.ToggleActiveAsync(id, ct);
        return Ok();
    }

    /// <summary>Dry-run a rule against a specific job.</summary>
    [HttpPost("{id:int}/test")]
    public async Task<ActionResult<AutomationExecutionLogDto>> Test(int id, [FromQuery] int jobId, CancellationToken ct)
    {
        var result = await _engineService.TestRuleAsync(id, jobId, ct);
        return Ok(result);
    }

    /// <summary>Trigger event evaluation (called by other services).</summary>
    [HttpPost("evaluate")]
    public async Task<IActionResult> Evaluate([FromBody] AutomationEvent automationEvent, CancellationToken ct)
    {
        await _engineService.EvaluateEventAsync(automationEvent, ct);
        return Accepted();
    }

    private static AutomationRuleDto MapToDto(AutomationRule rule) => new()
    {
        Id = rule.Id,
        Name = rule.Name,
        Description = rule.Description,
        IsActive = rule.IsActive,
        ConditionMatchMode = rule.ConditionMatchMode.ToString().ToLower(),
        Scope = new AutomationScopeDto
        {
            AllCustomers = rule.AllCustomers,
            CustomerIds = ParseIntList(rule.CustomerIds),
            AllSpeeds = rule.AllSpeeds,
            SpeedIds = ParseIntList(rule.SpeedIds)
        },
        Conditions = rule.Conditions.Select(c => new AutomationConditionDto
        {
            Id = c.Id,
            ConditionType = c.ConditionType.ToString(),
            SortOrder = c.SortOrder,
            JobTypeFilter = c.JobTypeFilter.ToString().ToLower(),
            StatusConditionMode = c.StatusConditionMode?.ToString(),
            StatusId = c.StatusId,
            ScheduledTimeField = c.ScheduledTimeField?.ToString(),
            OffsetValue = c.OffsetValue,
            OffsetUnit = c.OffsetUnit,
            ScanTypes = c.ScanTypes?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
            PriorityFilter = c.PriorityFilter ?? "ALL",
            FromSiteFilter = c.FromSiteFilter,
            ToSiteFilter = c.ToSiteFilter,
            FromRegionFilter = c.FromRegionFilter,
            ToRegionFilter = c.ToRegionFilter,
            TimeThreshold = c.TimeThreshold
        }).ToList(),
        Actions = rule.Actions.Select(a => new AutomationActionDto
        {
            Id = a.Id,
            ActionType = a.ActionType.ToString(),
            SortOrder = a.SortOrder,
            ToStatusId = a.ToStatusId,
            FromStatusId = a.FromStatusId,
            TaskTemplateId = a.TaskTemplateId,
            TaskAssigneeId = a.TaskAssigneeId,
            TaskAssigneeGroupId = a.TaskAssigneeGroupId,
            TaskDueOffsetMinutes = a.TaskDueOffsetMinutes,
            NotificationTemplateId = a.NotificationTemplateId,
            SmsRecipientType = a.SmsRecipientType?.ToString(),
            SmsFixedNumber = a.SmsFixedNumber,
            SmsMessageContent = a.SmsMessageContent
        }).ToList(),
        CreatedDate = rule.CreatedDate,
        ModifiedDate = rule.ModifiedDate
    };

    private static List<int> ParseIntList(string? csv) =>
        string.IsNullOrWhiteSpace(csv)
            ? new List<int>()
            : csv.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Where(s => int.TryParse(s, out _))
                .Select(int.Parse)
                .ToList();
}
