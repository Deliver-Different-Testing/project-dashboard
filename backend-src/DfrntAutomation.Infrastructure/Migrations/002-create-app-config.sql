-- 002: Create AppConfig table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AppConfig')
BEGIN
    CREATE TABLE [dbo].[AppConfig] (
        [AppConfigId]   INT IDENTITY(1,1) NOT NULL,
        [ConfigKey]     NVARCHAR(100) NOT NULL,
        [ConfigValue]   NVARCHAR(500) NULL,
        [ConfigType]    NVARCHAR(20) NOT NULL DEFAULT 'string',
        [Category]      NVARCHAR(50) NULL,
        [Description]   NVARCHAR(255) NULL,
        [Active]        BIT NOT NULL DEFAULT 1,
        [Created]       DATETIME NOT NULL DEFAULT GETUTCDATE(),
        [LastModified]  DATETIME NULL,
        CONSTRAINT [PK_AppConfig] PRIMARY KEY CLUSTERED ([AppConfigId]),
        CONSTRAINT [UQ_AppConfig_ConfigKey] UNIQUE ([ConfigKey])
    );
END;
GO
