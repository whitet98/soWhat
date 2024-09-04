'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

  const defaultThemeColour = '0, 123, 255'

  // Function to initialize the dialog
  function initializeDialog() {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      // Load any existing settings
      const savedContext = tableau.extensions.settings.get('context');
      const savedAudience = tableau.extensions.settings.get('audience');
      const savedGoal = tableau.extensions.settings.get('goal');
      const savedAnalysisDepth = tableau.extensions.settings.get('analysisDepth');
      const savedOutputFormat = tableau.extensions.settings.get('outputFormat');
      const savedThemeColour = tableau.extensions.settings.get('themeColour');
      const savedTextColour = tableau.extensions.settings.get('textColour');
      const savedDashboardName = tableau.extensions.settings.get('dashboardName');
      const savedApiKeySelection = tableau.extensions.settings.get('apiKeySelection');
  
      if (savedContext) {
        $('#contextInput').val(savedContext);
      }
      if (savedAudience) {
        $('#audienceInput').val(savedAudience);
      }
      if (savedGoal) {
        $('#audienceGoalInput').val(savedGoal);
      }
      if (savedAnalysisDepth) {
        $('#analysisDepthInput').val(savedAnalysisDepth);
      }
      if (savedOutputFormat) {
        $('#outputFormatInput').val(savedOutputFormat);
      }
      if (savedThemeColour) {
        $('#themeColourInput').val(savedThemeColour);
      } else {
        $('#themeColourInput').val(defaultThemeColour);
      }
      if (savedTextColour) {
        $('#textColourInput').val(savedTextColour);
      }
      if (savedDashboardName) {
        $('#dashboardNameInput').val(savedDashboardName);
      }
      if (savedApiKeySelection) {
        $('#apiKeySelectionInput').val(savedApiKeySelection);
      }
  
      $('#saveBtn').click(saveSettings);
      $('#cancelBtn').click(closeDialog);
    }).catch((error) => {
      console.error('Error initializing dialog:', error.message);
    });
  }
  

  // Function to save settings
  function saveSettings() {
    const context = $('#contextInput').val();
    const audience = $('#audienceInput').val();
    const goal = $('#audienceGoalInput').val();
    const analysisDepth = $('#analysisDepthInput').val();
    const outputFormat = $('#outputFormatInput').val();
    const themeColour = $('#themeColourInput').val() || defaultThemeColour;
    const textColour = $('#textColourInput').val();
    const dashboardName = $('#dashboardNameInput').val();
    const apiKeySelection = $('#apiKeySelectionInput').val();

    tableau.extensions.settings.set('context', context);
    tableau.extensions.settings.set('audience', audience);
    tableau.extensions.settings.set('goal', goal);
    tableau.extensions.settings.set('analysisDepth', analysisDepth);
    tableau.extensions.settings.set('outputFormat', outputFormat);
    tableau.extensions.settings.set('themeColour', themeColour);
    tableau.extensions.settings.set('textColour', textColour);
    tableau.extensions.settings.set('dashboardName', dashboardName);
    tableau.extensions.settings.set('apiKeySelection', apiKeySelection);

    applyThemeColour(themeColour);
    applyTextColour(textColour);

    // Save the settings and close the dialog
    tableau.extensions.settings.saveAsync().then(() => {
      const payload = JSON.stringify({
        themeColour: themeColour,
        textColour: textColour
    });
    
    tableau.extensions.ui.closeDialog(payload);
    }).catch((error) => {
      console.error('Error saving settings:', error.message);
    });
  }
  
  function closeDialog() {
    tableau.extensions.ui.closeDialog(); // This will close the dialog
  }

  // Initialize the dialog on document ready
  $(document).ready(initializeDialog);
})();