#!/bin/bash
# Helper script to commit without running hooks
# Usage: ./scripts/commit-no-hooks.sh "commit message"

if [ -z "$1" ]; then
  echo "Error: Please provide a commit message"
  echo "Usage: $0 \"commit message\""
  exit 1
fi

echo "Committing with message: $1"
git commit --no-verify -m "$1"