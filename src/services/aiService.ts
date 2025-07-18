import { supabase } from "./authService";

const API_BASE_URL = "http://localhost:3000"; // Update this to your backend URL

export interface PrayerAnalysisRequest {
  prayerText: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  wantsBibleStudy: boolean;
  wantsResources: boolean;
}

export interface BibleVerse {
  reference: string;
  text: string;
  whyItHelps: string;
}

export interface BibleStudy {
  title: string;
  devotional: string;
  reflectionQuestions: string[];
}

export interface Resource {
  title: string;
  type: string;
  description: string;
}

export interface AIAnalysisResults {
  sentiment: "positive" | "negative" | "neutral";
  bibleVerse: BibleVerse;
  bibleStudy: BibleStudy;
  resources: Resource[];
}

export interface PrayerAnalysisResponse {
  success: boolean;
  aiResults: {
    sentimentSummary: string;
    bibleVerses: BibleVerse[];
    bibleStudy?: BibleStudy | null;
    localResources?: any[];
    raw?: string;
  };
  message?: string;
  error?: string;
}

export const aiService = {
  async analyzePrayer(
    request: PrayerAnalysisRequest
  ): Promise<PrayerAnalysisResponse> {
    try {
      console.log("🔍 Frontend: Calling AI service with request:", request);
      console.log(
        "🔍 Frontend: API URL:",
        `${API_BASE_URL}/api/ai/analyze-prayer`
      );

      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-prayer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("🔍 Frontend: Received response from backend:", data);
      return data;
    } catch (error: any) {
      console.error("AI analysis error:", error);
      throw new Error(
        `Failed to analyze prayer: ${error.message || "Unknown error"}`
      );
    }
  },

  async savePrayerRequest(prayerData: any): Promise<any> {
    try {
      // Transform the data to match the database schema
      const dbData = {
        user_id:
          prayerData.userId || (await supabase.auth.getUser()).data.user?.id,
        title: prayerData.prayerText.substring(0, 100), // Use first 100 chars as title
        description: prayerData.prayerText,
        category: prayerData.category,
        anonymous: prayerData.anonymous,
        first_name_only: prayerData.firstNameOnly,
        city: prayerData.city,
        state: prayerData.state,
        country: prayerData.country,
        share_facebook: prayerData.shareFacebook,
        share_x: prayerData.shareX,
        share_instagram: prayerData.shareInstagram,
        bible_study: prayerData.bibleStudy,
        resource_rec: prayerData.resourceRec,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("prayer_requests")
        .insert([dbData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error("Save prayer request error:", error);
      throw new Error(
        `Failed to save prayer request: ${error.message || "Unknown error"}`
      );
    }
  },
};