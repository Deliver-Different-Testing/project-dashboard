using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// SMS sending using the existing TMS infrastructure.
/// Inserts into tucManualMessage (the existing SMS/messaging queue table)
/// rather than calling an external API directly — lets the existing
/// TMS SMS processor handle delivery.
/// </summary>
public class SmsService : ISmsService
{
    private readonly AutomationDbContext _db;
    private readonly ILogger<SmsService> _logger;

    public SmsService(AutomationDbContext db, ILogger<SmsService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SendSmsAsync(string phoneNumber, string message, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            _logger.LogWarning("Cannot send SMS: phone number is empty");
            return;
        }

        // Insert into tucManualMessage — the existing SMS queue table.
        // The TMS SMS processor picks these up and sends via the configured provider.
        await _db.Database.ExecuteSqlRawAsync(
            @"INSERT INTO tucManualMessage (RecipientNumber, MessageContent, MessageType, StatusId, CreatedDate, CreatedBy)
              VALUES (@p0, @p1, 'SMS', 1, GETUTCDATE(), 0)",
            new object[] { phoneNumber, message },
            ct);

        _logger.LogInformation("SMS queued to {Phone} via tucManualMessage", phoneNumber);
    }
}
