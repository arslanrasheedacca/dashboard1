import axios from 'axios';

const SEARCH_API_URL = 'https://api.bing.microsoft.com/v7.0/search';

export const performWebSearch = async (query: string, apiKey: string) => {
  try {
    const response = await axios.get(SEARCH_API_URL, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      },
      params: {
        q: query,
        count: 5,
        responseFilter: 'Webpages',
        textFormat: 'HTML'
      }
    });

    return response.data.webPages.value.map((result: any) => ({
      title: result.name,
      snippet: result.snippet,
      url: result.url
    }));
  } catch (error) {
    console.error('Search API Error:', error);
    throw new Error('Failed to perform web search');
  }
}; 