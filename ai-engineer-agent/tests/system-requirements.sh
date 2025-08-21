#!/bin/bash
# System Requirements Validation Test
# Verifies that the system meets minimum requirements for deployment

set -euo pipefail

# Test configuration
MIN_MEMORY_GB=4
MIN_DISK_GB=20
MIN_CPU_CORES=2
REQUIRED_COMMANDS=("docker" "kubectl" "curl" "jq" "bc")

echo "=== System Requirements Validation ==="

# Check memory
echo "Checking system memory..."
total_memory=$(free -g | awk 'NR==2{print $2}')
if [ "$total_memory" -ge $MIN_MEMORY_GB ]; then
    echo "✓ Memory: ${total_memory}GB (minimum: ${MIN_MEMORY_GB}GB)"
else
    echo "✗ Memory: ${total_memory}GB - insufficient (minimum: ${MIN_MEMORY_GB}GB)"
    exit 1
fi

# Check disk space
echo "Checking disk space..."
available_disk=$(df -BG . | awk 'NR==2 {gsub(/G/,"",$4); print $4}')
if [ "$available_disk" -ge $MIN_DISK_GB ]; then
    echo "✓ Disk space: ${available_disk}GB (minimum: ${MIN_DISK_GB}GB)"
else
    echo "✗ Disk space: ${available_disk}GB - insufficient (minimum: ${MIN_DISK_GB}GB)"
    exit 1
fi

# Check CPU cores
echo "Checking CPU cores..."
cpu_cores=$(nproc)
if [ "$cpu_cores" -ge $MIN_CPU_CORES ]; then
    echo "✓ CPU cores: $cpu_cores (minimum: $MIN_CPU_CORES)"
else
    echo "✗ CPU cores: $cpu_cores - insufficient (minimum: $MIN_CPU_CORES)"
    exit 1
fi

# Check required commands
echo "Checking required commands..."
for cmd in "${REQUIRED_COMMANDS[@]}"; do
    if command -v "$cmd" &> /dev/null; then
        version=$($cmd --version 2>&1 | head -n 1 || echo "unknown")
        echo "✓ $cmd: available ($version)"
    else
        echo "✗ $cmd: not found"
        exit 1
    fi
done

# Check kernel version
echo "Checking kernel version..."
kernel_version=$(uname -r)
echo "✓ Kernel: $kernel_version"

# Check ulimits
echo "Checking system limits..."
max_files=$(ulimit -n)
max_processes=$(ulimit -u)
echo "✓ Max open files: $max_files"
echo "✓ Max processes: $max_processes"

if [ "$max_files" -lt 65536 ]; then
    echo "⚠ Warning: Max open files ($max_files) is below recommended (65536)"
fi

# Check timezone
echo "Checking timezone configuration..."
timezone=$(timedatectl show --property=Timezone --value 2>/dev/null || date +%Z)
echo "✓ Timezone: $timezone"

# Check system architecture
echo "Checking system architecture..."
architecture=$(uname -m)
echo "✓ Architecture: $architecture"

if [[ "$architecture" != "x86_64" && "$architecture" != "aarch64" ]]; then
    echo "⚠ Warning: Unsupported architecture ($architecture)"
fi

# Check system load
echo "Checking system load..."
load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
cpu_usage=$(echo "$load_avg * 100 / $cpu_cores" | bc -l | cut -d. -f1)
echo "✓ Current load: $load_avg (${cpu_usage}% CPU utilization)"

if [ "$cpu_usage" -gt 80 ]; then
    echo "⚠ Warning: High CPU utilization ($cpu_usage%)"
fi

echo "✓ All system requirements met!"
echo "=== System Requirements Validation Complete ==="