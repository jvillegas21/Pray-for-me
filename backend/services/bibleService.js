const axios = require('axios');

class BibleService {
  constructor() {
    this.apiKey = process.env.BIBLE_API_KEY;
    this.baseURL = process.env.BIBLE_API_URL || 'https://api.scripture.api.bible/v1';
    this.defaultBibleId = 'de4e12af7f28f599-02'; // NIV Bible ID
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(endpoint, params = {}) {
    const headers = {
      'api-key': this.apiKey,
      'Content-Type': 'application/json',
    };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          headers,
          params,
        });
        
        return response.data;
      } catch (error) {
        console.error(`Bible API attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  async getBibles() {
    try {
      const data = await this.makeRequest('/bibles');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching Bibles:', error);
      return [];
    }
  }

  async getBooks(bibleId = this.defaultBibleId) {
    try {
      const data = await this.makeRequest(`/bibles/${bibleId}/books`);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  }

  async getChapters(bibleId = this.defaultBibleId, bookId) {
    try {
      const data = await this.makeRequest(`/bibles/${bibleId}/books/${bookId}/chapters`);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  }

  async getVerse(bibleId = this.defaultBibleId, verseId) {
    try {
      const data = await this.makeRequest(`/bibles/${bibleId}/verses/${verseId}`, {
        'content-type': 'text',
        'include-notes': false,
        'include-titles': false,
        'include-chapter-numbers': false,
        'include-verse-numbers': false,
      });
      
      return data.data || null;
    } catch (error) {
      console.error('Error fetching verse:', error);
      return null;
    }
  }

  async getVerseByReference(reference, bibleId = this.defaultBibleId) {
    try {
      // Parse the reference (e.g., "John 3:16" or "1 John 3:16")
      const parsedRef = this.parseReference(reference);
      if (!parsedRef) {
        throw new Error('Invalid reference format');
      }

      const verseId = this.buildVerseId(parsedRef);
      return await this.getVerse(bibleId, verseId);
    } catch (error) {
      console.error('Error fetching verse by reference:', error);
      return null;
    }
  }

  async searchVerses(query, bibleId = this.defaultBibleId, limit = 10) {
    try {
      const data = await this.makeRequest(`/bibles/${bibleId}/search`, {
        query,
        limit,
        'content-type': 'text',
        'include-notes': false,
        'include-titles': false,
        'include-chapter-numbers': false,
        'include-verse-numbers': false,
      });
      
      return data.data?.verses || [];
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  async getVerseOfTheDay(bibleId = this.defaultBibleId) {
    try {
      // Get a random verse from a list of popular verses
      const popularVerses = [
        'JHN.3.16', // John 3:16
        'PSA.23.1', // Psalm 23:1
        'PHP.4.13', // Philippians 4:13
        'JER.29.11', // Jeremiah 29:11
        'ROM.8.28', // Romans 8:28
        'ISA.41.10', // Isaiah 41:10
        'MAT.6.26', // Matthew 6:26
        'PRO.3.5-6', // Proverbs 3:5-6
        'JHN.14.6', // John 14:6
        'EPH.2.8-9', // Ephesians 2:8-9
      ];

      const randomIndex = Math.floor(Math.random() * popularVerses.length);
      const verseId = popularVerses[randomIndex];
      
      return await this.getVerse(bibleId, verseId);
    } catch (error) {
      console.error('Error fetching verse of the day:', error);
      return null;
    }
  }

  async getVersesByCategory(category, bibleId = this.defaultBibleId, limit = 5) {
    try {
      const searchQueries = this.getCategorySearchQueries(category);
      
      if (searchQueries.length === 0) {
        return [];
      }

      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
      const verses = await this.searchVerses(randomQuery, bibleId, limit);
      
      return verses.map(verse => ({
        verse: verse.text,
        reference: verse.reference,
        translation: 'NIV',
        category: category,
      }));
    } catch (error) {
      console.error('Error fetching verses by category:', error);
      return [];
    }
  }

  getCategorySearchQueries(category) {
    const categoryQueries = {
      healing: ['heal', 'healing', 'restore', 'strength', 'recovery'],
      family: ['family', 'children', 'parents', 'household', 'marriage'],
      work: ['work', 'labor', 'diligent', 'provision', 'calling'],
      relationships: ['love', 'friendship', 'unity', 'fellowship', 'relationships'],
      financial: ['provision', 'needs', 'money', 'stewardship', 'giving'],
      spiritual: ['faith', 'prayer', 'worship', 'God', 'Jesus'],
      guidance: ['wisdom', 'guidance', 'direction', 'path', 'way'],
      thanksgiving: ['thankful', 'gratitude', 'praise', 'blessings'],
      forgiveness: ['forgive', 'mercy', 'grace', 'reconciliation'],
      protection: ['protect', 'safety', 'refuge', 'shelter', 'security'],
      strength: ['strength', 'courage', 'power', 'endurance'],
      peace: ['peace', 'calm', 'rest', 'anxiety', 'worry'],
      other: ['hope', 'joy', 'love', 'faith', 'trust'],
    };
    
    return categoryQueries[category] || categoryQueries.other;
  }

  parseReference(reference) {
    try {
      // Handle various reference formats
      // Examples: "John 3:16", "1 John 3:16", "Psalm 23:1-3", "Genesis 1:1"
      const regex = /^(\d?\s?[A-Za-z]+)\s(\d+):(\d+)(?:-(\d+))?$/;
      const match = reference.match(regex);
      
      if (!match) {
        return null;
      }
      
      const [, book, chapter, startVerse, endVerse] = match;
      
      return {
        book: book.trim(),
        chapter: parseInt(chapter),
        startVerse: parseInt(startVerse),
        endVerse: endVerse ? parseInt(endVerse) : null,
      };
    } catch (error) {
      console.error('Error parsing reference:', error);
      return null;
    }
  }

  buildVerseId(parsedRef) {
    try {
      const bookAbbreviation = this.getBookAbbreviation(parsedRef.book);
      
      if (parsedRef.endVerse) {
        return `${bookAbbreviation}.${parsedRef.chapter}.${parsedRef.startVerse}-${parsedRef.endVerse}`;
      } else {
        return `${bookAbbreviation}.${parsedRef.chapter}.${parsedRef.startVerse}`;
      }
    } catch (error) {
      console.error('Error building verse ID:', error);
      return null;
    }
  }

  getBookAbbreviation(bookName) {
    const bookAbbreviations = {
      // Old Testament
      'Genesis': 'GEN',
      'Exodus': 'EXO',
      'Leviticus': 'LEV',
      'Numbers': 'NUM',
      'Deuteronomy': 'DEU',
      'Joshua': 'JOS',
      'Judges': 'JDG',
      'Ruth': 'RUT',
      '1 Samuel': '1SA',
      '2 Samuel': '2SA',
      '1 Kings': '1KI',
      '2 Kings': '2KI',
      '1 Chronicles': '1CH',
      '2 Chronicles': '2CH',
      'Ezra': 'EZR',
      'Nehemiah': 'NEH',
      'Esther': 'EST',
      'Job': 'JOB',
      'Psalms': 'PSA',
      'Psalm': 'PSA',
      'Proverbs': 'PRO',
      'Ecclesiastes': 'ECC',
      'Song of Solomon': 'SNG',
      'Isaiah': 'ISA',
      'Jeremiah': 'JER',
      'Lamentations': 'LAM',
      'Ezekiel': 'EZK',
      'Daniel': 'DAN',
      'Hosea': 'HOS',
      'Joel': 'JOL',
      'Amos': 'AMO',
      'Obadiah': 'OBA',
      'Jonah': 'JON',
      'Micah': 'MIC',
      'Nahum': 'NAM',
      'Habakkuk': 'HAB',
      'Zephaniah': 'ZEP',
      'Haggai': 'HAG',
      'Zechariah': 'ZEC',
      'Malachi': 'MAL',
      
      // New Testament
      'Matthew': 'MAT',
      'Mark': 'MRK',
      'Luke': 'LUK',
      'John': 'JHN',
      'Acts': 'ACT',
      'Romans': 'ROM',
      '1 Corinthians': '1CO',
      '2 Corinthians': '2CO',
      'Galatians': 'GAL',
      'Ephesians': 'EPH',
      'Philippians': 'PHP',
      'Colossians': 'COL',
      '1 Thessalonians': '1TH',
      '2 Thessalonians': '2TH',
      '1 Timothy': '1TI',
      '2 Timothy': '2TI',
      'Titus': 'TIT',
      'Philemon': 'PHM',
      'Hebrews': 'HEB',
      'James': 'JAS',
      '1 Peter': '1PE',
      '2 Peter': '2PE',
      '1 John': '1JN',
      '2 John': '2JN',
      '3 John': '3JN',
      'Jude': 'JUD',
      'Revelation': 'REV',
    };
    
    return bookAbbreviations[bookName] || bookName.toUpperCase().substring(0, 3);
  }

  async validateReference(reference) {
    try {
      const parsedRef = this.parseReference(reference);
      if (!parsedRef) {
        return false;
      }
      
      const verse = await this.getVerseByReference(reference);
      return verse !== null;
    } catch (error) {
      console.error('Error validating reference:', error);
      return false;
    }
  }

  getBibleTranslations() {
    return [
      { id: 'de4e12af7f28f599-02', name: 'New International Version (NIV)', abbreviation: 'NIV' },
      { id: 'bba9f40183526463-01', name: 'King James Version (KJV)', abbreviation: 'KJV' },
      { id: '9879dbb7cfe39e4d-01', name: 'New Living Translation (NLT)', abbreviation: 'NLT' },
      { id: '01b29f4b342acc35-01', name: 'English Standard Version (ESV)', abbreviation: 'ESV' },
      { id: 'f421fe261da7624f-01', name: 'New American Standard Bible (NASB)', abbreviation: 'NASB' },
    ];
  }

  async getMultipleTranslations(reference, translations = ['NIV', 'KJV', 'NLT']) {
    try {
      const results = [];
      const bibleTranslations = this.getBibleTranslations();
      
      for (const translation of translations) {
        const bibleInfo = bibleTranslations.find(b => b.abbreviation === translation);
        if (bibleInfo) {
          const verse = await this.getVerseByReference(reference, bibleInfo.id);
          if (verse) {
            results.push({
              verse: verse.content,
              reference: verse.reference,
              translation: translation,
            });
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error fetching multiple translations:', error);
      return [];
    }
  }
}

module.exports = new BibleService();