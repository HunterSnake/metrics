update MetricAggregatesDailyView set PushedFlag=0;
update MetricAggregatesWeeklyView set PushedFlag=0;
update MetricAggregatesMonthlyView set PushedFlag=0;
update MetricAggregatesQuarterlyView set PushedFlag=0;
update MetricAggregatesYearlyView set PushedFlag=0;

'http://localhost:8008'	

insert [ENOTE_PROCESSING].[dbo].[MiscConfigSettings] ([ConfigName] ,[ConfigValue] ,[AppName] ,[Category] ,[InstanceName]) Values
	('MetricsHelionHost','http://metrics-datasync-service.15.126.130.219.xip.io/','HelionPusher','Metrics','Helion')

insert [ENOTE_PROCESSING].[dbo].[MiscConfigSettings] ([ConfigName] ,[ConfigValue] ,[AppName] ,[Category] ,[InstanceName]) Values
	('MetricsPusherInstance','EIT300','HelionPusher','Metrics','Helion')

insert [ENOTE_PROCESSING].[dbo].[ProcessingThread] ([DisplayName] ,[IsOnHold] ,[ForceSingleThread] ,[ClassName] 
	,[SingleThreadIsTaken] ,[ThreadTypeId] ,[SingleThreadCheckDatetime] ,[SingleThreadServerName]) Values (
		'HelionPusher Thread',0,1,'Pusher',1,2,getDate(),'EITENOTV302')
