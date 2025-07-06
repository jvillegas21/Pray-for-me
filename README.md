# Prayer Community App 🙏

A comprehensive community-based prayer mobile application that connects people through faith, allowing users to submit prayer requests, discover nearby prayers through geolocation, and engage with AI-powered Bible study guides.

## ✨ Features

### 🗺️ **Location-Based Prayer Discovery**
- Submit prayer requests with geolocation
- Discover prayers from people in your area
- Adjustable radius for prayer discovery
- Real-time location-based prayer feeds

### ❤️ **Community Engagement**
- Like prayers to show support and increase visibility
- Comment on prayer requests
- Track when others pray for your requests
- Friend system for closer prayer partnerships

### 🤖 **AI-Powered Bible Integration**
- Automatic Bible verse suggestions for prayer requests using GPT-4
- Intelligent categorization and tagging of prayers
- AI-generated guided Bible study sessions
- Contextual Scripture recommendations

### 📖 **Guided Bible Studies**
- Complete Bible study guides generated for each prayer
- Interactive study sessions with reflection questions
- Progress tracking and completion certificates
- Personalized study recommendations based on prayer history

### 👥 **Social Features**
- User profiles with prayer statistics
- Friend requests and community building
- Prayer leaderboards and achievements
- Anonymous prayer option for privacy

### 📱 **Beautiful Mobile Experience**
- Cross-platform React Native app (iOS & Android)
- Modern, intuitive UI with smooth animations
- Offline capability with local storage
- Push notifications for prayer updates

## 🏗️ Architecture

### Backend (Node.js + Express)
- **RESTful API** with comprehensive endpoints
- **MongoDB** with Mongoose for data modeling
- **JWT Authentication** with secure token management
- **Socket.io** for real-time features
- **OpenAI Integration** for AI-powered content generation
- **Bible API Integration** for verse lookup and study materials
- **Geospatial Queries** for location-based features

### Mobile App (React Native + Expo)
- **React Navigation** for seamless app navigation
- **Context API** for state management
- **React Native Paper** for Material Design components
- **Expo** for development tools and native features
- **Maps Integration** for location visualization
- **Push Notifications** for engagement

### Key Technologies
- **Backend**: Node.js, Express, MongoDB, Socket.io, OpenAI API
- **Mobile**: React Native, Expo, React Navigation, React Native Paper
- **Authentication**: JWT tokens with secure storage
- **Real-time**: WebSocket connections for live updates
- **AI**: OpenAI GPT-4 for Bible verse suggestions and study generation
- **Location**: Geolocation services with privacy controls

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/location` - Update user location

### Prayers
- `GET /api/prayers` - Get prayers (with location filtering)
- `POST /api/prayers` - Create new prayer
- `GET /api/prayers/:id` - Get specific prayer
- `PUT /api/prayers/:id` - Update prayer
- `POST /api/prayers/:id/like` - Like/unlike prayer
- `POST /api/prayers/:id/pray` - Mark as prayed for
- `POST /api/prayers/:id/comment` - Add comment
- `GET /api/prayers/trending` - Get trending prayers

### Bible & Study
- `GET /api/bible/verse-of-the-day` - Daily verse
- `GET /api/bible/search` - Search Bible verses
- `GET /api/bible/verse/:reference` - Get specific verse
- `GET /api/study/guides` - Get study guides
- `POST /api/study/guides/:id/start` - Start study
- `PUT /api/study/guides/:id/progress` - Update progress
- `GET /api/study/recommended` - Get recommendations

### Social Features
- `GET /api/users` - Search/discover users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/friend` - Send friend request
- `GET /api/users/me/friends` - Get friends list
- `GET /api/users/leaderboard` - Community leaderboard

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Expo CLI (`npm install -g expo-cli`)
- OpenAI API key
- Bible API key (optional, fallback data included)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prayer-community-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/prayer_community
   JWT_SECRET=your_super_secret_jwt_key
   OPENAI_API_KEY=your_openai_api_key
   BIBLE_API_KEY=your_bible_api_key
   PORT=5000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### Mobile App Setup

1. **Install mobile dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Start the Expo development server**
   ```bash
   npm start
   ```

3. **Run on device/simulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

### Database Setup

The app will automatically create the necessary collections. For development, you can use MongoDB locally or cloud services like MongoDB Atlas.

## 🎯 Core Features Deep Dive

### Prayer Submission & Discovery
1. **Create Prayer**: Users submit prayers with title, content, category, and urgency level
2. **AI Enhancement**: GPT-4 automatically suggests relevant Bible verses and tags
3. **Geolocation**: Prayers are tagged with user's location for community discovery
4. **Visibility Control**: Users can set prayers as public, friends-only, or private

### AI-Powered Bible Study
1. **Verse Suggestions**: When a prayer is submitted, AI analyzes the content and suggests relevant Bible verses
2. **Study Guide Generation**: Complete Bible study guides are generated with:
   - Multiple study sections with teachings
   - Reflection questions for personal growth
   - Key verses with explanations
   - Prayer prompts and action steps
3. **Progress Tracking**: Users can track their study progress and save answers to reflection questions

### Location-Based Community
1. **Nearby Prayers**: Discover prayers from people in your area (adjustable radius)
2. **Map View**: Visual representation of prayers on an interactive map
3. **Privacy Controls**: Users control location sharing preferences
4. **Community Stats**: Local community engagement metrics and leaderboards

### Social Engagement
1. **Like System**: Like prayers to show support and increase their visibility
2. **Prayer Tracking**: Mark when you've prayed for someone's request
3. **Comments**: Encourage and support through comments
4. **Friend Network**: Build relationships with other community members

## 📊 Data Models

### User Schema
```javascript
{
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude],
    address: String,
    city: String,
    country: String
  },
  preferences: {
    shareLocation: Boolean,
    receiveNotifications: Boolean,
    prayerVisibility: String,
    bibleTranslation: String
  },
  stats: {
    prayersSubmitted: Number,
    prayersReceived: Number,
    likesGiven: Number,
    likesReceived: Number,
    studiesCompleted: Number
  }
}
```

### Prayer Schema
```javascript
{
  title: String,
  content: String,
  category: String, // healing, family, work, etc.
  urgency: String, // low, medium, high, urgent
  author: ObjectId,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  likes: [{ user: ObjectId, likedAt: Date }],
  prayedFor: [{ user: ObjectId, prayedAt: Date }],
  bibleVerses: [{
    verse: String,
    reference: String,
    relevanceScore: Number,
    aiGenerated: Boolean
  }],
  studyGuide: ObjectId,
  tags: [String],
  answered: Boolean
}
```

## 🔐 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent API abuse
- **Input Validation** on all endpoints
- **CORS Configuration** for secure cross-origin requests
- **Privacy Controls** for location and prayer visibility
- **Data Encryption** for sensitive information

## 🌟 Future Enhancements

### Planned Features
- [ ] Audio prayer recordings
- [ ] Video testimonies and updates
- [ ] Prayer group creation and management
- [ ] Weekly challenges and spiritual goals
- [ ] Integration with church calendars and events
- [ ] Multi-language support
- [ ] Prayer journal with export options
- [ ] Advanced Bible study tools
- [ ] Community prayer times and events
- [ ] Mentorship and spiritual guidance features

### Technical Improvements
- [ ] Offline-first architecture
- [ ] Push notification system
- [ ] Advanced search and filtering
- [ ] Performance optimizations
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Analytics and insights
- [ ] Admin dashboard

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Guidelines
1. Follow ESLint and Prettier configurations
2. Write tests for new features
3. Update documentation for API changes
4. Follow conventional commit messages
5. Ensure mobile app works on both iOS and Android

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@prayercommunity.app or create an issue in the repository.

## 🙏 Acknowledgments

- OpenAI for GPT-4 integration
- Bible API providers for Scripture access
- The open-source community for amazing libraries
- Beta testers and early adopters
- The faith community for inspiration and feedback

---

**Built with ❤️ for the global faith community**

*Connecting hearts through prayer, one request at a time.*