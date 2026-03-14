using System.Security.Claims;

namespace DfrntAutomation.Api.Middleware;

/// <summary>
/// Extracts tenant context from the JWT token and makes it available via HttpContext.Items.
/// </summary>
public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantId = context.User.FindFirstValue("tenant_id");
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!string.IsNullOrEmpty(tenantId))
                context.Items["TenantId"] = tenantId;

            if (!string.IsNullOrEmpty(userId))
                context.Items["UserId"] = userId;

            _logger.LogDebug("Tenant: {TenantId}, User: {UserId}", tenantId, userId);
        }

        await _next(context);
    }
}
