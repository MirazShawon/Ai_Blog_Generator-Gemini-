// AI Content Generation Service using Google Generative AI
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// AI service configuration and initialization
class ContentGenerationService {
  private aiClient: GoogleGenerativeAI;
  private modelName: string = "gemini-2.0-flash";

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Google Gemini API key not configured');
    }
    this.aiClient = new GoogleGenerativeAI(apiKey);
  }

  // Safety configuration for content moderation
  private getSafetyConfiguration() {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  // Content generation parameters
  private getGenerationParameters() {
    return {
      temperature: 0.7,
      maxOutputTokens: 1000,
    };
  }

  // Blog post creation prompt with tone and style
  private createBlogGenerationPrompt(topicTitle: string, tone: string = "professional", style: string = "informative"): string {
    let prompt = `You are a professional blog writer. Create a comprehensive, engaging blog post about "${topicTitle}". 

The blog post should be:
- Well-structured with clear headings and subheadings
- Around 500-800 words
- Written in a ${tone} tone with an ${style} style
- Include practical examples or insights where relevant

Tone-specific requirements:`;

    // Add tone-specific instructions
    switch (tone) {
      case "casual":
        prompt += "\n- Use conversational language and relatable examples\n- Feel free to use contractions and informal expressions\n- Connect with readers on a personal level";
        break;
      case "formal":
        prompt += "\n- Use formal language and professional terminology\n- Maintain a respectful and authoritative voice\n- Avoid contractions and colloquialisms";
        break;
      case "friendly":
        prompt += "\n- Use warm, approachable language that connects with readers\n- Include encouraging and supportive phrases\n- Make readers feel welcome and comfortable";
        break;
      case "conversational":
        prompt += "\n- Write as if speaking directly to the reader\n- Use questions to engage the audience\n- Include personal anecdotes when appropriate";
        break;
      case "authoritative":
        prompt += "\n- Use confident, expert language that establishes credibility\n- Reference data, studies, or expert opinions\n- Demonstrate deep knowledge of the subject";
        break;
      default: // professional
        prompt += "\n- Use clear, professional language appropriate for business contexts\n- Maintain objectivity while being engaging\n- Focus on practical value for readers";
    }

    prompt += `\n\nStyle-specific requirements:`;
    
    // Add style-specific instructions
    switch (style) {
      case "educational":
        prompt += "\n- Focus on teaching and explaining concepts clearly\n- Break down complex ideas into digestible parts\n- Include learning objectives or key takeaways";
        break;
      case "persuasive":
        prompt += "\n- Focus on convincing readers and presenting compelling arguments\n- Use persuasive techniques and call-to-actions\n- Address potential objections or counterarguments";
        break;
      case "analytical":
        prompt += "\n- Focus on data-driven insights and detailed analysis\n- Include statistics, trends, and research findings\n- Present logical conclusions based on evidence";
        break;
      case "narrative":
        prompt += "\n- Focus on storytelling and personal experiences\n- Use narrative techniques to engage readers\n- Include character development or journey elements";
        break;
      case "how-to":
        prompt += "\n- Focus on step-by-step guides and practical instructions\n- Number steps clearly and logically\n- Include tips, warnings, or troubleshooting advice";
        break;
      case "opinion":
        prompt += "\n- Focus on personal viewpoints and editorial perspectives\n- Clearly state opinions while backing them with reasoning\n- Acknowledge different viewpoints where appropriate";
        break;
      default: // informative
        prompt += "\n- Focus on providing valuable information and insights\n- Present facts clearly and objectively\n- Help readers understand the topic thoroughly";
    }

    prompt += `\n\nPlease provide only the blog content without any additional explanations or formatting instructions.`;
    
    return prompt;
  }

  // Content improvement prompt
  private createContentEnhancementPrompt(existingContent: string): string {
    return `You are a helpful writing assistant. Your task is to improve the following blog content by enhancing clarity, fixing grammar issues, and adding relevant details where appropriate without changing the main topic.

Blog content to improve:
${existingContent}

Please provide only the improved content without any additional explanations, commentary, or formatting instructions.`;
  }

  // Generate new content based on title with tone and style
  async generateBlogContent(title: string, tone?: string, style?: string) {
    const aiModel = this.aiClient.getGenerativeModel({ model: this.modelName });
    const prompt = this.createBlogGenerationPrompt(title, tone, style);

    const generationRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings: this.getSafetyConfiguration(),
      generationConfig: this.getGenerationParameters(),
    };

    const result = await aiModel.generateContent(generationRequest);
    return result.response.text();
  }

  // Enhance existing content
  async enhanceContent(content: string) {
    const aiModel = this.aiClient.getGenerativeModel({ model: this.modelName });
    const prompt = this.createContentEnhancementPrompt(content);

    const enhancementRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings: this.getSafetyConfiguration(),
      generationConfig: this.getGenerationParameters(),
    };

    const result = await aiModel.generateContent(enhancementRequest);
    return result.response.text();
  }
}

// Request processing utilities
class RequestProcessor {
  static validateGenerationRequest(title: string) {
    return title && title.trim().length > 0;
  }

  static validateEnhancementRequest(content: string) {
    return content && content.trim().length > 0;
  }

  static createErrorResponse(message: string, statusCode: number = 400) {
    return new Response(JSON.stringify({ error: message }), { 
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static createSuccessResponse(data: any) {
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: Request) {
  let requestData: any;
  
  try {
    // Parse incoming request data
    requestData = await req.json();
    const { content, action, title, tone, style } = requestData;
    
    console.log('Processing request - Action:', action);
    console.log('Content provided:', !!content);
    console.log('Title provided:', title);
    console.log('Tone:', tone);
    console.log('Style:', style);

    const contentService = new ContentGenerationService();

    // Handle content generation workflow
    if (action === 'generate') {
      if (!RequestProcessor.validateGenerationRequest(title)) {
        return RequestProcessor.createErrorResponse('Title is required for content generation');
      }

      const generatedText = await contentService.generateBlogContent(title, tone, style);
      return RequestProcessor.createSuccessResponse({ generatedContent: generatedText });
    } 
    // Handle content enhancement workflow
    else {
      if (!RequestProcessor.validateEnhancementRequest(content)) {
        return RequestProcessor.createErrorResponse('Content is required for improvement');
      }

      const enhancedText = await contentService.enhanceContent(content);
      return RequestProcessor.createSuccessResponse({ improvedContent: enhancedText });
    }

  } catch (processingError) {
    console.error('AI processing error:', processingError);
    const errorMsg = requestData?.action === 'generate' ? 'Failed to generate content' : 'Failed to improve content';
    return RequestProcessor.createErrorResponse(errorMsg, 500);
  }
}