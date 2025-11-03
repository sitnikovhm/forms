// === ФУНКЦИИ РАБОТЫ С ФОРМОЙ ===

// Функция для переключения режима редактор/просмотр
function toggleEditorMode(showEditor) {
  isEditorMode = showEditor;

  if (showEditor) {
    editorPanel.classList.add("show");

    if (container) {
      container.classList.add("editor-mode");
    }

    if (formPreview) {
      formPreview.classList.add("preview");
    }
  } else {
    editorPanel.classList.remove("show");

    if (container) {
      container.classList.remove("editor-mode");
    }

    if (formPreview) {
      formPreview.classList.remove("preview");
    }
  }

  updateUrl(null, showEditor);
}

// Функция для обновления логотипа организации
function updateOrganizationLogo(organization) {
  const logoImg = document.getElementById("orgLogoImg");
  if (logoImg) {
    logoImg.src = `images/${organization}.png`;
    logoImg.alt = `${organization} Logo`;
  }
}

// Функция для обновления favicon в зависимости от организации
function updateFavicon(organization) {
  const faviconLink = document.getElementById("faviconLink");
  if (faviconLink) {
    let faviconPath = "images/favicon/favicon.ico"; // по умолчанию

    // Устанавливаем favicon в зависимости от организации
    if (organization === "LSPD") {
      faviconPath = "images/favicon/lspd.ico";
    } else if (organization === "LSCSD") {
      faviconPath = "images/favicon/lscsd.ico";
    } else if (organization === "WN") {
      faviconPath = "images/favicon/wn.ico";
    } else if (organization === "ARM") {
      faviconPath = "images/favicon/arm.ico";
    }

    faviconLink.href = faviconPath;
  }
}

// Функция для восстановления базовой структуры формы
function restoreFormStructure() {
  const formWrapper = document.querySelector(".form-wrapper");

  formWrapper.innerHTML = `
    <div id="organizationLogo" class="organization-logo">
      <img src="images/LSPD.png" alt="Organization Logo" id="orgLogoImg" />
    </div>
    <div class="vinewood-logo"></div>
    <div class="header">
      <div class="header-top">
        <h1>Связаться с нами</h1>
        <div class="form-menu">
          <button id="editFormBtn" class="edit-form-btn" title="Меню формы">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div id="formDropdown" class="form-dropdown">
            <button class="dropdown-item" id="duplicateBtn">
              <i class="fas fa-copy"></i>
              Дублировать и настроить
            </button>
          </div>
        </div>
      </div>
      <p>Заполните форму и мы свяжемся с вами в ближайшее время</p>
    </div>

    <form id="contactForm" class="contact-form">
      <button type="submit" class="submit-btn">
        <span class="btn-text">Отправить сообщение</span>
        <i class="fas fa-arrow-right"></i>
      </button>
    </form>

    <div id="response" class="response-message"></div>
  `;
}

// Функция для показа welcome screen
function showWelcomeScreen() {
  const formWrapper = document.querySelector(".form-wrapper");

  document.title = "Discord Forms - Создай свою форму";
  document.getElementById("pageTitle").textContent = "Discord Forms";

  formWrapper.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <h1 class="welcome-title">Discord Forms</h1>
      <p class="welcome-subtitle">Создавай кастомные формы с отправкой в Discord</p>
      
      <div class="welcome-features">
        <div class="welcome-feature">
          <i class="fas fa-magic"></i>
          <span>Конструктор форм</span>
        </div>
        <div class="welcome-feature">
          <i class="fas fa-share-alt"></i>
          <span>Генерация ссылок</span>
        </div>
        <div class="welcome-feature">
          <i class="fab fa-discord"></i>
          <span>Интеграция с Discord</span>
        </div>
      </div>
      
      <button id="createFormBtn" class="create-form-btn">
        <i class="fas fa-plus-circle"></i>
        Создать форму
      </button>
      
      <div class="welcome-info">
        <p>Создай свою форму обратной связи, анкету, опрос или любую другую форму</p>
        <p>Все данные отправляются прямо в твой Discord-канал через webhook</p>
      </div>
    </div>
  `;

  const createFormBtn = document.getElementById("createFormBtn");
  if (createFormBtn) {
    createFormBtn.addEventListener("click", () => {
      currentConfig = createEmptyConfig();
      restoreFormStructure();
      initEditor();
      toggleEditorMode(true);
      renderForm();
      initFormHandlers();
    });
  }
}

// Функция для рендеринга формы на основе конфига
function renderForm() {
  const formHeader = formWrapper.querySelector(".header h1");
  const formDescription = formWrapper.querySelector(".header p");
  const formFields = formWrapper.querySelector(".contact-form");

  formHeader.textContent = currentConfig.title;
  formDescription.textContent = currentConfig.description;

  const submitBtn = formFields.querySelector(".submit-btn");
  formFields.innerHTML = "";
  formFields.appendChild(submitBtn);

  currentConfig.fields.forEach((field) => {
    const fieldGroup = document.createElement("div");
    fieldGroup.className = "form-group";
    fieldGroup.dataset.fieldId = field.id;

    if (field.conditional && field.conditional.enabled) {
      fieldGroup.dataset.conditionalField = field.conditional.field;
      fieldGroup.dataset.conditionalValue = field.conditional.value;
      fieldGroup.classList.add("conditional-field");
      fieldGroup.style.display = "none";
    }

    const label = document.createElement("label");
    label.setAttribute("for", field.id);
    label.innerHTML = `<i class="fas fa-${field.icon}"></i> ${field.label}${
      field.required ? " *" : ""
    }`;

    let inputElement;

    switch (field.type) {
      case "textarea":
        inputElement = document.createElement("textarea");
        inputElement.rows = 5;
        break;

      case "select":
        inputElement = document.createElement("select");
        if (field.options) {
          const defaultOption = document.createElement("option");
          defaultOption.value = "";
          defaultOption.textContent = "Выберите вариант";
          inputElement.appendChild(defaultOption);

          field.options.forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            inputElement.appendChild(optionElement);
          });
        }
        break;

      case "radio":
        const radioGroup = document.createElement("div");
        radioGroup.className = "radio-group";

        if (field.options) {
          field.options.forEach((option, index) => {
            const radioLabel = document.createElement("label");
            radioLabel.className = "radio-label";

            radioLabel.innerHTML = `
              <input type="radio" name="${field.id}" value="${option}" ${
              index === 0 && field.defaultValue === option ? "checked" : ""
            } />
              <span class="radio-custom"></span>
              ${option}
            `;

            radioGroup.appendChild(radioLabel);
          });
        }

        inputElement = radioGroup;
        break;

      case "checkbox":
        const checkboxLabel = document.createElement("label");
        checkboxLabel.className = "checkbox-label";

        checkboxLabel.innerHTML = `
          <input type="checkbox" id="${field.id}" name="${field.id}" />
          <span class="checkbox-custom"></span>
          ${field.label}
        `;

        fieldGroup.appendChild(checkboxLabel);
        break;

      case "computed":
        const formula = field.formula || "";
        const hasMultilineOperations =
          formula.includes(",map,") || formula.includes(",lines,");

        if (hasMultilineOperations) {
          inputElement = document.createElement("textarea");
          inputElement.rows = 3;
          inputElement.readOnly = true;
          inputElement.className = "computed-field";
          inputElement.dataset.formula = formula;
          inputElement.tabIndex = -1;
        } else {
          inputElement = document.createElement("input");
          inputElement.type = "text";
          inputElement.readOnly = true;
          inputElement.className = "computed-field";
          inputElement.dataset.formula = formula;
          inputElement.tabIndex = -1;
        }
        break;

      default:
        inputElement = document.createElement("input");
        inputElement.type = field.type;
    }

    if (inputElement && inputElement.tagName !== "DIV") {
      inputElement.id = field.id;
      inputElement.name = field.id;
      if (field.placeholder) inputElement.placeholder = field.placeholder;
      if (field.required) inputElement.required = true;

      fieldGroup.appendChild(label);
      fieldGroup.appendChild(inputElement);

      if (inputElement.type !== "checkbox") {
        const inputLine = document.createElement("div");
        inputLine.className = "input-line";
        fieldGroup.appendChild(inputLine);
      }
    } else if (inputElement && inputElement.tagName === "DIV") {
      fieldGroup.appendChild(label);
      fieldGroup.appendChild(inputElement);
    }

    formFields.insertBefore(fieldGroup, submitBtn);
  });

  initComputedFields();
  initConditionalFields();
  applyMentionInputStyling();
}

// Функция валидации формы
function validateForm(formData) {
  const errors = [];
  const form = document.getElementById("contactForm");

  currentConfig.fields.forEach((field) => {
    if (field.type === "computed") {
      return;
    }

    const fieldGroup = form.querySelector(`[data-field-id="${field.id}"]`);
    const isVisible = !fieldGroup || fieldGroup.style.display !== "none";

    if (!isVisible) {
      return;
    }

    if (field.required) {
      const value = formData[field.id];
      if (!value || (typeof value === "string" && !value.trim())) {
        errors.push(`Поле "${field.label}" обязательно для заполнения`);
      }
    }

    if (field.type === "email" && formData[field.id]) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.id])) {
        errors.push(`Введите корректный email адрес в поле "${field.label}"`);
      }
    }
  });

  return errors;
}

// Обработчик отправки формы
function initFormHandlers() {
  if (!contactForm) return;

  if (editFormBtn && formDropdown) {
    editFormBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      formDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      if (formDropdown.classList.contains("show")) {
        formDropdown.classList.remove("show");
      }
    });

    if (duplicateBtn) {
      duplicateBtn.addEventListener("click", () => {
        formDropdown.classList.remove("show");

        if (!isEditorMode) {
          initEditor();
          if (webhookUrlInput) {
            webhookUrlInput.value = "";
            currentConfig.webhookUrl = "";
          }
        }
        toggleEditorMode(!isEditorMode);
      });
    }
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    const errors = validateForm(data);
    if (errors.length > 0) {
      showMessage(errors.join(". "), "error");
      return;
    }

    setLoading(true);

    try {
      const result = await sendToDiscord(data);

      if (result.success) {
        showMessage(result.message, "success");
        contactForm.reset();

        if (submitBtn) {
          submitBtn.style.background =
            "linear-gradient(135deg, #10b981, #059669)";
          setTimeout(() => {
            submitBtn.style.background =
              "linear-gradient(135deg, #6366f1, #4f46e5)";
          }, 3000);
        }
      } else {
        showMessage(result.message, "error");
      }
    } catch (error) {
      console.error("Неожиданная ошибка:", error);
      showMessage("Произошла неожиданная ошибка. Попробуйте еще раз.", "error");
    } finally {
      setLoading(false);
    }
  });
}

// Добавить эту функцию в верхнюю часть form.js (рядом с другими утилитами)
function applyMentionInputStyling() {
  // Если currentConfig отсутствует — ничего не делаем
  if (!window.currentConfig || !Array.isArray(window.currentConfig.fields)) return;
  const form = document.getElementById("contactForm");
  if (!form) return;

  window.currentConfig.fields.forEach((f) => {
    if (f.type === "mention") {
      // ищем input по id или name
      const input = form.querySelector(`[name="${f.id}"], #${f.id}`);
      if (input) {
        input.classList.add("mention-input");
        if (!input.placeholder || input.placeholder === "") {
          input.placeholder = f.placeholder || "";
        }
        input.title = input.title || "Введите Discord ID или упоминание вида <@1350080637616390185>";
      }
    }
  });
}
