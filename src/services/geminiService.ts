
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCl-Ys-YuIoTBzN0fI8gcLmyIZsRp_zxWY';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface MedicalAnalysisResult {
  patientInfo: {
    name: string;
    age: string;
    gender: string;
  };
  symptoms: string[];
  detailedAnalysis: {
    possibleCauses: string;
    medications: string;
    prescriptions: string;
    lifestyle: string;
  };
  followUp: string;
}

export const analyzeMedicalTranscription = async (transcription: string): Promise<MedicalAnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    You are an experienced medical AI assistant. Analyze the following medical transcription and provide comprehensive medical information. 
    The transcription may be in multiple languages (English, Telugu, Hindi, Tamil, Kannada).
    
    Transcription: "${transcription}"
    
    Please provide a detailed JSON response with the following structure:
    {
      "patientInfo": {
        "name": "patient name if mentioned, or 'Not specified'",
        "age": "patient age if mentioned, or 'Not specified'", 
        "gender": "patient gender if mentioned, or 'Not specified'"
      },
      "symptoms": ["list of symptoms identified"],
      "detailedAnalysis": {
        "possibleCauses": "Detailed explanation of potential causes for the symptoms (200-250 words)",
        "medications": "Comprehensive list and explanation of recommended medications, dosages, and administration (300-350 words)",
        "prescriptions": "Detailed prescription recommendations with specific drug names, dosages, frequency, and duration (250-300 words)",
        "lifestyle": "Lifestyle modifications, dietary recommendations, and preventive measures (150-200 words)"
      },
      "followUp": "Detailed follow-up instructions and when to seek immediate medical attention"
    }
    
    Guidelines for detailed analysis:
    - Provide comprehensive medical information based on symptoms
    - Include both generic and brand names for medications where applicable
    - Specify exact dosages, frequency, and duration for prescriptions
    - Explain the mechanism of action for recommended medications
    - Include potential side effects and contraindications
    - Provide alternative treatment options
    - Consider age-appropriate medications if age is mentioned
    - Include both allopathic and complementary treatment suggestions
    - Mention when to seek emergency medical care
    - Be culturally sensitive to multilingual context
    - Total response should be approximately 1000 words in the detailed analysis section
    
    IMPORTANT: Always emphasize that this is educational information and professional medical consultation is required for proper diagnosis and treatment.
    
    Respond ONLY with valid JSON, no additional text or markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('Raw Gemini API response:', text);
    
    // Clean the response - remove markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    console.log('Cleaned response for parsing:', text);
    
    // Parse the JSON response
    const analysisResult = JSON.parse(text);
    console.log('Successfully parsed analysis result:', analysisResult);
    return analysisResult;
    
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    
    // Fallback response in case of API error
    return {
      patientInfo: {
        name: "Not specified",
        age: "Not specified", 
        gender: "Not specified"
      },
      symptoms: ["Analysis failed - please try again"],
      detailedAnalysis: {
        possibleCauses: "Unable to analyze possible causes due to API error. Please consult a healthcare provider for proper medical evaluation.",
        medications: "Unable to provide medication recommendations due to analysis failure. Please seek professional medical advice.",
        prescriptions: "Unable to generate prescription recommendations. Consult with a qualified healthcare provider for proper medication guidance.",
        lifestyle: "General advice: Maintain good hygiene, adequate rest, and proper nutrition. Consult a healthcare provider for specific recommendations."
      },
      followUp: "Please consult with a qualified healthcare provider for proper medical analysis and treatment recommendations."
    };
  }
};
