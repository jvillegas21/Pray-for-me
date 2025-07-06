# Prayer App Backend API

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret key for JWT tokens
     - `OPENAI_API_KEY`: Your OpenAI API key for GPT integration
     - `BIBLE_API_KEY`: (Optional) API key for Bible verse service

3. **Start MongoDB:**
   Make sure MongoDB is running on your system

4. **Run the server:**
   ```bash
   npm run dev  # For development with hot reload
   # or
   npm start    # For production
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `PUT /api/auth/location` - Update user location

### Prayers
- `POST /api/prayers` - Create new prayer
- `GET /api/prayers/nearby` - Get prayers near location
- `GET /api/prayers/trending` - Get trending prayers
- `GET /api/prayers/:id` - Get specific prayer
- `PUT /api/prayers/:id/like` - Like/unlike prayer
- `PUT /api/prayers/:id/pray` - Increment prayer count
- `PUT /api/prayers/:id/answered` - Mark prayer as answered
- `GET /api/prayers/user/:userId` - Get user's prayers

### Bible Integration
- `POST /api/bible/study` - Create Bible study for prayer
- `GET /api/bible/study/:id` - Get specific study
- `GET /api/bible/studies` - Get user's studies
- `PUT /api/bible/study/:id/answer` - Submit study answer
- `GET /api/bible/search` - Search Bible verses
- `GET /api/bible/verse` - Get specific verse

## Features
- JWT-based authentication
- Geolocation-based prayer discovery
- Prayer liking and visibility tracking
- AI-powered Bible verse suggestions
- Personalized Bible study generation
- Real-time prayer statistics