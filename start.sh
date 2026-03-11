#!/bin/bash
# Start both Django backend and Vite frontend

PROJECT_DIR="/home/architjagtap/Documents/gaming_idea"

# Kill any existing instances
pkill -f "vite" 2>/dev/null
pkill -f "manage.py runserver" 2>/dev/null
sleep 1

# Start Django backend
echo "Starting Django backend on http://127.0.0.1:8000 ..."
cd "$PROJECT_DIR"
source .venv/bin/activate
cd backend
nohup python manage.py runserver 8000 > /tmp/django.log 2>&1 &
DJANGO_PID=$!
echo "Django PID: $DJANGO_PID"

# Start Vite frontend
echo "Starting Vite frontend on http://localhost:5173 ..."
cd "$PROJECT_DIR/frontend"
nohup npm run dev -- --port 5173 > /tmp/vite.log 2>&1 &
VITE_PID=$!
echo "Vite PID: $VITE_PID"

sleep 3

echo ""
echo "==============================="
echo "✅ Backend:  http://127.0.0.1:8000"
echo "✅ Frontend: http://localhost:5173"
echo ""
echo "Logs: /tmp/django.log  |  /tmp/vite.log"
echo "To stop: pkill -f vite; pkill -f manage.py"
echo "==============================="
