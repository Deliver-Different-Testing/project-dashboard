namespace DfrntAutomation.Core.Enums;

/// <summary>
/// Types of conditions that can be evaluated by the automation engine.
/// </summary>
public enum ConditionType
{
    /// <summary>Job has no courier assigned (+ optional time offset).</summary>
    JobUnassigned,

    /// <summary>Job is assigned but not yet picked up (+ optional time offset).</summary>
    JobAssigned,

    /// <summary>N minutes before a scheduled time (pickup/delivery/flight).</summary>
    BeforeScheduledTime,

    /// <summary>N minutes after a scheduled time (pickup/delivery/flight).</summary>
    AfterScheduledTime,

    /// <summary>At the exact scheduled time.</summary>
    AtScheduledTime,

    /// <summary>Status change conditions (any_change, changes_to, leaves, is_not).</summary>
    Status,

    /// <summary>Barcode scan event (sort, run, transit, inwards, pickup, transfer, etc.).</summary>
    Scan
}
