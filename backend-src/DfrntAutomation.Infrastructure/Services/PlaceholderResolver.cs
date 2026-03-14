using DfrntAutomation.Core.Interfaces;
using DfrntAutomation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DfrntAutomation.Infrastructure.Services;

/// <summary>
/// C# port of UTL_fncJob_PlaceholderData stored procedure.
/// Resolves placeholders in email/SMS templates using job data.
/// </summary>
public class PlaceholderResolver : IPlaceholderResolver
{
    private readonly AutomationDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<PlaceholderResolver> _logger;

    public PlaceholderResolver(AutomationDbContext db, IConfiguration config, ILogger<PlaceholderResolver> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<string> ResolveAsync(string template, int jobId, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(template) || !template.Contains('{'))
            return template;

        var values = await GetPlaceholderValuesAsync(jobId, ct);
        var result = template;

        foreach (var kvp in values)
        {
            result = result.Replace($"{{{kvp.Key}}}", kvp.Value ?? string.Empty, StringComparison.OrdinalIgnoreCase);
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<Dictionary<string, string>> GetPlaceholderValuesAsync(int jobId, CancellationToken ct = default)
    {
        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        var sql = @"
            SELECT
                j.JobNumber,
                cust.CustomerName AS ClientName,
                cust.ShortName AS ClientShortName,
                -- Pickup
                pa.Address1 AS PickupAddress,
                pa.Suburb AS PickupSuburb,
                pa.City AS PickupCity,
                -- Delivery
                da.Address1 AS DeliveryAddress,
                da.Suburb AS DeliverySuburb,
                da.City AS DeliveryCity,
                -- Courier
                cr.CourierCode,
                cr.CourierName,
                cr.CourierMobile,
                -- Contact
                co.FirstName AS ContactFirstName,
                co.LastName AS ContactLastName,
                co.Email AS ContactEmail,
                co.Phone AS ContactPhone,
                -- Speed/Service
                sp.SpeedName,
                st.ServiceTypeName AS ServiceType,
                -- Times
                j.ScheduledPickupTime,
                j.ScheduledDeliveryTime,
                -- Status
                s.StatusName,
                j.CreatedDate,
                j.Reference1,
                j.Reference2
            FROM tucJob j
            LEFT JOIN tucCustomer cust ON j.CustomerId = cust.CustomerId
            LEFT JOIN tucAddress pa ON j.PickupAddressId = pa.AddressId
            LEFT JOIN tucAddress da ON j.DeliveryAddressId = da.AddressId
            LEFT JOIN tucCourier cr ON j.CourierId = cr.CourierId
            LEFT JOIN tucContact co ON j.ContactId = co.ContactId
            LEFT JOIN tucSpeed sp ON j.SpeedId = sp.SpeedId
            LEFT JOIN tucServiceType st ON j.ServiceTypeId = st.ServiceTypeId
            LEFT JOIN tucStatus s ON j.StatusId = s.StatusId
            WHERE j.JobId = @p0";

        try
        {
            await using var command = _db.Database.GetDbConnection().CreateCommand();
            command.CommandText = sql;
            var param = command.CreateParameter();
            param.ParameterName = "@p0";
            param.Value = jobId;
            command.Parameters.Add(param);

            await _db.Database.OpenConnectionAsync(ct);
            await using var reader = await command.ExecuteReaderAsync(ct);

            if (await reader.ReadAsync(ct))
            {
                for (var i = 0; i < reader.FieldCount; i++)
                {
                    var name = reader.GetName(i);
                    var value = reader.IsDBNull(i) ? string.Empty : reader.GetValue(i)?.ToString() ?? string.Empty;
                    values[name] = value;
                }
            }

            // Add portal link
            var portalBaseUrl = _config.GetValue<string>("AgentPortalBaseUrl") ?? "https://portal.dfrnt.com";
            values["PortalLink"] = $"{portalBaseUrl}/jobs/{jobId}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resolve placeholders for job {JobId}", jobId);
        }
        finally
        {
            await _db.Database.CloseConnectionAsync();
        }

        return values;
    }
}
