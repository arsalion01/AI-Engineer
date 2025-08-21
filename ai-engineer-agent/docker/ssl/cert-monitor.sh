#!/bin/bash

# AI Engineer Agent - SSL Certificate Monitoring Script
# Monitors certificate expiration and sends alerts

set -e

# Configuration
CERT_DIR="/etc/nginx/ssl"
DOMAIN=${1:-localhost}
ALERT_THRESHOLD_DAYS=${2:-30}
EMAIL_RECIPIENTS=${SSL_ALERT_EMAIL:-"admin@example.com"}
SLACK_WEBHOOK=${SLACK_WEBHOOK_URL:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check certificate expiration
check_certificate_expiry() {
    local cert_file="${CERT_DIR}/fullchain.pem"
    local domain=${1:-localhost}
    
    if [[ ! -f "${cert_file}" ]]; then
        error "Certificate file not found: ${cert_file}"
        return 1
    fi
    
    log "Checking certificate expiry for ${domain}..."
    
    # Get certificate expiry date
    local expiry_date=$(openssl x509 -in "${cert_file}" -noout -enddate | cut -d= -f2)
    local expiry_timestamp=$(date -d "${expiry_date}" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    log "Certificate expires on: ${expiry_date}"
    log "Days until expiry: ${days_until_expiry}"
    
    # Check if certificate is expired
    if [[ ${days_until_expiry} -lt 0 ]]; then
        error "Certificate has EXPIRED!"
        send_alert "CRITICAL" "SSL Certificate for ${domain} has EXPIRED" "The SSL certificate expired $((-days_until_expiry)) days ago. Immediate action required!"
        return 2
    fi
    
    # Check if certificate is expiring soon
    if [[ ${days_until_expiry} -le ${ALERT_THRESHOLD_DAYS} ]]; then
        warning "Certificate expires in ${days_until_expiry} days!"
        send_alert "WARNING" "SSL Certificate for ${domain} expiring soon" "The SSL certificate will expire in ${days_until_expiry} days. Renewal recommended."
        return 1
    fi
    
    success "Certificate is valid for ${days_until_expiry} more days"
    return 0
}

# Check certificate chain validity
check_certificate_chain() {
    local cert_file="${CERT_DIR}/fullchain.pem"
    local domain=${1:-localhost}
    
    log "Checking certificate chain validity..."
    
    # Verify certificate chain
    if openssl verify -CAfile "${CERT_DIR}/chain.pem" "${cert_file}" >/dev/null 2>&1; then
        success "Certificate chain is valid"
        return 0
    else
        error "Certificate chain validation failed"
        send_alert "ERROR" "SSL Certificate chain invalid for ${domain}" "The certificate chain validation failed. Certificate may not be trusted by browsers."
        return 1
    fi
}

# Test SSL connection
test_ssl_connection() {
    local domain=${1:-localhost}
    local port=${2:-443}
    
    log "Testing SSL connection to ${domain}:${port}..."
    
    # Test SSL connection
    if timeout 10 openssl s_client -connect "${domain}:${port}" -servername "${domain}" </dev/null >/dev/null 2>&1; then
        success "SSL connection test successful"
        return 0
    else
        error "SSL connection test failed"
        send_alert "ERROR" "SSL Connection test failed for ${domain}" "Unable to establish SSL connection to ${domain}:${port}. Service may be down or misconfigured."
        return 1
    fi
}

# Check certificate revocation status
check_certificate_revocation() {
    local cert_file="${CERT_DIR}/fullchain.pem"
    local domain=${1:-localhost}
    
    log "Checking certificate revocation status..."
    
    # Extract OCSP URI from certificate
    local ocsp_uri=$(openssl x509 -in "${cert_file}" -noout -ocsp_uri 2>/dev/null)
    
    if [[ -z "${ocsp_uri}" ]]; then
        warning "No OCSP URI found in certificate"
        return 0
    fi
    
    # Check OCSP status
    if openssl ocsp -issuer "${CERT_DIR}/chain.pem" -cert "${cert_file}" -url "${ocsp_uri}" -noverify >/dev/null 2>&1; then
        success "Certificate is not revoked"
        return 0
    else
        error "Certificate revocation check failed or certificate is revoked"
        send_alert "CRITICAL" "SSL Certificate may be revoked for ${domain}" "The certificate revocation check failed or the certificate has been revoked."
        return 1
    fi
}

# Send alert via email
send_email_alert() {
    local severity=${1}
    local subject=${2}
    local message=${3}
    
    if [[ -z "${EMAIL_RECIPIENTS}" ]]; then
        log "No email recipients configured, skipping email alert"
        return 0
    fi
    
    # Check if mail command is available
    if ! command -v mail &> /dev/null; then
        log "Mail command not available, skipping email alert"
        return 0
    fi
    
    local email_body="
SSL Certificate Alert

Severity: ${severity}
Domain: ${DOMAIN}
Timestamp: $(date)

${message}

Server: $(hostname)
Certificate Path: ${CERT_DIR}/fullchain.pem

Please take appropriate action to resolve this issue.

---
AI Engineer Agent SSL Monitor
"
    
    echo "${email_body}" | mail -s "[${severity}] ${subject}" "${EMAIL_RECIPIENTS}"
    log "Email alert sent to ${EMAIL_RECIPIENTS}"
}

# Send alert via Slack
send_slack_alert() {
    local severity=${1}
    local subject=${2}
    local message=${3}
    
    if [[ -z "${SLACK_WEBHOOK}" ]]; then
        log "No Slack webhook configured, skipping Slack alert"
        return 0
    fi
    
    # Determine emoji based on severity
    local emoji="⚠️"
    case "${severity}" in
        "CRITICAL") emoji="🚨" ;;
        "ERROR") emoji="❌" ;;
        "WARNING") emoji="⚠️" ;;
    esac
    
    local slack_payload=$(cat <<EOF
{
  "text": "${emoji} SSL Certificate Alert",
  "attachments": [
    {
      "color": "$(case ${severity} in CRITICAL) echo 'danger' ;; ERROR) echo 'warning' ;; *) echo 'good' ;; esac)",
      "fields": [
        {
          "title": "Severity",
          "value": "${severity}",
          "short": true
        },
        {
          "title": "Domain",
          "value": "${DOMAIN}",
          "short": true
        },
        {
          "title": "Subject",
          "value": "${subject}",
          "short": false
        },
        {
          "title": "Message",
          "value": "${message}",
          "short": false
        },
        {
          "title": "Server",
          "value": "$(hostname)",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "$(date)",
          "short": true
        }
      ]
    }
  ]
}
EOF
)
    
    if curl -X POST -H 'Content-type: application/json' --data "${slack_payload}" "${SLACK_WEBHOOK}" >/dev/null 2>&1; then
        log "Slack alert sent successfully"
    else
        error "Failed to send Slack alert"
    fi
}

# Unified alert function
send_alert() {
    local severity=${1}
    local subject=${2}
    local message=${3}
    
    log "Sending ${severity} alert: ${subject}"
    
    # Send email alert
    send_email_alert "${severity}" "${subject}" "${message}"
    
    # Send Slack alert
    send_slack_alert "${severity}" "${subject}" "${message}"
}

# Generate monitoring report
generate_report() {
    local domain=${1:-localhost}
    local report_file="/tmp/ssl-monitor-report-$(date +%Y%m%d-%H%M%S).txt"
    
    log "Generating SSL monitoring report..."
    
    cat > "${report_file}" << EOF
AI Engineer Agent - SSL Certificate Monitoring Report
Generated: $(date)
Domain: ${domain}
Server: $(hostname)

========================================
Certificate Information
========================================
EOF
    
    if [[ -f "${CERT_DIR}/fullchain.pem" ]]; then
        echo "Certificate Details:" >> "${report_file}"
        openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -text | head -20 >> "${report_file}"
        echo "" >> "${report_file}"
        
        echo "Subject: $(openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -subject)" >> "${report_file}"
        echo "Issuer: $(openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -issuer)" >> "${report_file}"
        echo "Serial: $(openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -serial)" >> "${report_file}"
        echo "Not Before: $(openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -startdate)" >> "${report_file}"
        echo "Not After: $(openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -enddate)" >> "${report_file}"
    else
        echo "Certificate file not found: ${CERT_DIR}/fullchain.pem" >> "${report_file}"
    fi
    
    echo "" >> "${report_file}"
    echo "========================================" >> "${report_file}"
    echo "Monitoring Results" >> "${report_file}"
    echo "========================================" >> "${report_file}"
    
    # Run checks and capture results
    check_certificate_expiry "${domain}" >> "${report_file}" 2>&1
    check_certificate_chain "${domain}" >> "${report_file}" 2>&1
    test_ssl_connection "${domain}" >> "${report_file}" 2>&1
    check_certificate_revocation "${domain}" >> "${report_file}" 2>&1
    
    success "Report generated: ${report_file}"
    echo "${report_file}"
}

# Show help
show_help() {
    cat << EOF
AI Engineer Agent SSL Certificate Monitor

Usage: $0 [OPTIONS] [DOMAIN]

Options:
    --check         Perform all certificate checks
    --expiry        Check certificate expiry only
    --chain         Check certificate chain validity
    --connection    Test SSL connection
    --revocation    Check certificate revocation status
    --report        Generate detailed monitoring report
    --alert-days N  Set alert threshold in days (default: 30)
    --help          Show this help message

Environment Variables:
    SSL_ALERT_EMAIL     Email address for alerts
    SLACK_WEBHOOK_URL   Slack webhook URL for alerts

Examples:
    # Check all certificate aspects
    $0 --check yourdomain.com

    # Check expiry with custom threshold
    $0 --expiry --alert-days 7 yourdomain.com

    # Generate detailed report
    $0 --report yourdomain.com

    # Monitor with alerts (suitable for cron)
    $0 --check --alert-days 15 yourdomain.com
EOF
}

# Main execution
main() {
    local check_all=false
    local check_expiry=false
    local check_chain=false
    local check_connection=false
    local check_revocation=false
    local generate_report_flag=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check)
                check_all=true
                shift
                ;;
            --expiry)
                check_expiry=true
                shift
                ;;
            --chain)
                check_chain=true
                shift
                ;;
            --connection)
                check_connection=true
                shift
                ;;
            --revocation)
                check_revocation=true
                shift
                ;;
            --report)
                generate_report_flag=true
                shift
                ;;
            --alert-days)
                ALERT_THRESHOLD_DAYS="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                DOMAIN="$1"
                shift
                ;;
        esac
    done
    
    # Default to check all if no specific checks requested
    if [[ "${check_all}" == "false" && "${check_expiry}" == "false" && "${check_chain}" == "false" && "${check_connection}" == "false" && "${check_revocation}" == "false" && "${generate_report_flag}" == "false" ]]; then
        check_all=true
    fi
    
    log "Starting SSL certificate monitoring for domain: ${DOMAIN}"
    log "Alert threshold: ${ALERT_THRESHOLD_DAYS} days"
    
    local exit_code=0
    
    if [[ "${generate_report_flag}" == "true" ]]; then
        generate_report "${DOMAIN}"
        exit 0
    fi
    
    if [[ "${check_all}" == "true" || "${check_expiry}" == "true" ]]; then
        check_certificate_expiry "${DOMAIN}" || exit_code=$?
    fi
    
    if [[ "${check_all}" == "true" || "${check_chain}" == "true" ]]; then
        check_certificate_chain "${DOMAIN}" || exit_code=$?
    fi
    
    if [[ "${check_all}" == "true" || "${check_connection}" == "true" ]]; then
        test_ssl_connection "${DOMAIN}" || exit_code=$?
    fi
    
    if [[ "${check_all}" == "true" || "${check_revocation}" == "true" ]]; then
        check_certificate_revocation "${DOMAIN}" || exit_code=$?
    fi
    
    if [[ ${exit_code} -eq 0 ]]; then
        success "All SSL certificate checks passed"
    else
        error "Some SSL certificate checks failed (exit code: ${exit_code})"
    fi
    
    exit ${exit_code}
}

# Run main function with all arguments
main "$@"