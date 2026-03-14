using DfrntAutomation.Core.Enums;

namespace DfrntAutomation.Core.Entities;

/// <summary>
/// An action to execute when rule conditions are met. Maps to the AutomationAction table.
/// </summary>
public class AutomationAction
{
    public int Id { get; set; }
    public int RuleId { get; set; }
    public ActionType ActionType { get; set; }
    public int SortOrder { get; set; }

    // UpdateJobStatus / ChangeStatus fields
    public int? ToStatusId { get; set; }
    public int? FromStatusId { get; set; }

    // CreateTask / CompleteTask fields
    public int? TaskTemplateId { get; set; }
    public int? TaskAssigneeId { get; set; }
    public int? TaskAssigneeGroupId { get; set; }
    public int? TaskDueOffsetMinutes { get; set; }

    // TriggerNotification fields
    public int? NotificationTemplateId { get; set; }

    // SendSms fields
    public SmsRecipientType? SmsRecipientType { get; set; }
    public string? SmsFixedNumber { get; set; }
    public string? SmsMessageContent { get; set; }

    // Navigation
    public AutomationRule Rule { get; set; } = null!;
}
