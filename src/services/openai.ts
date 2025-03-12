import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateAIResponse = async (
  messages: ChatMessage[],
  apiKey: string
): Promise<string> => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an advanced AI assistant integrated into a dashboard application. You can:
            1. Help with data analysis and visualization
            2. Provide real-time insights and suggestions
            3. Assist with technical problems and debugging
            4. Engage in creative brainstorming and ideation
            5. Offer detailed explanations on any topic
            6. Help with decision making and strategy
            7. Provide code examples and technical solutions
            8. Engage in natural conversation as a helpful partner
            
            Respond in a helpful, concise, and engaging way. Use markdown formatting when appropriate.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate AI response');
  }
}; 