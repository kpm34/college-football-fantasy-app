#!/bin/bash

# Script to run commands with clear completion indicators
# Usage: ./run-with-completion.sh "your command here"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the command from arguments
COMMAND="$@"

if [ -z "$COMMAND" ]; then
    echo -e "${RED}Error: No command provided${NC}"
    echo "Usage: $0 \"command to run\""
    exit 1
fi

# Print start marker
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}▶ COMMAND START: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${YELLOW}▶ Running: $COMMAND${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Run the command and capture exit code
eval "$COMMAND"
EXIT_CODE=$?

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Print completion status
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ COMMAND COMPLETED SUCCESSFULLY${NC}"
    echo -e "${GREEN}▶ Exit Code: $EXIT_CODE${NC}"
else
    echo -e "${RED}❌ COMMAND FAILED${NC}"
    echo -e "${RED}▶ Exit Code: $EXIT_CODE${NC}"
fi

echo -e "${YELLOW}▶ COMMAND END: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Special marker for AI assistant
echo "[[COMMAND_COMPLETE:$EXIT_CODE]]"

# Show the prompt to indicate completion
echo -e "${GREEN}kashyapmaheshwari@Kashyaps-iMac college-football-fantasy-app${NC}"

exit $EXIT_CODE
