namespace DfrntAutomation.Core.Interfaces;

/// <summary>
/// Creates events in the tucEvent table.
/// </summary>
public interface IEventService
{
    Task CreateEventAsync(int jobId, int eventTemplateId, string? detail = null, CancellationToken ct = default);
}
