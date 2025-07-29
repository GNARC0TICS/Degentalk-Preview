#!/bin/bash
# Command execution helper for consistent paths

# Set project root
export DEGENTALK_ROOT="/home/developer/Degentalk-BETA"

# Helper function to run commands from project root
run_from_root() {
    cd "$DEGENTALK_ROOT" && "$@"
}

# Helper function to run commands from server dir
run_from_server() {
    cd "$DEGENTALK_ROOT/server" && "$@"
}

# Helper function to run commands from client dir
run_from_client() {
    cd "$DEGENTALK_ROOT/client" && "$@"
}

# Helper function to run commands from db dir
run_from_db() {
    cd "$DEGENTALK_ROOT/db" && "$@"
}

# Export functions for use
echo "DegenTalk command helpers loaded!"
echo "Available functions:"
echo "  - run_from_root"
echo "  - run_from_server"
echo "  - run_from_client"
echo "  - run_from_db"
echo ""
echo "Project root: $DEGENTALK_ROOT"