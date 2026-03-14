using DfrntAutomation.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DfrntAutomation.Api.Controllers;

/// <summary>
/// Feature flag management API.
/// </summary>
[ApiController]
[Authorize]
public class AppConfigController : ControllerBase
{
    private readonly IAppConfigService _configService;

    public AppConfigController(IAppConfigService configService)
    {
        _configService = configService;
    }

    /// <summary>Get all feature flags.</summary>
    [HttpGet("api/config")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var configs = await _configService.GetAllAsync(ct);
        return Ok(configs);
    }

    /// <summary>Get a single flag by key.</summary>
    [HttpGet("api/config/{key}")]
    public async Task<IActionResult> GetByKey(string key, CancellationToken ct)
    {
        var config = await _configService.GetByKeyAsync(key, ct);
        if (config is null) return NotFound();
        return Ok(config);
    }

    /// <summary>Update a flag value.</summary>
    [HttpPut("api/config/{key}")]
    public async Task<IActionResult> Update(string key, [FromBody] UpdateConfigRequest request, CancellationToken ct)
    {
        await _configService.UpdateAsync(key, request.Value, ct);
        return Ok();
    }

    /// <summary>Get mobile-specific config (for MAUI app).</summary>
    [HttpGet("api/mobile/config")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMobileConfig(CancellationToken ct)
    {
        var configs = await _configService.GetMobileConfigAsync(ct);
        return Ok(configs.ToDictionary(c => c.ConfigKey, c => c.ConfigValue));
    }
}

public class UpdateConfigRequest
{
    public string Value { get; set; } = string.Empty;
}
