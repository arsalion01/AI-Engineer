#!/bin/bash

# AI Engineer Agent - SSL Certificate Management Script
# Generates self-signed certificates for local development and manages Let's Encrypt certificates for production

set -e

DOMAIN=${1:-localhost}
SSL_DIR="/etc/nginx/ssl"
CERT_EMAIL=${SSL_EMAIL:-admin@${DOMAIN}}

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

# Check if running in production
is_production() {
    [[ "${NODE_ENV}" == "production" || "${1}" == "--production" ]]
}

# Generate self-signed certificate for local development
generate_self_signed() {
    local domain=${1:-localhost}
    
    log "Generating self-signed certificate for domain: ${domain}"
    
    # Create SSL directory if it doesn't exist
    mkdir -p "${SSL_DIR}"
    
    # Generate private key
    openssl genrsa -out "${SSL_DIR}/privkey.pem" 2048
    
    # Generate certificate signing request
    openssl req -new -key "${SSL_DIR}/privkey.pem" -out "${SSL_DIR}/cert.csr" -subj "/C=US/ST=CA/L=San Francisco/O=AI Engineer Agent/CN=${domain}"
    
    # Generate self-signed certificate
    openssl x509 -req -in "${SSL_DIR}/cert.csr" -signkey "${SSL_DIR}/privkey.pem" -out "${SSL_DIR}/fullchain.pem" -days 365 \
        -extensions v3_req -extfile <(cat <<EOF
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${domain}
DNS.2 = www.${domain}
DNS.3 = localhost
DNS.4 = *.${domain}
IP.1 = 127.0.0.1
IP.2 = ::1
EOF
)
    
    # Create chain file (same as fullchain for self-signed)
    cp "${SSL_DIR}/fullchain.pem" "${SSL_DIR}/chain.pem"
    
    # Set proper permissions
    chmod 600 "${SSL_DIR}/privkey.pem"
    chmod 644 "${SSL_DIR}/fullchain.pem" "${SSL_DIR}/chain.pem"
    
    # Clean up CSR
    rm -f "${SSL_DIR}/cert.csr"
    
    success "Self-signed certificate generated successfully for ${domain}"
    log "Certificate files:"
    log "  - Private Key: ${SSL_DIR}/privkey.pem"
    log "  - Certificate: ${SSL_DIR}/fullchain.pem"
    log "  - Chain: ${SSL_DIR}/chain.pem"
}

# Setup Let's Encrypt certificate for production
setup_letsencrypt() {
    local domain=${1}
    local email=${2:-$CERT_EMAIL}
    
    if [[ -z "${domain}" || "${domain}" == "localhost" ]]; then
        error "Production domain is required for Let's Encrypt certificate"
        exit 1
    fi
    
    log "Setting up Let's Encrypt certificate for domain: ${domain}"
    log "Email: ${email}"
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        if command -v apt-get &> /dev/null; then
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        elif command -v yum &> /dev/null; then
            yum install -y certbot python3-certbot-nginx
        else
            error "Unable to install certbot. Please install it manually."
            exit 1
        fi
    fi
    
    # Backup existing certificates
    if [[ -f "${SSL_DIR}/fullchain.pem" ]]; then
        log "Backing up existing certificates..."
        mv "${SSL_DIR}/fullchain.pem" "${SSL_DIR}/fullchain.pem.backup.$(date +%s)"
        mv "${SSL_DIR}/privkey.pem" "${SSL_DIR}/privkey.pem.backup.$(date +%s)"
    fi
    
    # Create webroot directory for ACME challenge
    mkdir -p /var/www/certbot
    
    # Generate certificate using webroot method
    log "Requesting certificate from Let's Encrypt..."
    certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "${email}" \
        --agree-tos \
        --no-eff-email \
        --domains "${domain},www.${domain}" \
        --non-interactive
    
    # Link certificates to nginx directory
    ln -sf "/etc/letsencrypt/live/${domain}/fullchain.pem" "${SSL_DIR}/fullchain.pem"
    ln -sf "/etc/letsencrypt/live/${domain}/privkey.pem" "${SSL_DIR}/privkey.pem"
    ln -sf "/etc/letsencrypt/live/${domain}/chain.pem" "${SSL_DIR}/chain.pem"
    
    success "Let's Encrypt certificate generated successfully for ${domain}"
    
    # Setup auto-renewal
    setup_auto_renewal "${domain}"
}

# Setup automatic certificate renewal
setup_auto_renewal() {
    local domain=${1}
    
    log "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-ssl.sh << EOF
#!/bin/bash
# Auto-renewal script for Let's Encrypt certificates

certbot renew --quiet --no-self-upgrade

# Reload nginx if certificates were renewed
if [[ \$? -eq 0 ]]; then
    nginx -s reload
fi
EOF
    
    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Add cron job for automatic renewal (runs twice daily)
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/local/bin/renew-ssl.sh >/dev/null 2>&1") | crontab -
    (crontab -l 2>/dev/null; echo "0 0 * * * /usr/local/bin/renew-ssl.sh >/dev/null 2>&1") | crontab -
    
    success "Automatic renewal configured"
}

# Verify certificate
verify_certificate() {
    local domain=${1:-localhost}
    
    log "Verifying certificate for ${domain}..."
    
    if [[ ! -f "${SSL_DIR}/fullchain.pem" || ! -f "${SSL_DIR}/privkey.pem" ]]; then
        error "Certificate files not found"
        return 1
    fi
    
    # Check certificate validity
    if openssl x509 -in "${SSL_DIR}/fullchain.pem" -text -noout >/dev/null 2>&1; then
        local expiry_date=$(openssl x509 -in "${SSL_DIR}/fullchain.pem" -noout -enddate | cut -d= -f2)
        local days_until_expiry=$(( ($(date -d "${expiry_date}" +%s) - $(date +%s)) / 86400 ))
        
        success "Certificate is valid"
        log "Expires: ${expiry_date}"
        log "Days until expiry: ${days_until_expiry}"
        
        if [[ ${days_until_expiry} -lt 30 ]]; then
            warning "Certificate expires in less than 30 days!"
        fi
    else
        error "Certificate is invalid"
        return 1
    fi
    
    # Check private key
    if openssl rsa -in "${SSL_DIR}/privkey.pem" -check -noout >/dev/null 2>&1; then
        success "Private key is valid"
    else
        error "Private key is invalid"
        return 1
    fi
    
    # Check if certificate and key match
    cert_md5=$(openssl x509 -in "${SSL_DIR}/fullchain.pem" -noout -modulus | openssl md5)
    key_md5=$(openssl rsa -in "${SSL_DIR}/privkey.pem" -noout -modulus | openssl md5)
    
    if [[ "${cert_md5}" == "${key_md5}" ]]; then
        success "Certificate and private key match"
    else
        error "Certificate and private key do not match"
        return 1
    fi
}

# Show help
show_help() {
    cat << EOF
AI Engineer Agent SSL Certificate Management

Usage: $0 [OPTIONS] [DOMAIN]

Options:
    --production    Generate Let's Encrypt certificate for production
    --verify        Verify existing certificate
    --renew         Renew existing Let's Encrypt certificate
    --help          Show this help message

Examples:
    # Generate self-signed certificate for local development
    $0 localhost

    # Generate Let's Encrypt certificate for production
    $0 --production yourdomain.com

    # Verify existing certificate
    $0 --verify yourdomain.com

    # Renew Let's Encrypt certificate
    $0 --renew yourdomain.com

Environment Variables:
    SSL_EMAIL       Email for Let's Encrypt registration
    NODE_ENV        Set to 'production' for production mode
EOF
}

# Main execution
main() {
    case "${1}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --verify)
            verify_certificate "${2}"
            ;;
        --renew)
            if is_production || [[ "${2}" != "localhost" ]]; then
                log "Renewing Let's Encrypt certificate..."
                certbot renew --force-renewal
                nginx -s reload
            else
                error "Renewal is only available for Let's Encrypt certificates"
                exit 1
            fi
            ;;
        --production)
            setup_letsencrypt "${2}" "${SSL_EMAIL}"
            verify_certificate "${2}"
            ;;
        *)
            if is_production "${1}"; then
                setup_letsencrypt "${DOMAIN}" "${SSL_EMAIL}"
                verify_certificate "${DOMAIN}"
            else
                generate_self_signed "${1}"
                verify_certificate "${1}"
            fi
            ;;
    esac
}

# Run main function with all arguments
main "$@"