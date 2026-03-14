using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// 4-priority resolution chain for event templates:
/// 1. Client + ServiceType match
/// 2. Client only match
/// 3. ServiceType only match
/// 4. Default (both NULL)
/// </summary>
public class WorkflowResolutionService
{
    private readonly AutomationDbContext _db;
    private readonly ILogger<WorkflowResolutionService> _logger;

    public WorkflowResolutionService(AutomationDbContext db, ILogger<WorkflowResolutionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Resolve the best-matching event template ID for a given customer and service type.
    /// </summary>
    public async Task<int?> ResolveTemplateAsync(int? customerId, int? serviceTypeId, string eventType, CancellationToken ct = default)
    {
        var sql = @"
            SELECT TOP 1 EventTemplateId
            FROM tucEventTemplate
            WHERE EventType = {0}
              AND Active = 1
            ORDER BY
                CASE
                    WHEN CustomerId = {1} AND ServiceTypeId = {2} THEN 1
                    WHEN CustomerId = {1} AND ServiceTypeId IS NULL THEN 2
                    WHEN CustomerId IS NULL AND ServiceTypeId = {2} THEN 3
                    WHEN CustomerId IS NULL AND ServiceTypeId IS NULL THEN 4
                    ELSE 5
                END";

        var result = await _db.Database.SqlQueryRaw<int?>(sql,
            eventType,
            customerId ?? (object)DBNull.Value,
            serviceTypeId ?? (object)DBNull.Value
        ).FirstOrDefaultAsync(ct);

        _logger.LogDebug("Resolved template for customer {CustomerId} serviceType {ServiceTypeId} eventType {EventType}: {TemplateId}",
            customerId, serviceTypeId, eventType, result);

        return result;
    }

    /// <summary>
    /// Get all templates matching the resolution chain (for preview/debugging).
    /// </summary>
    public async Task<List<TemplateResolutionResult>> GetResolutionChainAsync(int? customerId, int? serviceTypeId, string eventType, CancellationToken ct = default)
    {
        var sql = @"
            SELECT EventTemplateId, TemplateName, CustomerId, ServiceTypeId,
                CASE
                    WHEN CustomerId = {1} AND ServiceTypeId = {2} THEN 1
                    WHEN CustomerId = {1} AND ServiceTypeId IS NULL THEN 2
                    WHEN CustomerId IS NULL AND ServiceTypeId = {2} THEN 3
                    WHEN CustomerId IS NULL AND ServiceTypeId IS NULL THEN 4
                    ELSE 5
                END AS Priority
            FROM tucEventTemplate
            WHERE EventType = {0} AND Active = 1
            ORDER BY Priority";

        var results = await _db.Database.SqlQueryRaw<TemplateResolutionResult>(sql,
            eventType,
            customerId ?? (object)DBNull.Value,
            serviceTypeId ?? (object)DBNull.Value
        ).ToListAsync(ct);

        return results;
    }
}

public class TemplateResolutionResult
{
    public int EventTemplateId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public int? CustomerId { get; set; }
    public int? ServiceTypeId { get; set; }
    public int Priority { get; set; }
}
