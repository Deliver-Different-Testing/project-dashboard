using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DfrntAutomation.Infrastructure.Data;

/// <summary>
/// Design-time factory for EF Core migrations tooling.
/// </summary>
public class AutomationDbContextFactory : IDesignTimeDbContextFactory<AutomationDbContext>
{
    public AutomationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AutomationDbContext>();
        optionsBuilder.UseSqlServer("Server=localhost;Database=TMS;Trusted_Connection=True;TrustServerCertificate=True;");
        return new AutomationDbContext(optionsBuilder.Options);
    }
}
