#!/bin/bash
# attach-umonitor.sh - Helper script to attach to umonitor screen session

# Set proper terminal type
export TERM=xterm-256color

# Check if we're running as root, and if so, switch to sbbs user
if [ "$(id -u)" = "0" ]; then
    echo "Switching to sbbs user..."
    exec su - sbbs -c "/usr/local/bin/attach-umonitor.sh"
fi

# Check if screen session exists
if ! screen -list | grep -q "umonitor"; then
    echo "Error: umonitor screen session not found!"
    echo "Available sessions:"
    screen -list
    echo ""
    echo "Available sessions for sbbs user:"
    screen -list 2>/dev/null || echo "No sessions found"
    exit 1
fi

# Attach to the umonitor screen session
# -r: Reattach to session
# -d: Detach the session from other terminals first
echo "Attaching to umonitor... (Press Ctrl+A, D to detach)"
exec screen -d -r umonitor
