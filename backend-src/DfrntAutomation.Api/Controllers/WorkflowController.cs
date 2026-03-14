using DfrntAutomation.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DfrntAutomation.Api.Controllers;

/// <summary>
/// Workflow template resolution endpoints.
/// </summary>
[ApiController]
[Route("api/workflows")]
[Authorize]
public class WorkflowController : ControllerBase
{
    private readonly WorkflowResolutionService _workflowService;

    public WorkflowController(WorkflowResolutionService workflowService)
    {
        _workflowService = workflowService;
    }

    /// <summary>Resolve the best-matching event template for a customer + service type.</summary>
    [HttpGet("resolve")]
    public async Task<IActionResult> Resolve(
        [FromQuery] int? customerId, [FromQuery] int? serviceTypeId,
        [FromQuery] string eventType, CancellationToken ct)
    {
        var templateId = await _workflowService.ResolveTemplateAsync(customerId, serviceTypeId, eventType, ct);
        if (templateId is null) return NotFound("No matching template found");
        return Ok(new { EventTemplateId = templateId });
    }

    /// <summary>Get the full resolution chain for debugging.</summary>
    [HttpGet("resolve/chain")]
    public async Task<IActionResult> GetResolutionChain(
        [FromQuery] int? customerId, [FromQuery] int? serviceTypeId,
        [FromQuery] string eventType, CancellationToken ct)
    {
        var chain = await _workflowService.GetResolutionChainAsync(customerId, serviceTypeId, eventType, ct);
        return Ok(chain);
    }
}
