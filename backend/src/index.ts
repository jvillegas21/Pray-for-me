import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import axios from "axios";
import { config as appConfig } from "./config";

// Load environment variables
dotenv.config();

const app = express();

// Configuration
const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
  ONESIGNAL_REST_API_KEY: process.env.ONESIGNAL_REST_API_KEY,
};

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Global request logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - body:`,
    req.body
  );
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    services: {
      supabase: config.SUPABASE_URL ? "configured" : "not configured",
      onesignal: config.ONESIGNAL_APP_ID ? "configured" : "not configured",
    },
  });
});

// API status endpoint
app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pray For Me API is running",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: "2.0.0",
  });
});

const SYSTEM_PROMPT = `You are a theologically-trained AI pastoral assistant with expertise in biblical counseling, cross-denominational Christian theology, and crisis intervention. Analyze each prayer request comprehensively using this framework:

## ANALYSIS PROTOCOL

### 1. COMPREHENSIVE SENTIMENT & PSYCHOLOGICAL ASSESSMENT
- **Primary Emotion**: Identify dominant emotional state (fear, grief, joy, anxiety, anger, hope, etc.)
- **Secondary Emotions**: Note underlying or conflicting emotions
- **Spiritual State Indicators**: Signs of faith crisis, spiritual growth, or seeking
- **Urgency Level**: Rate 1-5 (1=routine prayer, 5=crisis intervention needed)
- **Support Need**: Individual, family, community, or professional help indicators

### 2. ENHANCED CONTENT SAFETY & THEOLOGICAL REVIEW
- Screen for: hate speech, antisemitism, islamophobia, racism, self-harm indicators, abuse mentions
- **Theological Concerns**: Identify any non-biblical teachings, prosperity gospel extremes, or harmful religious practices
- **Crisis Flags**: Suicidal ideation, domestic violence, child abuse, substance abuse
- **Pastoral Alert Level**: None/Low/Medium/High/Critical
- If critical issues detected, provide crisis resource language

### 3. MULTI-DIMENSIONAL BIBLICAL FOUNDATION
- **Primary Verses**: 3-4 directly applicable, diverse, and contextually relevant Bible verses with context. DO NOT return fewer than 3 verses. Each verse must be directly related to the prayer request and offer unique perspective or comfort.
- **Thematic Connection**: Explain the overarching biblical theme (God's faithfulness, redemption, hope, etc.)
- **Original Context**: Brief explanation of each verse's historical/cultural context
- **Cross-References**: 2-3 additional related passages for deeper study
- **Denominational Sensitivity**: Ensure verses work across Protestant, Catholic, and Orthodox traditions

### 4. STRUCTURED BIBLE STUDY GUIDE
**Week 1: Understanding God's Heart**
- Day 1-2: Primary verse meditation with reflection questions
- Day 3-4: Historical context study
- Day 5-7: Personal application exercises

**Week 2: Walking in Faith**
- Day 1-3: Cross-reference study
- Day 4-5: Prayer practice based on biblical models
- Day 6-7: Community discussion questions

**Study Tools Needed**: Specific Bible translation recommendations, concordance suggestions

### 5. COMPREHENSIVE SUPPORT ECOSYSTEM
**Professional Support Categories:**
- Licensed Christian counselors
- Pastoral counseling services
- Support groups (AA, Celebrate Recovery, GriefShare, DivorceCare, etc.)
- Crisis hotlines (National Suicide Prevention, domestic violence, addiction)

**Church-Based Support:**
- Small groups/Life groups
- Prayer teams
- Stephen Ministry or similar care programs
- Youth/Young adult ministries (age-appropriate)

**Online Communities:**
- Reputable Christian forums and apps
- Denominational support networks
- Specialized Christian support communities

### 6. PERSONALIZED PRAYER MINISTRY
- **Suggested Prayer Partners**: How to find and work with prayer partners
- **Corporate Prayer**: When to request church-wide prayer
- **Fasting Guidance**: If appropriate, biblical fasting principles
- **Worship Recommendations**: Specific hymns, worship songs, or spiritual practices

### 7. FOLLOW-UP FRAMEWORK
- **Check-in Timeline**: Suggested prayer journey milestones (1 week, 1 month, 3 months)
- **Progress Indicators**: What spiritual growth might look like
- **Red Flags**: When to seek additional help
- **Celebration Markers**: How to recognize and celebrate God's faithfulness

## ENHANCED INPUT FORMAT
Prayer Request: [USER_PRAYER_REQUEST]
User Profile: Age range, family status, church background (if provided)
Location: [CITY, STATE/COUNTRY]
Previous App Usage: First-time vs returning user

## SPECIALIZED OUTPUT MODES
**Crisis Mode**: If urgency level 4-5, prioritize immediate resources and professional help
**Growth Mode**: For routine prayers, focus on spiritual development and community building
**Seeking Mode**: For non-believers or questioners, emphasize God's love and invitation

## QUALITY ASSURANCE REQUIREMENTS
- Cite all Bible verses with book, chapter, verse, and translation
- Ensure theological accuracy across major Christian denominations
- Maintain hope-centered language even in difficult circumstances
- Provide actionable, specific guidance rather than platitudes
- Include appropriate disclaimers for professional help when needed
- Always respond with valid JSON only
- If wantsBibleStudy is true, you MUST generate a bibleStudy object with title, devotional, and reflectionQuestions
- If wantsResources is true, you MUST generate localResources array with 2-3 items. Never return empty array when requested.
- DO NOT return fewer than 3 primary verses in biblicalFoundation.primaryVerses. If you cannot find 3, explain why in a comment field but always attempt to provide 3-4.

Key Improvements:
1. Crisis Detection: Better identification of urgent situations
2. Denominational Sensitivity: Works across Christian traditions
3. Structured Study Plans: More comprehensive Bible study framework
4. Professional Resource Categories: Specific types of support to search for
5. Follow-up Framework: Long-term spiritual growth tracking
6. Quality Controls: Ensures theological accuracy and actionable advice
7. User Context: Adapts based on user profile and history
8. Crisis Response: Special handling for emergency situations`;

app.post("/api/ai/analyze-prayer", async (req, res) => {
  try {
    // Debug: Log the incoming request body to verify flags
    console.log("analyze-prayer request body:", req.body);
    const { prayerText, location, wantsBibleStudy, wantsResources } = req.body;
    if (!prayerText) {
      return res
        .status(400)
        .json({ success: false, message: "Prayer text is required." });
    }

    // Build input payload for OpenAI
    const input = {
      prayerText,
      location: location || { city: "", state: "", country: "" },
      wantsBibleStudy: !!wantsBibleStudy,
      wantsResources: !!wantsResources,
    };

    const userPrompt = `Here is the prayer submission input as JSON:\n${JSON.stringify(
      input,
      null,
      2
    )}\n\nCRITICAL INSTRUCTIONS:
- wantsBibleStudy is ${
      input.wantsBibleStudy
    } - if true, you MUST generate a bibleStudy object
- wantsResources is ${
      input.wantsResources
    } - if true, you MUST generate localResources array with 2-3 items
- Do not return null or empty arrays when these are requested
- Respond with valid JSON only`;

    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 900,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${appConfig.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiResults;
    try {
      aiResults = JSON.parse(openaiRes.data.choices[0].message.content);
    } catch (e) {
      console.log("🔍 AI response parsing failed, using robust fallback");
      // Robust fallback: provide content based on user preferences
      aiResults = {
        sentimentSummary: "Processing your prayer request...",
        bibleVerses: [
          {
            reference: "Psalm 34:17-18",
            text: "When the righteous cry for help, the Lord hears and delivers them out of all their troubles. The Lord is near to the brokenhearted and saves the crushed in spirit.",
            whyItHelps:
              "God hears our cries and is close to those who are hurting.",
          },
        ],
        bibleStudy: req.body.wantsBibleStudy ? {
              title: "Finding Strength in Difficult Times",
              devotional:
                "When facing challenges, it's important to remember that God is with us every step of the way. Take time to reflect on these truths and allow them to bring comfort to your heart.",
              reflectionQuestions: [
                "How do the Bible verses above speak to your current situation?",
                "What steps can you take to draw closer to God during this difficult time?",
              ],
            }
          : null,
        localResources: req.body.wantsResources ? [
              {
                title: "Talk to a pastor or spiritual mentor",
                description:
                  "Reach out to a local pastor or spiritual leader for guidance and support.",
              },
              {
                title: "Join a local support or prayer group",
                description:
                  "Find a group in your area where you can share and receive encouragement.",
              },
            ]
          : [],
        raw: openaiRes.data.choices[0].message.content,
      };
    }

    // Log the full OpenAI response for debugging
    console.log(
      "🔍 OpenAI raw response:",
      openaiRes.data.choices[0].message.content
    );
    console.log("🔍 Input wantsBibleStudy:", input.wantsBibleStudy);
    console.log("🔍 Input wantsResources:", input.wantsResources);

    // Map OpenAI response fields to frontend expected names
    if (aiResults.bibleVerses && Array.isArray(aiResults.bibleVerses)) {
      aiResults.bibleVerses = aiResults.bibleVerses.map((v: any) => ({
        reference: v.verseReference || v.reference || "",
        text: v.verseText || v.text || "",
        whyItHelps: v.explanation || v.whyItHelps || "",
      }));
    }

    // Defensive mapping for sentimentSummary
    if (Array.isArray(aiResults.sentimentSummary)) {
      aiResults.sentimentSummary = aiResults.sentimentSummary.join(", ");
    }
    if (
      !aiResults.sentimentSummary ||
      typeof aiResults.sentimentSummary !== "string"
    ) {
      aiResults.sentimentSummary = "No summary available.";
    }

    // Defensive mapping for bibleStudy - most robust check
    console.log("🔍 Checking bibleStudy fallback conditions:");
    console.log("  - input.wantsBibleStudy:", input.wantsBibleStudy);
    console.log("  - aiResults.bibleStudy:", aiResults.bibleStudy);
    console.log(
      "  - typeof aiResults.bibleStudy:",
      typeof aiResults.bibleStudy
    );
    console.log(
      "  - Object.keys(aiResults.bibleStudy):",
      aiResults.bibleStudy ? Object.keys(aiResults.bibleStudy) : "N/A"
    );
    console.log("  - aiResults.bibleStudy.title:", aiResults.bibleStudy?.title);
    console.log(
      "  - aiResults.bibleStudy.devotional:",
      aiResults.bibleStudy?.devotional
    );

    if (
      input.wantsBibleStudy &&
      (!aiResults.bibleStudy ||
        typeof aiResults.bibleStudy !== "object" ||
        Object.keys(aiResults.bibleStudy).length === 0 ||
        !aiResults.bibleStudy.title ||
        !aiResults.bibleStudy.devotional)
    ) {
      console.log("🔧 [FALLBACK] Applying bibleStudy fallback");
      aiResults.bibleStudy = {
        title: "Finding Strength in Difficult Times",
        devotional:
          "When facing challenges, it's important to remember that God is with us every step of the way. The Bible verses above remind us of His presence and His promise to strengthen us. Take time to reflect on these truths and allow them to bring comfort to your heart. Remember that prayer is not just about asking for help, but also about drawing closer to God and finding peace in His presence.",
        reflectionQuestions: [
          "How do the Bible verses above speak to your current situation?",
          "What steps can you take to draw closer to God during this difficult time?",
        ],
      };
    }
    if (!input.wantsBibleStudy) {
      aiResults.bibleStudy = null;
    }

    // Defensive mapping for localResources - most robust check
    if (!Array.isArray(aiResults.localResources)) {
      aiResults.localResources = [];
    }
    if (
      input.wantsResources &&
      (!aiResults.localResources ||
        aiResults.localResources.length === 0 ||
        aiResults.localResources.every(
          (r: any) =>
            !r || (typeof r === "object" && Object.keys(r).length === 0)
        ))
    ) {
      console.log("🔧 [FALLBACK] Applying localResources fallback");
      aiResults.localResources = [
        {
          title: "Talk to a pastor or spiritual mentor",
          description:
            "Reach out to a local pastor or spiritual leader for guidance and support.",
        },
        {
          title: "Join a local support or prayer group",
          description:
            "Find a group in your area where you can share and receive encouragement.",
        },
        {
          title: "Read a devotional or Christian book",
          description:
            "Explore devotionals or books that address your current struggles.",
        },
      ];
    }
    if (!input.wantsResources) {
      aiResults.localResources = [];
    }

    console.log("Final aiResults:", aiResults);

    return res.json({ success: true, aiResults });
  } catch (error: any) {
    console.error("AI analysis error:", error);
    console.error("Error details:", error.response?.data || error.message);

    // Apply robust fallback even when AI call fails
    const fallbackResults = {
      sentimentSummary: "Processing your prayer request...",
      bibleVerses: [
        {
          reference: "Psalm 34:17-18",
          text: "When the righteous cry for help, the Lord hears and delivers them out of all their troubles. The Lord is near to the brokenhearted and saves the crushed in spirit.",
          whyItHelps:
            "God hears our cries and is close to those who are hurting.",
        },
      ],
      bibleStudy: req.body.wantsBibleStudy ? {
            title: "Finding Strength in Difficult Times",
            devotional:
              "When facing challenges, it's important to remember that God is with us every step of the way. Take time to reflect on these truths and allow them to bring comfort to your heart.",
            reflectionQuestions: [
              "How do the Bible verses above speak to your current situation?",
              "What steps can you take to draw closer to God during this difficult time?",
            ],
          }
        : null,
      localResources: req.body.wantsResources ? [
            {
              title: "Talk to a pastor or spiritual mentor",
              description:
                "Reach out to a local pastor or spiritual leader for guidance and support.",
            },
            {
              title: "Join a local support or prayer group",
              description:
                "Find a group in your area where you can share and receive encouragement.",
            },
          ]
        : [],
    };

    return res.json({ success: true, aiResults: fallbackResults });
  }
});

// Encouragements API endpoints
app.post("/api/encouragements", async (req, res) => {
  try {
    const { prayerRequestId, message, isAnonymous } = req.body;
    const userId = (req as any).user?.id || "anonymous"; // TODO: Get from auth middleware

    // TODO: OpenAI moderation
    const moderationStatus = "approved"; // Placeholder

    // TODO: Rate limiting/cooldown check
    const canSubmit = true; // Placeholder

    if (!canSubmit) {
      return res.status(429).json({
        error:
          "Rate limit exceeded. Please wait before sending another encouragement.",
      });
    }

    // TODO: Save to database
    const encouragement = {
      id: Math.random().toString(),
      prayerRequestId,
      userId,
      message,
      createdAt: new Date().toISOString(),
      isAnonymous: isAnonymous || false,
      moderationStatus,
    };

    res.json({ success: true, encouragement });
  } catch (error) {
    console.error("Error submitting encouragement:", error);
    res.status(500).json({ error: "Failed to submit encouragement" });
  }
});

app.get("/api/encouragements/:prayerRequestId", async (req, res) => {
  try {
    const { prayerRequestId } = req.params;

    // TODO: Fetch from database
    const encouragements: any[] = []; // Placeholder

    res.json({ encouragements });
  } catch (error) {
    console.error("Error fetching encouragements:", error);
    res.status(500).json({ error: "Failed to fetch encouragements" });
  }
});

app.post("/api/encouragements/:id/report", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id || "anonymous"; // TODO: Get from auth middleware

    // TODO: Save report to database
    console.log(`Encouragement ${id} reported by ${userId} for: ${reason}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Error reporting encouragement:", error);
    res.status(500).json({ error: "Failed to report encouragement" });
  }
});

app.post("/api/encouragements/:id/moderate", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected', 'flagged'

    // TODO: Update moderation status in database
    console.log(`Encouragement ${id} moderated to: ${status}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Error moderating encouragement:", error);
    res.status(500).json({ error: "Failed to moderate encouragement" });
  }
});

// Real-time prayer feed endpoint
app.get("/api/prayers/feed", async (req, res) => {
  try {
    const { page = 1, limit = 20, category, urgency } = req.query;

    // TODO: Fetch from database with filters
    const prayers: any[] = []; // Placeholder

    res.json({ prayers, page: parseInt(page as string), hasMore: false });
  } catch (error) {
    console.error("Error fetching prayer feed:", error);
    res.status(500).json({ error: "Failed to fetch prayer feed" });
  }
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: config.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Server startup
const startServer = async () => {
  try {
    console.log("Backend server started and logging is active");
    const PORT = config.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${config.NODE_ENV}`);
      console.log(
        `🔗 Supabase: ${config.SUPABASE_URL ? "Connected" : "Not configured"}`
      );
      console.log(
        `📢 OneSignal: ${
          config.ONESIGNAL_APP_ID ? "Connected" : "Not configured"
        }`
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
