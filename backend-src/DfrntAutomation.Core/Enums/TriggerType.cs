namespace DfrntAutomation.Core.Enums;

/// <summary>
/// What triggered the automation engine evaluation.
/// </summary>
public enum TriggerType
{
    StatusChange,
    ScanEvent,
    SupportEvent,
    ManualTrigger,
    TimeBased
}
