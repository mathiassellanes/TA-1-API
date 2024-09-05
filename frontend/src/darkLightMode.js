const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');

  const isDarkMode = document.body.classList.contains('dark-mode');

  localStorage.setItem('darkMode', isDarkMode);

  const img = document.getElementById('toggle-image');

  if (isDarkMode) {
    img.src = 'assets/sun-solid.svg';
  } else {
    img.src = 'assets/moon-solid.svg';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const darkModePreference = localStorage.getItem('darkMode');
  if (darkModePreference === 'true') {
    document.body.classList.add('dark-mode');
  }

  const img = document.getElementById('toggle-image');

  if (darkModePreference === 'true') {
    img.src = 'assets/sun-solid.svg';
  } else {
    img.src = 'assets/moon-solid.svg';
  }

  toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
});
