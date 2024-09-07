import fetch from 'node-fetch';

export const handler = async (event) => {
  const requestBody = JSON.parse(event.body);

  // Simulate fetching 'savedApiKeySelection' from the request body (passed from front-end)
  const { apiKeySelection } = requestBody;

  // Mapping the API key selection to the respective environment variable
  const apiKeyMap = {
    1: process.env.GPT_API_KEY_1,
    2: process.env.GPT_API_KEY_2,
    3: process.env.GPT_API_KEY_3,
    4: process.env.GPT_API_KEY_4,
    5: process.env.GPT_API_KEY_5,
  };

  const apiKey = apiKeyMap[apiKeySelection]; // Select the API key

  if (!apiKey) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
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
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Error fetching data from GPT API' })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
