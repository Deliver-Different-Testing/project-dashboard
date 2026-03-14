using DfrntAutomation.Core.Entities;
using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// Feature flag and configuration management via the AppConfig table.
/// </summary>
public class AppConfigService : IAppConfigService
{
    private readonly AutomationDbContext _db;
    private readonly ILogger<AppConfigService> _logger;

    public AppConfigService(AutomationDbContext db, ILogger<AppConfigService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<AppConfig>> GetAllAsync(CancellationToken ct = default) =>
        await _db.AppConfigs.Where(c => c.Active).OrderBy(c => c.Category).ThenBy(c => c.ConfigKey).ToListAsync(ct);

    public async Task<AppConfig?> GetByKeyAsync(string key, CancellationToken ct = default) =>
        await _db.AppConfigs.FirstOrDefaultAsync(c => c.ConfigKey == key, ct);

    public async Task<string?> GetValueAsync(string key, CancellationToken ct = default)
    {
        var config = await GetByKeyAsync(key, ct);
        return config?.ConfigValue;
    }

    public async Task<bool> GetBoolAsync(string key, bool defaultValue = false, CancellationToken ct = default)
    {
        var value = await GetValueAsync(key, ct);
        return value is not null ? bool.TryParse(value, out var result) && result : defaultValue;
    }

    public async Task<int> GetIntAsync(string key, int defaultValue = 0, CancellationToken ct = default)
    {
        var value = await GetValueAsync(key, ct);
        return value is not null && int.TryParse(value, out var result) ? result : defaultValue;
    }

    public async Task UpdateAsync(string key, string value, CancellationToken ct = default)
    {
        var config = await GetByKeyAsync(key, ct);
        if (config is null)
        {
            _logger.LogWarning("Config key {Key} not found", key);
            return;
        }
        config.ConfigValue = value;
        config.LastModified = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Config {Key} updated to {Value}", key, value);
    }

    public async Task<List<AppConfig>> GetMobileConfigAsync(CancellationToken ct = default) =>
        await _db.AppConfigs
            .Where(c => c.Active && c.Category == "Mobile")
            .OrderBy(c => c.ConfigKey)
            .ToListAsync(ct);
}
