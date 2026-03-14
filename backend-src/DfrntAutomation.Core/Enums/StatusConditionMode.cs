namespace DfrntAutomation.Core.Enums;

/// <summary>
/// Sub-modes for the Status condition type.
/// </summary>
public enum StatusConditionMode
{
    /// <summary>Any status change triggers the condition.</summary>
    AnyChange,

    /// <summary>Status changes TO a specific value.</summary>
    ChangesTo,

    /// <summary>Status changes FROM (leaves) a specific value.</summary>
    Leaves,

    /// <summary>Current status is NOT a specific value.</summary>
    IsNot
}
