'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

  
  // Function to initialize the extension
  function initializeExtension() {
    tableau.extensions.initializeAsync({
      configure: configureCallbackFunction
    }).then(function () {
      applySavedSettings();
      checkSettingsAndUpdateButton();
      // Add event listener to the button
      $('#openModalBtn').click(openSummaryDialog);
    }).catch((error) => {
      console.error('Error initializing Tableau Extensions:', error.message);
    });
  }

  // Function to open the summary dialog
  function openSummaryDialog() {

    const popupUrl = `${window.location.origin}/soWhatInsights.html`;
    const dialogStyle = tableau.DialogStyle.Modal;

    // Open the popup as a modal dialog
    tableau.extensions.ui
      .displayDialogAsync(popupUrl, "", { height: 500, width: 650, dialogStyle })
      .then((closePayload) => {
        // Handle any actions you want after the dialog is closed
        console.log('Dialog closed with payload:', closePayload);
      })
      .catch((error) => {
        // Handle errors such as when the dialog is closed by the user
        if (error.errorCode === tableau.ErrorCodes.DialogClosedByUser) {
          console.log('Dialog was closed by user');
        } else {
          console.error('Error displaying dialog:', error.message);
        }
      });
  }

  // Callback function for configuring the extension
  function configureCallbackFunction() {
    const popupUrl = `${window.location.origin}/soWhatSettings.html`;

    let dialogStyle = tableau.DialogStyle.Modal;

    tableau.extensions.ui
      .displayDialogAsync(popupUrl, '', { height: 500, width: 800, dialogStyle })
      .then((closePayload) => {
        if (closePayload) {
            const parsedPayload = JSON.parse(closePayload);
            const { themeColour, textColour } = parsedPayload;
            applyThemeColour(themeColour);
            applyTextColour(textColour);
        }
    })
      
      .catch((error) => {
        if (error.errorCode === tableau.ErrorCodes.DialogClosedByUser) {
          console.log('Dialog was closed by user');
        } else {
          console.error('Error displaying dialog:', error.message);
        }
      });
  }
  
  // Function to check if settings are configured and update button state
  function checkSettingsAndUpdateButton() {
    const savedContext = tableau.extensions.settings.get('context');
    const savedAudience = tableau.extensions.settings.get('audience');
    const savedAnalysisDepth = tableau.extensions.settings.get('analysisDepth');
    const savedOutputFormat = tableau.extensions.settings.get('outputFormat');
    const apiKeySelection = tableau.extensions.settings.get('savedApiKeySelection');

    const isConfigured = savedContext && savedAudience && savedAnalysisDepth && savedOutputFormat && apiKeySelection;
    const button = $('#openModalBtn');

    if (isConfigured) {
      button.removeClass('btn-disabled').addClass('btn-primary');
      button.prop('disabled', false);
    } else {
      button.removeClass('btn-primary').addClass('btn-disabled');
      button.prop('disabled', true);
    }
  }
  // Initialize the extension on document ready
  $(document).ready(initializeExtension);

})();
