// === ФУНКЦИИ РАБОТЫ С КОНФИГУРАЦИЕЙ ===

// Функция для создания пустого конфига
function createEmptyConfig() {
  return {
    title: "Моя форма",
    description: "Описание формы",
    customMessage: "",
    webhookUrl: "",
    webhookUsername: "Форма обратной связи",
    webhookAvatarUrl: "https://pngimg.com/uploads/discord/discord_PNG3.png",
    organization: "LSPD",
    conditionalMessages: [],
    showAdvancedSettings: false,
    fields: [
      {
        id: generateId(),
        type: "text",
        label: "Имя",
        placeholder: "",
        required: true,
        icon: "user",
      },
      {
        id: generateId(),
        type: "email",
        label: "Email",
        placeholder: "",
        required: true,
        icon: "envelope",
      },
      {
        id: generateId(),
        type: "textarea",
        label: "Сообщение",
        placeholder: "",
        required: true,
        icon: "comment",
      },
    ],
  };
}

// Функция для обновления конфига из редактора
function updateConfigFromEditor() {
  currentConfig.title = formTitleInput.value || "Форма обратной связи";
  currentConfig.description = formDescriptionInput.value || "Заполните форму";
  currentConfig.customMessage = customMessageInput.value || "";
  currentConfig.webhookUrl = webhookUrlInput.value;
  currentConfig.webhookUsername =
    webhookUsernameInput.value || currentConfig.title;
  currentConfig.webhookAvatarUrl =
    webhookAvatarUrlInput.value ||
    "https://pngimg.com/uploads/discord/discord_PNG3.png";
  currentConfig.sendAsPlainText = sendAsPlainTextCheckbox
    ? sendAsPlainTextCheckbox.checked
    : false;

  pageTitle.textContent = currentConfig.title;
  document.querySelector("h1").textContent = currentConfig.title;
  document.querySelector(".header p").textContent = currentConfig.description;

  updateUrl(currentConfig);
}

// Функция для генерации ссылки на форму
function generateShareUrl() {
  const shareConfig = { ...currentConfig };
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?config=${encodeConfig(shareConfig)}`;
}

// Функция для сокращения ссылки через is.gd API
async function shortenUrlWithIsGd(longUrl) {
  try {
    const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(
      longUrl
    )}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errorcode) {
      throw new Error(data.errormessage || "Ошибка сокращения ссылки");
    }

    return data.shorturl;
  } catch (error) {
    console.error("Ошибка is.gd API:", error);
    throw error;
  }
}

// Функция для генерации и копирования ссылки на форму
async function generateAndCopyShareUrl() {
  if (!currentConfig.webhookUrl.trim()) {
    showMessage(
      "Укажите Discord Webhook URL перед копированием ссылки",
      "error"
    );
    return;
  }

  const shareUrl = generateShareUrl();
  const success = await copyToClipboard(shareUrl);

  if (success) {
    generateUrlBtn.classList.add("copied");
    generateUrlBtn.innerHTML =
      '<i class="fas fa-check"></i> Ссылка скопирована!';

    setTimeout(() => {
      generateUrlBtn.classList.remove("copied");
      generateUrlBtn.innerHTML =
        '<i class="fas fa-copy"></i> Скопировать ссылку на форму';
    }, 2000);

    showMessage("Ссылка на форму скопирована в буфер обмена!", "success");
  } else {
    showMessage("Не удалось скопировать ссылку", "error");
  }
}

// Функция для генерации и копирования короткой ссылки
async function generateAndCopyShortUrl() {
  if (!currentConfig.webhookUrl.trim()) {
    showMessage(
      "Укажите Discord Webhook URL перед копированием ссылки",
      "error"
    );
    return;
  }

  // Показываем состояние загрузки
  shortenUrlBtn.disabled = true;
  shortenUrlBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Сокращение...';

  try {
    const shareUrl = generateShareUrl();
    const shortUrl = await shortenUrlWithIsGd(shareUrl);

    const success = await copyToClipboard(shortUrl);

    if (success) {
      shortenUrlBtn.classList.add("copied");
      shortenUrlBtn.innerHTML =
        '<i class="fas fa-check"></i> Короткая ссылка скопирована!';

      setTimeout(() => {
        shortenUrlBtn.classList.remove("copied");
        shortenUrlBtn.disabled = false;
        shortenUrlBtn.innerHTML =
          '<i class="fas fa-compress-alt"></i> Сократить ссылку';
      }, 2000);

      showMessage(`Короткая ссылка скопирована: ${shortUrl}`, "success");
    } else {
      throw new Error("Не удалось скопировать ссылку");
    }
  } catch (error) {
    shortenUrlBtn.disabled = false;
    shortenUrlBtn.innerHTML =
      '<i class="fas fa-compress-alt"></i> Сократить ссылку';

    let errorMsg = "Не удалось сократить ссылку";
    if (error.message.includes("rate limit")) {
      errorMsg = "Превышен лимит запросов. Попробуйте через минуту";
    } else if (error.message) {
      errorMsg = error.message;
    }

    showMessage(errorMsg, "error");
  }
}
