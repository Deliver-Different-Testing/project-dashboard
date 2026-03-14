namespace DfrntAutomation.Core.Interfaces;

public interface ITaskService
{
    Task CreateTaskAsync(int jobId, int taskTemplateId, int? assigneeId, int? assigneeGroupId, int? dueOffsetMinutes, CancellationToken ct = default);
    Task CompleteTaskAsync(int jobId, int taskTemplateId, CancellationToken ct = default);
}
