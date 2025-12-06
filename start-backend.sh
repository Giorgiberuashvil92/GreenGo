#!/bin/bash

# GreenGo Backend Start Script
echo "🚀 Starting GreenGo Backend..."

cd "$(dirname "$0")/greengo-backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Creating default .env..."
  cat > .env << EOF
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://GreenGo:Berobero12!@greengi.doampnw.mongodb.net/greengo?retryWrites=true&w=majority&appName=GreenGi

# Server
PORT=3001

# JWT Secret
JWT_SECRET=93b778f4d6d1ee088ee2478e97b53a2e2cb8b165bca9203f84fcd2bcd11e16b0
JWT_EXPIRES_IN=7d
EOF
fi

# Start backend
echo "✅ Starting backend on port 3001..."
npm run start:dev

