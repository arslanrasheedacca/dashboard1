import axios from 'axios';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface AIModelResponse {
  text: string;
  source: string;
  confidence: number;
  features?: {
    codeGeneration?: boolean;
    dataAnalysis?: boolean;
    creativity?: boolean;
  };
}

// Initialize Gemini with enhanced features
const initializeGemini = (apiKey: string): GenerativeModel => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.7,
      topP: 1,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
};

// Enhanced Deepseek API call with specialized capabilities
const callDeepseek = async (
  prompt: string,
  context: any,
  apiKey: string
): Promise<AIModelResponse> => {
  try {
    // Enhance prompt with context and specific instructions
    const enhancedPrompt = `
Context: ${JSON.stringify(context)}
User Query: ${prompt}

Instructions:
- Provide detailed, accurate responses
- Include code examples when relevant
- Format output in markdown when appropriate
- Consider the dashboard context when relevant
- Be concise but comprehensive

Response:`;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an advanced AI assistant with expertise in technical analysis, coding, and data visualization. Provide detailed, accurate responses with code examples when relevant.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      text: response.data.choices[0].message.content,
      source: 'Deepseek',
      confidence: response.data.choices[0].finish_reason === 'stop' ? 0.95 : 0.8,
      features: {
        codeGeneration: true,
        dataAnalysis: true,
        creativity: false
      }
    };
  } catch (error) {
    console.error('Deepseek API Error:', error);
    throw new Error('Failed to generate Deepseek response');
  }
};

// Enhanced Gemini API call with specialized capabilities
const callGemini = async (
  prompt: string,
  context: any,
  model: GenerativeModel
): Promise<AIModelResponse> => {
  try {
    // Enhance prompt with context
    const enhancedPrompt = `
Context Information:
${JSON.stringify(context)}

User Query: ${prompt}

Please provide a comprehensive response that:
1. Addresses the query directly
2. Includes relevant examples
3. Uses markdown formatting for clarity
4. Considers the dashboard context
5. Provides actionable insights`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      source: 'Gemini',
      confidence: 0.9,
      features: {
        codeGeneration: true,
        dataAnalysis: true,
        creativity: true
      }
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate Gemini response');
  }
};

// Smart response selection based on query type and context
const selectBestResponse = (
  responses: AIModelResponse[], 
  query: string,
  context: any
): AIModelResponse => {
  // Analyze query type
  const isCodeRelated = /code|programming|function|api|implementation/i.test(query);
  const isDataAnalysis = /data|analysis|metrics|statistics|trends/i.test(query);
  const isCreative = /ideas|suggest|creative|design|improve/i.test(query);
  const isDashboardSpecific = /dashboard|chart|graph|visualization/i.test(query);

  // Weight responses based on query type
  const weightedResponses = responses.map(response => {
    let weight = response.confidence;

    if (isCodeRelated && response.features?.codeGeneration) weight += 0.1;
    if (isDataAnalysis && response.features?.dataAnalysis) weight += 0.1;
    if (isCreative && response.features?.creativity) weight += 0.1;
    if (isDashboardSpecific && response.source === 'Deepseek') weight += 0.1;

    return {
      ...response,
      weight
    };
  });

  // Return the response with highest weight
  return weightedResponses.sort((a, b) => b.weight - a.weight)[0];
};

// Main function to get enhanced AI response
export const getEnhancedAIResponse = async (
  prompt: string,
  context: any,
  apiKeys: {
    deepseek: string;
    gemini: string;
  }
): Promise<AIModelResponse> => {
  try {
    const geminiModel = initializeGemini(apiKeys.gemini);
    
    // Call both models in parallel
    const responses = await Promise.allSettled([
      callDeepseek(prompt, context, apiKeys.deepseek),
      callGemini(prompt, context, geminiModel)
    ]);

    // Filter successful responses
    const successfulResponses = responses
      .filter((result): result is PromiseFulfilledResult<AIModelResponse> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    if (successfulResponses.length === 0) {
      throw new Error('No AI models were able to generate a response');
    }

    // Select the best response based on context and query type
    return selectBestResponse(successfulResponses, prompt, context);
  } catch (error) {
    console.error('Enhanced AI Error:', error);
    throw error;
  }
}; 