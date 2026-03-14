namespace DfrntAutomation.Core.Interfaces;

/// <summary>
/// Resolves placeholders like {JobNumber}, {ClientName} etc. in templates.
/// C# port of UTL_fncJob_PlaceholderData.
/// </summary>
public interface IPlaceholderResolver
{
    Task<string> ResolveAsync(string template, int jobId, CancellationToken ct = default);
    Task<Dictionary<string, string>> GetPlaceholderValuesAsync(int jobId, CancellationToken ct = default);
}
