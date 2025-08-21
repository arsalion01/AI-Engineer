-- AI Engineer Agent - Database Seeding Script
-- Populates initial data for production deployment

-- ============================================================================
-- System Configuration
-- ============================================================================

INSERT INTO system_config (config_key, config_value, description, config_type) VALUES 
-- Application Settings
('app_name', 'AI Engineer Agent', 'Application name', 'string'),
('app_version', '1.0.0', 'Current application version', 'string'),
('app_environment', 'production', 'Current environment', 'string'),

-- Feature Flags
('enable_team_collaboration', 'true', 'Enable team collaboration features', 'boolean'),
('enable_advanced_analytics', 'true', 'Enable advanced analytics dashboard', 'boolean'),
('enable_workflow_templates', 'true', 'Enable workflow template library', 'boolean'),
('enable_real_time_collaboration', 'true', 'Enable real-time collaboration features', 'boolean'),
('enable_notifications', 'true', 'Enable email notifications', 'boolean'),

-- Rate Limiting & Quotas
('default_gemini_quota_daily', '100', 'Default daily Gemini API requests per user', 'integer'),
('default_gemini_quota_hourly', '50', 'Default hourly Gemini API requests per user', 'integer'),
('max_projects_per_user', '50', 'Maximum projects per user', 'integer'),
('max_team_members', '20', 'Maximum members per team', 'integer'),
('max_file_size_mb', '10', 'Maximum file upload size in MB', 'integer'),

-- AI Configuration
('ai_model_default', 'gemini-1.5-pro', 'Default AI model to use', 'string'),
('ai_temperature', '0.7', 'Default AI temperature for responses', 'float'),
('ai_max_tokens', '4096', 'Maximum tokens for AI responses', 'integer'),

-- Workflow Settings
('workflow_timeout_seconds', '300', 'Default workflow generation timeout', 'integer'),
('max_workflow_complexity', '10', 'Maximum workflow complexity score', 'integer'),

-- Security Settings
('session_timeout_hours', '24', 'User session timeout in hours', 'integer'),
('password_min_length', '8', 'Minimum password length', 'integer'),
('require_email_verification', 'true', 'Require email verification for new users', 'boolean'),

-- Analytics Settings
('analytics_retention_days', '90', 'Analytics data retention period', 'integer'),
('enable_usage_tracking', 'true', 'Enable anonymous usage tracking', 'boolean'),

-- Email Settings
('email_from_name', 'AI Engineer Agent', 'Email sender name', 'string'),
('email_support_address', 'support@ai-engineer-agent.com', 'Support email address', 'string')

ON CONFLICT (config_key) DO UPDATE SET 
    config_value = EXCLUDED.config_value,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- Initial Workflow Templates Data
-- ============================================================================

-- Insert workflow categories
INSERT INTO workflow_templates (
    template_id,
    name,
    description,
    category,
    difficulty_level,
    use_cases,
    json_template,
    tags,
    usage_count,
    success_rate,
    estimated_time_minutes,
    created_at,
    updated_at
) VALUES 

-- Data Processing Templates
('template_001', 'Basic Data Transformation', 'Simple data transformation workflow for CSV/JSON processing', 'Data Processing', 'beginner', ARRAY['Data cleaning', 'Format conversion', 'Basic ETL'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"transform","type":"transform","position":{"x":300,"y":100},"parameters":{"operation":"map","expression":"item => ({ ...item, processed: true })"}},{"id":"end","type":"end","position":{"x":500,"y":100}}],"connections":[{"source":"start","target":"transform"},{"source":"transform","target":"end"}]}',
ARRAY['data', 'transformation', 'beginner'], 0, 95.0, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('template_002', 'API Data Aggregation', 'Aggregate data from multiple APIs and combine results', 'API Integration', 'intermediate', ARRAY['API integration', 'Data aggregation', 'Multi-source data'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"api1","type":"http","position":{"x":250,"y":50},"parameters":{"url":"https://api1.example.com/data","method":"GET"}},{"id":"api2","type":"http","position":{"x":250,"y":150},"parameters":{"url":"https://api2.example.com/data","method":"GET"}},{"id":"merge","type":"merge","position":{"x":400,"y":100}},{"id":"transform","type":"transform","position":{"x":550,"y":100}},{"id":"end","type":"end","position":{"x":700,"y":100}}],"connections":[{"source":"start","target":"api1"},{"source":"start","target":"api2"},{"source":"api1","target":"merge"},{"source":"api2","target":"merge"},{"source":"merge","target":"transform"},{"source":"transform","target":"end"}]}',
ARRAY['api', 'aggregation', 'intermediate'], 0, 88.0, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('template_003', 'Database Sync Workflow', 'Synchronize data between different database systems', 'Database', 'advanced', ARRAY['Database sync', 'Data migration', 'ETL pipeline'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"source_db","type":"database","position":{"x":250,"y":100},"parameters":{"operation":"read","query":"SELECT * FROM source_table WHERE updated_at > ?"}},{"id":"transform","type":"transform","position":{"x":400,"y":100}},{"id":"target_db","type":"database","position":{"x":550,"y":100},"parameters":{"operation":"upsert","table":"target_table"}},{"id":"end","type":"end","position":{"x":700,"y":100}}],"connections":[{"source":"start","target":"source_db"},{"source":"source_db","target":"transform"},{"source":"transform","target":"target_db"},{"source":"target_db","target":"end"}]}',
ARRAY['database', 'sync', 'advanced'], 0, 92.0, 45, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- AI/ML Templates
('template_004', 'Text Analysis Pipeline', 'Analyze text content using various NLP techniques', 'AI/ML', 'intermediate', ARRAY['Text analysis', 'NLP', 'Sentiment analysis'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"text_input","type":"input","position":{"x":250,"y":100},"parameters":{"type":"text"}},{"id":"sentiment","type":"ai","position":{"x":400,"y":50},"parameters":{"operation":"sentiment_analysis","model":"bert-base"}},{"id":"keywords","type":"ai","position":{"x":400,"y":150},"parameters":{"operation":"keyword_extraction"}},{"id":"combine","type":"merge","position":{"x":550,"y":100}},{"id":"output","type":"output","position":{"x":700,"y":100}},{"id":"end","type":"end","position":{"x":850,"y":100}}],"connections":[{"source":"start","target":"text_input"},{"source":"text_input","target":"sentiment"},{"source":"text_input","target":"keywords"},{"source":"sentiment","target":"combine"},{"source":"keywords","target":"combine"},{"source":"combine","target":"output"},{"source":"output","target":"end"}]}',
ARRAY['ai', 'nlp', 'text-analysis'], 0, 87.0, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('template_005', 'Image Processing Workflow', 'Process and analyze images with AI models', 'AI/ML', 'advanced', ARRAY['Image processing', 'Computer vision', 'AI analysis'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"image_input","type":"input","position":{"x":250,"y":100},"parameters":{"type":"file","accept":"image/*"}},{"id":"resize","type":"transform","position":{"x":400,"y":100},"parameters":{"operation":"resize","width":224,"height":224}},{"id":"ai_analysis","type":"ai","position":{"x":550,"y":100},"parameters":{"operation":"image_classification","model":"resnet50"}},{"id":"results","type":"output","position":{"x":700,"y":100}},{"id":"end","type":"end","position":{"x":850,"y":100}}],"connections":[{"source":"start","target":"image_input"},{"source":"image_input","target":"resize"},{"source":"resize","target":"ai_analysis"},{"source":"ai_analysis","target":"results"},{"source":"results","target":"end"}]}',
ARRAY['ai', 'image-processing', 'computer-vision'], 0, 89.0, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Communication Templates
('template_006', 'Email Automation Workflow', 'Automated email sending with personalization', 'Communication', 'beginner', ARRAY['Email automation', 'Personalization', 'Marketing'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"trigger","type":"trigger","position":{"x":250,"y":100},"parameters":{"type":"schedule","schedule":"0 9 * * 1"}},{"id":"get_contacts","type":"database","position":{"x":400,"y":100},"parameters":{"operation":"read","query":"SELECT * FROM contacts WHERE active = true"}},{"id":"personalize","type":"transform","position":{"x":550,"y":100},"parameters":{"template":"Hello {{name}}, welcome to our service!"}},{"id":"send_email","type":"email","position":{"x":700,"y":100},"parameters":{"smtp":"smtp.gmail.com"}},{"id":"end","type":"end","position":{"x":850,"y":100}}],"connections":[{"source":"start","target":"trigger"},{"source":"trigger","target":"get_contacts"},{"source":"get_contacts","target":"personalize"},{"source":"personalize","target":"send_email"},{"source":"send_email","target":"end"}]}',
ARRAY['email', 'automation', 'communication'], 0, 94.0, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('template_007', 'Slack Integration Workflow', 'Send automated messages and notifications to Slack', 'Communication', 'beginner', ARRAY['Slack integration', 'Notifications', 'Team communication'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"webhook","type":"webhook","position":{"x":250,"y":100},"parameters":{"method":"POST","path":"/slack-notification"}},{"id":"format_message","type":"transform","position":{"x":400,"y":100},"parameters":{"template":"🚀 New deployment: {{version}} - {{status}}"}},{"id":"slack_send","type":"slack","position":{"x":550,"y":100},"parameters":{"channel":"#deployments","webhook_url":"https://hooks.slack.com/services/..."}},{"id":"end","type":"end","position":{"x":700,"y":100}}],"connections":[{"source":"start","target":"webhook"},{"source":"webhook","target":"format_message"},{"source":"format_message","target":"slack_send"},{"source":"slack_send","target":"end"}]}',
ARRAY['slack', 'notifications', 'webhook'], 0, 96.0, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Monitoring Templates
('template_008', 'System Health Monitor', 'Monitor system health and send alerts', 'Monitoring', 'intermediate', ARRAY['Health monitoring', 'Alerting', 'System monitoring'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"schedule","type":"trigger","position":{"x":250,"y":100},"parameters":{"type":"schedule","schedule":"*/5 * * * *"}},{"id":"health_check","type":"http","position":{"x":400,"y":100},"parameters":{"url":"https://api.example.com/health","method":"GET","timeout":10000}},{"id":"evaluate","type":"condition","position":{"x":550,"y":100},"parameters":{"condition":"response.status !== 200"}},{"id":"alert","type":"email","position":{"x":700,"y":50},"parameters":{"to":"admin@example.com","subject":"System Alert"}},{"id":"log_success","type":"log","position":{"x":700,"y":150}},{"id":"end","type":"end","position":{"x":850,"y":100}}],"connections":[{"source":"start","target":"schedule"},{"source":"schedule","target":"health_check"},{"source":"health_check","target":"evaluate"},{"source":"evaluate","target":"alert","condition":"true"},{"source":"evaluate","target":"log_success","condition":"false"},{"source":"alert","target":"end"},{"source":"log_success","target":"end"}]}',
ARRAY['monitoring', 'health-check', 'alerting'], 0, 91.0, 35, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- E-commerce Templates
('template_009', 'Order Processing Workflow', 'Complete order processing from payment to fulfillment', 'E-commerce', 'advanced', ARRAY['Order processing', 'Payment integration', 'Fulfillment'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"order_webhook","type":"webhook","position":{"x":250,"y":100},"parameters":{"method":"POST","path":"/order"}},{"id":"validate_order","type":"condition","position":{"x":400,"y":100},"parameters":{"condition":"order.total > 0 && order.items.length > 0"}},{"id":"payment","type":"http","position":{"x":550,"y":50},"parameters":{"url":"https://api.stripe.com/v1/charges","method":"POST"}},{"id":"update_inventory","type":"database","position":{"x":550,"y":150},"parameters":{"operation":"update","table":"inventory"}},{"id":"send_confirmation","type":"email","position":{"x":700,"y":75},"parameters":{"template":"order_confirmation"}},{"id":"fulfill_order","type":"http","position":{"x":850,"y":100},"parameters":{"url":"https://fulfillment.api.com/orders","method":"POST"}},{"id":"end","type":"end","position":{"x":1000,"y":100}}],"connections":[{"source":"start","target":"order_webhook"},{"source":"order_webhook","target":"validate_order"},{"source":"validate_order","target":"payment","condition":"true"},{"source":"payment","target":"update_inventory"},{"source":"payment","target":"send_confirmation"},{"source":"update_inventory","target":"fulfill_order"},{"source":"fulfill_order","target":"end"}]}',
ARRAY['ecommerce', 'payment', 'fulfillment'], 0, 85.0, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- File Processing Templates
('template_010', 'Document Processing Pipeline', 'Process documents with OCR and data extraction', 'File Processing', 'advanced', ARRAY['OCR', 'Document processing', 'Data extraction'], 
'{"nodes":[{"id":"start","type":"start","position":{"x":100,"y":100}},{"id":"file_upload","type":"webhook","position":{"x":250,"y":100},"parameters":{"method":"POST","path":"/upload","accept":"application/pdf,image/*"}},{"id":"ocr","type":"ai","position":{"x":400,"y":100},"parameters":{"operation":"ocr","engine":"tesseract"}},{"id":"extract_data","type":"ai","position":{"x":550,"y":100},"parameters":{"operation":"named_entity_recognition"}},{"id":"validate","type":"condition","position":{"x":700,"y":100},"parameters":{"condition":"extracted_data.confidence > 0.8"}},{"id":"store_data","type":"database","position":{"x":850,"y":50},"parameters":{"operation":"insert","table":"documents"}},{"id":"manual_review","type":"webhook","position":{"x":850,"y":150},"parameters":{"url":"https://review.api.com/queue"}},{"id":"end","type":"end","position":{"x":1000,"y":100}}],"connections":[{"source":"start","target":"file_upload"},{"source":"file_upload","target":"ocr"},{"source":"ocr","target":"extract_data"},{"source":"extract_data","target":"validate"},{"source":"validate","target":"store_data","condition":"true"},{"source":"validate","target":"manual_review","condition":"false"},{"source":"store_data","target":"end"},{"source":"manual_review","target":"end"}]}',
ARRAY['ocr', 'document-processing', 'ai'], 0, 82.0, 90, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- Team and User Templates
-- ============================================================================

-- Insert default team template
INSERT INTO teams (name, description, subscription_tier, settings, created_at, updated_at) VALUES 
('Default Organization', 'Default team for single users', 'free', 
'{"max_projects": 10, "max_workflows": 50, "ai_requests_per_day": 100, "storage_limit_mb": 1000, "collaboration_enabled": false}',
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- API Rate Limits
-- ============================================================================

INSERT INTO api_rate_limits (endpoint_pattern, rate_limit, time_window, burst_limit, description, created_at) VALUES 
('/api/auth/*', 10, 900, 5, 'Authentication endpoints rate limit', CURRENT_TIMESTAMP),
('/api/projects/*', 100, 3600, 20, 'Project management endpoints', CURRENT_TIMESTAMP),
('/api/workflows/*', 50, 3600, 10, 'Workflow generation endpoints', CURRENT_TIMESTAMP),
('/api/ai/*', 30, 3600, 5, 'AI processing endpoints', CURRENT_TIMESTAMP),
('/api/upload/*', 5, 300, 2, 'File upload endpoints', CURRENT_TIMESTAMP),
('/api/analytics/*', 200, 3600, 50, 'Analytics endpoints', CURRENT_TIMESTAMP),
('/*', 1000, 3600, 100, 'Global rate limit', CURRENT_TIMESTAMP)

ON CONFLICT (endpoint_pattern) DO UPDATE SET 
    rate_limit = EXCLUDED.rate_limit,
    time_window = EXCLUDED.time_window,
    burst_limit = EXCLUDED.burst_limit,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- Initial Analytics Data
-- ============================================================================

-- Insert sample metrics for the dashboard
INSERT INTO daily_metrics (metric_date, total_users, active_users, new_signups, projects_created, 
                          workflows_generated, api_requests, avg_response_time_ms, error_rate, 
                          storage_used_mb, gemini_requests, created_at) VALUES 
(CURRENT_DATE - INTERVAL '1 day', 0, 0, 0, 0, 0, 0, 0.0, 0.0, 0, 0, CURRENT_TIMESTAMP),
(CURRENT_DATE, 0, 0, 0, 0, 0, 0, 0.0, 0.0, 0, 0, CURRENT_TIMESTAMP)

ON CONFLICT (metric_date) DO NOTHING;

-- ============================================================================
-- Custom Reports Templates
-- ============================================================================

INSERT INTO custom_reports (name, description, report_type, query_config, schedule_config, 
                           output_format, recipients, created_at) VALUES 
('Daily System Health', 'Daily overview of system performance and user activity', 'system_health',
'{"metrics": ["total_users", "active_users", "api_requests", "error_rate", "avg_response_time_ms"], "time_range": "24h", "aggregation": "sum"}',
'{"frequency": "daily", "time": "08:00", "timezone": "UTC", "enabled": true}',
'json', ARRAY['admin@ai-engineer-agent.com'], CURRENT_TIMESTAMP),

('Weekly User Growth', 'Weekly report on user acquisition and engagement', 'user_analytics',
'{"metrics": ["new_signups", "active_users", "retention_rate"], "time_range": "7d", "aggregation": "sum", "group_by": "day"}',
'{"frequency": "weekly", "day": "monday", "time": "09:00", "timezone": "UTC", "enabled": true}',
'pdf', ARRAY['management@ai-engineer-agent.com'], CURRENT_TIMESTAMP),

('Monthly Performance Summary', 'Comprehensive monthly system and business metrics', 'comprehensive',
'{"metrics": ["all"], "time_range": "30d", "aggregation": "avg", "include_comparisons": true}',
'{"frequency": "monthly", "day": 1, "time": "10:00", "timezone": "UTC", "enabled": true}',
'excel', ARRAY['reports@ai-engineer-agent.com'], CURRENT_TIMESTAMP)

ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    query_config = EXCLUDED.query_config,
    schedule_config = EXCLUDED.schedule_config,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- Alert Rules
-- ============================================================================

INSERT INTO alert_rules (name, description, rule_type, condition_config, notification_config, 
                        is_active, created_at) VALUES 
('High Error Rate', 'Alert when error rate exceeds 5%', 'error_rate',
'{"metric": "error_rate", "operator": "greater_than", "threshold": 5.0, "time_window": "5m", "evaluation_frequency": "1m"}',
'{"channels": ["email"], "recipients": ["admin@ai-engineer-agent.com"], "severity": "high", "cooldown_minutes": 15}',
true, CURRENT_TIMESTAMP),

('Low Disk Space', 'Alert when available disk space is below 10%', 'system',
'{"metric": "disk_usage_percent", "operator": "greater_than", "threshold": 90.0, "time_window": "1m", "evaluation_frequency": "5m"}',
'{"channels": ["email", "slack"], "recipients": ["sysadmin@ai-engineer-agent.com"], "severity": "critical", "cooldown_minutes": 60}',
true, CURRENT_TIMESTAMP),

('High Response Time', 'Alert when average response time exceeds 2 seconds', 'performance',
'{"metric": "avg_response_time_ms", "operator": "greater_than", "threshold": 2000.0, "time_window": "5m", "evaluation_frequency": "1m"}',
'{"channels": ["email"], "recipients": ["dev-team@ai-engineer-agent.com"], "severity": "medium", "cooldown_minutes": 10}',
true, CURRENT_TIMESTAMP),

('Database Connection Issues', 'Alert when database connection pool utilization exceeds 80%', 'database',
'{"metric": "db_pool_usage_percent", "operator": "greater_than", "threshold": 80.0, "time_window": "2m", "evaluation_frequency": "30s"}',
'{"channels": ["email"], "recipients": ["db-admin@ai-engineer-agent.com"], "severity": "high", "cooldown_minutes": 5}',
true, CURRENT_TIMESTAMP),

('New User Signup Spike', 'Alert when new signups exceed normal patterns', 'business',
'{"metric": "new_signups_hourly", "operator": "greater_than", "threshold": 50, "time_window": "1h", "evaluation_frequency": "15m"}',
'{"channels": ["email"], "recipients": ["growth@ai-engineer-agent.com"], "severity": "low", "cooldown_minutes": 120}',
true, CURRENT_TIMESTAMP)

ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    condition_config = EXCLUDED.condition_config,
    notification_config = EXCLUDED.notification_config,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- Performance Optimizations
-- ============================================================================

-- Create additional indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_timestamp 
ON analytics_events(user_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_team_status 
ON projects(team_id, status, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_templates_category_difficulty 
ON workflow_templates(category, difficulty_level, usage_count DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_metrics_date_range 
ON daily_metrics(metric_date DESC);

-- Update table statistics
ANALYZE users;
ANALYZE teams;
ANALYZE projects;
ANALYZE workflow_templates;
ANALYZE analytics_events;
ANALYZE daily_metrics;

-- ============================================================================
-- Initial Success Message
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '==========================================================';
    RAISE NOTICE 'AI Engineer Agent Database Seeding Completed Successfully';
    RAISE NOTICE '==========================================================';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- % system configuration entries', (SELECT count(*) FROM system_config);
    RAISE NOTICE '- % workflow templates', (SELECT count(*) FROM workflow_templates);
    RAISE NOTICE '- % API rate limit rules', (SELECT count(*) FROM api_rate_limits);
    RAISE NOTICE '- % alert rules', (SELECT count(*) FROM alert_rules);
    RAISE NOTICE '- % custom report templates', (SELECT count(*) FROM custom_reports);
    RAISE NOTICE '==========================================================';
END $$;