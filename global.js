function applySavedSettings() {
  const themeColour = tableau.extensions.settings.get('themeColour');
  const textColour = tableau.extensions.settings.get('textColour');

  if (themeColour) {
    applyThemeColour(themeColour);
  }

  if (textColour) {
    applyTextColour(textColour);
  }
}

// Function to apply theme color to CSS variables
function applyThemeColour(color) {
  const [r, g, b] = color.split(',').map(Number);
  document.documentElement.style.setProperty('--theme-colour', `rgb(${r}, ${g}, ${b})`);
  document.documentElement.style.setProperty('--theme-colour-rgbA', `rgba(${r}, ${g}, ${b}, 0.7)`);
  document.documentElement.style.setProperty('--theme-colour-rgbB', `rgba(${r}, ${g}, ${b}, 0.2)`);
}

// Function to apply text color to CSS variables
function applyTextColour(color) {
  document.documentElement.style.setProperty('--theme-text-colour', color.toLowerCase());
}