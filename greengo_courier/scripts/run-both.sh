#!/bin/bash

# Script to run both GreenGo and Courier apps simultaneously
# Usage: ./scripts/run-both.sh

echo "🚀 Starting both GreenGo apps..."

# Get available simulators
echo "📱 Available iOS Simulators:"
xcrun simctl list devices available | grep -i "iphone" | head -5

echo ""
echo "💡 Tip: Use different simulators for each app, or use different Metro bundler ports"
echo ""
echo "Option 1: Run in different simulators"
echo "  Terminal 1: cd GreenGo && npm run ios"
echo "  Terminal 2: cd greengo_courier && npm run ios -- --device 'iPhone 16 Pro'"
echo ""
echo "Option 2: Run with different Metro ports"
echo "  Terminal 1: cd GreenGo && PORT=8081 npm start"
echo "  Terminal 2: cd greengo_courier && PORT=8082 npm start"
echo "  Then run each app from Xcode separately"
