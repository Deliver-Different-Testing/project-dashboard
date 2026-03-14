using System.Net.Http.Json;
using DfrntAutomation.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// Sends emails via the Mailtrap REST API (send/2863151 endpoint).
/// </summary>
public class MailtrapEmailService : IMailtrapEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<MailtrapEmailService> _logger;

    public MailtrapEmailService(HttpClient httpClient, IConfiguration config, ILogger<MailtrapEmailService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody, string category = "automation", CancellationToken ct = default)
    {
        var baseUrl = _config["MailTrapApiBaseUrl"] ?? "https://send.api.mailtrap.io/api";
        var token = _config["MailTrapApiToken"];

        if (string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("MailTrap API token not configured, skipping email send");
            return;
        }

        var payload = new
        {
            from = new { email = "automation@dfrnt.com", name = "DFRNT Automation" },
            to = new[] { new { email = toEmail, name = toName } },
            subject,
            html = htmlBody,
            category
        };

        var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/send/2863151")
        {
            Content = JsonContent.Create(payload)
        };
        request.Headers.Add("Api-Token", token);

        var response = await _httpClient.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("Mailtrap API error {StatusCode}: {Body}", response.StatusCode, body);
            throw new HttpRequestException($"Mailtrap API returned {response.StatusCode}");
        }

        _logger.LogInformation("Email sent to {Email} subject '{Subject}'", toEmail, subject);
    }
}
