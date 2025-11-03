// === УТИЛИТАРНЫЕ ФУНКЦИИ ===

// Функция для показа сообщений
function showMessage(message, type = "success") {
  responseMessage.textContent = message;
  responseMessage.className = `response-message ${type} show`;

  setTimeout(() => {
    responseMessage.classList.remove("show");
  }, 5000);
}

// Функция для кодирования конфига в base64 с компрессией
function encodeConfig(config) {
  try {
    const json = JSON.stringify(config);
    // Используем LZ-String для сжатия (если доступна библиотека)
    if (typeof LZString !== "undefined") {
      return "v2:" + LZString.compressToEncodedURIComponent(json);
    }
    // Fallback на старый метод
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error("Ошибка кодирования конфига:", e);
    return btoa(encodeURIComponent(JSON.stringify(config)));
  }
}

// Функция для декодирования конфига из base64 (с обратной совместимостью)
function decodeConfig(encodedConfig) {
  try {
    // Проверяем новый формат с версией
    if (encodedConfig.startsWith("v2:")) {
      const compressed = encodedConfig.substring(3);
      if (typeof LZString !== "undefined") {
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        return JSON.parse(json);
      }
    }

    // Старый формат (обратная совместимость)
    return JSON.parse(decodeURIComponent(atob(encodedConfig)));
  } catch (e) {
    console.error("Ошибка декодирования конфига:", e);
    return null;
  }
}

// Функция для получения параметров URL
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    config: params.get("config"),
    mode: params.get("mode"),
  };
}

// Функция для обновления URL без перезагрузки
function updateUrl(config = null, mode = null) {
  const url = new URL(window.location);

  if (config) {
    url.searchParams.set("config", encodeConfig(config));
  }

  if (mode !== null) {
    if (mode) {
      url.searchParams.set("mode", "editor");
    } else {
      url.searchParams.delete("mode");
    }
  }

  window.history.pushState({}, "", url);
}

// Функция для копирования текста в буфер обмена
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Ошибка копирования:", err);
    return false;
  }
}

// Функция для генерации уникального ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Функция для установки состояния загрузки
function setLoading(isLoading) {
  if (submitBtn) {
    submitBtn.disabled = isLoading;

    if (isLoading) {
      btnText.textContent = "Отправка...";
      btnIcon.className = "fas fa-spinner loading";
    } else {
      btnText.textContent = "Отправить сообщение";
      btnIcon.className = "fas fa-arrow-right";
    }
  }
}
