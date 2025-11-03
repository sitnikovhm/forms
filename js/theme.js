// === ФУНКЦИИ РАБОТЫ С ТЕМАМИ ===

// Функция для применения темы
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  currentTheme = theme;

  if (lightThemeBtn && darkThemeBtn) {
    lightThemeBtn.classList.toggle("active", theme === "light");
    darkThemeBtn.classList.toggle("active", theme === "dark");
  }

  localStorage.setItem("theme", theme);
}

// Функция для инициализации темы
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
}

// Функция для переключения темы
function toggleTheme(theme) {
  applyTheme(theme);
}
