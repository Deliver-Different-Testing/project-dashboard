using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// Creates events/notifications in tucEvent.
/// In the TMS, events, tasks, and notifications are ALL tucEvent rows —
/// distinguished by their EventTypeId from tucEventType.
/// </summary>
public class EventService : IEventService
{
    private readonly AutomationDbContext _db;
    private readonly ILogger<EventService> _logger;

    public EventService(AutomationDbContext db, ILogger<EventService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Insert a new event row into tucEvent with the given EventTypeId.
    /// </summary>
    public async Task CreateEventAsync(int jobId, int eventTemplateId, string? detail = null, CancellationToken ct = default)
    {
        // eventTemplateId maps to EventTypeId in tucEventType
        await _db.Database.ExecuteSqlRawAsync(
            @"INSERT INTO tucEvent (JobId, EventTypeId, Notes, CreatedDate, CreatedBy)
              VALUES (@p0, @p1, @p2, GETUTCDATE(), 0)",
            new object[] { jobId, eventTemplateId, detail ?? (object)DBNull.Value },
            ct);

        _logger.LogInformation("Event created for job {JobId} eventTypeId {EventTypeId}", jobId, eventTemplateId);
    }
}
