-- Email Templates Migration
-- Creates tables for email template management with version control

-- Main email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    
    -- Template content
    subject TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    body_html TEXT,
    body_plain_text TEXT,
    
    -- Template variables and metadata
    variables JSONB NOT NULL DEFAULT '{}',
    default_values JSONB NOT NULL DEFAULT '{}',
    
    -- Settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    
    -- Tracking
    last_used_at TIMESTAMP,
    use_count INTEGER NOT NULL DEFAULT 0,
    
    -- Audit
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Version control
    version INTEGER NOT NULL DEFAULT 1,
    previous_version_id INTEGER REFERENCES email_templates(id)
);

-- Email template version history
CREATE TABLE IF NOT EXISTS email_template_versions (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES email_templates(id),
    version INTEGER NOT NULL,
    
    -- Snapshot of template at this version
    subject TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    body_html TEXT,
    variables JSONB NOT NULL DEFAULT '{}',
    
    -- Version metadata
    change_description TEXT,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email template usage logs
CREATE TABLE IF NOT EXISTS email_template_logs (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES email_templates(id),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_user_id UUID REFERENCES users(user_id),
    
    -- Email details
    subject TEXT NOT NULL,
    variables_used JSONB DEFAULT '{}',
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'sent', -- sent, failed, bounced, opened
    error_message TEXT,
    
    -- Tracking timestamps
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(key);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_updated_at ON email_templates(updated_at);

CREATE INDEX IF NOT EXISTS idx_email_template_versions_template_id ON email_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_email_template_versions_version ON email_template_versions(template_id, version);

CREATE INDEX IF NOT EXISTS idx_email_template_logs_template_id ON email_template_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_template_logs_recipient ON email_template_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_template_logs_status ON email_template_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_template_logs_sent_at ON email_template_logs(sent_at);

-- Insert default email templates
INSERT INTO email_templates (key, name, description, category, subject, body_markdown, variables, default_values, created_by, updated_by) VALUES 
('welcome_email', 'Welcome Email', 'Welcome new users to the platform', 'auth', 'Welcome to DegenTalk! 🚀', 
'# Welcome to DegenTalk, {{username}}!

Thanks for joining the most exciting crypto community on the internet! 

## What''s Next?

- **Explore the Forums**: Check out our different zones and start engaging with the community
- **Earn DGT Points**: Participate in discussions and earn rewards
- **Set Up Your Profile**: Add a bio, avatar, and connect your social accounts

## Quick Links

- [Forum Rules]({{base_url}}/rules)
- [Getting Started Guide]({{base_url}}/guide)
- [DGT Economy Info]({{base_url}}/economy)

Ready to become a legend? Let''s go! 🔥

---
*The DegenTalk Team*',
'[{"name": "username", "description": "User''s username", "required": true, "type": "string"}, {"name": "base_url", "description": "Site base URL", "required": true, "type": "string"}]',
'{"base_url": "https://degentalk.com"}',
NULL, NULL);

INSERT INTO email_templates (key, name, description, category, subject, body_markdown, variables, default_values, created_by, updated_by) VALUES 
('password_reset', 'Password Reset', 'Password reset email template', 'auth', 'Reset Your DegenTalk Password', 
'# Password Reset Request

Hi {{username}},

You''ve requested to reset your password for your DegenTalk account.

## Reset Your Password

Click the button below to reset your password. This link will expire in **{{expiry_hours}} hours**.

[Reset Password]({{reset_url}})

Or copy and paste this URL into your browser:
{{reset_url}}

## Security Notice

If you didn''t request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link will expire in {{expiry_hours}} hours.

---
*The DegenTalk Team*',
'[{"name": "username", "description": "User''s username", "required": true, "type": "string"}, {"name": "reset_url", "description": "Password reset URL", "required": true, "type": "string"}, {"name": "expiry_hours", "description": "Hours until link expires", "required": true, "type": "number"}]',
'{"expiry_hours": 24}',
NULL, NULL);

INSERT INTO email_templates (key, name, description, category, subject, body_markdown, variables, default_values, created_by, updated_by) VALUES 
('email_verification', 'Email Verification', 'Email address verification template', 'auth', 'Verify Your DegenTalk Email', 
'# Verify Your Email Address

Hi {{username}},

Please verify your email address to complete your DegenTalk registration.

## Verify Email

Click the button below to verify your email address:

[Verify Email]({{verification_url}})

Or copy and paste this URL into your browser:
{{verification_url}}

## Important

You need to verify your email to:
- Post in forums
- Receive notifications
- Access premium features

This verification link will expire in **{{expiry_hours}} hours**.

---
*The DegenTalk Team*',
'[{"name": "username", "description": "User''s username", "required": true, "type": "string"}, {"name": "verification_url", "description": "Email verification URL", "required": true, "type": "string"}, {"name": "expiry_hours", "description": "Hours until link expires", "required": true, "type": "number"}]',
'{"expiry_hours": 48}',
NULL, NULL);

-- Update timestamps trigger for email_templates
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();