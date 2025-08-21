#!/bin/bash
# Docker Environment Validation Test
# Verifies Docker and container configurations

set -euo pipefail

echo "=== Docker Validation ==="

# Check Docker daemon
echo "Checking Docker daemon..."
if ! docker info &> /dev/null; then
    echo "✗ Docker daemon not running or not accessible"
    exit 1
fi
echo "✓ Docker daemon is running"

# Check Docker version
echo "Checking Docker version..."
docker_version=$(docker --version | cut -d' ' -f3 | sed 's/,//')
echo "✓ Docker version: $docker_version"

# Check Docker Compose
echo "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version | cut -d' ' -f4 | sed 's/,//')
    echo "✓ Docker Compose version: $compose_version"
else
    # Try docker compose (newer syntax)
    if docker compose version &> /dev/null; then
        compose_version=$(docker compose version --short)
        echo "✓ Docker Compose version: $compose_version"
    else
        echo "✗ Docker Compose not found"
        exit 1
    fi
fi

# Check Docker system info
echo "Checking Docker system resources..."
docker_info=$(docker system df --format "table {{.Type}}\t{{.Total}}\t{{.Active}}\t{{.Size}}")
echo "$docker_info"

# Check Docker networks
echo "Checking Docker networks..."
networks=$(docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}")
echo "$networks"

# Verify required networks exist (if any)
required_networks=("ai-engineer-network")
for network in "${required_networks[@]}"; do
    if docker network ls --format "{{.Name}}" | grep -q "^${network}$"; then
        echo "✓ Network '$network' exists"
    else
        echo "⚠ Network '$network' not found (will be created during deployment)"
    fi
done

# Check Docker volumes
echo "Checking Docker volumes..."
volumes=$(docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Size}}")
echo "$volumes"

# Check if containers are running
echo "Checking running containers..."
running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
echo "$running_containers"

# Verify specific AI Engineer containers (if running)
expected_containers=("ai-engineer-app" "postgresql" "timescaledb" "redis" "prometheus" "grafana")
for container in "${expected_containers[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}"; then
        status=$(docker ps --filter "name=${container}" --format "{{.Status}}")
        echo "✓ Container '$container' is running ($status)"
    else
        echo "⚠ Container '$container' not running (expected during fresh deployment)"
    fi
done

# Check Docker storage driver
echo "Checking Docker storage driver..."
storage_driver=$(docker info --format '{{.Driver}}')
echo "✓ Storage driver: $storage_driver"

# Check Docker security options
echo "Checking Docker security options..."
security_options=$(docker info --format '{{range .SecurityOptions}}{{.}} {{end}}')
echo "✓ Security options: $security_options"

# Test Docker functionality
echo "Testing Docker functionality..."
test_image="hello-world"
if docker run --rm "$test_image" &> /dev/null; then
    echo "✓ Docker can pull and run containers"
else
    echo "✗ Docker functionality test failed"
    exit 1
fi

# Check Docker resource limits
echo "Checking Docker resource limits..."
max_containers=$(docker info --format '{{.ContainersRunning}}/{{.Containers}}')
echo "✓ Container usage: $max_containers"

# Check Docker daemon configuration
echo "Checking Docker daemon configuration..."
if [ -f /etc/docker/daemon.json ]; then
    echo "✓ Docker daemon configuration found"
    # Validate JSON format
    if jq empty /etc/docker/daemon.json 2>/dev/null; then
        echo "✓ Docker daemon configuration is valid JSON"
    else
        echo "⚠ Warning: Docker daemon configuration has invalid JSON"
    fi
else
    echo "⚠ No custom Docker daemon configuration found"
fi

# Check Docker registry access
echo "Testing Docker registry access..."
if docker pull alpine:latest &> /dev/null; then
    echo "✓ Docker registry access working"
    docker rmi alpine:latest &> /dev/null || true
else
    echo "⚠ Warning: Docker registry access may be limited"
fi

# Check Docker system events (background check)
echo "Checking Docker system events..."
timeout 5s docker events --format '{{.Status}} {{.ID}} {{.From}}' > /tmp/docker-events.log 2>&1 &
sleep 1
kill $! 2>/dev/null || true
wait $! 2>/dev/null || true

if [ -s /tmp/docker-events.log ]; then
    echo "✓ Docker event system is working"
else
    echo "⚠ Warning: No Docker events detected (may be normal)"
fi
rm -f /tmp/docker-events.log

echo "✓ Docker validation complete!"
echo "=== Docker Validation Complete ==="