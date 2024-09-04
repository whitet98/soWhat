'use strict';

(function () {
  let conversationHistory = [];
  //let apiKey = [];
  //let config = {};

  

  function showLoading() {
    $('#loadingMessage').show(); // Show the loading message and icon
    $('#gptContainer, #userInputContainer').hide(); // Hide the content and input
  }
  
  function hideLoading() {
    $('#loadingMessage').hide(); // Hide the loading message and icon
    $('#gptContainer, #userInputContainer').show(); // Show the content and input
  }
  
  function initializeDialog() {
    applySavedSettings();  
    showLoading();
    tableau.extensions.initializeDialogAsync().then(() => {
      const sheetNames = getSheetNames();
      getFilteredMarks(sheetNames).then(filteredMarks => {
        // Call GPT initially with the context
        sendInitialRequestToGPT(filteredMarks).then(response => {
          displayGPTResponse(response);
          setupUserQueryHandler(); // Set up query handler after displaying initial response
        }).catch(error => {
          console.error('Error getting GPT response:', error.message);
          showError('Failed to retrieve GPT response.');
        });
      }).catch(error => {
        console.error('Error getting filtered marks:', error.message);
        showError('Failed to retrieve filtered marks.');
      });
    }).catch(error => {
      console.error('Error initializing dialog:', error.message);
      showError('Failed to initialize dialog.');
    });
  }

  function showError(message) {
    $('#loadingMessage').text(message).show();
  }

  function getSheetNames() {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    let sheetNames = [];

    // Loop through the worksheets and only include those with a `~` character in the name
    dashboard.worksheets.forEach(sheet => {
      if (sheet.name.includes('~')) {
        sheetNames.push(sheet.name);
      }
    });

    return sheetNames;
  }

  async function getFilteredMarks(sheetNames) {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    let filteredMarks = [];

    for (const sheet of dashboard.worksheets) {
      if (sheetNames.includes(sheet.name)) {
        try {
          const summaryData = await sheet.getSummaryDataAsync();
          console.log(`Summary data for ${sheet.name}:`, summaryData); // Debugging

          const marksInfo = {
            sheetName: sheet.name,
            data: summaryData.data.map(row => row.map(cell => cell.formattedValue)) // Extract formatted values
          };
          filteredMarks.push(marksInfo);
        } catch (error) {
          console.error(`Error retrieving summary data for ${sheet.name}:`, error.message);
        }
      }
    }

    return filteredMarks;
  }

  async function sendInitialRequestToGPT(filteredMarks) {
    const savedContext = tableau.extensions.settings.get('context');
    const savedAudience = tableau.extensions.settings.get('audience');
    const savedAnalysisDepth = tableau.extensions.settings.get('analysisDepth');
    const savedOutputFormat = tableau.extensions.settings.get('outputFormat');
    
    const systemPrompt = "You are an expert data analyst.";
    const userPrompt = "Analyze the following dataset and provide insights.";
    const model = "gpt-4o-mini";
    const max_tokens = 1000;
    const temperature = 0.5;
    const userPrompt = `
This is a test`;

    const systemPrompt = 
      `You are an expert data analyst specializing in providing actionable insights based on user-supplied datasets. 
      Your role is to analyze the data context provided, considering the audience, specific metrics, and other relevant details.
      Take your time. Focus on delivering insights that are clear, relevant, and actionable. 
      Tailor your responses to the specified Depth of Analysis and Output Format. 
      Keep the tone professional and direct but still casual, and conversational and aligned to the needs of the specified audience. 
      When offering recommendations, be concise but thorough, ensuring that the insights are practical and grounded in the data provided. 
      Always prioritize clarity, relevance, and utility in your responses.`;

    conversationHistory = [
      { "role": "system", "content": "You are an expert data analyst." },
      { "role": "user", "content": "Analyze the following dataset and provide insights."}
    ];
    
    
    return await sendToGPT();
  }

  async function sendUserQueryToGPT(userQuery) {

    
    conversationHistory.push({ role: 'user', content: userQuery });

    return await sendToGPT();
  }

  async function sendToGPT() {
    const requestBody = {
      model: "gpt-4o-mini",
      messages: conversationHistory, 
      max_tokens: 1000,
      temperature: 0.5
    };

    try {
      const response = await fetch('sowhatt.netlify.app/.netlify/functions/gpt-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending request to GPT:', error.message);
      throw error;
    }
  }
  

  function displayGPTResponse(response) {
    // Convert newlines to <br> for line breaks
    let formattedResponse = response
      .replace(/(?:\r\n|\r|\n)/g, '<br>')
      // Convert '- ' bullet points to <li> and wrap in <ul>
      .replace(/(?:^|\n)-(.+)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
      // Convert '#' to Heading
      .replace(/^####> (.+)$/gm, '<h1>$1</h1>')
      .replace(/^####>(.+)$/gm, '<h1>$1</h1>')
      .replace(/^####(.+)$/gm, '<h1>$1</h1>')
      .replace(/^###>(.+)$/gm, '<h2>$1</h2>')
      //.replace(/^###\s(.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Convert '**bold text**' to <strong>bold text</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    const gptContainer = $('#gptContainer');
    gptContainer.append(`<div class="message received-message">${formattedResponse}</div>`);

    // Hide the loading message and show the content divs
    hideLoading();

    // Scroll to the bottom of the container
    gptContainer.scrollTop(gptContainer[0].scrollHeight);
  }


  function setupUserQueryHandler() {
    $('#queryForm').on('submit', async (event) => {
      event.preventDefault(); // Prevent the default form submission
  
      const userQuery = $('#userQuery').val();
      if (userQuery.trim()) {
        // Display user's query
        const gptContainer = $('#gptContainer');
        gptContainer.append(`<div class="message sent-message">${userQuery}</div>`);
  
        try {
          const response = await sendUserQueryToGPT(userQuery);
          displayGPTResponse(response);
          // Clear the input field
          $('#userQuery').val('');
        } catch (error) {
          console.error('Error sending user query to GPT:', error.message);
        }
  
        // Scroll to the bottom of the container
        gptContainer.scrollTop(gptContainer[0].scrollHeight);
      }
    });
  }

  $(document).ready(initializeDialog);
})();
