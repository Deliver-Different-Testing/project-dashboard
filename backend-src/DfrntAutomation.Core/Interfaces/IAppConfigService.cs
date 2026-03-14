using DfrntAutomation.Core.Entities;

namespace DfrntAutomation.Core.Interfaces;

public interface IAppConfigService
{
    Task<List<AppConfig>> GetAllAsync(CancellationToken ct = default);
    Task<AppConfig?> GetByKeyAsync(string key, CancellationToken ct = default);
    Task<string?> GetValueAsync(string key, CancellationToken ct = default);
    Task<bool> GetBoolAsync(string key, bool defaultValue = false, CancellationToken ct = default);
    Task<int> GetIntAsync(string key, int defaultValue = 0, CancellationToken ct = default);
    Task UpdateAsync(string key, string value, CancellationToken ct = default);
    Task<List<AppConfig>> GetMobileConfigAsync(CancellationToken ct = default);
}
