# Pray For Me - Geolocation-based Spiritual Support App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)

A comprehensive geolocation-based spiritual support mobile application that connects faith communities through prayer requests and spiritual support. Built with React Native, TypeScript, and Node.js.

## 🌟 Features

### Core Features
- **Prayer Request System**: Create, share, and respond to prayer requests with privacy controls
- **Geolocation Integration**: Find nearby prayer requests and communities
- **Community Management**: Join local faith communities and participate in group prayers
- **AI-Powered Matching**: Intelligent matching of prayer requests with appropriate supporters
- **Privacy Controls**: Granular privacy settings for anonymous or identified participation
- **Real-time Notifications**: Instant notifications for prayer responses and community updates

### Advanced Features
- **Crisis Intervention**: Automatic detection and response to crisis situations
- **Content Moderation**: AI-powered content filtering with human oversight
- **Multi-faith Support**: Inclusive design supporting various religious denominations
- **Accessibility**: Comprehensive accessibility features for diverse users
- **Offline Support**: Limited offline functionality for essential features

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- React Native development environment
- MongoDB database
- Redis (optional, for caching)
- Android Studio / Xcode for mobile development

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pray-for-me.git
cd pray-for-me
```

### 2. Install Dependencies

#### Frontend (React Native)
```bash
npm install
# or
yarn install
```

#### Backend
```bash
cd backend
npm install
# or
yarn install
```

### 3. Environment Configuration
```bash
# Copy environment variables
cp .env.example .env
cd backend
cp .env.example .env
```

Edit the `.env` files with your configuration:
- Database connection strings
- API keys (Google Maps, OpenAI, etc.)
- Email configuration
- Push notification keys

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Run database migrations (if applicable)
cd backend
npm run migrate
```

### 5. Start Development Servers

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🏗️ Project Structure

```
pray-for-me/
├── src/                          # React Native source code
│   ├── components/               # Reusable UI components
│   ├── screens/                  # App screens
│   │   ├── auth/                # Authentication screens
│   │   └── main/                # Main app screens
│   ├── navigation/              # Navigation configuration
│   ├── store/                   # Redux store and slices
│   ├── services/                # API services
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript type definitions
│   └── assets/                  # Images, fonts, etc.
├── backend/                     # Node.js backend
│   ├── src/                     # Backend source code
│   │   ├── routes/              # API routes
│   │   ├── models/              # Database models
│   │   ├── middleware/          # Express middleware
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Utility functions
│   │   └── config/              # Configuration files
│   └── dist/                    # Compiled JavaScript
├── docs/                        # Documentation
├── PROJECT_ANALYSIS.md          # Comprehensive project analysis
└── README.md                    # This file
```

## 🎯 User Personas

### Primary Persona: "Seeking Sarah" (35-45)
- Busy parent facing personal struggles
- Active in local faith community
- Seeks anonymous support for sensitive issues
- Values privacy and authentic connection

### Secondary Persona: "Supportive Samuel" (25-65)
- Experienced in faith journey
- Enjoys helping others in spiritual growth
- Regular prayer practice
- Trusted community member

### Tertiary Persona: "Community Leader Claire" (40-60)
- Pastor, minister, or lay leader
- Manages prayer groups and spiritual support
- Needs tools for community oversight
- Concerned about pastoral care scalability

## 🔧 Configuration

### Environment Variables

See `.env.example` for a complete list of configuration options including:
- Database connections
- API keys and credentials
- Privacy and security settings
- Rate limiting and content moderation
- Crisis intervention configuration

### Privacy Settings

The app implements comprehensive privacy controls:
- **Privacy Zones**: Configurable areas where location sharing is restricted
- **Anonymous Mode**: Complete anonymity for sensitive requests
- **Community Levels**: Public, faith-based, or local-only sharing
- **Data Retention**: Automatic deletion of old data

## 🔐 Security Features

- **End-to-end Encryption**: Sensitive messages and data
- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **Content Moderation**: AI-powered filtering with human oversight
- **Crisis Detection**: Automatic identification of crisis situations

## 📱 Mobile App Features

### Authentication Flow
1. Welcome screen with app overview
2. Registration with email verification
3. Faith background and preferences setup
4. Location permission and privacy configuration
5. Community discovery and connection

### Core User Journeys
- **Prayer Request**: Create → Share → Receive Support → Follow-up
- **Offering Support**: Discover → Connect → Provide Support → Maintain Connection
- **Community Participation**: Join → Engage → Moderate → Grow

## 🖥️ Backend API

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/profile` - Update profile

### Prayer Request Endpoints
- `GET /api/prayer-requests` - Get nearby requests
- `POST /api/prayer-requests` - Create new request
- `PUT /api/prayer-requests/:id` - Update request
- `POST /api/prayer-requests/:id/respond` - Respond to request

### Community Endpoints
- `GET /api/communities` - Get nearby communities
- `POST /api/communities` - Create community
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance tests for scalability

## 🚀 Deployment

### Production Build
```bash
# Build backend
cd backend
npm run build

# Build mobile app
cd ..
npx react-native run-android --variant=release
npx react-native run-ios --configuration Release
```

### Deployment Checklist
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Configure push notifications
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Test all API endpoints
- [ ] Verify mobile app functionality

## 📈 Monitoring and Analytics

### Key Metrics
- **User Engagement**: DAU, MAU, session duration
- **Prayer Request Metrics**: Creation rate, response rate, resolution time
- **Community Health**: Member growth, interaction frequency
- **Technical Metrics**: API response times, error rates, uptime

### Logging
- Structured logging with Winston
- Error tracking and alerting
- Performance monitoring
- Security audit trails

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development setup
- Pull request process
- Coding standards
- Testing requirements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Faith communities for inspiration and guidance
- React Native and Node.js communities
- Contributors and beta testers
- Mental health and crisis intervention experts

## 📞 Support

For support and questions:
- Email: support@prayfor.me
- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-username/pray-for-me/issues)

---

**Built with ❤️ and 🙏 for faith communities worldwide.**