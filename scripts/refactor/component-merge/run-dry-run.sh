#!/usr/bin/env bash
# RUN: bash scripts/refactor/component-merge/run-dry-run.sh
# Description: Executes all codemod transforms in this directory with --dry
#              and appends their output to dry-run.log. Exits non-zero on error.

set -euo pipefail

LOG_FILE="scripts/refactor/component-merge/dry-run.log"
> "$LOG_FILE"

for codemod in "$(dirname "$0")"/*.js; do
  echo "Running $codemod in dry-run mode..." | tee -a "$LOG_FILE"
  # jscodeshift will exit non-zero if transform errors; we want CI to pick this up.
  npx jscodeshift -t "$codemod" client/src --extensions=ts,tsx --dry --print >> "$LOG_FILE" 2>&1
done

echo "All codemods completed successfully." | tee -a "$LOG_FILE" 