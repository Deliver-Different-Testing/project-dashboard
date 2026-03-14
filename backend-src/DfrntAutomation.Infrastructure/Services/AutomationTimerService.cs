using DfrntAutomation.Core.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// BackgroundService that evaluates time-based automation rules on a configurable interval.
/// Default: every 5 minutes.
/// </summary>
public class AutomationTimerService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AutomationTimerService> _logger;

    public AutomationTimerService(IServiceScopeFactory scopeFactory, ILogger<AutomationTimerService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutomationTimerService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var configService = scope.ServiceProvider.GetRequiredService<IAppConfigService>();
                var intervalMinutes = await configService.GetIntAsync("Automation.TimeBased.IntervalMinutes", 5, stoppingToken);

                var engineService = scope.ServiceProvider.GetRequiredService<IAutomationEngineService>();

                var enabled = await configService.GetBoolAsync("Automation.DotNetEngine.Enabled", true, stoppingToken);
                if (enabled)
                {
                    _logger.LogDebug("Running time-based rule evaluation");
                    await engineService.EvaluateTimeBasedRulesAsync(stoppingToken);
                }

                await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AutomationTimerService loop");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        _logger.LogInformation("AutomationTimerService stopped");
    }
}
