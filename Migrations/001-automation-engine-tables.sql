-- ============================================================================
-- Migration 001: Automation Engine Tables
-- Extends existing AutomationRules/Actions/Conditions/ExecutionLog tables
-- and creates new AppConfig + ActionExecutionDetail tables.
--
-- Run against the TMS production database (contains tucJob, tucClient, etc.)
-- Uses IF NOT EXISTS guards — safe to re-run.
-- ============================================================================

-- ============================================================================
-- 1. Extend AutomationRules with new columns needed by the engine
-- ============================================================================

-- IsDeleted (soft delete)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationRules') AND name = 'IsDeleted'
)
ALTER TABLE AutomationRules ADD IsDeleted BIT NOT NULL DEFAULT 0;
GO

-- ConditionMatchMode ('All' or 'Any')
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationRules') AND name = 'ConditionMatchMode'
)
ALTER TABLE AutomationRules ADD ConditionMatchMode NVARCHAR(10) NOT NULL DEFAULT 'All';
GO

-- Scope: AllCustomers flag
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationRules') AND name = 'AllCustomers'
)
ALTER TABLE AutomationRules ADD AllCustomers BIT NOT NULL DEFAULT 1;
GO

-- Scope: comma-separated customer IDs (FK references tucClient.ucclID)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationRules') AND name = 'CustomerIds'
)
ALTER TABLE AutomationRules ADD CustomerIds NVARCHAR(500) NULL;
GO

-- Scope: AllSpeeds flag
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationRules') AND name = 'AllSpeeds'
)
ALTER TABLE AutomationRules ADD AllSpeeds BIT NOT NULL DEFAULT 1;
GO

-- Scope: comma-separated speed IDs (references tucJobType.ucjtID)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationRules') AND name = 'SpeedIds'
)
ALTER TABLE AutomationRules ADD SpeedIds NVARCHAR(500) NULL;
GO

-- ============================================================================
-- 2. Extend AutomationConditions with engine-specific columns
-- ============================================================================

-- SortOrder
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationConditions') AND name = 'SortOrder'
)
ALTER TABLE AutomationConditions ADD SortOrder INT NOT NULL DEFAULT 0;
GO

-- StatusConditionMode (AnyChange, ChangesTo, Leaves, IsNot)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationConditions') AND name = 'StatusConditionMode'
)
ALTER TABLE AutomationConditions ADD StatusConditionMode NVARCHAR(20) NULL;
GO

-- StatusId → references tucJobStatus.ucjsID
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationConditions') AND name = 'StatusId'
)
ALTER TABLE AutomationConditions ADD StatusId INT NULL;
GO

-- ScheduledTimeField (Pickup, Delivery, Flight)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationConditions') AND name = 'ScheduledTimeField'
)
ALTER TABLE AutomationConditions ADD ScheduledTimeField NVARCHAR(20) NULL;
GO

-- OffsetValue (number of minutes/hours)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationConditions') AND name = 'OffsetValue'
)
ALTER TABLE AutomationConditions ADD OffsetValue INT NULL;
GO

-- OffsetUnit ('minutes' or 'hours')
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationConditions') AND name = 'OffsetUnit'
)
ALTER TABLE AutomationConditions ADD OffsetUnit NVARCHAR(10) NULL;
GO

-- ScanTypes (comma-separated scan type values)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationConditions') AND name = 'ScanTypes'
)
ALTER TABLE AutomationConditions ADD ScanTypes NVARCHAR(500) NULL;
GO

-- ============================================================================
-- 3. Extend AutomationActions with engine-specific columns
-- ============================================================================

-- SortOrder
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'SortOrder'
)
ALTER TABLE AutomationActions ADD SortOrder INT NOT NULL DEFAULT 0;
GO

-- ToStatusId → references tucJobStatus.ucjsID
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'ToStatusId'
)
ALTER TABLE AutomationActions ADD ToStatusId INT NULL;
GO

-- FromStatusId → references tucJobStatus.ucjsID
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'FromStatusId'
)
ALTER TABLE AutomationActions ADD FromStatusId INT NULL;
GO

-- TaskTemplateId → references tucEventTemplate.ucetID
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'TaskTemplateId'
)
ALTER TABLE AutomationActions ADD TaskTemplateId INT NULL;
GO

-- TaskAssigneeId → references tucStaff.ucstID
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'TaskAssigneeId'
)
ALTER TABLE AutomationActions ADD TaskAssigneeId INT NULL;
GO

-- TaskAssigneeGroupId
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'TaskAssigneeGroupId'
)
ALTER TABLE AutomationActions ADD TaskAssigneeGroupId INT NULL;
GO

-- TaskDueOffsetMinutes
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'TaskDueOffsetMinutes'
)
ALTER TABLE AutomationActions ADD TaskDueOffsetMinutes INT NULL;
GO

-- NotificationTemplateId → references tucEventTemplateDetail or notification system
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'NotificationTemplateId'
)
ALTER TABLE AutomationActions ADD NotificationTemplateId INT NULL;
GO

-- SmsRecipientType (CustomerContact, Driver, FixedNumber)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'SmsRecipientType'
)
ALTER TABLE AutomationActions ADD SmsRecipientType NVARCHAR(20) NULL;
GO

-- SmsFixedNumber
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'SmsFixedNumber'
)
ALTER TABLE AutomationActions ADD SmsFixedNumber NVARCHAR(50) NULL;
GO

-- SmsMessageContent
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationActions') AND name = 'SmsMessageContent'
)
ALTER TABLE AutomationActions ADD SmsMessageContent NVARCHAR(MAX) NULL;
GO

-- ============================================================================
-- 4. Extend AutomationExecutionLog with engine-specific columns
-- ============================================================================

-- RuleName (denormalized for fast log queries)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationExecutionLog') AND name = 'RuleName'
)
ALTER TABLE AutomationExecutionLog ADD RuleName NVARCHAR(200) NOT NULL DEFAULT '';
GO

-- ConditionsMet
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationExecutionLog') AND name = 'ConditionsMet'
)
ALTER TABLE AutomationExecutionLog ADD ConditionsMet BIT NOT NULL DEFAULT 0;
GO

-- TriggerType (StatusChange, ScanEvent, TimeBased, ManualTrigger, etc.)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationExecutionLog') AND name = 'TriggerType'
)
ALTER TABLE AutomationExecutionLog ADD TriggerType NVARCHAR(50) NOT NULL DEFAULT '';
GO

-- TriggerDetail (JSON or text with additional context)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationExecutionLog') AND name = 'TriggerDetail'
)
ALTER TABLE AutomationExecutionLog ADD TriggerDetail NVARCHAR(MAX) NULL;
GO

-- ActionsExecuted (count of actions that ran)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationExecutionLog') AND name = 'ActionsExecuted'
)
ALTER TABLE AutomationExecutionLog ADD ActionsExecuted INT NOT NULL DEFAULT 0;
GO

-- ActionsSummary (human-readable summary)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationExecutionLog') AND name = 'ActionsSummary'
)
ALTER TABLE AutomationExecutionLog ADD ActionsSummary NVARCHAR(MAX) NULL;
GO

-- DurationMs (execution duration in milliseconds)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('AutomationExecutionLog') AND name = 'DurationMs'
)
ALTER TABLE AutomationExecutionLog ADD DurationMs INT NOT NULL DEFAULT 0;
GO

-- ============================================================================
-- 5. Create ActionExecutionDetail table (new)
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('ActionExecutionDetail') AND type = 'U')
BEGIN
    CREATE TABLE ActionExecutionDetail (
        Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
        ExecutionLogId  BIGINT       NOT NULL,
        ActionType      NVARCHAR(50) NOT NULL,
        Success         BIT          NOT NULL DEFAULT 0,
        Detail          NVARCHAR(MAX) NULL,
        ErrorMessage    NVARCHAR(MAX) NULL,
        DurationMs      INT          NOT NULL DEFAULT 0,

        CONSTRAINT FK_ActionExecDetail_ExecLog
            FOREIGN KEY (ExecutionLogId)
            REFERENCES AutomationExecutionLog(Id)
    );

    CREATE NONCLUSTERED INDEX IX_ActionExecDetail_LogId
        ON ActionExecutionDetail (ExecutionLogId);
END;
GO

-- ============================================================================
-- 6. Create AppConfig table (new)
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('AppConfig') AND type = 'U')
BEGIN
    CREATE TABLE AppConfig (
        AppConfigId   INT IDENTITY(1,1) PRIMARY KEY,
        ConfigKey     NVARCHAR(200)  NOT NULL,
        ConfigValue   NVARCHAR(MAX)  NULL,
        ConfigType    NVARCHAR(20)   NOT NULL DEFAULT 'string',
        Category      NVARCHAR(100)  NULL,
        Description   NVARCHAR(500)  NULL,
        Active        BIT            NOT NULL DEFAULT 1,
        Created       DATETIME       NOT NULL DEFAULT GETUTCDATE(),
        LastModified   DATETIME       NULL,

        CONSTRAINT UQ_AppConfig_Key UNIQUE (ConfigKey)
    );

    CREATE NONCLUSTERED INDEX IX_AppConfig_Category
        ON AppConfig (Category) WHERE Active = 1;
END;
GO

-- ============================================================================
-- 7. Indexes for performance
-- ============================================================================

-- Fast lookups: active, non-deleted rules
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AutomationRules_Active' AND object_id = OBJECT_ID('AutomationRules'))
    CREATE NONCLUSTERED INDEX IX_AutomationRules_Active
        ON AutomationRules (IsActive, IsDeleted) INCLUDE (Name);
GO

-- Execution log by rule
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AutoExecLog_RuleId' AND object_id = OBJECT_ID('AutomationExecutionLog'))
    CREATE NONCLUSTERED INDEX IX_AutoExecLog_RuleId
        ON AutomationExecutionLog (RuleId, ExecutedDate DESC);
GO

-- Execution log by job
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AutoExecLog_JobId' AND object_id = OBJECT_ID('AutomationExecutionLog'))
    CREATE NONCLUSTERED INDEX IX_AutoExecLog_JobId
        ON AutomationExecutionLog (JobId) WHERE JobId IS NOT NULL;
GO

-- ============================================================================
-- 8. Seed default AppConfig entries for the automation engine
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM AppConfig WHERE ConfigKey = 'AutomationEngine.Enabled')
    INSERT INTO AppConfig (ConfigKey, ConfigValue, ConfigType, Category, Description)
    VALUES ('AutomationEngine.Enabled', 'false', 'bool', 'Automation', 'Master switch for the automation engine');

IF NOT EXISTS (SELECT 1 FROM AppConfig WHERE ConfigKey = 'AutomationEngine.MaxActionsPerEvaluation')
    INSERT INTO AppConfig (ConfigKey, ConfigValue, ConfigType, Category, Description)
    VALUES ('AutomationEngine.MaxActionsPerEvaluation', '10', 'int', 'Automation', 'Safety limit: max actions per single evaluation');

IF NOT EXISTS (SELECT 1 FROM AppConfig WHERE ConfigKey = 'AutomationEngine.DryRunMode')
    INSERT INTO AppConfig (ConfigKey, ConfigValue, ConfigType, Category, Description)
    VALUES ('AutomationEngine.DryRunMode', 'true', 'bool', 'Automation', 'When true, actions are logged but not executed');

GO
