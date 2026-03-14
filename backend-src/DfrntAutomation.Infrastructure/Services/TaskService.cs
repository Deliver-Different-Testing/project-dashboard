using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// Creates and completes tasks by inserting/updating rows in tucEvent
/// with task-type EventTypeIds from tucEventType.
/// In the TMS, tasks ARE events — just with a different EventTypeId.
/// </summary>
public class TaskService : ITaskService
{
    private readonly AutomationDbContext _db;
    private readonly ILogger<TaskService> _logger;

    public TaskService(AutomationDbContext db, ILogger<TaskService> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Creates a task by inserting into tucEvent with the task-type EventTypeId.
    /// Prevents duplicates: won't create if an open (non-completed) event of the
    /// same type already exists for this job.
    /// </summary>
    public async Task CreateTaskAsync(int jobId, int taskTemplateId, int? assigneeId, int? assigneeGroupId, int? dueOffsetMinutes, CancellationToken ct = default)
    {
        // taskTemplateId maps to EventTypeId in tucEventType
        var dueDate = dueOffsetMinutes.HasValue
            ? $"DATEADD(MINUTE, {dueOffsetMinutes.Value}, GETUTCDATE())"
            : "NULL";

        var sql = $@"
            IF NOT EXISTS (
                SELECT 1 FROM tucEvent
                WHERE JobId = @p0
                  AND EventTypeId = @p1
                  AND CompletedDate IS NULL
            )
            BEGIN
                INSERT INTO tucEvent (JobId, EventTypeId, AssigneeId, AssigneeGroupId, DueDate, Notes, CreatedDate, CreatedBy)
                VALUES (
                    @p0,
                    @p1,
                    {(assigneeId.HasValue ? assigneeId.Value.ToString() : "NULL")},
                    {(assigneeGroupId.HasValue ? assigneeGroupId.Value.ToString() : "NULL")},
                    {dueDate},
                    'Created by Automation Engine',
                    GETUTCDATE(),
                    0
                )
            END";

        await _db.Database.ExecuteSqlRawAsync(sql, new object[] { jobId, taskTemplateId }, ct);
        _logger.LogInformation("Task event created for job {JobId} eventTypeId {EventTypeId}", jobId, taskTemplateId);
    }

    /// <summary>
    /// Completes a task by setting CompletedDate on the matching tucEvent row.
    /// </summary>
    public async Task CompleteTaskAsync(int jobId, int taskTemplateId, CancellationToken ct = default)
    {
        var sql = @"
            UPDATE tucEvent
            SET CompletedDate = GETUTCDATE()
            WHERE JobId = @p0
              AND EventTypeId = @p1
              AND CompletedDate IS NULL";

        var rows = await _db.Database.ExecuteSqlRawAsync(sql, new object[] { jobId, taskTemplateId }, ct);
        _logger.LogInformation("Task completed for job {JobId} eventTypeId {EventTypeId} ({Rows} rows)", jobId, taskTemplateId, rows);
    }
}
