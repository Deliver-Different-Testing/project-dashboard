namespace DfrntAutomation.Core.Entities;

/// <summary>
/// Feature flag / configuration entry. Maps to the AppConfig table.
/// </summary>
public class AppConfig
{
    public int AppConfigId { get; set; }
    public string ConfigKey { get; set; } = string.Empty;
    public string? ConfigValue { get; set; }
    public string ConfigType { get; set; } = "string";
    public string? Category { get; set; }
    public string? Description { get; set; }
    public bool Active { get; set; } = true;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime? LastModified { get; set; }
}
