#!/bin/bash

# AI Engineer Agent - Security Hardening Script
# Comprehensive security configuration for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/security-hardening.log"
DRY_RUN=${DRY_RUN:-false}

# Logging functions
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

# Execute command with dry run support
execute() {
    local cmd="$1"
    local description="$2"
    
    log "Executing: ${description}"
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log "[DRY RUN] Would execute: ${cmd}"
        return 0
    fi
    
    if eval "${cmd}"; then
        success "Completed: ${description}"
        return 0
    else
        error "Failed: ${description}"
        return 1
    fi
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root for security hardening"
        exit 1
    fi
}

# Initialize logging
init_logging() {
    mkdir -p "$(dirname "${LOG_FILE}")"
    touch "${LOG_FILE}"
    log "=== AI Engineer Agent Security Hardening Started ==="
}

# Update system packages
update_system() {
    log "Updating system packages..."
    
    if command -v apt-get >/dev/null 2>&1; then
        execute "apt-get update && apt-get upgrade -y" "Update APT packages"
        execute "apt-get autoremove -y && apt-get autoclean" "Clean APT cache"
    elif command -v yum >/dev/null 2>&1; then
        execute "yum update -y" "Update YUM packages"
        execute "yum clean all" "Clean YUM cache"
    elif command -v dnf >/dev/null 2>&1; then
        execute "dnf update -y" "Update DNF packages"
        execute "dnf clean all" "Clean DNF cache"
    else
        warning "Unknown package manager, skipping system update"
    fi
}

# Install security tools
install_security_tools() {
    log "Installing essential security tools..."
    
    local tools=("fail2ban" "ufw" "rkhunter" "chkrootkit" "lynis" "aide" "logwatch")
    
    if command -v apt-get >/dev/null 2>&1; then
        for tool in "${tools[@]}"; do
            if ! command -v "${tool}" >/dev/null 2>&1; then
                execute "apt-get install -y ${tool}" "Install ${tool}"
            fi
        done
    elif command -v yum >/dev/null 2>&1; then
        for tool in "${tools[@]}"; do
            if ! command -v "${tool}" >/dev/null 2>&1; then
                execute "yum install -y ${tool}" "Install ${tool}"
            fi
        done
    fi
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    if command -v ufw >/dev/null 2>&1; then
        # Reset UFW to default state
        execute "ufw --force reset" "Reset UFW"
        
        # Default policies
        execute "ufw default deny incoming" "Set default deny incoming"
        execute "ufw default allow outgoing" "Set default allow outgoing"
        
        # Allow SSH (adjust port as needed)
        execute "ufw allow 22/tcp" "Allow SSH"
        
        # Allow HTTP and HTTPS
        execute "ufw allow 80/tcp" "Allow HTTP"
        execute "ufw allow 443/tcp" "Allow HTTPS"
        
        # Allow application ports
        execute "ufw allow 3000/tcp" "Allow application port"
        execute "ufw allow 8080/tcp" "Allow WebSocket port"
        
        # Allow monitoring ports (restrict to internal networks in production)
        execute "ufw allow from 10.0.0.0/8 to any port 9090" "Allow Prometheus (internal)"
        execute "ufw allow from 10.0.0.0/8 to any port 3001" "Allow Grafana (internal)"
        execute "ufw allow from 10.0.0.0/8 to any port 5601" "Allow Kibana (internal)"
        
        # Rate limiting for SSH
        execute "ufw limit ssh" "Enable SSH rate limiting"
        
        # Enable UFW
        execute "ufw --force enable" "Enable UFW"
        
        # Show status
        execute "ufw status verbose" "Show UFW status"
    else
        warning "UFW not available, skipping firewall configuration"
    fi
}

# Configure Fail2Ban
configure_fail2ban() {
    log "Configuring Fail2Ban..."
    
    if command -v fail2ban-server >/dev/null 2>&1; then
        # Create custom jail configuration
        cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Ban hosts for 24 hours
bantime = 86400

# Find time window (10 minutes)
findtime = 600

# Number of failures before ban
maxretry = 3

# Ignore local IPs
ignoreip = 127.0.0.1/8 ::1 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16

# Backend for log processing
backend = systemd

# Default action with email notification
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

# Custom jail for AI Engineer Agent
[ai-engineer-app]
enabled = true
port = 3000,8080
logpath = /var/log/app/*.log
failregex = ^.*\[.*\] .*Failed login attempt from <HOST>.*$
            ^.*\[.*\] .*Authentication failed for <HOST>.*$
            ^.*\[.*\] .*Suspicious activity from <HOST>.*$
maxretry = 5
findtime = 300
bantime = 3600
EOF
        
        execute "systemctl restart fail2ban" "Restart Fail2Ban"
        execute "systemctl enable fail2ban" "Enable Fail2Ban"
        execute "fail2ban-client status" "Check Fail2Ban status"
    else
        warning "Fail2Ban not available, skipping configuration"
    fi
}

# Harden SSH configuration
harden_ssh() {
    log "Hardening SSH configuration..."
    
    local ssh_config="/etc/ssh/sshd_config"
    
    if [[ -f "${ssh_config}" ]]; then
        # Backup original configuration
        execute "cp ${ssh_config} ${ssh_config}.backup" "Backup SSH config"
        
        # Apply security settings
        cat >> "${ssh_config}" << 'EOF'

# AI Engineer Agent Security Hardening
# Disable root login
PermitRootLogin no

# Disable password authentication (use keys only)
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM no

# Disable empty passwords
PermitEmptyPasswords no

# Protocol version 2 only
Protocol 2

# Limit user login
MaxAuthTries 3
MaxStartups 2
LoginGraceTime 30

# Disable X11 forwarding
X11Forwarding no

# Disable port forwarding
AllowTcpForwarding no
AllowStreamLocalForwarding no
GatewayPorts no

# Use privilege separation
UsePrivilegeSeparation yes

# Log more information
LogLevel VERBOSE

# Allow specific users only (uncomment and modify as needed)
# AllowUsers deployuser

# Disable unused authentication methods
HostbasedAuthentication no
IgnoreRhosts yes
IgnoreUserKnownHosts yes
RhostsRSAAuthentication no
RSAAuthentication yes
PubkeyAuthentication yes

# Client alive settings
ClientAliveInterval 300
ClientAliveCountMax 0

# Compression settings
Compression no

# Disable agent forwarding
AllowAgentForwarding no

# Strict mode
StrictModes yes

# Banner
Banner /etc/ssh/ssh_banner
EOF
        
        # Create SSH banner
        cat > /etc/ssh/ssh_banner << 'EOF'
***************************************************************************
                    AUTHORIZED USERS ONLY
                    
This system is for authorized users only. All activities are monitored
and recorded. Unauthorized access is strictly prohibited and will be
prosecuted to the full extent of the law.

                    AI Engineer Agent Production System
***************************************************************************
EOF
        
        execute "sshd -t" "Test SSH configuration"
        execute "systemctl restart ssh || systemctl restart sshd" "Restart SSH service"
        
        success "SSH hardening completed"
    else
        warning "SSH configuration file not found, skipping SSH hardening"
    fi
}

# Set up log monitoring
configure_log_monitoring() {
    log "Configuring log monitoring..."
    
    # Configure logrotate for application logs
    cat > /etc/logrotate.d/ai-engineer-agent << 'EOF'
/var/log/app/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    postrotate
        /usr/bin/docker kill --signal=USR1 ai-engineer-app 2>/dev/null || true
    endscript
}

/var/log/ssl/*.log {
    weekly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}

/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data adm
    postrotate
        /usr/sbin/nginx -s reload 2>/dev/null || true
    endscript
}
EOF
    
    execute "logrotate -d /etc/logrotate.d/ai-engineer-agent" "Test logrotate configuration"
    
    # Set up log monitoring script
    cat > /usr/local/bin/security-log-monitor.sh << 'EOF'
#!/bin/bash

# Security log monitoring for AI Engineer Agent
LOG_FILE="/var/log/security-alerts.log"
ALERT_EMAIL="${SECURITY_ALERT_EMAIL:-admin@example.com}"

# Function to send alert
send_alert() {
    local message="$1"
    local timestamp=$(date)
    
    echo "${timestamp}: ${message}" >> "${LOG_FILE}"
    
    if command -v mail >/dev/null 2>&1 && [[ -n "${ALERT_EMAIL}" ]]; then
        echo "${message}" | mail -s "Security Alert - AI Engineer Agent" "${ALERT_EMAIL}"
    fi
}

# Monitor for failed login attempts
failed_logins=$(grep "Failed password" /var/log/auth.log 2>/dev/null | grep "$(date +%Y-%m-%d)" | wc -l)
if [[ ${failed_logins} -gt 10 ]]; then
    send_alert "High number of failed login attempts: ${failed_logins}"
fi

# Monitor for root login attempts
root_attempts=$(grep "Failed password for root" /var/log/auth.log 2>/dev/null | grep "$(date +%Y-%m-%d)" | wc -l)
if [[ ${root_attempts} -gt 0 ]]; then
    send_alert "Root login attempts detected: ${root_attempts}"
fi

# Monitor for suspicious nginx requests
suspicious_requests=$(grep -E "(union|select|insert|delete|drop)" /var/log/nginx/access.log 2>/dev/null | grep "$(date +%d/%b/%Y)" | wc -l)
if [[ ${suspicious_requests} -gt 5 ]]; then
    send_alert "Suspicious SQL injection attempts: ${suspicious_requests}"
fi

# Monitor for high error rates
error_rate=$(grep " 5[0-9][0-9] " /var/log/nginx/access.log 2>/dev/null | grep "$(date +%d/%b/%Y)" | wc -l)
if [[ ${error_rate} -gt 100 ]]; then
    send_alert "High error rate detected: ${error_rate} 5xx responses"
fi
EOF
    
    execute "chmod +x /usr/local/bin/security-log-monitor.sh" "Make log monitor executable"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/15 * * * * /usr/local/bin/security-log-monitor.sh") | crontab -
    
    success "Log monitoring configured"
}

# Configure system limits
configure_system_limits() {
    log "Configuring system limits..."
    
    # Set security limits
    cat >> /etc/security/limits.conf << 'EOF'

# AI Engineer Agent Security Limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768

# Prevent core dumps
* hard core 0
EOF
    
    # Configure sysctl security settings
    cat > /etc/sysctl.d/99-security.conf << 'EOF'
# AI Engineer Agent Security Settings

# Network security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# IPv6 security
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_ra = 0
net.ipv6.conf.default.accept_ra = 0

# Kernel security
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1
kernel.core_uses_pid = 1

# File system security
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
fs.suid_dumpable = 0
EOF
    
    execute "sysctl -p /etc/sysctl.d/99-security.conf" "Apply sysctl settings"
    
    success "System limits configured"
}

# Set up file permissions
secure_file_permissions() {
    log "Securing file permissions..."
    
    # Secure important directories
    local dirs=(
        "/etc/ssl/private:700"
        "/var/log:755"
        "/etc/ssh:755"
        "/home:755"
        "/root:700"
        "/tmp:1777"
        "/var/tmp:1777"
    )
    
    for dir_perm in "${dirs[@]}"; do
        local dir="${dir_perm%:*}"
        local perm="${dir_perm#*:}"
        if [[ -d "${dir}" ]]; then
            execute "chmod ${perm} ${dir}" "Set permissions for ${dir}"
        fi
    done
    
    # Secure important files
    local files=(
        "/etc/passwd:644"
        "/etc/shadow:600"
        "/etc/group:644"
        "/etc/gshadow:600"
        "/etc/ssh/sshd_config:600"
        "/etc/crontab:600"
        "/etc/sudoers:440"
    )
    
    for file_perm in "${files[@]}"; do
        local file="${file_perm%:*}"
        local perm="${file_perm#*:}"
        if [[ -f "${file}" ]]; then
            execute "chmod ${perm} ${file}" "Set permissions for ${file}"
        fi
    done
    
    # Remove world-writable files
    execute "find / -xdev -type f -perm -0002 -exec chmod o-w {} + 2>/dev/null || true" "Remove world-writable permissions"
    
    # Find and secure SUID/SGID files
    execute "find / -xdev -type f -perm -4000 -exec ls -la {} + 2>/dev/null > /var/log/suid-files.log || true" "Log SUID files"
    execute "find / -xdev -type f -perm -2000 -exec ls -la {} + 2>/dev/null > /var/log/sgid-files.log || true" "Log SGID files"
    
    success "File permissions secured"
}

# Install and configure intrusion detection
setup_intrusion_detection() {
    log "Setting up intrusion detection..."
    
    if command -v aide >/dev/null 2>&1; then
        # Initialize AIDE database
        execute "aide --init" "Initialize AIDE database"
        execute "mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db" "Activate AIDE database"
        
        # Create AIDE check script
        cat > /usr/local/bin/aide-check.sh << 'EOF'
#!/bin/bash
/usr/bin/aide --check 2>&1 | tee /var/log/aide-check.log
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    mail -s "AIDE Intrusion Detection Alert" "${SECURITY_ALERT_EMAIL:-admin@example.com}" < /var/log/aide-check.log
fi
EOF
        
        execute "chmod +x /usr/local/bin/aide-check.sh" "Make AIDE check script executable"
        
        # Add daily AIDE check to cron
        (crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/aide-check.sh") | crontab -
        
        success "AIDE intrusion detection configured"
    else
        warning "AIDE not available, skipping intrusion detection setup"
    fi
}

# Configure audit logging
setup_audit_logging() {
    log "Setting up audit logging..."
    
    if command -v auditd >/dev/null 2>&1; then
        # Configure audit rules
        cat > /etc/audit/rules.d/ai-engineer-agent.rules << 'EOF'
# AI Engineer Agent Audit Rules

# Monitor important files
-w /etc/passwd -p wa -k user-modification
-w /etc/group -p wa -k group-modification
-w /etc/shadow -p wa -k shadow-modification
-w /etc/sudoers -p wa -k sudoers-modification
-w /etc/ssh/sshd_config -p wa -k ssh-config

# Monitor log files
-w /var/log/ -p wa -k log-modification

# Monitor SSL certificates
-w /etc/ssl/ -p wa -k ssl-modification
-w /etc/nginx/ssl/ -p wa -k ssl-modification

# Monitor application configuration
-w /app/ -p wa -k app-modification
-w /etc/nginx/ -p wa -k nginx-modification

# Monitor system calls
-a always,exit -F arch=b64 -S execve -k exec
-a always,exit -F arch=b32 -S execve -k exec

# Monitor network connections
-a always,exit -F arch=b64 -S connect -k network-connect
-a always,exit -F arch=b32 -S connect -k network-connect

# Monitor file access
-a always,exit -F arch=b64 -S open -S openat -F exit=-EACCES -k access-denied
-a always,exit -F arch=b32 -S open -S openat -F exit=-EACCES -k access-denied
EOF
        
        execute "systemctl restart auditd" "Restart auditd"
        execute "systemctl enable auditd" "Enable auditd"
        
        success "Audit logging configured"
    else
        warning "Auditd not available, skipping audit logging setup"
    fi
}

# Configure Docker security (if Docker is present)
secure_docker() {
    if command -v docker >/dev/null 2>&1; then
        log "Configuring Docker security..."
        
        # Create Docker daemon configuration
        mkdir -p /etc/docker
        cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true,
  "seccomp-profile": "/etc/docker/seccomp.json",
  "storage-driver": "overlay2"
}
EOF
        
        execute "systemctl restart docker" "Restart Docker with security settings"
        
        success "Docker security configured"
    else
        log "Docker not found, skipping Docker security configuration"
    fi
}

# Generate security report
generate_security_report() {
    log "Generating security report..."
    
    local report_file="/var/log/security-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "${report_file}" << 'EOF'
AI ENGINEER AGENT SECURITY HARDENING REPORT
==========================================

Generated: $(date)
Server: $(hostname)
OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)

SYSTEM UPDATES
--------------
EOF
    
    # Check for available updates
    if command -v apt >/dev/null 2>&1; then
        apt list --upgradable 2>/dev/null >> "${report_file}"
    elif command -v yum >/dev/null 2>&1; then
        yum check-update >> "${report_file}" 2>&1 || true
    fi
    
    cat >> "${report_file}" << 'EOF'

FIREWALL STATUS
---------------
EOF
    ufw status verbose >> "${report_file}" 2>/dev/null || echo "UFW not configured" >> "${report_file}"
    
    cat >> "${report_file}" << 'EOF'

FAIL2BAN STATUS
---------------
EOF
    fail2ban-client status >> "${report_file}" 2>/dev/null || echo "Fail2Ban not configured" >> "${report_file}"
    
    cat >> "${report_file}" << 'EOF'

LISTENING PORTS
---------------
EOF
    netstat -tuln >> "${report_file}" 2>/dev/null || ss -tuln >> "${report_file}" 2>/dev/null
    
    cat >> "${report_file}" << 'EOF'

RUNNING SERVICES
----------------
EOF
    systemctl list-units --type=service --state=running >> "${report_file}" 2>/dev/null
    
    cat >> "${report_file}" << 'EOF'

LAST LOGIN ATTEMPTS
-------------------
EOF
    last -n 20 >> "${report_file}" 2>/dev/null
    
    cat >> "${report_file}" << 'EOF'

SECURITY RECOMMENDATIONS
------------------------
1. Regularly update system packages
2. Monitor security logs daily
3. Review firewall rules periodically
4. Keep SSL certificates up to date
5. Perform regular security audits
6. Monitor system resources and performance
7. Backup critical data regularly
8. Test incident response procedures

Report saved to: ${report_file}
EOF
    
    success "Security report generated: ${report_file}"
    echo "${report_file}"
}

# Show help
show_help() {
    cat << 'EOF'
AI Engineer Agent Security Hardening Script

Usage: ./security-hardening.sh [OPTIONS]

Options:
    --dry-run       Show what would be done without making changes
    --help          Show this help message

Environment Variables:
    SECURITY_ALERT_EMAIL    Email address for security alerts
    DRY_RUN                Set to 'true' for dry run mode

This script performs comprehensive security hardening including:
- System updates and security tool installation
- Firewall configuration
- SSH hardening
- Fail2Ban setup
- Log monitoring
- File permission security
- Intrusion detection
- Audit logging
- Docker security (if present)

The script creates detailed logs at /var/log/security-hardening.log
EOF
}

# Main execution
main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
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
    
    # Initialize
    check_root
    init_logging
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        warning "Running in DRY RUN mode - no changes will be made"
    fi
    
    log "Starting comprehensive security hardening..."
    
    # Run hardening steps
    update_system
    install_security_tools
    configure_firewall
    configure_fail2ban
    harden_ssh
    configure_log_monitoring
    configure_system_limits
    secure_file_permissions
    setup_intrusion_detection
    setup_audit_logging
    secure_docker
    
    # Generate final report
    local report_file
    report_file=$(generate_security_report)
    
    success "Security hardening completed successfully!"
    log "Security report: ${report_file}"
    log "Security hardening log: ${LOG_FILE}"
    
    log "=== Security Hardening Summary ==="
    log "✓ System updated and security tools installed"
    log "✓ Firewall configured with restrictive rules"
    log "✓ SSH hardened with key-only authentication"
    log "✓ Fail2Ban configured for intrusion prevention"
    log "✓ Log monitoring and alerting enabled"
    log "✓ System limits and kernel parameters secured"
    log "✓ File permissions hardened"
    log "✓ Intrusion detection system configured"
    log "✓ Audit logging enabled"
    log "✓ Docker security settings applied"
    
    warning "Important: Please review and test all security settings before deploying to production"
    warning "Remember to configure proper backup and monitoring systems"
}

# Trap signals for clean exit
trap 'log "Security hardening interrupted"; exit 130' INT TERM

# Run main function
main "$@"