const OpenAI = require('openai');
const bibleService = require('./bibleService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryOperation(operation, maxRetries = this.maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`AI operation attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  async generateBibleVersesForPrayer(prayerContent, category, urgency = 'medium') {
    try {
      const prompt = `
        Given this prayer request in the "${category}" category with "${urgency}" urgency:
        
        "${prayerContent}"
        
        Please suggest 3-5 relevant Bible verses that would provide comfort, guidance, or encouragement for this prayer request. 
        
        For each verse, provide:
        1. The verse text
        2. The Bible reference (book, chapter, verse)
        3. A brief explanation of why this verse is relevant (1-2 sentences)
        4. A relevance score from 0.1 to 1.0
        
        Format the response as a JSON array with this structure:
        [
          {
            "verse": "verse text here",
            "reference": "Book Chapter:Verse",
            "explanation": "why this verse is relevant",
            "relevanceScore": 0.9
          }
        ]
        
        Focus on verses that directly address the prayer concern and provide hope, wisdom, or comfort.
      `;

      const response = await this.retryOperation(async () => {
        return await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a knowledgeable Bible scholar and pastoral counselor. Provide relevant, accurate Bible verses with proper references and helpful explanations. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        });
      });

      const content = response.choices[0].message.content;
      
      try {
        const verses = JSON.parse(content);
        
        // Validate the response structure
        if (!Array.isArray(verses)) {
          throw new Error('Response is not an array');
        }
        
        // Validate each verse object
        const validatedVerses = verses.map(verse => {
          if (!verse.verse || !verse.reference || !verse.explanation || typeof verse.relevanceScore !== 'number') {
            throw new Error('Invalid verse structure');
          }
          
          return {
            verse: verse.verse.trim(),
            reference: verse.reference.trim(),
            explanation: verse.explanation.trim(),
            relevanceScore: Math.max(0.1, Math.min(1.0, verse.relevanceScore)),
            aiGenerated: true,
            translation: 'NIV'
          };
        });
        
        return validatedVerses;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        
        // Fallback to default verses for the category
        return this.getFallbackVerses(category);
      }
    } catch (error) {
      console.error('Error generating Bible verses:', error);
      
      // Return fallback verses if AI fails
      return this.getFallbackVerses(category);
    }
  }

  async generateStudyGuide(prayer, bibleVerses) {
    try {
      const prompt = `
        Create a comprehensive Bible study guide for this prayer request:
        
        Title: "${prayer.title}"
        Category: "${prayer.category}"
        Prayer: "${prayer.content}"
        
        Related Bible verses:
        ${bibleVerses.map(v => `- ${v.reference}: ${v.verse}`).join('\n')}
        
        Create a study guide with the following structure:
        1. A compelling title (50 characters max)
        2. A description explaining the study's purpose (200 characters max)
        3. Estimated duration in minutes (15-45 minutes)
        4. Difficulty level (beginner, intermediate, advanced)
        5. 3-5 study sections, each with:
           - Section title
           - Content (teaching/explanation)
           - 2-3 reflection questions
           - Related verses
        6. 3-5 key verses with explanations
        7. 5 prayer prompts of different types
        8. 5 reflection questions
        9. 3-5 practical action steps
        10. Relevant tags
        
        Format as JSON with this structure:
        {
          "title": "Study title",
          "description": "Study description",
          "estimatedDuration": 20,
          "difficulty": "beginner",
          "sections": [
            {
              "title": "Section title",
              "content": "Teaching content",
              "verses": [
                {
                  "verse": "verse text",
                  "reference": "reference",
                  "translation": "NIV"
                }
              ],
              "questions": [
                {
                  "question": "question text",
                  "type": "reflection",
                  "hints": ["hint1", "hint2"]
                }
              ],
              "order": 1
            }
          ],
          "keyVerses": [
            {
              "verse": "verse text",
              "reference": "reference",
              "translation": "NIV",
              "explanation": "explanation"
            }
          ],
          "prayerPrompts": [
            {
              "prompt": "prayer prompt",
              "category": "praise"
            }
          ],
          "reflectionQuestions": [
            {
              "question": "reflection question",
              "category": "personal"
            }
          ],
          "actionSteps": [
            {
              "step": "action step",
              "description": "description",
              "order": 1
            }
          ],
          "tags": ["tag1", "tag2"]
        }
        
        Make the study practical, encouraging, and deeply rooted in biblical truth.
      `;

      const response = await this.retryOperation(async () => {
        return await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an experienced Bible teacher and curriculum designer. Create comprehensive, practical Bible study guides that help people apply Scripture to their lives. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.8,
        });
      });

      const content = response.choices[0].message.content;
      
      try {
        const studyGuide = JSON.parse(content);
        
        // Add metadata
        studyGuide.category = prayer.category;
        studyGuide.createdBy = 'ai';
        studyGuide.aiPrompt = prompt.substring(0, 1000);
        
        return studyGuide;
      } catch (parseError) {
        console.error('Failed to parse study guide response:', parseError);
        
        // Return a basic fallback study guide
        return this.getFallbackStudyGuide(prayer);
      }
    } catch (error) {
      console.error('Error generating study guide:', error);
      
      // Return fallback study guide
      return this.getFallbackStudyGuide(prayer);
    }
  }

  async enhancePrayerTags(prayerContent, category) {
    try {
      const prompt = `
        Analyze this prayer request and suggest 5-8 relevant tags:
        
        Category: "${category}"
        Prayer: "${prayerContent}"
        
        Suggest tags that capture:
        1. The main themes or topics
        2. Emotional states or feelings
        3. Specific life situations
        4. Biblical concepts or themes
        5. Types of prayer (intercession, petition, thanksgiving, etc.)
        
        Return only a JSON array of strings, lowercase, no spaces:
        ["tag1", "tag2", "tag3"]
        
        Keep tags concise and relevant.
      `;

      const response = await this.retryOperation(async () => {
        return await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a content categorization expert. Analyze text and provide relevant tags. Always respond with valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.5,
        });
      });

      const content = response.choices[0].message.content;
      
      try {
        const tags = JSON.parse(content);
        
        if (Array.isArray(tags)) {
          return tags.map(tag => tag.toLowerCase().trim()).slice(0, 8);
        }
        
        return this.getFallbackTags(category);
      } catch (parseError) {
        console.error('Failed to parse tags response:', parseError);
        return this.getFallbackTags(category);
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      return this.getFallbackTags(category);
    }
  }

  getFallbackVerses(category) {
    const fallbackVerses = {
      healing: [
        {
          verse: "But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.",
          reference: "Isaiah 53:5",
          explanation: "God's healing comes through Jesus' sacrifice for us.",
          relevanceScore: 0.9,
          aiGenerated: false,
          translation: "NIV"
        }
      ],
      family: [
        {
          verse: "As for me and my household, we will serve the Lord.",
          reference: "Joshua 24:15",
          explanation: "A declaration of faith and commitment for families.",
          relevanceScore: 0.8,
          aiGenerated: false,
          translation: "NIV"
        }
      ],
      // Add more fallback verses for other categories
    };
    
    return fallbackVerses[category] || fallbackVerses.spiritual || [];
  }

  getFallbackStudyGuide(prayer) {
    return {
      title: `Study Guide for ${prayer.category} Prayer`,
      description: `A Bible study focused on ${prayer.category} and trusting God.`,
      estimatedDuration: 20,
      difficulty: 'beginner',
      sections: [
        {
          title: 'Understanding God\'s Heart',
          content: 'God cares deeply about every aspect of our lives and wants us to bring our concerns to Him in prayer.',
          verses: [
            {
              verse: "Cast all your anxiety on him because he cares for you.",
              reference: "1 Peter 5:7",
              translation: "NIV"
            }
          ],
          questions: [
            {
              question: "How does knowing God cares for you change your perspective on this situation?",
              type: "reflection",
              hints: ["Think about God's character", "Consider His love for you"]
            }
          ],
          order: 1
        }
      ],
      keyVerses: [
        {
          verse: "Cast all your anxiety on him because he cares for you.",
          reference: "1 Peter 5:7",
          translation: "NIV",
          explanation: "We can trust God with our concerns because He loves us."
        }
      ],
      prayerPrompts: [
        {
          prompt: "Thank God for His love and care for you",
          category: "thanksgiving"
        }
      ],
      reflectionQuestions: [
        {
          question: "How can you trust God more deeply in this situation?",
          category: "personal"
        }
      ],
      actionSteps: [
        {
          step: "Spend time in prayer daily about this concern",
          description: "Set aside specific time each day to pray about this matter",
          order: 1
        }
      ],
      tags: [prayer.category, "trust", "faith", "prayer"]
    };
  }

  getFallbackTags(category) {
    const categoryTags = {
      healing: ["healing", "health", "restoration", "hope"],
      family: ["family", "relationships", "love", "unity"],
      work: ["work", "provision", "purpose", "wisdom"],
      financial: ["provision", "stewardship", "trust", "needs"],
      spiritual: ["faith", "growth", "discipleship", "prayer"],
      guidance: ["wisdom", "direction", "decisions", "guidance"],
      thanksgiving: ["gratitude", "thankfulness", "praise", "blessings"],
      forgiveness: ["forgiveness", "mercy", "reconciliation", "grace"],
      protection: ["protection", "safety", "security", "peace"],
      strength: ["strength", "courage", "perseverance", "endurance"],
      peace: ["peace", "comfort", "rest", "anxiety"],
      other: ["prayer", "faith", "trust", "hope"]
    };
    
    return categoryTags[category] || categoryTags.other;
  }
}

module.exports = new AIService();