-- Backup & Restore System Migration
-- Creates comprehensive backup and restore management tables

-- Main admin backups table
CREATE TABLE IF NOT EXISTS admin_backups (
    id SERIAL PRIMARY KEY,
    
    -- Backup identification
    filename VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Backup type and metadata
    backup_type VARCHAR(50) NOT NULL DEFAULT 'full', -- full, schema, selective
    source VARCHAR(50) NOT NULL DEFAULT 'manual', -- manual, scheduled
    
    -- File information
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0, -- Size in bytes
    checksum_md5 VARCHAR(32),
    compression_type VARCHAR(20) DEFAULT 'gzip',
    
    -- Operation details
    database_name VARCHAR(100) NOT NULL,
    postgres_version VARCHAR(50),
    backup_format VARCHAR(20) DEFAULT 'custom', -- custom, plain, tar
    
    -- Tables and schemas included (for selective backups)
    included_tables JSONB DEFAULT '[]', -- Array of table names
    included_schemas JSONB DEFAULT '["public"]', -- Array of schema names
    excluded_tables JSONB DEFAULT '[]', -- Array of excluded table names
    
    -- Status and timing
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER, -- Duration in seconds
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0,
    
    -- Audit trail
    created_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Retention and cleanup
    expires_at TIMESTAMP,
    is_protected BOOLEAN DEFAULT false, -- Protected from auto-deletion
    
    -- Tags and categorization
    tags JSONB DEFAULT '[]', -- Array of string tags
    metadata JSONB DEFAULT '{}' -- Additional metadata
);

-- Backup schedules table
CREATE TABLE IF NOT EXISTS backup_schedules (
    id SERIAL PRIMARY KEY,
    
    -- Schedule identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Schedule configuration
    cron_expression VARCHAR(100) NOT NULL, -- e.g., "0 2 * * *" for daily at 2 AM
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Backup configuration (inherits from admin_backups schema)
    backup_type VARCHAR(50) NOT NULL DEFAULT 'full',
    backup_format VARCHAR(20) DEFAULT 'custom',
    compression_type VARCHAR(20) DEFAULT 'gzip',
    included_tables JSONB DEFAULT '[]',
    included_schemas JSONB DEFAULT '["public"]',
    excluded_tables JSONB DEFAULT '[]',
    
    -- Retention policy
    retention_days INTEGER DEFAULT 30,
    max_backups INTEGER DEFAULT 10, -- Maximum number of backups to keep for this schedule
    
    -- Status and control
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    last_backup_id INTEGER REFERENCES admin_backups(id),
    
    -- Error tracking
    consecutive_failures INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Audit trail
    created_by UUID NOT NULL REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Notification settings
    notify_on_success BOOLEAN DEFAULT false,
    notify_on_failure BOOLEAN DEFAULT true,
    notification_emails JSONB DEFAULT '[]' -- Array of email addresses
);

-- Restore operations table
CREATE TABLE IF NOT EXISTS restore_operations (
    id SERIAL PRIMARY KEY,
    
    -- Operation identification
    operation_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Source backup information
    source_backup_id INTEGER NOT NULL REFERENCES admin_backups(id),
    source_filename VARCHAR(255) NOT NULL,
    
    -- Restore configuration
    restore_type VARCHAR(50) NOT NULL DEFAULT 'full', -- full, schema_only, data_only, selective
    target_database VARCHAR(100),
    
    -- Pre-restore backup (safety checkpoint)
    pre_restore_backup_id INTEGER REFERENCES admin_backups(id),
    create_pre_backup BOOLEAN DEFAULT true,
    
    -- Selective restore options
    included_tables JSONB DEFAULT '[]',
    excluded_tables JSONB DEFAULT '[]',
    include_indexes BOOLEAN DEFAULT true,
    include_constraints BOOLEAN DEFAULT true,
    include_triggers BOOLEAN DEFAULT true,
    
    -- Operation status and timing
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, pre_backup, restoring, completed, failed, cancelled
    started_at TIMESTAMP,
    pre_backup_completed_at TIMESTAMP,
    restore_started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER, -- Total duration in seconds
    
    -- Progress tracking
    progress_percent INTEGER DEFAULT 0,
    current_step VARCHAR(100),
    estimated_time_remaining INTEGER, -- Seconds
    
    -- Results and statistics
    tables_restored INTEGER DEFAULT 0,
    rows_restored BIGINT DEFAULT 0,
    data_size BIGINT DEFAULT 0,
    
    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    error_step VARCHAR(100),
    can_rollback BOOLEAN DEFAULT true,
    
    -- Audit and security
    initiated_by UUID NOT NULL REFERENCES users(user_id),
    approved_by UUID REFERENCES users(user_id), -- For critical restore operations
    confirmation_token VARCHAR(100),
    confirmation_expires_at TIMESTAMP,
    
    -- Audit trail
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Warnings and validations
    validation_warnings JSONB DEFAULT '[]', -- Array of warning messages
    impact_assessment JSONB DEFAULT '{}', -- Estimated impact on system
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Backup settings table
CREATE TABLE IF NOT EXISTS backup_settings (
    id SERIAL PRIMARY KEY,
    
    -- Storage configuration
    storage_location TEXT NOT NULL DEFAULT '/var/backups/degentalk',
    max_storage_size BIGINT DEFAULT 107374182400, -- 100 GB in bytes
    compression_level INTEGER DEFAULT 6, -- gzip compression level 1-9
    
    -- Default retention policies
    default_retention_days INTEGER DEFAULT 30,
    max_manual_backups INTEGER DEFAULT 50,
    max_scheduled_backups INTEGER DEFAULT 100,
    
    -- Security and permissions
    require_approval_for_restore BOOLEAN DEFAULT true,
    allowed_restore_roles JSONB DEFAULT '["admin"]', -- Array of role names
    allowed_backup_roles JSONB DEFAULT '["admin", "mod"]',
    
    -- Notification settings
    default_notification_emails JSONB DEFAULT '[]',
    notify_on_large_backups BOOLEAN DEFAULT true,
    large_backup_threshold_mb INTEGER DEFAULT 1000,
    
    -- Performance settings
    connection_timeout INTEGER DEFAULT 30, -- Seconds
    command_timeout INTEGER DEFAULT 3600, -- Seconds (1 hour)
    max_concurrent_operations INTEGER DEFAULT 2,
    
    -- Cleanup settings
    cleanup_frequency VARCHAR(50) DEFAULT 'daily', -- daily, weekly
    cleanup_time VARCHAR(10) DEFAULT '02:00', -- Time in HH:MM format
    auto_cleanup_enabled BOOLEAN DEFAULT true,
    
    -- System information
    last_cleanup_at TIMESTAMP,
    disk_usage BIGINT DEFAULT 0, -- Current backup storage usage in bytes
    
    -- Audit trail
    updated_by UUID REFERENCES users(user_id),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance

-- Admin backups indices
CREATE INDEX IF NOT EXISTS idx_admin_backups_status ON admin_backups(status);
CREATE INDEX IF NOT EXISTS idx_admin_backups_backup_type ON admin_backups(backup_type);
CREATE INDEX IF NOT EXISTS idx_admin_backups_source ON admin_backups(source);
CREATE INDEX IF NOT EXISTS idx_admin_backups_created_at ON admin_backups(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_backups_created_by ON admin_backups(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_backups_filename ON admin_backups(filename);
CREATE INDEX IF NOT EXISTS idx_admin_backups_expires_at ON admin_backups(expires_at);

-- Full-text search on backup names and descriptions
CREATE INDEX IF NOT EXISTS idx_admin_backups_search_gin 
ON admin_backups USING gin(to_tsvector('english', display_name || ' ' || COALESCE(description, '')));

-- Backup schedules indices
CREATE INDEX IF NOT EXISTS idx_backup_schedules_is_active ON backup_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_next_run ON backup_schedules(next_run_at);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_created_by ON backup_schedules(created_by);
CREATE INDEX IF NOT EXISTS idx_backup_schedules_backup_type ON backup_schedules(backup_type);

-- Restore operations indices
CREATE INDEX IF NOT EXISTS idx_restore_operations_operation_id ON restore_operations(operation_id);
CREATE INDEX IF NOT EXISTS idx_restore_operations_status ON restore_operations(status);
CREATE INDEX IF NOT EXISTS idx_restore_operations_initiated_by ON restore_operations(initiated_by);
CREATE INDEX IF NOT EXISTS idx_restore_operations_source_backup ON restore_operations(source_backup_id);
CREATE INDEX IF NOT EXISTS idx_restore_operations_created_at ON restore_operations(created_at);

-- Backup settings - no additional indices needed (single row table)

-- Insert default backup settings
INSERT INTO backup_settings (id) VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- Create triggers for automatic timestamp updates

-- Backup schedules updated_at trigger
CREATE OR REPLACE FUNCTION update_backup_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_schedules_updated_at
    BEFORE UPDATE ON backup_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_backup_schedules_updated_at();

-- Backup settings updated_at trigger
CREATE OR REPLACE FUNCTION update_backup_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_backup_settings_updated_at
    BEFORE UPDATE ON backup_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_backup_settings_updated_at();