#!/bin/bash

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}Starting PaperTalk development servers...${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}[Backend]${NC} Starting FastAPI server..."
(
    cd backend
    source .venv/bin/activate
    uv run uvicorn app:app --reload --port 8000
) &

# Start frontend
echo -e "${GREEN}[Frontend]${NC} Starting Next.js server..."
(
    cd frontend
    npm run dev
) &

# Wait for all background processes
wait