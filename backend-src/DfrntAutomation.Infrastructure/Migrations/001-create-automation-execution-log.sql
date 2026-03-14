-- 001: Create AutomationExecutionLog table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AutomationExecutionLog')
BEGIN
    CREATE TABLE [dbo].[AutomationExecutionLog] (
        [Id]              BIGINT IDENTITY(1,1) NOT NULL,
        [RuleId]          INT NOT NULL,
        [RuleName]        NVARCHAR(200) NOT NULL,
        [JobId]           INT NULL,
        [EvaluatedAt]     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [ConditionsMet]   BIT NOT NULL DEFAULT 0,
        [TriggerType]     NVARCHAR(50) NOT NULL,
        [TriggerDetail]   NVARCHAR(500) NULL,
        [ActionsExecuted] INT NOT NULL DEFAULT 0,
        [ActionsSummary]  NVARCHAR(MAX) NULL,
        [ErrorMessage]    NVARCHAR(MAX) NULL,
        [DurationMs]      INT NOT NULL DEFAULT 0,
        CONSTRAINT [PK_AutomationExecutionLog] PRIMARY KEY CLUSTERED ([Id])
    );

    CREATE NONCLUSTERED INDEX [IX_AutomationExecutionLog_RuleId_EvaluatedAt]
        ON [dbo].[AutomationExecutionLog] ([RuleId], [EvaluatedAt]);

    CREATE NONCLUSTERED INDEX [IX_AutomationExecutionLog_JobId_EvaluatedAt]
        ON [dbo].[AutomationExecutionLog] ([JobId], [EvaluatedAt]);

    CREATE NONCLUSTERED INDEX [IX_AutomationExecutionLog_EvaluatedAt]
        ON [dbo].[AutomationExecutionLog] ([EvaluatedAt]);
END;
GO

-- ActionExecutionDetail
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ActionExecutionDetail')
BEGIN
    CREATE TABLE [dbo].[ActionExecutionDetail] (
        [Id]              BIGINT IDENTITY(1,1) NOT NULL,
        [ExecutionLogId]  BIGINT NOT NULL,
        [ActionType]      NVARCHAR(50) NOT NULL,
        [Success]         BIT NOT NULL DEFAULT 0,
        [Detail]          NVARCHAR(MAX) NULL,
        [ErrorMessage]    NVARCHAR(MAX) NULL,
        [DurationMs]      INT NOT NULL DEFAULT 0,
        CONSTRAINT [PK_ActionExecutionDetail] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_ActionExecutionDetail_Log] FOREIGN KEY ([ExecutionLogId])
            REFERENCES [dbo].[AutomationExecutionLog]([Id]) ON DELETE CASCADE
    );
END;
GO
