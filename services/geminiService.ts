import { GoogleGenAI, Type } from "@google/genai";
import { Counselor, AiMatchResponse, AiMoodResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

export const matchCounselorsWithAI = async (
  userRequest: string,
  counselors: Counselor[]
): Promise<AiMatchResponse> => {
  const counselorContext = JSON.stringify(
    counselors.map((c) => ({
      id: c.id,
      name: c.name,
      specialties: c.specialties,
      bio: c.bio,
    }))
  );

  const prompt = `
    Context: A user is looking for a mental health counselor.
    User Request: "${userRequest}"
    Available Counselors: ${counselorContext}

    Task: Select up to 3 counselors that best fit the user's request based on their specialties and bio.
    Return a JSON object with 'matchedCounselorIds' (array of strings) and 'reasoning' (a short string explaining the match).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedCounselorIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reasoning: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AiMatchResponse;
  } catch (error) {
    console.error("AI Matching failed:", error);
    return { matchedCounselorIds: [], reasoning: "AI service temporarily unavailable. Please browse manually." };
  }
};

export const analyzeMoodWithAI = async (
  journalContent: string
): Promise<AiMoodResponse> => {
  const prompt = `
    Analyze the following journal entry for sentiment and mental state.
    Journal: "${journalContent}"

    Task:
    1. Assign a mood score from 1 (Very Negative/Depressed) to 10 (Very Positive/Joyful).
    2. Provide a 1-sentence sentiment summary.
    3. Provide a short, actionable self-care suggestion or coping strategy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moodScore: { type: Type.NUMBER },
            sentiment: { type: Type.STRING },
            suggestion: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AiMoodResponse;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { moodScore: 5, sentiment: "Unable to analyze", suggestion: "Take a deep breath." };
  }
};
