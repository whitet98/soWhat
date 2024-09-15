// back-end
import fetch from 'node-fetch';

const apiKeys = {
  1: process.env.GPT_API_KEY_1,
  2: process.env.GPT_API_KEY_2,
  3: process.env.GPT_API_KEY_3,
  4: process.env.GPT_API_KEY_4,
  5: process.env.GPT_API_KEY_5
};

export const handler = async (event) => {
  const { apiKeySelection, ...requestBody } = JSON.parse(event.body);
  const apiKey = apiKeys[apiKeySelection];

  if (!apiKey) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust as needed
      },
      body: JSON.stringify({ error: 'Invalid API key selection' })
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Adjust as needed
        },
        body: JSON.stringify({ error: 'Error fetching data from GPT API' })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust as needed
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust as needed
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
