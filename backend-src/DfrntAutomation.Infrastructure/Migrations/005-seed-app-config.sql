-- 005: Seed AppConfig feature flags
-- Uses MERGE for idempotency

MERGE INTO [dbo].[AppConfig] AS target
USING (VALUES
    ('Automation.DotNetEngine.Enabled',        'true',  'bool',   'Automation', 'Enable the .NET automation engine'),
    ('Automation.DotNetEngine.ShadowMode',      'true',  'bool',   'Automation', 'Shadow mode: evaluate but do not execute actions'),
    ('Automation.StoredProcedure.Enabled',      'true',  'bool',   'Automation', 'Enable the legacy SP automation engine'),
    ('Automation.TimeBased.IntervalMinutes',    '5',     'int',    'Automation', 'Interval in minutes for time-based rule evaluation'),
    ('Automation.TimeBased.WindowMinutes',      '30',    'int',    'Automation', 'Window in minutes to prevent re-processing same rule+job'),
    ('Automation.Logging.RetentionDays',        '90',    'int',    'Automation', 'Days to retain execution logs'),
    ('Mobile.EnablePushNotifications',          'true',  'bool',   'Mobile',     'Enable push notifications in MAUI app'),
    ('Mobile.EnableOfflineMode',                'true',  'bool',   'Mobile',     'Enable offline mode in MAUI app'),
    ('Mobile.MinAppVersion',                    '1.0.0', 'string', 'Mobile',     'Minimum required MAUI app version'),
    ('Portal.EnableAgentPortal',                'true',  'bool',   'Portal',     'Enable the Agent Portal feature'),
    ('Portal.AgentPortalBaseUrl',               'https://portal.dfrnt.com', 'string', 'Portal', 'Base URL for the Agent Portal'),
    ('Email.AutomationFromAddress',             'automation@dfrnt.com', 'string', 'Email', 'From address for automation emails')
) AS source ([ConfigKey], [ConfigValue], [ConfigType], [Category], [Description])
ON target.[ConfigKey] = source.[ConfigKey]
WHEN NOT MATCHED THEN
    INSERT ([ConfigKey], [ConfigValue], [ConfigType], [Category], [Description], [Active], [Created])
    VALUES (source.[ConfigKey], source.[ConfigValue], source.[ConfigType], source.[Category], source.[Description], 1, GETUTCDATE());
GO
