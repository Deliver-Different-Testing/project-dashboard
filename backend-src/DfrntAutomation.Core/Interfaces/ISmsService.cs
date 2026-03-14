namespace DfrntAutomation.Core.Interfaces;

public interface ISmsService
{
    Task SendSmsAsync(string phoneNumber, string message, CancellationToken ct = default);
}
