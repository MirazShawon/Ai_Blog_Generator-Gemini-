// /app/api/gemini-topics/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || '');

interface TopicRequest {
  topic: string;
  keywords?: string;
  tone?: "casual" | "formal" | "friendly" | "conversational" | "authoritative" | "professional";
  style?: "educational" | "persuasive" | "analytical" | "narrative" | "how-to" | "opinion" | "informative";
}

interface TopicResponse {
  success: boolean;
  topics?: string[];
  error?: string;
  requiresRetry?: boolean;
  partialSuccess?: boolean;
  message?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { topic, keywords, tone = "professional", style = "informative" }: TopicRequest = await request.json();
    
    // Input validation
    if (!topic || typeof topic !== 'string') {
      return Response.json(
        { success: false, error: "Valid topic is required" } as TopicResponse,
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Construct the prompt with tone and style
    let prompt: string = `Generate exactly 5 engaging, creative, and specific blog post ideas about "${topic}".`;
    
    if (keywords && keywords.trim()) {
      prompt += ` Include these keywords where appropriate: ${keywords}.`;
    }
    
    prompt += ` The content should be written in a ${tone} tone with an ${style} style.`;
    
    // Add specific instructions based on tone
    switch (tone) {
      case "casual":
        prompt += " Use conversational language and relatable examples.";
        break;
      case "formal":
        prompt += " Use formal language and professional terminology.";
        break;
      case "friendly":
        prompt += " Use warm, approachable language that connects with readers.";
        break;
      case "conversational":
        prompt += " Write as if speaking directly to the reader in a natural, engaging way.";
        break;
      case "authoritative":
        prompt += " Use confident, expert language that establishes credibility.";
        break;
      default: // professional
        prompt += " Use clear, professional language appropriate for business contexts.";
    }
    
    // Add specific instructions based on style
    switch (style) {
      case "educational":
        prompt += " Focus on teaching and explaining concepts clearly.";
        break;
      case "persuasive":
        prompt += " Focus on convincing readers and presenting compelling arguments.";
        break;
      case "analytical":
        prompt += " Focus on data-driven insights and detailed analysis.";
        break;
      case "narrative":
        prompt += " Focus on storytelling and personal experiences.";
        break;
      case "how-to":
        prompt += " Focus on step-by-step guides and practical instructions.";
        break;
      case "opinion":
        prompt += " Focus on personal viewpoints and editorial perspectives.";
        break;
      default: // informative
        prompt += " Focus on providing valuable information and insights.";
    }
    
    prompt += ` Format the output as a JSON array of 5 strings, with no additional text or explanation. Each title should be concise but descriptive and reflect the requested ${tone} tone and ${style} style.`;
    
    console.log("Sending prompt to Gemini:", prompt);
    
    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text: string = response.text();
    console.log("Received response from Gemini:", text);
    
    // Parse the response - handle different possible formats
    let topics: string[] = [];
    let extractionFailed: boolean = false;
    
    try {
      
      topics = JSON.parse(text);
      
      // If somehow we get an object instead of array, extract values
      if (!Array.isArray(topics) && typeof topics === 'object') {
        topics = Object.values(topics);
      }
    } catch (err) {
      // If JSON parsing fails, try to extract titles from the text
      console.log("Failed to parse JSON, extracting titles from text");
      topics = text
        .split(/\r?\n/)
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim())
        .slice(2, 7);
    }
    
    // Check if extraction failed or returned insufficient results
    if (!Array.isArray(topics) || topics.length < 1) {
      extractionFailed = true;
      return Response.json({ 
        success: false, 
        error: "Failed to generate topics with the AI model",
        requiresRetry: true
      } as TopicResponse, { status: 422 });
    }
    
    // Ensure we have exactly 5 topics by truncating or adding generic ones
    while (topics.length > 5) topics.pop();
    
    // If we have less than 5 topics but at least 1, it's a partial success
    const partialSuccess: boolean = topics.length > 0 && topics.length < 5;
    
    if (partialSuccess) {
      return Response.json({ 
        success: true, 
        topics,
        partialSuccess: true,
        message: "Only generated " + topics.length + " topics. You may want to retry for a full set of 5."
      } as TopicResponse);
    }
    
    return Response.json({ 
      success: true, 
      topics 
    } as TopicResponse);
  } catch (error) {
    console.error("Error generating topics with Gemini:", error);
    return Response.json(
      { 
        success: false, 
        error: "Failed to generate topics. Please try again.",
        requiresRetry: true
      } as TopicResponse,
      { status: 500 }
    );
  }
}



