import { GoogleGenAI, Type } from "@google/genai";
import { Patient, AIInsight } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        analysisSummary: {
            type: Type.STRING,
            description: "A brief, professional summary (2-3 sentences) detecting signs of improvement, regression, or stability."
        },
        suggestedProgress: {
            type: Type.INTEGER,
            description: "An integer between 0 and 100 representing the patient's current progress toward their treatment goals."
        },
        strategies: {
            type: Type.ARRAY,
            description: "An array of 3 daily strategies.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A short, actionable title for the strategy (e.g., 'Visual Schedule for Morning Routine')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A short paragraph explaining the strategy and its benefits."
                    }
                },
                required: ["title", "description"]
            }
        }
    },
    required: ["analysisSummary", "suggestedProgress", "strategies"]
};


export const generateAnalysisAndStrategies = async (patient: Patient, language: 'en' | 'ar'): Promise<AIInsight> => {
    const model = 'gemini-2.5-flash';
    
    const recentNotes = patient.sessionNotes.slice(0, 5).map(note => 
        `- Date: ${note.date}\n  Note: ${note.text}`
    ).join('\n');
    
    const instructionLanguage = language === 'ar' ? 'Arabic' : 'English';

    const systemInstruction = language === 'ar'
        ? "أنت مساعد ذكاء اصطناعي خبير لعلماء النفس المتخصصين في التوحد واضطرابات النمو. مهمتك هي تحليل بيانات المريض وملاحظات الجلسات لتقديم تقييم احترافي واستراتيجيات قابلة للتنفيذ بتنسيق JSON. يجب أن تكون جميع النصوص في الاستجابة باللغة العربية."
        : "You are an expert AI assistant for psychologists specializing in autism and developmental disorders. Your task is to analyze patient data and session notes to provide a professional assessment and actionable strategies in JSON format.";


    const prompt = `
Analyze the following patient file and session notes.

**Patient Information:**
- Name: ${patient.fullName}
- Age: ${patient.age}
- Diagnosis: ${patient.diagnosis}
- Case History: ${patient.caseHistory}
- Current Treatment Plan: ${patient.treatmentPlan}

**Recent Session Notes (most recent first):**
${recentNotes || "No session notes available."}

Based on this information, provide a JSON object following the specified schema. All text values in the JSON object (analysisSummary, strategy titles, and descriptions) must be in ${instructionLanguage}.
`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        // Basic validation
        if (parsedResponse && typeof parsedResponse.analysisSummary === 'string' && typeof parsedResponse.suggestedProgress === 'number' && Array.isArray(parsedResponse.strategies)) {
            return parsedResponse as AIInsight;
        } else {
            throw new Error("Received malformed JSON response from AI.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from AI. Ensure your API key is configured correctly.");
    }
};