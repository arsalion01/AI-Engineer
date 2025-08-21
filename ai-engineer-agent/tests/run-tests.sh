#!/bin/bash
# AI Engineer Agent - Comprehensive Testing Suite
# Deployment validation and system verification tests

set -euo pipefail

# Configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${TEST_DIR}/logs"
RESULTS_DIR="${TEST_DIR}/results"
CONFIG_FILE="${TEST_DIR}/test-config.json"

# Create directories
mkdir -p "$LOG_DIR" "$RESULTS_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_DIR/test-runner.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_DIR/test-runner.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_DIR/test-runner.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_DIR/test-runner.log"
}

# Test result tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Function to run a test and capture results
run_test() {
    local test_name="$1"
    local test_script="$2"
    local log_file="$LOG_DIR/${test_name}.log"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "Running test: $test_name"
    
    if bash "$TEST_DIR/$test_script" > "$log_file" 2>&1; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log_success "$test_name completed successfully"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        log_error "$test_name failed (see $log_file for details)"
        
        # Show last 10 lines of error log
        echo "--- Last 10 lines of error log ---"
        tail -10 "$log_file"
        echo "--- End error log ---"
    fi
}

# Function to run optional tests (warnings don't fail the suite)
run_optional_test() {
    local test_name="$1"
    local test_script="$2"
    local log_file="$LOG_DIR/${test_name}.log"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "Running optional test: $test_name"
    
    if bash "$TEST_DIR/$test_script" > "$log_file" 2>&1; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log_success "$test_name completed successfully"
    else
        PASSED_TESTS=$((PASSED_TESTS + 1))  # Count as passed for optional tests
        WARNINGS=$((WARNINGS + 1))
        log_warning "$test_name failed (optional test - see $log_file for details)"
    fi
}

# Function to generate test report
generate_report() {
    local report_file="$RESULTS_DIR/test-report-$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "test_run": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "environment": "${TEST_ENVIRONMENT:-production}",
        "total_tests": $TOTAL_TESTS,
        "passed": $PASSED_TESTS,
        "failed": $FAILED_TESTS,
        "warnings": $WARNINGS,
        "success_rate": "$(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%"
    },
    "system_info": {
        "hostname": "$(hostname)",
        "kernel": "$(uname -r)",
        "uptime": "$(uptime -p)"
    }
}
EOF

    log_info "Test report saved to: $report_file"
}

# Main test execution
main() {
    log_info "Starting AI Engineer Agent Testing Suite"
    log_info "Test environment: ${TEST_ENVIRONMENT:-production}"
    log_info "Timestamp: $(date)"
    
    # Basic system tests
    log_info "=== Running Basic System Tests ==="
    run_test "system-requirements" "system-requirements.sh"
    run_test "docker-validation" "docker-validation.sh"
    
    # Infrastructure tests
    log_info "=== Running Infrastructure Tests ==="
    run_test "database-connectivity" "database-connectivity.sh"
    run_test "redis-connectivity" "redis-connectivity.sh"
    run_test "network-connectivity" "network-connectivity.sh"
    
    # Application tests
    log_info "=== Running Application Tests ==="
    run_test "health-checks" "health-checks.sh"
    run_test "api-endpoints" "api-endpoints.sh"
    run_test "authentication" "authentication.sh"
    
    # Performance tests (optional)
    log_info "=== Running Performance Tests ==="
    run_optional_test "load-testing" "load-testing.sh"
    run_optional_test "benchmark" "benchmark.sh"
    
    # Security tests
    log_info "=== Running Security Tests ==="
    run_test "security-validation" "security-validation.sh"
    run_test "ssl-validation" "ssl-validation.sh"
    
    # Backup and recovery tests
    log_info "=== Running Backup/Recovery Tests ==="
    run_test "backup-validation" "backup-validation.sh"
    run_optional_test "restore-testing" "restore-testing.sh"
    
    # Integration tests
    log_info "=== Running Integration Tests ==="
    run_test "workflow-integration" "workflow-integration.sh"
    run_test "team-collaboration" "team-collaboration.sh"
    
    # Monitoring tests
    log_info "=== Running Monitoring Tests ==="
    run_test "monitoring-validation" "monitoring-validation.sh"
    run_optional_test "alerting-validation" "alerting-validation.sh"
    
    # Generate final report
    generate_report
    
    # Print summary
    echo ""
    log_info "=== Test Summary ==="
    log_info "Total Tests: $TOTAL_TESTS"
    log_success "Passed: $PASSED_TESTS"
    log_error "Failed: $FAILED_TESTS"
    log_warning "Warnings: $WARNINGS"
    
    success_rate=$(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)
    log_info "Success Rate: ${success_rate}%"
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "All critical tests passed!"
        exit 0
    else
        log_error "Some critical tests failed. Check logs for details."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-all}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [test_type]"
        echo "Available test types:"
        echo "  all          - Run all tests (default)"
        echo "  system       - Run system requirement tests"
        echo "  infrastructure - Run infrastructure tests"
        echo "  application  - Run application tests"
        echo "  security     - Run security tests"
        echo "  performance  - Run performance tests"
        echo "  monitoring   - Run monitoring tests"
        echo "  help         - Show this help message"
        exit 0
        ;;
    "system")
        log_info "Running system tests only"
        run_test "system-requirements" "system-requirements.sh"
        ;;
    "infrastructure")
        log_info "Running infrastructure tests only"
        run_test "database-connectivity" "database-connectivity.sh"
        run_test "redis-connectivity" "redis-connectivity.sh"
        run_test "network-connectivity" "network-connectivity.sh"
        ;;
    "application")
        log_info "Running application tests only"
        run_test "health-checks" "health-checks.sh"
        run_test "api-endpoints" "api-endpoints.sh"
        run_test "authentication" "authentication.sh"
        ;;
    "security")
        log_info "Running security tests only"
        run_test "security-validation" "security-validation.sh"
        run_test "ssl-validation" "ssl-validation.sh"
        ;;
    "performance")
        log_info "Running performance tests only"
        run_test "load-testing" "load-testing.sh"
        run_test "benchmark" "benchmark.sh"
        ;;
    "monitoring")
        log_info "Running monitoring tests only"
        run_test "monitoring-validation" "monitoring-validation.sh"
        run_test "alerting-validation" "alerting-validation.sh"
        ;;
    "all"|*)
        main
        ;;
esac