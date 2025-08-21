#!/bin/bash

# AI Engineer Agent - Automated SSL Certificate Renewal Script
# Handles automatic certificate renewal with monitoring and fallback

set -e

# Configuration
CERT_DIR="/etc/nginx/ssl"
DOMAIN=${DOMAIN:-"localhost"}
CERT_EMAIL=${SSL_EMAIL:-"admin@${DOMAIN}"}
RENEWAL_THRESHOLD_DAYS=${RENEWAL_THRESHOLD_DAYS:-30}
BACKUP_DIR="/backup/ssl"
LOG_FILE="/var/log/ssl-renewal.log"

# Service management
NGINX_SERVICE="nginx"
DOCKER_NGINX_CONTAINER="nginx"

# Notification settings
EMAIL_RECIPIENTS=${SSL_ALERT_EMAIL:-"admin@${DOMAIN}"}
SLACK_WEBHOOK=${SLACK_WEBHOOK_URL:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function with file output
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}${message}${NC}"
    echo "${message}" >> "${LOG_FILE}"
}

error() {
    local message="[ERROR] $1"
    echo -e "${RED}${message}${NC}" >&2
    echo "${message}" >> "${LOG_FILE}"
}

success() {
    local message="[SUCCESS] $1"
    echo -e "${GREEN}${message}${NC}"
    echo "${message}" >> "${LOG_FILE}"
}

warning() {
    local message="[WARNING] $1"
    echo -e "${YELLOW}${message}${NC}"
    echo "${message}" >> "${LOG_FILE}"
}

# Initialize logging
init_logging() {
    mkdir -p "$(dirname "${LOG_FILE}")"
    touch "${LOG_FILE}"
    
    # Rotate log file if it gets too large (>10MB)
    if [[ -f "${LOG_FILE}" ]] && [[ $(stat -f%z "${LOG_FILE}" 2>/dev/null || stat -c%s "${LOG_FILE}") -gt 10485760 ]]; then
        mv "${LOG_FILE}" "${LOG_FILE}.old"
        touch "${LOG_FILE}"
        log "Log file rotated due to size"
    fi
}

# Check if certificate needs renewal
needs_renewal() {
    local cert_file="${CERT_DIR}/fullchain.pem"
    
    if [[ ! -f "${cert_file}" ]]; then
        log "Certificate file not found, renewal needed"
        return 0
    fi
    
    local expiry_date=$(openssl x509 -in "${cert_file}" -noout -enddate | cut -d= -f2)
    local expiry_timestamp=$(date -d "${expiry_date}" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    log "Certificate expires in ${days_until_expiry} days"
    
    if [[ ${days_until_expiry} -le ${RENEWAL_THRESHOLD_DAYS} ]]; then
        log "Certificate needs renewal (${days_until_expiry} days <= ${RENEWAL_THRESHOLD_DAYS} days)"
        return 0
    else
        log "Certificate does not need renewal yet"
        return 1
    fi
}

# Backup existing certificates
backup_certificates() {
    log "Creating certificate backup..."
    
    mkdir -p "${BACKUP_DIR}"
    local backup_name="ssl-backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    mkdir -p "${backup_path}"
    
    if [[ -f "${CERT_DIR}/fullchain.pem" ]]; then
        cp "${CERT_DIR}/fullchain.pem" "${backup_path}/"
        cp "${CERT_DIR}/privkey.pem" "${backup_path}/"
        [[ -f "${CERT_DIR}/chain.pem" ]] && cp "${CERT_DIR}/chain.pem" "${backup_path}/"
        
        # Create backup info file
        cat > "${backup_path}/backup_info.txt" << EOF
Backup Created: $(date)
Domain: ${DOMAIN}
Original Certificate Expiry: $(openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -enddate)
Backup Reason: Pre-renewal backup
Server: $(hostname)
EOF
        
        success "Certificates backed up to ${backup_path}"
        echo "${backup_path}"
        
        # Clean up old backups (keep last 10)
        cleanup_old_backups
    else
        warning "No existing certificates to backup"
    fi
}

# Clean up old certificate backups
cleanup_old_backups() {
    log "Cleaning up old certificate backups..."
    
    if [[ -d "${BACKUP_DIR}" ]]; then
        # Keep only the last 10 backups
        find "${BACKUP_DIR}" -maxdepth 1 -type d -name "ssl-backup-*" | sort -r | tail -n +11 | xargs -r rm -rf
        log "Old backups cleaned up"
    fi
}

# Renew certificate using Certbot
renew_certificate() {
    log "Starting certificate renewal for ${DOMAIN}..."
    
    # Check if certbot is available
    if ! command -v certbot &> /dev/null; then
        error "Certbot is not installed"
        return 1
    fi
    
    # Attempt renewal
    log "Running certbot renew..."
    if certbot renew --quiet --no-self-upgrade --deploy-hook "systemctl reload nginx" 2>> "${LOG_FILE}"; then
        success "Certbot renewal completed"
        
        # Update symbolic links if needed
        if [[ -d "/etc/letsencrypt/live/${DOMAIN}" ]]; then
            ln -sf "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "${CERT_DIR}/fullchain.pem"
            ln -sf "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" "${CERT_DIR}/privkey.pem"
            ln -sf "/etc/letsencrypt/live/${DOMAIN}/chain.pem" "${CERT_DIR}/chain.pem"
            log "Certificate links updated"
        fi
        
        return 0
    else
        error "Certbot renewal failed"
        return 1
    fi
}

# Reload web server
reload_web_server() {
    log "Reloading web server..."
    
    # Try different methods to reload nginx
    if command -v systemctl &> /dev/null; then
        # Systemd system
        if systemctl is-active --quiet nginx; then
            systemctl reload nginx
            success "Nginx reloaded via systemctl"
            return 0
        fi
    fi
    
    # Docker container
    if command -v docker &> /dev/null; then
        if docker ps --format "table {{.Names}}" | grep -q "${DOCKER_NGINX_CONTAINER}"; then
            docker exec "${DOCKER_NGINX_CONTAINER}" nginx -s reload
            success "Nginx reloaded in Docker container"
            return 0
        fi
    fi
    
    # Direct nginx command
    if command -v nginx &> /dev/null; then
        nginx -s reload
        success "Nginx reloaded directly"
        return 0
    fi
    
    error "Could not reload nginx - no suitable method found"
    return 1
}

# Verify renewal was successful
verify_renewal() {
    log "Verifying certificate renewal..."
    
    local cert_file="${CERT_DIR}/fullchain.pem"
    
    if [[ ! -f "${cert_file}" ]]; then
        error "Certificate file not found after renewal"
        return 1
    fi
    
    # Check certificate validity
    if ! openssl x509 -in "${cert_file}" -noout -text >/dev/null 2>&1; then
        error "Renewed certificate is invalid"
        return 1
    fi
    
    # Check expiry date
    local expiry_date=$(openssl x509 -in "${cert_file}" -noout -enddate | cut -d= -f2)
    local expiry_timestamp=$(date -d "${expiry_date}" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [[ ${days_until_expiry} -gt ${RENEWAL_THRESHOLD_DAYS} ]]; then
        success "Certificate renewal verified - expires in ${days_until_expiry} days"
        return 0
    else
        error "Renewed certificate still expires soon (${days_until_expiry} days)"
        return 1
    fi
}

# Test certificate with real connection
test_certificate() {
    log "Testing certificate with real connection..."
    
    # Test HTTPS connection
    if timeout 10 curl -s -I "https://${DOMAIN}" >/dev/null 2>&1; then
        success "HTTPS connection test successful"
        return 0
    else
        error "HTTPS connection test failed"
        return 1
    fi
}

# Restore from backup
restore_from_backup() {
    local backup_path=${1}
    
    if [[ -z "${backup_path}" ]]; then
        error "No backup path provided for restoration"
        return 1
    fi
    
    if [[ ! -d "${backup_path}" ]]; then
        error "Backup directory not found: ${backup_path}"
        return 1
    fi
    
    log "Restoring certificates from backup: ${backup_path}"
    
    cp "${backup_path}/fullchain.pem" "${CERT_DIR}/"
    cp "${backup_path}/privkey.pem" "${CERT_DIR}/"
    [[ -f "${backup_path}/chain.pem" ]] && cp "${backup_path}/chain.pem" "${CERT_DIR}/"
    
    # Set correct permissions
    chmod 600 "${CERT_DIR}/privkey.pem"
    chmod 644 "${CERT_DIR}/fullchain.pem" "${CERT_DIR}/chain.pem"
    
    # Reload nginx
    reload_web_server
    
    success "Certificates restored from backup"
}

# Send notification
send_notification() {
    local status=${1}
    local message=${2}
    local details=${3:-""}
    
    local subject="SSL Certificate Renewal ${status} - ${DOMAIN}"
    local full_message="${message}

Domain: ${DOMAIN}
Server: $(hostname)
Timestamp: $(date)
${details}

---
AI Engineer Agent SSL Auto-Renewal"
    
    # Send email if configured
    if [[ -n "${EMAIL_RECIPIENTS}" ]] && command -v mail &> /dev/null; then
        echo "${full_message}" | mail -s "${subject}" "${EMAIL_RECIPIENTS}"
        log "Email notification sent to ${EMAIL_RECIPIENTS}"
    fi
    
    # Send Slack notification if configured
    if [[ -n "${SLACK_WEBHOOK}" ]]; then
        local emoji="✅"
        local color="good"
        
        case "${status}" in
            "FAILED") emoji="❌"; color="danger" ;;
            "WARNING") emoji="⚠️"; color="warning" ;;
        esac
        
        local slack_payload=$(cat <<EOF
{
  "text": "${emoji} SSL Certificate Renewal ${status}",
  "attachments": [
    {
      "color": "${color}",
      "fields": [
        {
          "title": "Domain",
          "value": "${DOMAIN}",
          "short": true
        },
        {
          "title": "Status",
          "value": "${status}",
          "short": true
        },
        {
          "title": "Message",
          "value": "${message}",
          "short": false
        }
      ]
    }
  ]
}
EOF
)
        
        if curl -X POST -H 'Content-type: application/json' --data "${slack_payload}" "${SLACK_WEBHOOK}" >/dev/null 2>&1; then
            log "Slack notification sent"
        fi
    fi
}

# Main renewal process
run_renewal() {
    log "=== Starting SSL Certificate Renewal Process ==="
    log "Domain: ${DOMAIN}"
    log "Renewal threshold: ${RENEWAL_THRESHOLD_DAYS} days"
    
    local backup_path=""
    local renewal_needed=false
    
    # Check if renewal is needed
    if needs_renewal; then
        renewal_needed=true
        
        # Create backup
        backup_path=$(backup_certificates)
        
        # Attempt renewal
        if renew_certificate; then
            # Reload web server
            if reload_web_server; then
                # Verify renewal
                if verify_renewal && test_certificate; then
                    success "SSL certificate renewal completed successfully"
                    send_notification "SUCCESS" "SSL certificate has been successfully renewed"
                    return 0
                else
                    error "Certificate renewal verification failed"
                    # Restore backup if verification fails
                    if [[ -n "${backup_path}" ]]; then
                        restore_from_backup "${backup_path}"
                        send_notification "FAILED" "Certificate renewal failed verification, restored from backup" "Backup restored from: ${backup_path}"
                    else
                        send_notification "FAILED" "Certificate renewal failed verification, no backup available"
                    fi
                    return 1
                fi
            else
                error "Failed to reload web server after renewal"
                send_notification "FAILED" "Certificate renewed but failed to reload web server"
                return 1
            fi
        else
            error "Certificate renewal failed"
            send_notification "FAILED" "Certificate renewal process failed"
            return 1
        fi
    else
        log "Certificate renewal not needed at this time"
        return 0
    fi
}

# Show help
show_help() {
    cat << EOF
AI Engineer Agent SSL Certificate Auto-Renewal

Usage: $0 [OPTIONS]

Options:
    --force         Force renewal regardless of expiry date
    --check-only    Check if renewal is needed without performing it
    --test          Test certificate after renewal
    --restore PATH  Restore certificates from backup path
    --help          Show this help message

Environment Variables:
    DOMAIN                  Domain name for the certificate
    SSL_EMAIL              Email for Let's Encrypt registration
    RENEWAL_THRESHOLD_DAYS Days before expiry to renew (default: 30)
    SSL_ALERT_EMAIL        Email address for notifications
    SLACK_WEBHOOK_URL      Slack webhook URL for notifications

Examples:
    # Normal operation (suitable for cron)
    $0

    # Force renewal
    $0 --force

    # Check if renewal is needed
    $0 --check-only

    # Restore from backup
    $0 --restore /backup/ssl/ssl-backup-20231201-120000
EOF
}

# Main execution
main() {
    init_logging
    
    local force_renewal=false
    local check_only=false
    local test_only=false
    local restore_path=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force_renewal=true
                shift
                ;;
            --check-only)
                check_only=true
                shift
                ;;
            --test)
                test_only=true
                shift
                ;;
            --restore)
                restore_path="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Handle different modes
    if [[ -n "${restore_path}" ]]; then
        restore_from_backup "${restore_path}"
        exit $?
    fi
    
    if [[ "${test_only}" == "true" ]]; then
        test_certificate
        exit $?
    fi
    
    if [[ "${check_only}" == "true" ]]; then
        if needs_renewal; then
            echo "Renewal needed"
            exit 0
        else
            echo "Renewal not needed"
            exit 1
        fi
    fi
    
    if [[ "${force_renewal}" == "true" ]]; then
        RENEWAL_THRESHOLD_DAYS=365  # Force renewal by setting a high threshold
    fi
    
    # Run the main renewal process
    run_renewal
}

# Trap signals for clean exit
trap 'log "Renewal process interrupted"; exit 130' INT TERM

# Run main function with all arguments
main "$@"