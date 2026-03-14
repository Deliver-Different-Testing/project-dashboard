using DfrntAutomation.Core.Entities;
using DfrntAutomation.Core.Enums;
using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of the automation repository.
/// </summary>
public class AutomationRepository : IAutomationRepository
{
    private readonly AutomationDbContext _db;
    private readonly ILogger<AutomationRepository> _logger;

    public AutomationRepository(AutomationDbContext db, ILogger<AutomationRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<AutomationRule>> GetActiveRulesAsync(CancellationToken ct = default) =>
        await _db.AutomationRules
            .Include(r => r.Conditions.OrderBy(c => c.SortOrder))
            .Include(r => r.Actions.OrderBy(a => a.SortOrder))
            .Where(r => r.IsActive)
            .AsNoTracking()
            .ToListAsync(ct);

    public async Task<List<AutomationRule>> GetTimeBasedRulesAsync(CancellationToken ct = default) =>
        await _db.AutomationRules
            .Include(r => r.Conditions.OrderBy(c => c.SortOrder))
            .Include(r => r.Actions.OrderBy(a => a.SortOrder))
            .Where(r => r.IsActive && r.Conditions.Any(c =>
                c.ConditionType == ConditionType.BeforeScheduledTime ||
                c.ConditionType == ConditionType.AfterScheduledTime ||
                c.ConditionType == ConditionType.AtScheduledTime ||
                c.ConditionType == ConditionType.JobUnassigned ||
                c.ConditionType == ConditionType.JobAssigned))
            .AsNoTracking()
            .ToListAsync(ct);

    public async Task<AutomationRule?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await _db.AutomationRules
            .Include(r => r.Conditions.OrderBy(c => c.SortOrder))
            .Include(r => r.Actions.OrderBy(a => a.SortOrder))
            .FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<List<AutomationRule>> GetAllAsync(int? customerId, int? speedId, string? search, bool? isActive, CancellationToken ct = default)
    {
        var query = _db.AutomationRules
            .Include(r => r.Conditions.OrderBy(c => c.SortOrder))
            .Include(r => r.Actions.OrderBy(a => a.SortOrder))
            .AsQueryable();

        if (isActive.HasValue)
            query = query.Where(r => r.IsActive == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r => r.Name.Contains(search) || (r.Description != null && r.Description.Contains(search)));

        if (customerId.HasValue)
            query = query.Where(r => r.AllCustomers || (r.CustomerIds != null && r.CustomerIds.Contains(customerId.Value.ToString())));

        if (speedId.HasValue)
            query = query.Where(r => r.AllSpeeds || (r.SpeedIds != null && r.SpeedIds.Contains(speedId.Value.ToString())));

        return await query.AsNoTracking().OrderBy(r => r.Name).ToListAsync(ct);
    }

    public async Task<AutomationRule> CreateAsync(AutomationRule rule, CancellationToken ct = default)
    {
        _db.AutomationRules.Add(rule);
        await _db.SaveChangesAsync(ct);
        return rule;
    }

    public async Task UpdateAsync(AutomationRule rule, CancellationToken ct = default)
    {
        rule.ModifiedDate = DateTime.UtcNow;
        _db.AutomationRules.Update(rule);
        await _db.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteAsync(int id, CancellationToken ct = default)
    {
        var rule = await _db.AutomationRules.FindAsync(new object[] { id }, ct);
        if (rule is not null)
        {
            rule.IsDeleted = true;
            rule.IsActive = false;
            rule.ModifiedDate = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task ToggleActiveAsync(int id, CancellationToken ct = default)
    {
        var rule = await _db.AutomationRules.FindAsync(new object[] { id }, ct);
        if (rule is not null)
        {
            rule.IsActive = !rule.IsActive;
            rule.ModifiedDate = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task<AutomationExecutionLog> LogExecutionAsync(AutomationExecutionLog log, CancellationToken ct = default)
    {
        _db.AutomationExecutionLogs.Add(log);
        await _db.SaveChangesAsync(ct);
        return log;
    }

    public async Task<bool> HasBeenEvaluatedRecentlyAsync(int ruleId, int jobId, int windowMinutes, CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-windowMinutes);
        return await _db.AutomationExecutionLogs
            .AnyAsync(l => l.RuleId == ruleId && l.JobId == jobId && l.ConditionsMet && l.EvaluatedAt >= cutoff, ct);
    }

    public async Task<List<AutomationExecutionLog>> GetLogsAsync(
        int? ruleId, int? jobId, DateTime? from, DateTime? to,
        string? triggerType, bool? conditionsMet, int skip, int take, CancellationToken ct = default)
    {
        var query = _db.AutomationExecutionLogs
            .Include(l => l.ActionDetails)
            .AsQueryable();

        if (ruleId.HasValue) query = query.Where(l => l.RuleId == ruleId.Value);
        if (jobId.HasValue) query = query.Where(l => l.JobId == jobId.Value);
        if (from.HasValue) query = query.Where(l => l.EvaluatedAt >= from.Value);
        if (to.HasValue) query = query.Where(l => l.EvaluatedAt <= to.Value);
        if (!string.IsNullOrEmpty(triggerType)) query = query.Where(l => l.TriggerType == triggerType);
        if (conditionsMet.HasValue) query = query.Where(l => l.ConditionsMet == conditionsMet.Value);

        return await query
            .OrderByDescending(l => l.EvaluatedAt)
            .Skip(skip).Take(take)
            .AsNoTracking()
            .ToListAsync(ct);
    }

    public async Task<AutomationExecutionLog?> GetLogByIdAsync(long id, CancellationToken ct = default) =>
        await _db.AutomationExecutionLogs
            .Include(l => l.ActionDetails)
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == id, ct);
}
