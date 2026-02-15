#!/bin/bash
# Kill any process on port 3000
echo "Stopping existing server..."
fuser -k 3000/tcp || lsof -ti:3000 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 2

# Start server in background
echo "Starting new server..."
nohup npm start > server.log 2>&1 &
echo "Server started. PID: $!"
