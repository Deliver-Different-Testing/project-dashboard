namespace DfrntAutomation.Core.Enums;

/// <summary>
/// Types of actions the automation engine can execute.
/// </summary>
public enum ActionType
{
    /// <summary>Change job to a specific status.</summary>
    UpdateJobStatus,

    /// <summary>Create a task from a template with optional assignee and due offset.</summary>
    CreateTask,

    /// <summary>Mark a specific task template as complete.</summary>
    CompleteTask,

    /// <summary>Fire a notification template.</summary>
    TriggerNotification,

    /// <summary>Send SMS to customer_contact/driver/fixed_number with placeholder support.</summary>
    SendSms,

    /// <summary>Conditional from→to status change.</summary>
    ChangeStatus
}
