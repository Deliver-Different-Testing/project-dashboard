-- 004: Extend event template tables

-- tucEventTemplate: ucetCategory
IF COL_LENGTH('tucEventTemplate', 'ucetCategory') IS NULL
    ALTER TABLE [dbo].[tucEventTemplate] ADD [ucetCategory] NVARCHAR(50) NULL;
GO

-- tucEventTemplate: MirrorToAgentPortal
IF COL_LENGTH('tucEventTemplate', 'MirrorToAgentPortal') IS NULL
    ALTER TABLE [dbo].[tucEventTemplate] ADD [MirrorToAgentPortal] BIT NOT NULL DEFAULT 0;
GO

-- tucEventTemplateDetail: ucetdConfig
IF COL_LENGTH('tucEventTemplateDetail', 'ucetdConfig') IS NULL
    ALTER TABLE [dbo].[tucEventTemplateDetail] ADD [ucetdConfig] NVARCHAR(MAX) NULL;
GO

-- tucEventTemplateDetail: ucetdContext
IF COL_LENGTH('tucEventTemplateDetail', 'ucetdContext') IS NULL
    ALTER TABLE [dbo].[tucEventTemplateDetail] ADD [ucetdContext] NVARCHAR(MAX) NULL;
GO
