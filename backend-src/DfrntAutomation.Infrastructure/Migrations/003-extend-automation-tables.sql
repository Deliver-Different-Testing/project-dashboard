-- 003: Extend automation tables with new columns (idempotent)

-- tucAutomationRule: ConditionMatchMode
IF COL_LENGTH('tucAutomationRule', 'ConditionMatchMode') IS NULL
    ALTER TABLE [dbo].[tucAutomationRule] ADD [ConditionMatchMode] NVARCHAR(5) NOT NULL DEFAULT 'all';
GO

-- AutomationCondition: JobTypeFilter
IF COL_LENGTH('AutomationCondition', 'JobTypeFilter') IS NULL
    ALTER TABLE [dbo].[AutomationCondition] ADD [JobTypeFilter] NVARCHAR(20) NOT NULL DEFAULT 'all';
GO

-- AutomationCondition: ScheduledTimeField
IF COL_LENGTH('AutomationCondition', 'ScheduledTimeField') IS NULL
    ALTER TABLE [dbo].[AutomationCondition] ADD [ScheduledTimeField] NVARCHAR(10) NULL;
GO

-- AutomationCondition: OffsetValue, OffsetUnit
IF COL_LENGTH('AutomationCondition', 'OffsetValue') IS NULL
    ALTER TABLE [dbo].[AutomationCondition] ADD [OffsetValue] INT NULL;
GO
IF COL_LENGTH('AutomationCondition', 'OffsetUnit') IS NULL
    ALTER TABLE [dbo].[AutomationCondition] ADD [OffsetUnit] NVARCHAR(10) NULL;
GO

-- AutomationCondition: StatusConditionMode
IF COL_LENGTH('AutomationCondition', 'StatusConditionMode') IS NULL
    ALTER TABLE [dbo].[AutomationCondition] ADD [StatusConditionMode] NVARCHAR(20) NULL;
GO

-- AutomationCondition: ScanTypes
IF COL_LENGTH('AutomationCondition', 'ScanTypes') IS NULL
    ALTER TABLE [dbo].[AutomationCondition] ADD [ScanTypes] NVARCHAR(500) NULL;
GO

-- AutomationAction: SmsRecipientType, SmsFixedNumber, SmsMessageContent
IF COL_LENGTH('AutomationAction', 'SmsRecipientType') IS NULL
    ALTER TABLE [dbo].[AutomationAction] ADD [SmsRecipientType] NVARCHAR(20) NULL;
GO
IF COL_LENGTH('AutomationAction', 'SmsFixedNumber') IS NULL
    ALTER TABLE [dbo].[AutomationAction] ADD [SmsFixedNumber] NVARCHAR(20) NULL;
GO
IF COL_LENGTH('AutomationAction', 'SmsMessageContent') IS NULL
    ALTER TABLE [dbo].[AutomationAction] ADD [SmsMessageContent] NVARCHAR(2000) NULL;
GO

-- AutomationAction: FromStatusId (conditional status change)
IF COL_LENGTH('AutomationAction', 'FromStatusId') IS NULL
    ALTER TABLE [dbo].[AutomationAction] ADD [FromStatusId] INT NULL;
GO

-- AutomationAction: TaskAssigneeId, TaskAssigneeGroupId, TaskDueOffsetMinutes
IF COL_LENGTH('AutomationAction', 'TaskAssigneeId') IS NULL
    ALTER TABLE [dbo].[AutomationAction] ADD [TaskAssigneeId] INT NULL;
GO
IF COL_LENGTH('AutomationAction', 'TaskAssigneeGroupId') IS NULL
    ALTER TABLE [dbo].[AutomationAction] ADD [TaskAssigneeGroupId] INT NULL;
GO
IF COL_LENGTH('AutomationAction', 'TaskDueOffsetMinutes') IS NULL
    ALTER TABLE [dbo].[AutomationAction] ADD [TaskDueOffsetMinutes] INT NULL;
GO
