#!/bin/bash

# Run a typescript file with proper path resolution
# Usage: ./scripts/run-with-paths.sh <script.ts>

export NODE_OPTIONS="--loader tsx"
export TSX_TSCONFIG_PATH="./scripts/tsconfig.json"

# Run the script with tsx
tsx "$@"