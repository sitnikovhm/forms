// === ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ ===

// Функция инициализации приложения
function initApp() {
  const urlParams = getUrlParams();

  initTheme();

  if (urlParams.config) {
    const loadedConfig = decodeConfig(urlParams.config);
    if (loadedConfig) {
      currentConfig = loadedConfig;
      isEditorMode = urlParams.mode === 'editor';

      if (isEditorMode) {
        currentConfig.webhookUrl = '';
      }
    }
  }

  if (!currentConfig) {
    showWelcomeScreen();
    return;
  }

  if (isEditorMode) {
    initEditor();
  }

  toggleEditorMode(isEditorMode);

  renderForm();

  // Обновляем заголовок и описание формы из конфига
  document.querySelector('h1').textContent = currentConfig.title;
  document.querySelector('.header p').textContent = currentConfig.description;
  pageTitle.textContent = currentConfig.title;

  updateOrganizationLogo(currentConfig.organization || 'LSPD');
  updateFavicon(currentConfig.organization || 'LSPD');

  initFormHandlers();
}

// Анимации для интерактивности
document.addEventListener('DOMContentLoaded', () => {
  const formWrapper = document.querySelector('.form-wrapper');
  if (formWrapper) {
    formWrapper.style.opacity = '0';
    formWrapper.style.transform = 'translateY(30px)';

    setTimeout(() => {
      formWrapper.style.transition = 'all 0.8s ease-out';
      formWrapper.style.opacity = '1';
      formWrapper.style.transform = 'translateY(0)';
    }, 100);
  }

  initApp();
});

// Обработчик изменения истории браузера
window.addEventListener('popstate', () => {
  window.location.reload();
});
