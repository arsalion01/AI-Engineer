#!/bin/bash
# Database Connectivity Test
# Tests connectivity to PostgreSQL and TimescaleDB

set -euo pipefail

# Configuration from environment variables or defaults
POSTGRES_HOST="${POSTGRES_HOST:-postgresql}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-ai_engineer_user}"
POSTGRES_DB="${POSTGRES_DB:-ai_engineer_db}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-changeme}"

TIMESCALE_HOST="${TIMESCALE_HOST:-timescaledb}"
TIMESCALE_PORT="${TIMESCALE_PORT:-5432}"
TIMESCALE_USER="${TIMESCALE_USER:-ai_engineer_analytics_user}"
TIMESCALE_DB="${TIMESCALE_DB:-ai_engineer_analytics}"
TIMESCALE_PASSWORD="${TIMESCALE_PASSWORD:-changeme}"

echo "=== Database Connectivity Test ==="

# Test PostgreSQL connectivity
echo "Testing PostgreSQL connectivity..."
pg_isready_output=$(pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" 2>&1)
if [ $? -eq 0 ]; then
    echo "✓ PostgreSQL server is accepting connections"
    echo "  $pg_isready_output"
else
    echo "✗ PostgreSQL server is not accessible"
    echo "  $pg_isready_output"
    exit 1
fi

# Test PostgreSQL database connection
echo "Testing PostgreSQL database connection..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" &> /tmp/pg_version.log
if [ $? -eq 0 ]; then
    version=$(cat /tmp/pg_version.log | grep "PostgreSQL" | head -n 1)
    echo "✓ PostgreSQL database connection successful"
    echo "  Version: $version"
else
    echo "✗ PostgreSQL database connection failed"
    cat /tmp/pg_version.log
    exit 1
fi

# Test PostgreSQL basic operations
echo "Testing PostgreSQL basic operations..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'EOF' &> /tmp/pg_operations.log
-- Create test table
DROP TABLE IF EXISTS test_connection;
CREATE TABLE test_connection (
    id SERIAL PRIMARY KEY,
    test_data VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO test_connection (test_data) VALUES ('connectivity_test');

-- Query test data
SELECT id, test_data, created_at FROM test_connection WHERE test_data = 'connectivity_test';

-- Clean up
DROP TABLE test_connection;
EOF

if [ $? -eq 0 ]; then
    echo "✓ PostgreSQL basic operations successful"
else
    echo "✗ PostgreSQL basic operations failed"
    cat /tmp/pg_operations.log
    exit 1
fi

# Check PostgreSQL configuration
echo "Checking PostgreSQL configuration..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SHOW max_connections;" &> /tmp/pg_config.log
if [ $? -eq 0 ]; then
    max_conn=$(cat /tmp/pg_config.log | grep -o '[0-9]\+' | head -n 1)
    echo "✓ PostgreSQL max_connections: $max_conn"
else
    echo "⚠ Warning: Could not check PostgreSQL configuration"
fi

# Check PostgreSQL active connections
echo "Checking PostgreSQL active connections..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';" &> /tmp/pg_active.log
if [ $? -eq 0 ]; then
    active_conn=$(cat /tmp/pg_active.log | grep -o '[0-9]\+' | tail -n 1)
    echo "✓ PostgreSQL active connections: $active_conn"
else
    echo "⚠ Warning: Could not check active connections"
fi

# Test TimescaleDB connectivity
echo "Testing TimescaleDB connectivity..."
pg_isready_output=$(pg_isready -h "$TIMESCALE_HOST" -p "$TIMESCALE_PORT" -U "$TIMESCALE_USER" 2>&1)
if [ $? -eq 0 ]; then
    echo "✓ TimescaleDB server is accepting connections"
    echo "  $pg_isready_output"
else
    echo "✗ TimescaleDB server is not accessible"
    echo "  $pg_isready_output"
    exit 1
fi

# Test TimescaleDB database connection and extension
echo "Testing TimescaleDB database connection..."
PGPASSWORD="$TIMESCALE_PASSWORD" psql -h "$TIMESCALE_HOST" -p "$TIMESCALE_PORT" -U "$TIMESCALE_USER" -d "$TIMESCALE_DB" << 'EOF' &> /tmp/ts_test.log
-- Check TimescaleDB extension
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- Get TimescaleDB version
SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';

-- Test basic TimescaleDB functionality
DROP TABLE IF EXISTS test_timeseries;
CREATE TABLE test_timeseries (
    time TIMESTAMPTZ NOT NULL,
    value DOUBLE PRECISION,
    device_id INTEGER
);

-- Convert to hypertable
SELECT create_hypertable('test_timeseries', 'time');

-- Insert test data
INSERT INTO test_timeseries (time, value, device_id) VALUES 
    (NOW(), 23.5, 1),
    (NOW() - INTERVAL '1 hour', 22.1, 1),
    (NOW() - INTERVAL '2 hours', 21.8, 1);

-- Query test data
SELECT time, value, device_id FROM test_timeseries ORDER BY time DESC;

-- Clean up
DROP TABLE test_timeseries;
EOF

if [ $? -eq 0 ]; then
    echo "✓ TimescaleDB connection and hypertable operations successful"
    
    # Extract version information
    ts_version=$(grep -A 1 "timescaledb" /tmp/ts_test.log | tail -n 1 | awk '{print $1}' | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' || echo "unknown")
    echo "  TimescaleDB version: $ts_version"
else
    echo "✗ TimescaleDB connection or operations failed"
    cat /tmp/ts_test.log
    exit 1
fi

# Test database performance (simple benchmark)
echo "Testing database performance..."
start_time=$(date +%s.%N)
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT pg_sleep(0.1);" &> /dev/null
end_time=$(date +%s.%N)
response_time=$(echo "$end_time - $start_time" | bc -l)
response_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)

echo "✓ Database response time: ${response_ms}ms"
if [ "$response_ms" -gt 1000 ]; then
    echo "⚠ Warning: High database response time (${response_ms}ms)"
fi

# Check database sizes
echo "Checking database sizes..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT pg_size_pretty(pg_database_size('$POSTGRES_DB')) AS size;" &> /tmp/pg_size.log
if [ $? -eq 0 ]; then
    db_size=$(cat /tmp/pg_size.log | grep -v "size" | grep -v "---" | grep -v "(" | tr -d ' ')
    echo "✓ PostgreSQL database size: $db_size"
fi

PGPASSWORD="$TIMESCALE_PASSWORD" psql -h "$TIMESCALE_HOST" -p "$TIMESCALE_PORT" -U "$TIMESCALE_USER" -d "$TIMESCALE_DB" -c "SELECT pg_size_pretty(pg_database_size('$TIMESCALE_DB')) AS size;" &> /tmp/ts_size.log
if [ $? -eq 0 ]; then
    ts_size=$(cat /tmp/ts_size.log | grep -v "size" | grep -v "---" | grep -v "(" | tr -d ' ')
    echo "✓ TimescaleDB database size: $ts_size"
fi

# Clean up temporary files
rm -f /tmp/pg_*.log /tmp/ts_*.log

echo "✓ All database connectivity tests passed!"
echo "=== Database Connectivity Test Complete ==="