-- AI Engineer Agent - Production Database Migration
-- Complete database schema for team collaboration and analytics extensions

-- ============================================================================
-- USERS AND AUTHENTICATION
-- ============================================================================

-- Enhanced users table with team collaboration features
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    google_id VARCHAR(100) UNIQUE,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    quota_used INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 1000,
    last_active_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User sessions for enhanced security
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TEAM COLLABORATION
-- ============================================================================

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members with roles and permissions
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED PROJECTS
-- ============================================================================

-- Enhanced projects table with collaboration features
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    phase VARCHAR(50) DEFAULT 'requirements',
    progress INTEGER DEFAULT 0,
    visibility VARCHAR(20) DEFAULT 'private',
    settings JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project collaborators
CREATE TABLE IF NOT EXISTS project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    permissions JSONB DEFAULT '[]',
    added_by UUID NOT NULL REFERENCES users(id),
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Project requirements with collaboration tracking
CREATE TABLE IF NOT EXISTS project_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Project blueprints
CREATE TABLE IF NOT EXISTS project_blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    technical_architecture JSONB,
    business_case JSONB,
    implementation_plan JSONB,
    risk_assessment JSONB,
    success_metrics JSONB,
    estimated_roi DECIMAL(5,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Generated workflows
CREATE TABLE IF NOT EXISTS project_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    blueprint_id UUID REFERENCES project_blueprints(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'main',
    workflow_json JSONB NOT NULL,
    n8n_import_ready BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- ============================================================================
-- COLLABORATION FEATURES
-- ============================================================================

-- Comments system
CREATE TABLE IF NOT EXISTS project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'open',
    thread_id UUID REFERENCES project_comments(id),
    mentions UUID[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Real-time activity tracking
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    team_id UUID REFERENCES teams(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project templates
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    team_id UUID REFERENCES teams(id),
    created_by UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    requirements_template JSONB,
    blueprint_template JSONB,
    workflow_templates JSONB,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ADVANCED ANALYTICS
-- ============================================================================

-- Analytics events for comprehensive tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id UUID,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    properties JSONB DEFAULT '{}',
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Time-series metrics for analytics
CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    dimensions JSONB DEFAULT '{}',
    team_id UUID REFERENCES teams(id),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Aggregated daily metrics for performance
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    team_id UUID REFERENCES teams(id),
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    workflows_generated INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    avg_response_time DECIMAL(8,2) DEFAULT 0,
    error_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(metric_date, team_id)
);

-- User behavior analytics
CREATE TABLE IF NOT EXISTS user_sessions_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    duration INTEGER,
    page_views INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    projects_accessed UUID[] DEFAULT '{}',
    device_type VARCHAR(50),
    browser VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Custom reports
CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    parameters JSONB NOT NULL,
    schedule_config JSONB,
    recipients TEXT[] DEFAULT '{}',
    format VARCHAR(20) DEFAULT 'pdf',
    is_scheduled BOOLEAN DEFAULT false,
    last_generated TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert rules
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metric VARCHAR(100) NOT NULL,
    condition VARCHAR(20) NOT NULL,
    threshold DECIMAL(15,4) NOT NULL,
    time_window INTEGER DEFAULT 300,
    severity VARCHAR(20) DEFAULT 'warning',
    notifications JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    triggered_count INTEGER DEFAULT 0,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert incidents
CREATE TABLE IF NOT EXISTS alert_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    metric_value DECIMAL(15,4) NOT NULL,
    message TEXT,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- WORKFLOW KNOWLEDGE BASE ENHANCEMENTS
-- ============================================================================

-- Enhanced workflow templates from GitHub repository
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    workflow_json JSONB NOT NULL,
    nodes_used TEXT[] DEFAULT '{}',
    integrations TEXT[] DEFAULT '{}',
    complexity VARCHAR(20) DEFAULT 'simple',
    estimated_time INTEGER,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    source_repo VARCHAR(255),
    source_file VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow usage analytics
CREATE TABLE IF NOT EXISTS workflow_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workflow_templates(id),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    success BOOLEAN DEFAULT true,
    execution_time INTEGER,
    modifications JSONB,
    feedback_rating INTEGER,
    feedback_comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM CONFIGURATION
-- ============================================================================

-- System settings and configuration
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API rate limiting
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    endpoint VARCHAR(200) NOT NULL,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP NOT NULL,
    window_duration INTEGER DEFAULT 3600,
    limit_per_window INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Team indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_timestamp ON analytics_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(metric_date);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at);

-- Workflow template indexes
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_complexity ON workflow_templates(complexity);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING GIN(tags);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_requirements_updated_at BEFORE UPDATE ON project_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON project_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL SYSTEM DATA
-- ============================================================================

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES
('app_name', '"AI Engineer Agent"', 'Application name'),
('app_version', '"2.0.0"', 'Current application version'),
('max_team_members_free', '5', 'Maximum team members for free tier'),
('max_team_members_pro', '50', 'Maximum team members for professional tier'),
('max_team_members_enterprise', '500', 'Maximum team members for enterprise tier'),
('default_api_quota', '1000', 'Default monthly API quota per user'),
('session_timeout_hours', '24', 'User session timeout in hours'),
('analytics_retention_days', '365', 'Analytics data retention period'),
('backup_retention_days', '30', 'Database backup retention period')
ON CONFLICT (key) DO NOTHING;

-- Insert default workflow categories
INSERT INTO workflow_templates (name, description, category, workflow_json, complexity) VALUES
('Simple Email Notification', 'Basic email sending workflow', 'communication', 
 '{"nodes": [], "connections": {}}', 'simple'),
('Data Processing Pipeline', 'ETL workflow for data transformation', 'data-processing', 
 '{"nodes": [], "connections": {}}', 'moderate'),
('CRM Lead Processing', 'Automated lead qualification and routing', 'crm', 
 '{"nodes": [], "connections": {}}', 'complex')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DATABASE MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to clean up old analytics events
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '365 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily metrics
CREATE OR REPLACE FUNCTION calculate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_metrics (
        metric_date, team_id, total_users, active_users, 
        total_projects, completed_projects, workflows_generated, api_calls
    )
    SELECT 
        target_date,
        tm.team_id,
        COUNT(DISTINCT tm.user_id) as total_users,
        COUNT(DISTINCT CASE WHEN u.last_active_at::date = target_date THEN tm.user_id END) as active_users,
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT CASE WHEN p.phase = 'completed' THEN p.id END) as completed_projects,
        COUNT(DISTINCT pw.id) as workflows_generated,
        COALESCE(api_stats.api_calls, 0) as api_calls
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    LEFT JOIN projects p ON p.team_id = tm.team_id
    LEFT JOIN project_workflows pw ON pw.project_id = p.id AND pw.created_at::date = target_date
    LEFT JOIN (
        SELECT 
            ae.user_id,
            tm2.team_id,
            COUNT(*) as api_calls
        FROM analytics_events ae
        JOIN team_members tm2 ON ae.user_id = tm2.user_id
        WHERE ae.created_at::date = target_date
        GROUP BY ae.user_id, tm2.team_id
    ) api_stats ON api_stats.team_id = tm.team_id
    WHERE tm.status = 'active'
    GROUP BY tm.team_id, api_stats.api_calls
    ON CONFLICT (metric_date, team_id) DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        total_projects = EXCLUDED.total_projects,
        completed_projects = EXCLUDED.completed_projects,
        workflows_generated = EXCLUDED.workflows_generated,
        api_calls = EXCLUDED.api_calls;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'AI Engineer Agent database migration completed successfully!';
    RAISE NOTICE 'Created tables: %, %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'),
        'Total indexes created: ' || (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
END $$;