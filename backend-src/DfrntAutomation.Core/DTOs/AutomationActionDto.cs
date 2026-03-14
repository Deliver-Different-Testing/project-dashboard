namespace DfrntAutomation.Core.DTOs;

public class AutomationActionDto
{
    public int? Id { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int? ToStatusId { get; set; }
    public int? FromStatusId { get; set; }
    public int? TaskTemplateId { get; set; }
    public int? TaskAssigneeId { get; set; }
    public int? TaskAssigneeGroupId { get; set; }
    public int? TaskDueOffsetMinutes { get; set; }
    public int? NotificationTemplateId { get; set; }
    public string? SmsRecipientType { get; set; }
    public string? SmsFixedNumber { get; set; }
    public string? SmsMessageContent { get; set; }
}
