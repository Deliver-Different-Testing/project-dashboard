using DfrntAutomation.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DfrntAutomation.Infrastructure.Data;

/// <summary>
/// EF Core DbContext for automation engine entities.
/// Maps to existing TMS tables where applicable.
/// </summary>
public class AutomationDbContext : DbContext
{
    public AutomationDbContext(DbContextOptions<AutomationDbContext> options) : base(options) { }

    public DbSet<AutomationRule> AutomationRules => Set<AutomationRule>();
    public DbSet<AutomationCondition> AutomationConditions => Set<AutomationCondition>();
    public DbSet<AutomationAction> AutomationActions => Set<AutomationAction>();
    public DbSet<AutomationExecutionLog> AutomationExecutionLogs => Set<AutomationExecutionLog>();
    public DbSet<ActionExecutionDetail> ActionExecutionDetails => Set<ActionExecutionDetail>();
    public DbSet<AppConfig> AppConfigs => Set<AppConfig>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // AutomationRule → maps to existing tucAutomationRule
        modelBuilder.Entity<AutomationRule>(e =>
        {
            e.ToTable("tucAutomationRule");
            e.HasKey(r => r.Id);
            e.Property(r => r.Name).HasMaxLength(200).IsRequired();
            e.Property(r => r.Description).HasMaxLength(1000);
            e.Property(r => r.ConditionMatchMode)
                .HasConversion<string>()
                .HasMaxLength(5)
                .HasDefaultValue(Core.Enums.ConditionMatchMode.All);
            e.Property(r => r.CustomerIds).HasMaxLength(2000);
            e.Property(r => r.SpeedIds).HasMaxLength(2000);
            e.HasQueryFilter(r => !r.IsDeleted);
        });

        // AutomationCondition
        modelBuilder.Entity<AutomationCondition>(e =>
        {
            e.ToTable("AutomationCondition");
            e.HasKey(c => c.Id);
            e.Property(c => c.ConditionType).HasConversion<string>().HasMaxLength(50);
            e.Property(c => c.JobTypeFilter).HasConversion<string>().HasMaxLength(20).HasDefaultValue(Core.Enums.JobTypeFilter.All);
            e.Property(c => c.StatusConditionMode).HasConversion<string>().HasMaxLength(20);
            e.Property(c => c.ScheduledTimeField).HasConversion<string>().HasMaxLength(10);
            e.Property(c => c.OffsetUnit).HasMaxLength(10);
            e.Property(c => c.ScanTypes).HasMaxLength(500);
            e.Property(c => c.PriorityFilter).HasMaxLength(50).HasDefaultValue("ALL");
            e.Property(c => c.FromSiteFilter).HasMaxLength(2000);
            e.Property(c => c.ToSiteFilter).HasMaxLength(2000);
            e.Property(c => c.FromRegionFilter).HasMaxLength(2000);
            e.Property(c => c.ToRegionFilter).HasMaxLength(2000);
            e.Property(c => c.TimeThreshold);
            e.HasOne(c => c.Rule).WithMany(r => r.Conditions).HasForeignKey(c => c.RuleId).OnDelete(DeleteBehavior.Cascade);
        });

        // AutomationAction
        modelBuilder.Entity<AutomationAction>(e =>
        {
            e.ToTable("AutomationAction");
            e.HasKey(a => a.Id);
            e.Property(a => a.ActionType).HasConversion<string>().HasMaxLength(50);
            e.Property(a => a.SmsRecipientType).HasConversion<string>().HasMaxLength(20);
            e.Property(a => a.SmsFixedNumber).HasMaxLength(20);
            e.Property(a => a.SmsMessageContent).HasMaxLength(2000);
            e.HasOne(a => a.Rule).WithMany(r => r.Actions).HasForeignKey(a => a.RuleId).OnDelete(DeleteBehavior.Cascade);
        });

        // AutomationExecutionLog (new table)
        modelBuilder.Entity<AutomationExecutionLog>(e =>
        {
            e.ToTable("AutomationExecutionLog");
            e.HasKey(l => l.Id);
            e.Property(l => l.RuleName).HasMaxLength(200);
            e.Property(l => l.TriggerType).HasMaxLength(50);
            e.Property(l => l.TriggerDetail).HasMaxLength(500);
            e.HasIndex(l => new { l.RuleId, l.EvaluatedAt });
            e.HasIndex(l => new { l.JobId, l.EvaluatedAt });
            e.HasIndex(l => l.EvaluatedAt);
        });

        // ActionExecutionDetail (new table)
        modelBuilder.Entity<ActionExecutionDetail>(e =>
        {
            e.ToTable("ActionExecutionDetail");
            e.HasKey(d => d.Id);
            e.Property(d => d.ActionType).HasMaxLength(50);
            e.HasOne(d => d.ExecutionLog).WithMany(l => l.ActionDetails).HasForeignKey(d => d.ExecutionLogId).OnDelete(DeleteBehavior.Cascade);
        });

        // AppConfig (new table)
        modelBuilder.Entity<AppConfig>(e =>
        {
            e.ToTable("AppConfig");
            e.HasKey(c => c.AppConfigId);
            e.Property(c => c.ConfigKey).HasMaxLength(100).IsRequired();
            e.HasIndex(c => c.ConfigKey).IsUnique();
            e.Property(c => c.ConfigValue).HasMaxLength(500);
            e.Property(c => c.ConfigType).HasMaxLength(20);
            e.Property(c => c.Category).HasMaxLength(50);
            e.Property(c => c.Description).HasMaxLength(255);
        });
    }
}
