namespace DfrntAutomation.Core.Interfaces;

public interface IMailtrapEmailService
{
    Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, string category = "automation", CancellationToken ct = default);
}
