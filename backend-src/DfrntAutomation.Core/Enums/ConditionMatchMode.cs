namespace DfrntAutomation.Core.Enums;

/// <summary>
/// How multiple conditions on a rule are evaluated.
/// </summary>
public enum ConditionMatchMode
{
    /// <summary>ALL conditions must be true (AND logic).</summary>
    All,

    /// <summary>ANY condition can be true (OR logic).</summary>
    Any
}
