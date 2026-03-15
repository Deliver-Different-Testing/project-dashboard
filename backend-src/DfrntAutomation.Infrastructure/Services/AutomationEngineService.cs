using System.Diagnostics;
using System.Text.Json;
using DfrntAutomation.Core.DTOs;
using DfrntAutomation.Core.Entities;
using DfrntAutomation.Core.Enums;
using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// THE CORE ENGINE — replaces sp_AutomationEngine stored procedure.
/// Two evaluation paths: event-driven and time-based.
/// </summary>
public class AutomationEngineService : IAutomationEngineService
{
    private readonly IAutomationRepository _repository;
    private readonly IPlaceholderResolver _placeholderResolver;
    private readonly IMailtrapEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly IEventService _eventService;
    private readonly ITaskService _taskService;
    private readonly IAppConfigService _appConfigService;
    private readonly AutomationDbContext _db;
    private readonly ILogger<AutomationEngineService> _logger;

    public AutomationEngineService(
        IAutomationRepository repository,
        IPlaceholderResolver placeholderResolver,
        IMailtrapEmailService emailService,
        ISmsService smsService,
        IEventService eventService,
        ITaskService taskService,
        IAppConfigService appConfigService,
        AutomationDbContext db,
        ILogger<AutomationEngineService> logger)
    {
        _repository = repository;
        _placeholderResolver = placeholderResolver;
        _emailService = emailService;
        _smsService = smsService;
        _eventService = eventService;
        _taskService = taskService;
        _appConfigService = appConfigService;
        _db = db;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task EvaluateEventAsync(AutomationEvent automationEvent, CancellationToken ct = default)
    {
        var shadowMode = await _appConfigService.GetBoolAsync("Automation.DotNetEngine.ShadowMode", false, ct);
        var rules = await _repository.GetActiveRulesAsync(ct);

        _logger.LogInformation("Evaluating {Count} active rules for event {TriggerType} on job {JobId}",
            rules.Count, automationEvent.TriggerType, automationEvent.JobId);

        foreach (var rule in rules)
        {
            var sw = Stopwatch.StartNew();
            var log = new AutomationExecutionLog
            {
                RuleId = rule.Id,
                RuleName = rule.Name,
                JobId = automationEvent.JobId,
                TriggerType = automationEvent.TriggerType,
                TriggerDetail = automationEvent.TriggerDetail
            };

            try
            {
                // Check scope
                if (!IsInScope(rule, automationEvent))
                {
                    log.ConditionsMet = false;
                    sw.Stop();
                    log.DurationMs = (int)sw.ElapsedMilliseconds;
                    await _repository.LogExecutionAsync(log, ct);
                    continue;
                }

                // Evaluate conditions
                var conditionsMet = EvaluateConditions(rule, automationEvent);
                log.ConditionsMet = conditionsMet;

                if (conditionsMet && !shadowMode)
                {
                    var actionResults = await ExecuteActionsAsync(rule, automationEvent, ct);
                    log.ActionsExecuted = actionResults.Count(r => r.Success);
                    log.ActionsSummary = JsonSerializer.Serialize(actionResults.Select(r => new { r.ActionType, r.Success, r.Detail }));
                    log.ActionDetails = actionResults;
                }
                else if (conditionsMet && shadowMode)
                {
                    log.ActionsSummary = "SHADOW_MODE: Actions would have been executed";
                    _logger.LogInformation("Shadow mode: Rule {RuleId} conditions met for job {JobId}, skipping actions",
                        rule.Id, automationEvent.JobId);
                }
            }
            catch (Exception ex)
            {
                log.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Error evaluating rule {RuleId} for job {JobId}", rule.Id, automationEvent.JobId);
            }
            finally
            {
                sw.Stop();
                log.DurationMs = (int)sw.ElapsedMilliseconds;
                log.EvaluatedAt = DateTime.UtcNow;
                await _repository.LogExecutionAsync(log, ct);
            }
        }
    }

    /// <inheritdoc />
    public async Task EvaluateTimeBasedRulesAsync(CancellationToken ct = default)
    {
        var shadowMode = await _appConfigService.GetBoolAsync("Automation.DotNetEngine.ShadowMode", false, ct);
        var windowMinutes = await _appConfigService.GetIntAsync("Automation.TimeBased.WindowMinutes", 30, ct);
        var rules = await _repository.GetTimeBasedRulesAsync(ct);

        _logger.LogInformation("Evaluating {Count} time-based rules", rules.Count);

        foreach (var rule in rules)
        {
            try
            {
                // Query jobs matching time conditions using raw SQL
                var matchingJobIds = await GetJobsMatchingTimeConditionsAsync(rule, ct);

                foreach (var jobId in matchingJobIds)
                {
                    // Skip if already evaluated within window
                    if (await _repository.HasBeenEvaluatedRecentlyAsync(rule.Id, jobId, windowMinutes, ct))
                        continue;

                    var sw = Stopwatch.StartNew();
                    var log = new AutomationExecutionLog
                    {
                        RuleId = rule.Id,
                        RuleName = rule.Name,
                        JobId = jobId,
                        TriggerType = TriggerType.TimeBased.ToString(),
                        TriggerDetail = $"Timer evaluation for rule {rule.Name}",
                        ConditionsMet = true
                    };

                    try
                    {
                        if (!shadowMode)
                        {
                            var evt = new AutomationEvent
                            {
                                TriggerType = TriggerType.TimeBased.ToString(),
                                JobId = jobId
                            };
                            var actionResults = await ExecuteActionsAsync(rule, evt, ct);
                            log.ActionsExecuted = actionResults.Count(r => r.Success);
                            log.ActionsSummary = JsonSerializer.Serialize(actionResults.Select(r => new { r.ActionType, r.Success }));
                            log.ActionDetails = actionResults;
                        }
                        else
                        {
                            log.ActionsSummary = "SHADOW_MODE: Actions would have been executed";
                        }
                    }
                    catch (Exception ex)
                    {
                        log.ErrorMessage = ex.Message;
                        _logger.LogError(ex, "Error executing time-based rule {RuleId} for job {JobId}", rule.Id, jobId);
                    }
                    finally
                    {
                        sw.Stop();
                        log.DurationMs = (int)sw.ElapsedMilliseconds;
                        log.EvaluatedAt = DateTime.UtcNow;
                        await _repository.LogExecutionAsync(log, ct);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing time-based rule {RuleId}", rule.Id);
            }
        }
    }

    /// <inheritdoc />
    public async Task<AutomationExecutionLogDto> TestRuleAsync(int ruleId, int jobId, CancellationToken ct = default)
    {
        var rule = await _repository.GetByIdAsync(ruleId, ct)
            ?? throw new InvalidOperationException($"Rule {ruleId} not found");

        var sw = Stopwatch.StartNew();
        var evt = new AutomationEvent
        {
            TriggerType = "DryRun",
            JobId = jobId,
            TriggerDetail = $"Dry-run test of rule {rule.Name}"
        };

        var conditionsMet = EvaluateConditions(rule, evt);
        sw.Stop();

        return new AutomationExecutionLogDto
        {
            RuleId = ruleId,
            RuleName = rule.Name,
            JobId = jobId,
            EvaluatedAt = DateTime.UtcNow,
            ConditionsMet = conditionsMet,
            TriggerType = "DryRun",
            TriggerDetail = evt.TriggerDetail,
            ActionsExecuted = 0,
            ActionsSummary = conditionsMet
                ? $"Would execute {rule.Actions.Count} action(s): {string.Join(", ", rule.Actions.Select(a => a.ActionType))}"
                : "Conditions not met — no actions would execute",
            DurationMs = (int)sw.ElapsedMilliseconds
        };
    }

    #region Private Methods

    /// <summary>
    /// Check if the job falls within the rule's scope. ALL filters live here (not on conditions)
    /// to prevent conflicting condition-level filters that silently match nothing.
    /// </summary>
    private static bool IsInScope(AutomationRule rule, AutomationEvent evt)
    {
        // Customers
        if (!rule.AllCustomers && evt.CustomerId.HasValue)
        {
            var ids = ParseIds(rule.CustomerIds);
            if (ids.Count > 0 && !ids.Contains(evt.CustomerId.Value))
                return false;
        }

        // Speeds
        if (!rule.AllSpeeds && evt.SpeedId.HasValue)
        {
            var ids = ParseIds(rule.SpeedIds);
            if (ids.Count > 0 && !ids.Contains(evt.SpeedId.Value))
                return false;
        }

        // Job Statuses
        if (!rule.AllJobStatuses && evt.NewStatusId.HasValue)
        {
            var ids = ParseIds(rule.JobStatusIds);
            if (ids.Count > 0 && !ids.Contains(evt.NewStatusId.Value))
                return false;
        }

        // Priorities
        if (!rule.AllPriorities && evt.PriorityId.HasValue)
        {
            var ids = ParseIds(rule.PriorityIds);
            if (ids.Count > 0 && !ids.Contains(evt.PriorityId.Value))
                return false;
        }

        // From Site
        if (!rule.AllFromSites && evt.FromSiteId.HasValue)
        {
            var ids = ParseIds(rule.FromSiteIds);
            if (ids.Count > 0 && !ids.Contains(evt.FromSiteId.Value))
                return false;
        }

        // To Site
        if (!rule.AllToSites && evt.ToSiteId.HasValue)
        {
            var ids = ParseIds(rule.ToSiteIds);
            if (ids.Count > 0 && !ids.Contains(evt.ToSiteId.Value))
                return false;
        }

        // From Region
        if (!rule.AllFromRegions && evt.FromRegionId.HasValue)
        {
            var ids = ParseIds(rule.FromRegionIds);
            if (ids.Count > 0 && !ids.Contains(evt.FromRegionId.Value))
                return false;
        }

        // To Region
        if (!rule.AllToRegions && evt.ToRegionId.HasValue)
        {
            var ids = ParseIds(rule.ToRegionIds);
            if (ids.Count > 0 && !ids.Contains(evt.ToRegionId.Value))
                return false;
        }

        // Time Threshold
        if (rule.TimeThreshold.HasValue && rule.TimeThreshold.Value > 0)
        {
            if (!evt.MinutesInState.HasValue || evt.MinutesInState.Value < rule.TimeThreshold.Value)
                return false;
        }

        return true;
    }

    /// <summary>
    /// Evaluate all conditions on a rule against the event.
    /// </summary>
    private static bool EvaluateConditions(AutomationRule rule, AutomationEvent evt)
    {
        if (!rule.Conditions.Any())
            return true;

        var results = rule.Conditions.Select(c => EvaluateCondition(c, evt));

        return rule.ConditionMatchMode == ConditionMatchMode.All
            ? results.All(r => r)
            : results.Any(r => r);
    }

    /// <summary>
    /// Evaluate a single condition against the event.
    /// </summary>
    private static bool EvaluateCondition(AutomationCondition condition, AutomationEvent evt)
    {
        // Advanced filters now live at scope/rule level (checked in IsInScope)
        return condition.ConditionType switch
        {
            ConditionType.Status => EvaluateStatusCondition(condition, evt),
            ConditionType.Scan => EvaluateScanCondition(condition, evt),
            // Time-based conditions are evaluated by the timer path via SQL queries
            ConditionType.JobUnassigned or
            ConditionType.JobAssigned or
            ConditionType.BeforeScheduledTime or
            ConditionType.AfterScheduledTime or
            ConditionType.AtScheduledTime => true, // Already filtered by SQL
            _ => false
        };
    }

    /// <summary>
    /// Matches the SP's CHARINDEX approach: checks if a value exists in a comma-separated string.
    /// e.g. CsvContains("1,5,12", "5") → true
    /// </summary>
    private static bool CsvContains(string csv, string value)
    {
        var items = csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return items.Contains(value, StringComparer.OrdinalIgnoreCase);
    }

    private static bool EvaluateStatusCondition(AutomationCondition condition, AutomationEvent evt)
    {
        return condition.StatusConditionMode switch
        {
            Enums.StatusConditionMode.AnyChange => evt.NewStatusId != evt.OldStatusId,
            Enums.StatusConditionMode.ChangesTo => evt.NewStatusId == condition.StatusId,
            Enums.StatusConditionMode.Leaves => evt.OldStatusId == condition.StatusId,
            Enums.StatusConditionMode.IsNot => evt.NewStatusId != condition.StatusId,
            _ => false
        };
    }

    private static bool EvaluateScanCondition(AutomationCondition condition, AutomationEvent evt)
    {
        if (string.IsNullOrEmpty(evt.ScanType) || string.IsNullOrEmpty(condition.ScanTypes))
            return false;

        var allowedScans = condition.ScanTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return allowedScans.Contains(evt.ScanType, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Execute all actions for a rule that has met its conditions.
    /// </summary>
    private async Task<List<ActionExecutionDetail>> ExecuteActionsAsync(
        AutomationRule rule, AutomationEvent evt, CancellationToken ct)
    {
        var results = new List<ActionExecutionDetail>();

        foreach (var action in rule.Actions.OrderBy(a => a.SortOrder))
        {
            var sw = Stopwatch.StartNew();
            var detail = new ActionExecutionDetail { ActionType = action.ActionType.ToString() };

            try
            {
                await ExecuteActionAsync(action, evt, ct);
                detail.Success = true;
                detail.Detail = $"Executed {action.ActionType} successfully";
            }
            catch (Exception ex)
            {
                detail.Success = false;
                detail.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Action {ActionType} failed for rule {RuleId} job {JobId}",
                    action.ActionType, rule.Id, evt.JobId);
            }
            finally
            {
                sw.Stop();
                detail.DurationMs = (int)sw.ElapsedMilliseconds;
                results.Add(detail);
            }
        }

        return results;
    }

    /// <summary>
    /// Execute a single action.
    /// </summary>
    private async Task ExecuteActionAsync(AutomationAction action, AutomationEvent evt, CancellationToken ct)
    {
        switch (action.ActionType)
        {
            case ActionType.UpdateJobStatus:
                if (action.ToStatusId.HasValue && evt.JobId.HasValue)
                {
                    await _db.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE tucJob SET StatusId = {action.ToStatusId.Value} WHERE JobId = {evt.JobId.Value}", ct);
                }
                break;

            case ActionType.ChangeStatus:
                if (action.FromStatusId.HasValue && action.ToStatusId.HasValue && evt.JobId.HasValue)
                {
                    // Only change if current status matches FromStatusId
                    await _db.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE tucJob SET StatusId = {action.ToStatusId.Value} WHERE JobId = {evt.JobId.Value} AND StatusId = {action.FromStatusId.Value}", ct);
                }
                break;

            case ActionType.CreateTask:
                if (action.TaskTemplateId.HasValue && evt.JobId.HasValue)
                {
                    await _taskService.CreateTaskAsync(
                        evt.JobId.Value, action.TaskTemplateId.Value,
                        action.TaskAssigneeId, action.TaskAssigneeGroupId,
                        action.TaskDueOffsetMinutes, ct);
                }
                break;

            case ActionType.CompleteTask:
                if (action.TaskTemplateId.HasValue && evt.JobId.HasValue)
                {
                    await _taskService.CompleteTaskAsync(evt.JobId.Value, action.TaskTemplateId.Value, ct);
                }
                break;

            case ActionType.TriggerNotification:
                // NotificationTemplateId maps to EventTypeId in tucEventType
                // Creates a tucEvent row — notifications ARE events in the TMS
                if (action.NotificationTemplateId.HasValue && evt.JobId.HasValue)
                {
                    await _eventService.CreateEventAsync(evt.JobId.Value, action.NotificationTemplateId.Value, "Triggered by Automation Engine", ct);
                }
                break;

            case ActionType.SendSms:
                if (evt.JobId.HasValue && !string.IsNullOrEmpty(action.SmsMessageContent))
                {
                    var resolvedMessage = await _placeholderResolver.ResolveAsync(action.SmsMessageContent, evt.JobId.Value, ct);
                    var phoneNumber = await ResolvePhoneNumberAsync(action, evt.JobId.Value, ct);
                    if (!string.IsNullOrEmpty(phoneNumber))
                    {
                        await _smsService.SendSmsAsync(phoneNumber, resolvedMessage, ct);
                    }
                }
                break;

            default:
                _logger.LogWarning("Unknown action type: {ActionType}", action.ActionType);
                break;
        }
    }

    /// <summary>
    /// Resolve the phone number for SMS based on recipient type.
    /// </summary>
    private async Task<string?> ResolvePhoneNumberAsync(AutomationAction action, int jobId, CancellationToken ct)
    {
        return action.SmsRecipientType switch
        {
            SmsRecipientType.FixedNumber => action.SmsFixedNumber,
            SmsRecipientType.CustomerContact => await GetPhoneFromSqlAsync(
                "SELECT TOP 1 c.ContactPhone FROM tucJob j INNER JOIN tucContact c ON j.ContactId = c.ContactId WHERE j.JobId = @p0", jobId, ct),
            SmsRecipientType.Driver => await GetPhoneFromSqlAsync(
                "SELECT TOP 1 cr.CourierMobile FROM tucJob j INNER JOIN tucCourier cr ON j.CourierId = cr.CourierId WHERE j.JobId = @p0", jobId, ct),
            _ => null
        };
    }

    private async Task<string?> GetPhoneFromSqlAsync(string sql, int jobId, CancellationToken ct)
    {
        await using var command = _db.Database.GetDbConnection().CreateCommand();
        command.CommandText = sql;
        var param = command.CreateParameter();
        param.ParameterName = "@p0";
        param.Value = jobId;
        command.Parameters.Add(param);

        await _db.Database.OpenConnectionAsync(ct);
        try
        {
            var result = await command.ExecuteScalarAsync(ct);
            return result?.ToString();
        }
        finally
        {
            await _db.Database.CloseConnectionAsync();
        }
    }

    /// <summary>
    /// Query jobs matching time-based conditions for a rule.
    /// </summary>
    private async Task<List<int>> GetJobsMatchingTimeConditionsAsync(AutomationRule rule, CancellationToken ct)
    {
        var jobIds = new List<int>();
        var now = DateTime.UtcNow;

        foreach (var condition in rule.Conditions)
        {
            var sql = condition.ConditionType switch
            {
                ConditionType.JobUnassigned =>
                    $@"SELECT j.JobId FROM tucJob j
                       WHERE j.CourierId IS NULL AND j.StatusId NOT IN (SELECT StatusId FROM tucStatus WHERE IsFinal = 1)
                       AND DATEDIFF(MINUTE, j.CreatedDate, GETUTCDATE()) >= {condition.OffsetValue ?? 0}",

                ConditionType.JobAssigned =>
                    $@"SELECT j.JobId FROM tucJob j
                       WHERE j.CourierId IS NOT NULL AND j.PickupActual IS NULL
                       AND j.StatusId NOT IN (SELECT StatusId FROM tucStatus WHERE IsFinal = 1)
                       AND DATEDIFF(MINUTE, j.AssignedDate, GETUTCDATE()) >= {condition.OffsetValue ?? 0}",

                ConditionType.BeforeScheduledTime =>
                    BuildScheduledTimeSql(condition, "<=", now),

                ConditionType.AfterScheduledTime =>
                    BuildScheduledTimeSql(condition, ">=", now),

                ConditionType.AtScheduledTime =>
                    BuildScheduledTimeSql(condition, "=", now),

                _ => null
            };

            if (sql is not null)
            {
                // Apply all scope filters to SQL
                if (!rule.AllCustomers && !string.IsNullOrEmpty(rule.CustomerIds))
                    sql += $" AND j.CustomerId IN ({rule.CustomerIds})";
                if (!rule.AllSpeeds && !string.IsNullOrEmpty(rule.SpeedIds))
                    sql += $" AND j.SpeedId IN ({rule.SpeedIds})";
                if (!rule.AllJobStatuses && !string.IsNullOrEmpty(rule.JobStatusIds))
                    sql += $" AND j.StatusId IN ({rule.JobStatusIds})";
                if (!rule.AllPriorities && !string.IsNullOrEmpty(rule.PriorityIds))
                    sql += $" AND j.PriorityId IN ({rule.PriorityIds})";
                if (!rule.AllFromSites && !string.IsNullOrEmpty(rule.FromSiteIds))
                    sql += $" AND j.PickupSiteId IN ({rule.FromSiteIds})";
                if (!rule.AllToSites && !string.IsNullOrEmpty(rule.ToSiteIds))
                    sql += $" AND j.DeliverySiteId IN ({rule.ToSiteIds})";
                if (!rule.AllFromRegions && !string.IsNullOrEmpty(rule.FromRegionIds))
                    sql += $" AND j.PickupRegionId IN ({rule.FromRegionIds})";
                if (!rule.AllToRegions && !string.IsNullOrEmpty(rule.ToRegionIds))
                    sql += $" AND j.DeliveryRegionId IN ({rule.ToRegionIds})";

                var ids = await _db.Database.SqlQueryRaw<int>(sql).ToListAsync(ct);
                jobIds.AddRange(ids);
            }
        }

        return jobIds.Distinct().ToList();
    }

    private static string BuildScheduledTimeSql(AutomationCondition condition, string op, DateTime now)
    {
        var field = condition.ScheduledTimeField switch
        {
            ScheduledTimeField.Pickup => "j.ScheduledPickupTime",
            ScheduledTimeField.Delivery => "j.ScheduledDeliveryTime",
            ScheduledTimeField.Flight => "j.FlightTime",
            _ => "j.ScheduledPickupTime"
        };

        var offsetMinutes = condition.OffsetValue ?? 0;
        if (condition.OffsetUnit?.ToLower() == "hours")
            offsetMinutes *= 60;

        return op switch
        {
            "<=" => $@"SELECT j.JobId FROM tucJob j
                       WHERE {field} IS NOT NULL
                       AND j.StatusId NOT IN (SELECT StatusId FROM tucStatus WHERE IsFinal = 1)
                       AND DATEDIFF(MINUTE, GETUTCDATE(), {field}) BETWEEN 0 AND {offsetMinutes}",

            ">=" => $@"SELECT j.JobId FROM tucJob j
                       WHERE {field} IS NOT NULL
                       AND j.StatusId NOT IN (SELECT StatusId FROM tucStatus WHERE IsFinal = 1)
                       AND DATEDIFF(MINUTE, {field}, GETUTCDATE()) BETWEEN 0 AND {offsetMinutes}",

            _ => $@"SELECT j.JobId FROM tucJob j
                    WHERE {field} IS NOT NULL
                    AND j.StatusId NOT IN (SELECT StatusId FROM tucStatus WHERE IsFinal = 1)
                    AND ABS(DATEDIFF(MINUTE, {field}, GETUTCDATE())) <= 2"
        };
    }

    private static HashSet<int> ParseIds(string? csv)
    {
        if (string.IsNullOrWhiteSpace(csv)) return new HashSet<int>();
        return csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => int.TryParse(s, out _))
            .Select(int.Parse)
            .ToHashSet();
    }

    #endregion
}
