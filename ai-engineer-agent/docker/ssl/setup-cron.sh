#!/bin/bash

# AI Engineer Agent - SSL Cron Jobs Setup Script
# Sets up automated certificate monitoring and renewal

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAIN=${1:-"your-domain.com"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Setup SSL monitoring and renewal cron jobs
setup_cron_jobs() {
    log "Setting up SSL certificate monitoring and renewal cron jobs..."
    
    # Create log directory
    mkdir -p /var/log/ssl
    
    # Get current crontab
    local current_cron=$(crontab -l 2>/dev/null || echo "")
    
    # Remove existing SSL-related cron jobs
    local new_cron=$(echo "${current_cron}" | grep -v "# AI Engineer Agent SSL" || echo "")
    
    # Add new cron jobs
    local ssl_cron_jobs="
# AI Engineer Agent SSL Certificate Monitoring and Renewal
# Check certificate expiry daily at 6 AM
0 6 * * * ${SCRIPT_DIR}/cert-monitor.sh --check ${DOMAIN} >> /var/log/ssl/monitor.log 2>&1

# Attempt certificate renewal twice daily at 2 AM and 2 PM
0 2,14 * * * ${SCRIPT_DIR}/auto-renew.sh >> /var/log/ssl/renewal.log 2>&1

# Weekly detailed monitoring report on Sundays at 8 AM
0 8 * * 0 ${SCRIPT_DIR}/cert-monitor.sh --report ${DOMAIN} >> /var/log/ssl/weekly-report.log 2>&1

# Monthly cleanup of old backups and logs on the 1st at 3 AM
0 3 1 * * find /backup/ssl -type d -name 'ssl-backup-*' -mtime +30 -exec rm -rf {} + 2>/dev/null && find /var/log/ssl -name '*.log' -mtime +90 -delete 2>/dev/null
"
    
    # Combine existing cron jobs (excluding SSL ones) with new SSL jobs
    local final_cron="${new_cron}${ssl_cron_jobs}"
    
    # Install new crontab
    echo "${final_cron}" | crontab -
    
    success "SSL cron jobs installed successfully"
    
    # Display installed jobs
    log "Installed cron jobs:"
    crontab -l | grep -A 10 "AI Engineer Agent SSL"
}

# Create SSL monitoring configuration
create_monitoring_config() {
    log "Creating SSL monitoring configuration..."
    
    local config_file="/etc/ssl-monitor.conf"
    
    cat > "${config_file}" << EOF
# AI Engineer Agent SSL Monitoring Configuration

# Domain to monitor
DOMAIN=${DOMAIN}

# Alert threshold in days
ALERT_THRESHOLD_DAYS=30

# Email settings
SSL_ALERT_EMAIL=${SSL_ALERT_EMAIL:-"admin@${DOMAIN}"}

# Slack webhook URL (optional)
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL:-""}

# Renewal settings
RENEWAL_THRESHOLD_DAYS=30

# Backup settings
BACKUP_RETENTION_DAYS=30

# Log settings
LOG_RETENTION_DAYS=90
EOF
    
    success "SSL monitoring configuration created at ${config_file}"
}

# Create systemd service for SSL monitoring (alternative to cron)
create_systemd_services() {
    if ! command -v systemctl &> /dev/null; then
        log "Systemd not available, skipping systemd service creation"
        return 0
    fi
    
    log "Creating systemd services for SSL management..."
    
    # SSL Certificate Monitor Service
    cat > /etc/systemd/system/ssl-cert-monitor.service << EOF
[Unit]
Description=SSL Certificate Monitor
After=network.target

[Service]
Type=oneshot
ExecStart=${SCRIPT_DIR}/cert-monitor.sh --check ${DOMAIN}
User=root
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # SSL Certificate Renewal Service
    cat > /etc/systemd/system/ssl-cert-renewal.service << EOF
[Unit]
Description=SSL Certificate Auto-Renewal
After=network.target

[Service]
Type=oneshot
ExecStart=${SCRIPT_DIR}/auto-renew.sh
User=root
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # SSL Certificate Monitor Timer
    cat > /etc/systemd/system/ssl-cert-monitor.timer << EOF
[Unit]
Description=Run SSL Certificate Monitor daily
Requires=ssl-cert-monitor.service

[Timer]
OnCalendar=daily
RandomizedDelaySec=1h
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    # SSL Certificate Renewal Timer
    cat > /etc/systemd/system/ssl-cert-renewal.timer << EOF
[Unit]
Description=Run SSL Certificate Renewal twice daily
Requires=ssl-cert-renewal.service

[Timer]
OnCalendar=*-*-* 02,14:00:00
RandomizedDelaySec=30min
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    # Reload systemd and enable timers
    systemctl daemon-reload
    systemctl enable ssl-cert-monitor.timer
    systemctl enable ssl-cert-renewal.timer
    systemctl start ssl-cert-monitor.timer
    systemctl start ssl-cert-renewal.timer
    
    success "Systemd services and timers created and enabled"
    
    # Show timer status
    systemctl list-timers | grep ssl-cert || true
}

# Install required dependencies
install_dependencies() {
    log "Checking and installing required dependencies..."
    
    # Check for required commands
    local missing_deps=()
    
    command -v openssl >/dev/null || missing_deps+=("openssl")
    command -v curl >/dev/null || missing_deps+=("curl")
    
    # Install certbot if not present and not in development
    if [[ "${DOMAIN}" != "localhost" ]] && ! command -v certbot >/dev/null; then
        missing_deps+=("certbot")
    fi
    
    # Install mail command for notifications
    if [[ -n "${SSL_ALERT_EMAIL}" ]] && ! command -v mail >/dev/null; then
        missing_deps+=("mailutils")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log "Installing missing dependencies: ${missing_deps[*]}"
        
        if command -v apt-get >/dev/null; then
            apt-get update
            apt-get install -y "${missing_deps[@]}"
        elif command -v yum >/dev/null; then
            yum install -y "${missing_deps[@]}"
        elif command -v apk >/dev/null; then
            apk add "${missing_deps[@]}"
        else
            warning "Could not automatically install dependencies. Please install manually: ${missing_deps[*]}"
        fi
    else
        success "All required dependencies are available"
    fi
}

# Test SSL monitoring setup
test_setup() {
    log "Testing SSL monitoring setup..."
    
    # Test certificate monitoring
    if "${SCRIPT_DIR}/cert-monitor.sh" --expiry "${DOMAIN}"; then
        success "Certificate monitoring test passed"
    else
        error "Certificate monitoring test failed"
        return 1
    fi
    
    # Test auto-renewal (check only)
    if "${SCRIPT_DIR}/auto-renew.sh" --check-only; then
        log "Auto-renewal check completed (renewal not needed)"
    else
        log "Auto-renewal check completed (renewal would be performed)"
    fi
    
    success "SSL monitoring setup test completed"
}

# Show help
show_help() {
    cat << EOF
AI Engineer Agent SSL Cron Jobs Setup

Usage: $0 [DOMAIN]

This script sets up automated SSL certificate monitoring and renewal using cron jobs.

Arguments:
    DOMAIN    Domain name to monitor (default: your-domain.com)

Environment Variables:
    SSL_ALERT_EMAIL       Email address for alerts
    SLACK_WEBHOOK_URL    Slack webhook URL for notifications

The script will install the following cron jobs:
- Daily certificate expiry check at 6 AM
- Twice-daily renewal attempts at 2 AM and 2 PM
- Weekly detailed monitoring report on Sundays at 8 AM
- Monthly cleanup of old backups and logs

Examples:
    $0 example.com
    $0 app.example.com
EOF
}

# Main execution
main() {
    if [[ "${1}" == "--help" || "${1}" == "-h" ]]; then
        show_help
        exit 0
    fi
    
    if [[ -n "${1}" ]]; then
        DOMAIN="${1}"
    fi
    
    log "Setting up SSL certificate automation for domain: ${DOMAIN}"
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Create monitoring configuration
    create_monitoring_config
    
    # Setup cron jobs
    setup_cron_jobs
    
    # Try to create systemd services as well (if available)
    create_systemd_services || log "Systemd services creation skipped"
    
    # Test the setup
    test_setup
    
    success "SSL certificate automation setup completed successfully!"
    
    log "Manual commands for SSL management:"
    log "  Monitor certificate: ${SCRIPT_DIR}/cert-monitor.sh --check ${DOMAIN}"
    log "  Force renewal: ${SCRIPT_DIR}/auto-renew.sh --force"
    log "  Generate report: ${SCRIPT_DIR}/cert-monitor.sh --report ${DOMAIN}"
    
    log "Log files:"
    log "  Monitor logs: /var/log/ssl/monitor.log"
    log "  Renewal logs: /var/log/ssl/renewal.log"
    log "  Weekly reports: /var/log/ssl/weekly-report.log"
}

# Run main function
main "$@"