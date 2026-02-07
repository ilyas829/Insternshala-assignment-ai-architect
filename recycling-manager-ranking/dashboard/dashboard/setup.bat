@echo off
echo Setting up Recycling Manager Ranking System...
echo.

echo 1. Creating project structure...
if not exist backend mkdir backend
if not exist database mkdir database
if not exist candidate-generator mkdir candidate-generator
if not exist ai-evaluation mkdir ai-evaluation

echo 2. Copying environment template...
if not exist .env copy .env.example .env
echo Please edit .env file with your API keys!

echo 3. Setting up backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)
cd ..

echo 4. Setup complete!
echo.
echo To start the system:
echo 1. Add your API key to backend/.env
echo 2. Run: node backend/server.js
echo 3. Open dashboard.html in browser
pause