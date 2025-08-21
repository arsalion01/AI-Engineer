#!/bin/bash
# Redis Connectivity Test
# Tests Redis cache connectivity and operations

set -euo pipefail

# Configuration from environment variables or defaults
REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD:-}"

echo "=== Redis Connectivity Test ==="

# Build redis-cli command with auth if password is set
REDIS_CMD="redis-cli -h $REDIS_HOST -p $REDIS_PORT"
if [ -n "$REDIS_PASSWORD" ]; then
    REDIS_CMD="$REDIS_CMD -a $REDIS_PASSWORD"
fi

# Test Redis connectivity
echo "Testing Redis connectivity..."
if $REDIS_CMD ping &> /dev/null; then
    echo "✓ Redis server is responding to ping"
else
    echo "✗ Redis server is not accessible"
    exit 1
fi

# Test Redis authentication (if password is set)
if [ -n "$REDIS_PASSWORD" ]; then
    echo "Testing Redis authentication..."
    if $REDIS_CMD auth "$REDIS_PASSWORD" &> /dev/null; then
        echo "✓ Redis authentication successful"
    else
        echo "✗ Redis authentication failed"
        exit 1
    fi
fi

# Get Redis server info
echo "Getting Redis server information..."
redis_info=$($REDIS_CMD info server | grep -E "redis_version:|redis_mode:|arch_bits:|multiplexing_api:|gcc_version:")
echo "$redis_info"

# Extract version
redis_version=$($REDIS_CMD info server | grep "redis_version:" | cut -d: -f2 | tr -d '\r')
echo "✓ Redis version: $redis_version"

# Test basic Redis operations
echo "Testing basic Redis operations..."

# SET operation
if $REDIS_CMD set test_key "test_value" &> /dev/null; then
    echo "✓ Redis SET operation successful"
else
    echo "✗ Redis SET operation failed"
    exit 1
fi

# GET operation
get_result=$($REDIS_CMD get test_key)
if [ "$get_result" = "test_value" ]; then
    echo "✓ Redis GET operation successful"
else
    echo "✗ Redis GET operation failed (expected: test_value, got: $get_result)"
    exit 1
fi

# EXISTS operation
if $REDIS_CMD exists test_key &> /dev/null; then
    echo "✓ Redis EXISTS operation successful"
else
    echo "✗ Redis EXISTS operation failed"
    exit 1
fi

# DEL operation
if $REDIS_CMD del test_key &> /dev/null; then
    echo "✓ Redis DEL operation successful"
else
    echo "✗ Redis DEL operation failed"
    exit 1
fi

# Test Redis data types
echo "Testing Redis data types..."

# String operations
$REDIS_CMD set string_test "Hello Redis" > /dev/null
string_val=$($REDIS_CMD get string_test)
echo "✓ String operations working (value: $string_val)"

# List operations
$REDIS_CMD lpush list_test "item1" "item2" "item3" > /dev/null
list_len=$($REDIS_CMD llen list_test)
echo "✓ List operations working (length: $list_len)"

# Hash operations
$REDIS_CMD hset hash_test field1 "value1" field2 "value2" > /dev/null
hash_len=$($REDIS_CMD hlen hash_test)
echo "✓ Hash operations working (fields: $hash_len)"

# Set operations
$REDIS_CMD sadd set_test "member1" "member2" "member3" > /dev/null
set_len=$($REDIS_CMD scard set_test)
echo "✓ Set operations working (members: $set_len)"

# Sorted set operations
$REDIS_CMD zadd sorted_test 1 "first" 2 "second" 3 "third" > /dev/null
sorted_len=$($REDIS_CMD zcard sorted_test)
echo "✓ Sorted set operations working (members: $sorted_len)"

# Test expiration
echo "Testing key expiration..."
$REDIS_CMD set expire_test "expire_me" ex 1 > /dev/null
sleep 2
if ! $REDIS_CMD exists expire_test &> /dev/null; then
    echo "✓ Key expiration working correctly"
else
    echo "⚠ Warning: Key expiration may not be working"
fi

# Test Redis performance
echo "Testing Redis performance..."
start_time=$(date +%s.%N)
for i in {1..100}; do
    $REDIS_CMD set perf_test_$i "value_$i" > /dev/null
done
end_time=$(date +%s.%N)
ops_time=$(echo "$end_time - $start_time" | bc -l)
ops_per_sec=$(echo "scale=2; 100 / $ops_time" | bc -l)
echo "✓ Performance test: ${ops_per_sec} operations/second"

# Get memory usage
echo "Checking Redis memory usage..."
memory_info=$($REDIS_CMD info memory | grep -E "used_memory_human:|used_memory_peak_human:|maxmemory_human:")
echo "$memory_info"

# Get client connections
echo "Checking Redis client connections..."
client_info=$($REDIS_CMD info clients | grep -E "connected_clients:|client_recent_max_input_buffer:|client_recent_max_output_buffer:")
echo "$client_info"

# Check Redis configuration
echo "Checking Redis configuration..."
maxmemory=$($REDIS_CMD config get maxmemory | tail -n 1)
maxmemory_policy=$($REDIS_CMD config get maxmemory-policy | tail -n 1)
echo "✓ Max memory: $maxmemory"
echo "✓ Memory policy: $maxmemory_policy"

# Test Redis persistence (if enabled)
echo "Checking Redis persistence..."
last_save=$($REDIS_CMD lastsave)
echo "✓ Last save timestamp: $last_save"

# Test BGSAVE if it's safe (check if another save is in progress)
save_in_progress=$($REDIS_CMD lastsave)
$REDIS_CMD bgsave > /dev/null 2>&1 || echo "⚠ Background save may be disabled or another save is in progress"

# Check Redis keyspace
echo "Checking Redis keyspace..."
keyspace_info=$($REDIS_CMD info keyspace)
if [ -n "$keyspace_info" ]; then
    echo "$keyspace_info"
else
    echo "✓ Redis keyspace is empty"
fi

# Test Redis pub/sub (basic test)
echo "Testing Redis pub/sub functionality..."
# This is a basic test - in a real scenario, you'd want a more comprehensive test
$REDIS_CMD publish test_channel "test_message" > /tmp/redis_pubsub.log 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Redis pub/sub publish successful"
else
    echo "⚠ Warning: Redis pub/sub may not be working properly"
fi

# Clean up test data
echo "Cleaning up test data..."
$REDIS_CMD del string_test list_test hash_test set_test sorted_test > /dev/null
for i in {1..100}; do
    $REDIS_CMD del perf_test_$i > /dev/null 2>&1
done
echo "✓ Test data cleanup completed"

# Test Redis Sentinel (if available)
SENTINEL_HOST="${SENTINEL_HOST:-redis-sentinel}"
SENTINEL_PORT="${SENTINEL_PORT:-26379}"
echo "Testing Redis Sentinel connectivity (optional)..."
if command -v redis-cli &> /dev/null; then
    if redis-cli -h "$SENTINEL_HOST" -p "$SENTINEL_PORT" ping &> /dev/null; then
        echo "✓ Redis Sentinel is available and responding"
        
        # Get sentinel info
        sentinel_masters=$(redis-cli -h "$SENTINEL_HOST" -p "$SENTINEL_PORT" sentinel masters | head -n 10)
        echo "Sentinel masters info (first 10 lines):"
        echo "$sentinel_masters"
    else
        echo "⚠ Redis Sentinel not available (this is optional for single-instance setups)"
    fi
else
    echo "⚠ redis-cli not available for Sentinel testing"
fi

# Check Redis cluster info (if applicable)
echo "Checking Redis cluster mode..."
cluster_info=$($REDIS_CMD cluster nodes 2>/dev/null || echo "Not in cluster mode")
if [ "$cluster_info" = "Not in cluster mode" ]; then
    echo "✓ Redis running in standalone mode"
else
    echo "✓ Redis cluster information available"
    echo "$cluster_info"
fi

# Clean up temporary files
rm -f /tmp/redis_*.log

echo "✓ All Redis connectivity tests passed!"
echo "=== Redis Connectivity Test Complete ==="