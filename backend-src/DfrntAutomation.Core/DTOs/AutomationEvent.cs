namespace DfrntAutomation.Core.DTOs;

/// <summary>
/// Trigger event model passed to the automation engine for evaluation.
/// </summary>
public class AutomationEvent
{
    /// <summary>What triggered this event.</summary>
    public string TriggerType { get; set; } = string.Empty;

    /// <summary>The job ID involved, if any.</summary>
    public int? JobId { get; set; }

    /// <summary>Customer ID from the job.</summary>
    public int? CustomerId { get; set; }

    /// <summary>Speed/service level ID from the job.</summary>
    public int? SpeedId { get; set; }

    /// <summary>New status ID (for status change triggers).</summary>
    public int? NewStatusId { get; set; }

    /// <summary>Previous status ID (for status change triggers).</summary>
    public int? OldStatusId { get; set; }

    /// <summary>Scan type (for scan event triggers).</summary>
    public string? ScanType { get; set; }

    /// <summary>Additional detail about the trigger.</summary>
    public string? TriggerDetail { get; set; }

    // ── Filter fields (populated from tucJob when event is raised) ──

    /// <summary>Priority/speed ID from the job (maps to tucJob.ucjbSpeedID).</summary>
    public int? PriorityId { get; set; }

    /// <summary>Origin site ID (maps to tucJob.ucjbFromSiteID → tucSite).</summary>
    public int? FromSiteId { get; set; }

    /// <summary>Destination site ID (maps to tucJob.ucjbToSiteID → tucSite).</summary>
    public int? ToSiteId { get; set; }

    /// <summary>Origin region ID (maps to tucSite.SiteRegionID → tucRegion).</summary>
    public int? FromRegionId { get; set; }

    /// <summary>Destination region ID (maps to tucSite.SiteRegionID → tucRegion).</summary>
    public int? ToRegionId { get; set; }

    /// <summary>Job type (e.g. "Standard", "Pickup", "Delivery"). For JobTypeFilter matching.</summary>
    public string? JobType { get; set; }

    /// <summary>Minutes the job has been in its current state (for TimeThreshold filtering).</summary>
    public int? MinutesInState { get; set; }
}
