namespace DfrntAutomation.Core.Enums;

/// <summary>
/// Types of barcode scan events.
/// </summary>
public enum ScanType
{
    Sort,
    Run,
    Transit,
    Inwards,
    Pickup,
    Transfer,
    Delivery,
    Collection,
    ReturnToSender
}
