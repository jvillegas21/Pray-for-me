# Prayer Connect - Community Prayer Mobile App

A React Native mobile application that connects people through prayer. Users can submit prayers, see nearby prayer requests, like and pray for others, receive AI-powered Bible verses, and engage in guided Bible studies.

## Features

### Core Features
- **Geolocation-based Prayer Discovery**: Find and connect with prayers from people nearby
- **Prayer Submission**: Share your prayer requests with the community
- **Like & Prayer Count System**: Show support by liking and praying for others
- **AI-Powered Bible Verses**: Get relevant scripture automatically after submitting prayers
- **Guided Bible Studies**: Optional personalized Bible study sessions based on prayers
- **User Authentication**: Secure signup/login with JWT tokens
- **Real-time Updates**: See trending prayers and community engagement

### Technical Features
- React Native with TypeScript
- Node.js/Express backend with MongoDB
- OpenAI GPT integration for intelligent Bible verse suggestions
- Geospatial queries for location-based features
- JWT authentication
- Async storage for offline capability

## Project Structure

```
prayer-app/
├── backend/               # Node.js/Express API
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic & integrations
│   └── middleware/       # Auth & error handling
│
└── mobile/               # React Native app
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── screens/      # App screens
    │   ├── navigation/   # React Navigation setup
    │   ├── context/      # Global state management
    │   ├── services/     # API & external services
    │   ├── types/        # TypeScript definitions
    │   └── utils/        # Helper functions & theme
    └── App.tsx          # Main app component
```

## Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB
- React Native development environment
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/prayer-app
   JWT_SECRET=your-secret-key
   OPENAI_API_KEY=your-openai-api-key
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Mobile App Setup

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   cd ios && pod install  # For iOS
   ```

3. Update API URL in `src/services/api.ts` if needed

4. Run the app:
   ```bash
   npm run ios      # For iOS
   npm run android  # For Android
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `PUT /api/auth/location` - Update user location

### Prayers
- `POST /api/prayers` - Create prayer request
- `GET /api/prayers/nearby` - Get location-based prayers
- `GET /api/prayers/trending` - Get popular prayers
- `PUT /api/prayers/:id/like` - Like/unlike prayer
- `PUT /api/prayers/:id/pray` - Increment prayer count

### Bible Integration
- `POST /api/bible/study` - Generate Bible study
- `GET /api/bible/search` - Search Bible verses
- `GET /api/bible/verse` - Get specific verse

## Key Technologies

### Backend
- **Express.js**: Web framework
- **MongoDB/Mongoose**: Database and ODM
- **OpenAI API**: AI-powered Bible verse generation
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing

### Mobile
- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type safety
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **React Hook Form**: Form handling
- **Axios**: HTTP client
- **AsyncStorage**: Local data persistence

## Features in Detail

### Prayer Submission
Users can:
- Write prayer title and content
- Select prayer category (healing, guidance, etc.)
- Choose visibility (public, local, private)
- Automatically receive relevant Bible verses

### Geolocation Features
- View prayers from people nearby (customizable radius)
- See prayer locations on a map
- Filter by distance

### Community Engagement
- Like prayers to show support
- "Pray" button to indicate you're praying
- See trending prayers based on engagement
- Mark prayers as answered

### Bible Study Integration
- AI generates personalized study based on prayer
- Includes relevant verses with explanations
- Reflection questions
- Progress tracking
- Additional resources

## Security & Privacy
- Passwords are hashed with bcrypt
- JWT tokens for session management
- Optional location sharing
- Private prayer option
- Secure API endpoints with authentication middleware

## Future Enhancements
- Push notifications for prayer updates
- Prayer groups and communities
- Audio prayers
- Prayer reminders
- Multi-language support
- Offline mode with sync
- Social sharing
- Prayer statistics and insights

## Contributing
This is a community project aimed at connecting people through faith and prayer. Contributions are welcome!

## License
MIT License