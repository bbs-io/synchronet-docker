#!/bin/bash
set -e

# Check if Synchronet is already installed (i.e., if sbbs.ini exists)
if [ ! -f "/sbbs/ctrl/sbbs.ini" ]; then
    echo "First run detected - installing Synchronet from package..."
    
    # Create the sbbs directory structure
    mkdir -p /sbbs
    
    # Extract the Synchronet installation
    if [ -f "/usr/local/share/sbbs-install.tar.gz" ]; then
        echo "Extracting Synchronet installation..."
        tar -xzf /usr/local/share/sbbs-install.tar.gz -C /
        echo "Synchronet installation extracted successfully"
    else
        echo "ERROR: Synchronet installation package not found!"
        exit 1
    fi
    
    # Set proper ownership
    chown -R sbbs:sbbs /sbbs
    
    echo "Synchronet installation completed"
fi

# Ensure proper permissions
chown -R sbbs:sbbs /sbbs

# Execute the main command
exec "$@"
