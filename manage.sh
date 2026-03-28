#!/bin/bash

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function show_help {
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start   - Build and start all services in the background"
    echo "  stop    - Stop all services"
    echo "  logs    - View real-time logs for all services"
    echo "  status  - Show status of all services"
    echo "  restart - Stop and then start all services"
    echo "  help    - Show this help message"
}

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Warning: docker-compose not found. Trying 'docker compose'...${NC}"
    DOCKER_CMD="docker compose"
else
    DOCKER_CMD="docker-compose"
fi

case "$1" in
    start)
        echo -e "${GREEN}🚀 Starting PromptWars services...${NC}"
        $DOCKER_CMD up -d --build
        echo -e "${GREEN}✅ Services are running!${NC}"
        echo "---------------------------------------"
        echo "Frontend UI:  http://localhost:5173"
        echo "Backend API:  http://localhost:8000"
        echo "API Docs:     http://localhost:8000/docs"
        echo "---------------------------------------"
        echo "Run './manage.sh logs' to see the output."
        ;;
    stop)
        echo -e "${YELLOW}🛑 Stopping services...${NC}"
        $DOCKER_CMD down
        echo -e "${GREEN}✅ Done.${NC}"
        ;;
    logs)
        echo -e "${GREEN}📜 Showing real-time logs (Ctrl+C to exit)...${NC}"
        $DOCKER_CMD logs -f
        ;;
    status)
        echo -e "${GREEN}📊 Current service status:${NC}"
        $DOCKER_CMD ps
        ;;
    restart)
        $0 stop
        $0 start
        ;;
    *)
        show_help
        ;;
esac
