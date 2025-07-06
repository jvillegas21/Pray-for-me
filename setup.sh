#!/bin/bash

# Prayer Community App Setup Script
echo "🙏 Welcome to Prayer Community App Setup"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION'))" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to v$REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB detected"
else
    echo "⚠️  MongoDB not detected locally. You can use MongoDB Atlas or install MongoDB locally."
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g expo-cli
else
    echo "✅ Expo CLI already installed"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend package.json not found"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit backend/.env with your configuration:"
    echo "   - MongoDB URI"
    echo "   - JWT Secret"
    echo "   - OpenAI API Key"
    echo "   - Bible API Key (optional)"
    echo ""
fi

cd ..

# Install mobile dependencies
echo "📱 Installing mobile app dependencies..."
cd mobile
if [ -f "package.json" ]; then
    npm install
    echo "✅ Mobile dependencies installed"
else
    echo "❌ Mobile package.json not found"
    exit 1
fi

cd ..

# Install root dependencies
echo "📦 Installing root dependencies..."
if [ -f "package.json" ]; then
    npm install
    echo "✅ Root dependencies installed"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. 📝 Edit backend/.env with your API keys and database URI"
echo "2. 🗄️  Start MongoDB (if using locally)"
echo "3. 🚀 Start the backend: cd backend && npm run dev"
echo "4. 📱 Start the mobile app: cd mobile && npm start"
echo ""
echo "📚 Quick Commands:"
echo "  npm run install-all  # Install all dependencies"
echo "  npm start           # Start backend server"
echo "  npm run mobile      # Start mobile app"
echo ""
echo "🔗 Useful Links:"
echo "  Backend API: http://localhost:5000"
echo "  API Health: http://localhost:5000/api/health"
echo "  MongoDB Atlas: https://cloud.mongodb.com/"
echo "  OpenAI API: https://platform.openai.com/api-keys"
echo "  Bible API: https://scripture.api.bible/"
echo ""
echo "📖 Documentation: README.md"
echo "❓ Need help? Create an issue on GitHub"
echo ""
echo "Happy coding! 🙏✨"