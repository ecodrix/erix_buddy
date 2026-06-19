#!/usr/bin/env bash

# Erix AI Code Reviewer - CI/CD & Local Runner Script
# ----------------------------------------------------

set -eo pipefail

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print ascii banner if running interactively (stdout is a terminal)
if [ -t 1 ]; then
  echo -e "${CYAN}"
  echo "  ______      _          _____            _                     "
  echo " |  ____|    (_)        |  __ \          (_)                    "
  echo " | |__   _ __ _ _  __   | |__) |_____   ___  _____      _____ _ __ "
  echo " |  __| | '__| \ \/ /   |  _  // _ \ \ / / |/ _ \ \ /\ / / _ \ '__|"
  echo " | |____| |  | |>  <    | | \ \  __/\ V /| |  __/\ V  V /  __/ |   "
  echo " |______|_|  |_/_/\_\   |_|  \_\___| \_/ |_|\___| \_/\_/ \___|_|   "
  echo -e "${NC}"
  echo -e " 🚀 ${BLUE}Erix Buddy Code Reviewer CLI Runner${NC}\n"
fi

# Load local environment file if present in the current working directory
if [ -f .env ]; then
  if [ -t 1 ]; then
    echo -e "${YELLOW}System: Found local .env file. Loading environment variables...${NC}"
  fi
  # Export variables from .env, ignoring comments
  export $(grep -v '^#' .env | xargs)
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is not installed. Please install Node.js >= 18 to run erix-reviewer.${NC}"
  exit 1
fi

# Determine if we are running in CI/CD pipeline
IS_CI=false
if [ -n "$CI" ] || [ -n "$GITHUB_ACTIONS" ] || [ -n "$GITLAB_CI" ] || [ -n "$BITBUCKET_BUILD_NUMBER" ]; then
  IS_CI=true
fi

# If in CI, force non-interactive and fail on blockers
if [ "$IS_CI" = true ]; then
  echo -e "${BLUE}CI Environment Detected.${NC}"
  
  # Export env variable to trigger exit-on-blocker inside the reviewer core
  export CODE_REVIEW_FAIL_ON_BLOCKING=1
  
  # If running in GitHub Actions, automatically output github annotations
  if [ -n "$GITHUB_ACTIONS" ]; then
    echo -e "${BLUE}GitHub Actions detected. Appending GitHub annotation outputs...${NC}"
    npx erix-buddy "$@" --format github-annotations,console
  else
    npx erix-reviewer "$@"
  fi
else
  # Run normally (forwarding all arguments)
  npx erix-buddy "$@"
fi
