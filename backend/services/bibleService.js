const OpenAI = require('openai');
const axios = require('axios');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Bible API configuration (using api.scripture.api.bible or similar)
const BIBLE_API_KEY = process.env.BIBLE_API_KEY;
const BIBLE_API_BASE_URL = 'https://api.scripture.api.bible/v1';

// Generate relevant Bible verses based on prayer content
async function generateBibleVerses(prayerContent, category) {
  try {
    const prompt = `Based on this prayer: "${prayerContent}" (Category: ${category})
    
    Please provide 3-5 relevant Bible verses that would comfort, encourage, or guide someone with this prayer request. 
    Format the response as a JSON array with objects containing:
    - reference: The Bible reference (e.g., "John 3:16")
    - text: The verse text
    - relevance: A brief explanation of why this verse is relevant (1-2 sentences)
    
    Focus on verses that are encouraging, hopeful, and directly related to the prayer's theme.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a compassionate biblical counselor who provides relevant scripture for people's prayers and concerns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = response.choices[0].message.content;
    
    // Parse the response
    try {
      const verses = JSON.parse(content);
      return verses.map(verse => ({
        reference: verse.reference,
        text: verse.text,
        version: 'NIV'
      }));
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('Error parsing verses:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating Bible verses:', error);
    throw error;
  }
}

// Generate a guided Bible study based on prayer
async function generateBibleStudy(prayer) {
  try {
    const prompt = `Create a guided Bible study based on this prayer request:
    Title: ${prayer.title}
    Content: ${prayer.content}
    Category: ${prayer.category}
    
    Generate a comprehensive 15-20 minute Bible study that includes:
    1. A title for the study
    2. A central theme
    3. An introduction (2-3 sentences)
    4. 3-4 relevant Bible verses with explanations and reflection questions
    5. 3-4 discussion questions
    6. 3 key takeaways
    7. 3 prayer points related to the original prayer
    
    Format as JSON with the structure matching our BibleStudy schema.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an experienced Bible study leader creating personalized study sessions that help people grow spiritually through their prayer requests."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const content = response.choices[0].message.content;
    
    try {
      const studyData = JSON.parse(content);
      
      return {
        title: studyData.title,
        theme: studyData.theme,
        introduction: studyData.introduction,
        verses: studyData.verses.map(v => ({
          reference: v.reference,
          text: v.text,
          version: 'NIV',
          explanation: v.explanation,
          reflection: v.reflection
        })),
        questions: studyData.questions.map(q => ({
          question: q
        })),
        keyTakeaways: studyData.keyTakeaways,
        prayerPoints: studyData.prayerPoints,
        duration: 15
      };
    } catch (parseError) {
      console.error('Error parsing Bible study:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Error generating Bible study:', error);
    throw error;
  }
}

// Get specific Bible verse text (can integrate with actual Bible API)
async function getBibleVerse(reference, version = 'NIV') {
  try {
    // This is a placeholder - you would integrate with a real Bible API
    // For now, we'll use GPT to get the verse text
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a Bible reference system. Provide the exact text of the requested Bible verse in ${version} version.`
        },
        {
          role: "user",
          content: `Please provide the text for ${reference}`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    throw error;
  }
}

// Search Bible verses by keyword or theme
async function searchBibleVerses(keyword, limit = 10) {
  try {
    const prompt = `Find ${limit} Bible verses related to "${keyword}". 
    Return as JSON array with objects containing:
    - reference: Bible reference
    - text: Verse text
    - relevance: Why this verse relates to the keyword`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a Bible search system that finds relevant verses based on themes and keywords."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    const content = response.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing search results:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error searching Bible verses:', error);
    throw error;
  }
}

module.exports = {
  generateBibleVerses,
  generateBibleStudy,
  getBibleVerse,
  searchBibleVerses
};