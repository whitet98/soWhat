'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {

  
  // Function to initialize the extension
  function initializeExtension() {
    tableau.extensions.initializeAsync({
      configure: configureCallbackFunction
    }).then(function () {
      applySavedSettings();
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

  // Initialize the extension on document ready
  $(document).ready(initializeExtension);

})();