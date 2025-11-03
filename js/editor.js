// === ФУНКЦИИ РЕДАКТОРА ===

// Функция для инициализации редактора
function initEditor() {
  formTitleInput.value = currentConfig.title;
  formDescriptionInput.value = currentConfig.description;
  customMessageInput.value = currentConfig.customMessage || "";
  webhookUrlInput.value = currentConfig.webhookUrl;
  webhookUsernameInput.value =
    currentConfig.webhookUsername || currentConfig.title;
  webhookAvatarUrlInput.value = currentConfig.webhookAvatarUrl || "";

  // URL изображения в embed (image)
  const embedImageUrlInput = document.getElementById("embedImageUrl");
  if (embedImageUrlInput) {
    embedImageUrlInput.value = currentConfig.embedImageUrl || "";
    embedImageUrlInput.addEventListener("input", (e) => {
      currentConfig.embedImageUrl = e.target.value;
      if (typeof updateConfigFromEditor === "function") updateConfigFromEditor();
      if (typeof renderForm === "function") renderForm();
    });
  }

  if (sendAsPlainTextCheckbox) {
    sendAsPlainTextCheckbox.checked = currentConfig.sendAsPlainText || false;
  }

  if (!currentConfig.conditionalMessages) {
    currentConfig.conditionalMessages = [];
  }

  if (organizationSelect) {
    organizationSelect.value = currentConfig.organization || "LSPD";
    updateOrganizationLogo(currentConfig.organization || "LSPD");
    updateFavicon(currentConfig.organization || "LSPD");
  }

  // Инициализация чекбокса расширенных настроек
  const advancedSettingsCheckbox = document.getElementById(
    "advancedSettingsCheckbox"
  );
  if (advancedSettingsCheckbox) {
    advancedSettingsCheckbox.checked =
      currentConfig.showAdvancedSettings || false;
    updateAdvancedSettingsVisibility(
      currentConfig.showAdvancedSettings || false
    );
  }

  fieldsList.innerHTML = "";
  currentConfig.fields.forEach((field) => {
    addFieldToEditor(field);
  });

  formTitleInput.addEventListener("input", updateConfigFromEditor);
  formDescriptionInput.addEventListener("input", updateConfigFromEditor);
  customMessageInput.addEventListener("input", updateConfigFromEditor);
  webhookUrlInput.addEventListener("input", updateConfigFromEditor);
  webhookUsernameInput.addEventListener("input", updateConfigFromEditor);
  webhookAvatarUrlInput.addEventListener("input", updateConfigFromEditor);
  // embedImageUrlInput handled above (listener sets currentConfig and updates)

  if (sendAsPlainTextCheckbox) {
    sendAsPlainTextCheckbox.addEventListener("change", updateConfigFromEditor);
  }

  if (organizationSelect) {
    organizationSelect.addEventListener("change", (e) => {
      currentConfig.organization = e.target.value;
      updateOrganizationLogo(e.target.value);
      updateFavicon(e.target.value);
      updateConfigFromEditor();
    });
  }

  if (lightThemeBtn) {
    lightThemeBtn.addEventListener("click", () => toggleTheme("light"));
  }
  if (darkThemeBtn) {
    darkThemeBtn.addEventListener("click", () => toggleTheme("dark"));
  }

  // Обработчик чекбокса расширенных настроек
  if (advancedSettingsCheckbox) {
    advancedSettingsCheckbox.addEventListener("change", (e) => {
      currentConfig.showAdvancedSettings = e.target.checked;
      updateAdvancedSettingsVisibility(e.target.checked);
      updateConfigFromEditor();
    });
  }

  addFieldBtn.addEventListener("click", () => {
    const newField = {
      id: generateId(),
      type: "text",
      label: "Новое поле",
      placeholder: "",
      required: false,
      icon: "question",
    };
    currentConfig.fields.push(newField);
    addFieldToEditor(newField);
    updateConfigFromEditor();
    renderForm();
  });

  if (!currentConfig.conditionalMessages) {
    currentConfig.conditionalMessages = [];
  }
  conditionalMessagesList.innerHTML = "";
  currentConfig.conditionalMessages.forEach((condMsg) => {
    addConditionalMessageToEditor(condMsg);
  });

  addConditionalMessageBtn.addEventListener("click", () => {
    const newCondMsg = {
      id: generateId(),
      field: "",
      value: "",
      message: "",
    };
    currentConfig.conditionalMessages.push(newCondMsg);
    addConditionalMessageToEditor(newCondMsg);
    updateConfigFromEditor();
  });

  generateUrlBtn.addEventListener("click", generateAndCopyShareUrl);
  shortenUrlBtn.addEventListener("click", generateAndCopyShortUrl);
}

// Функция для добавления поля в редактор
function addFieldToEditor(field) {
  const fieldItem = document.createElement("div");
  fieldItem.className = "field-item";
  fieldItem.dataset.fieldId = field.id;

  fieldItem.innerHTML = `
    <div class="field-header">
      <div class="field-header-left">
        <span class="field-title">${iconMap[field.icon] || "❓"} ${
    field.label
  }</span>
        <label class="field-required-inline">
          <input type="checkbox" class="field-required" ${
            field.required ? "checked" : ""
          } />
          <span>обязательное</span>
        </label>
      </div>
      <div class="field-actions">
        <button class="field-action-btn move-up" title="Переместить вверх">
          <i class="fas fa-arrow-up"></i>
        </button>
        <button class="field-action-btn move-down" title="Переместить вниз">
          <i class="fas fa-arrow-down"></i>
        </button>
        <button class="field-action-btn clone" title="Клонировать">
          <i class="fas fa-clone"></i>
        </button>
        <button class="field-action-btn delete" title="Удалить">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="field-config">
      <div class="field-config-item">
        <label>Тип поля</label>
        <select class="field-type">
          <option value="text" ${
            field.type === "text" ? "selected" : ""
          }>Текст</option>
          <option value="email" ${
            field.type === "email" ? "selected" : ""
          }>Email</option>
          <option value="textarea" ${
            field.type === "textarea" ? "selected" : ""
          }>Текстовая область</option>
          <option value="select" ${
            field.type === "select" ? "selected" : ""
          }>Выпадающий список</option>
          <option value="radio" ${
            field.type === "radio" ? "selected" : ""
          }>Радиокнопки</option>
          <option value="checkbox" ${
            field.type === "checkbox" ? "selected" : ""
          }>Чекбокс</option>
          <option value="computed" ${
            field.type === "computed" ? "selected" : ""
          }>Вычисляемое поле</option>
        </select>
      </div>
      <div class="field-config-item">
        <label>Иконка</label>
        <select class="field-icon">
          <option value="user" ${
            field.icon === "user" ? "selected" : ""
          }>Пользователь</option>
          <option value="envelope" ${
            field.icon === "envelope" ? "selected" : ""
          }>Email</option>
          <option value="tag" ${
            field.icon === "tag" ? "selected" : ""
          }>Тег</option>
          <option value="exclamation-triangle" ${
            field.icon === "exclamation-triangle" ? "selected" : ""
          }>Приоритет</option>
          <option value="comment" ${
            field.icon === "comment" ? "selected" : ""
          }>Сообщение</option>
          <option value="newspaper" ${
            field.icon === "newspaper" ? "selected" : ""
          }>Новости</option>
          <option value="question" ${
            field.icon === "question" ? "selected" : ""
          }>Вопрос</option>
          <option value="calculator" ${
            field.icon === "calculator" ? "selected" : ""
          }>Калькулятор</option>
        </select>
      </div>
      <div class="field-config-item">
        <label>Название поля</label>
        <input type="text" class="field-label" value="${field.label}" />
      </div>
      <div class="field-config-item">
        <label>Placeholder</label>
        <input type="text" class="field-placeholder" value="${
          field.placeholder || ""
        }" />
      </div>
      <div class="field-config-item field-options" style="display: ${
        field.type === "select" || field.type === "radio" ? "block" : "none"
      };">
        <label>Варианты (через запятую)</label>
        <input type="text" class="field-options-input" value="${
          field.options ? field.options.join(", ") : ""
        }" />
      </div>
      <div class="field-config-item field-formula-container" style="display: ${
        field.type === "computed" ? "block" : "none"
      }; grid-column: 1 / -1;">
        <label>Формула</label>
        <div class="formula-editor">
          <input type="text" class="field-formula-input" value="${
            field.formula || ""
          }" placeholder="Пример: Заявка от {name} - {email,0,3}" />
          <button type="button" class="add-field-variable-btn" title="Добавить переменную">
            <i class="fas fa-plus"></i> Поле
          </button>
        </div>
        <div class="formula-hint">
          Используйте {id_поля} для значения поля.<br>
          Substring: {id_поля,start} или {id_поля,start,end}<br>
          Многострочные поля: {id_поля,count} - кол-во строк, {id_поля,line,0} - первая строка,<br>
          {id_поля,line,-1} - последняя строка, {id_поля,lines} - все строки через запятую,<br>
          {id_поля,lines,|} - все строки через указанный разделитель,<br>
          {id_поля,map,'выражение'} - применить выражение к каждой строке
        </div>
      </div>
      <div class="field-config-item field-conditional-container" style="grid-column: 1 / -1; display: ${
        currentConfig.showAdvancedSettings ? "block" : "none"
      };">
        <div class="conditional-section-header">
          <span>Условная видимость</span>
          <i class="fas fa-chevron-down conditional-toggle-icon ${
            field.conditional && field.conditional.enabled ? "open" : ""
          }"></i>
        </div>
        <div class="conditional-config" style="display: ${
          field.conditional && field.conditional.enabled ? "block" : "none"
        };">
          <div class="conditional-hint">Показывать это поле только если:</div>
          <div class="conditional-row">
            <select class="conditional-field-select">
              <option value="">Выберите поле...</option>
            </select>
            <span>включает</span>
            <div class="conditional-value-container"></div>
          </div>
        </div>
      </div>
      <div class="field-config-item field-custom-webhook-container" style="grid-column: 1 / -1; display: ${
        currentConfig.showAdvancedSettings ? "block" : "none"
      };">
        <div class="custom-webhook-section-header">
          <span>Кастомная отправка</span>
          <i class="fas fa-chevron-down custom-webhook-toggle-icon ${
            field.customWebhook && field.customWebhook.enabled ? "open" : ""
          }"></i>
        </div>
        <div class="custom-webhook-config" style="display: ${
          field.customWebhook && field.customWebhook.enabled ? "block" : "none"
        };">
          <div class="custom-webhook-hint">Отправлять форму с этим полем на отдельный webhook:</div>
          <input type="url" class="custom-webhook-url-input" value="" placeholder="https://discord.com/api/webhooks/..." />
          <label class="custom-webhook-split-lines" style="display: ${
            field.type === "textarea" || field.type === "computed"
              ? "flex"
              : "none"
          };">
            <input type="checkbox" class="custom-webhook-split-lines-checkbox" ${
              field.customWebhook && field.customWebhook.splitLines
                ? "checked"
                : ""
            } />
            <span>Каждая строка отдельным сообщением</span>
          </label>
        </div>
      </div>
    </div>
  `;

  setupFieldEventHandlers(fieldItem, field);
  fieldsList.appendChild(fieldItem);
}

// Функция для настройки обработчиков событий поля
function setupFieldEventHandlers(fieldItem, field) {
  const fieldHeader = fieldItem.querySelector(".field-header");
  const cloneBtn = fieldItem.querySelector(".clone");
  const deleteBtn = fieldItem.querySelector(".delete");
  const moveUpBtn = fieldItem.querySelector(".move-up");
  const moveDownBtn = fieldItem.querySelector(".move-down");
  const typeSelect = fieldItem.querySelector(".field-type");
  const labelInput = fieldItem.querySelector(".field-label");
  const placeholderInput = fieldItem.querySelector(".field-placeholder");
  const iconSelect = fieldItem.querySelector(".field-icon");
  const requiredCheckbox = fieldItem.querySelector(".field-required");
  const optionsContainer = fieldItem.querySelector(".field-options");
  const optionsInput = fieldItem.querySelector(".field-options-input");
  const formulaContainer = fieldItem.querySelector(".field-formula-container");
  const formulaInput = fieldItem.querySelector(".field-formula-input");
  const addVariableBtn = fieldItem.querySelector(".add-field-variable-btn");
  const conditionalSectionHeader = fieldItem.querySelector(
    ".conditional-section-header"
  );
  const conditionalToggleIcon = fieldItem.querySelector(
    ".conditional-toggle-icon"
  );
  const conditionalConfig = fieldItem.querySelector(".conditional-config");
  const conditionalFieldSelect = fieldItem.querySelector(
    ".conditional-field-select"
  );
  const conditionalValueContainer = fieldItem.querySelector(
    ".conditional-value-container"
  );
  const customWebhookSectionHeader = fieldItem.querySelector(
    ".custom-webhook-section-header"
  );
  const customWebhookToggleIcon = fieldItem.querySelector(
    ".custom-webhook-toggle-icon"
  );
  const customWebhookConfig = fieldItem.querySelector(".custom-webhook-config");
  const customWebhookUrlInput = fieldItem.querySelector(
    ".custom-webhook-url-input"
  );
  const customWebhookSplitLinesLabel = fieldItem.querySelector(
    ".custom-webhook-split-lines"
  );
  const customWebhookSplitLinesCheckbox = fieldItem.querySelector(
    ".custom-webhook-split-lines-checkbox"
  );

  function populateConditionalFieldSelect() {
    conditionalFieldSelect.innerHTML =
      '<option value="">Выберите поле...</option>';

    currentConfig.fields.forEach((f) => {
      if (f.id !== field.id && (f.type === "select" || f.type === "radio")) {
        const option = document.createElement("option");
        option.value = f.id;
        option.textContent = f.label;
        if (field.conditional && field.conditional.field === f.id) {
          option.selected = true;
        }
        conditionalFieldSelect.appendChild(option);
      }
    });
  }

  function updateConditionalValueOptions(selectedFieldId) {
    const selectedField = currentConfig.fields.find(
      (f) => f.id === selectedFieldId
    );

    const container = fieldItem.querySelector(".conditional-value-container");
    if (!container) return;

    if (
      !selectedField ||
      !selectedField.options ||
      selectedField.options.length === 0
    ) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "conditional-value-input";
      input.value = field.conditional ? field.conditional.value || "" : "";
      input.placeholder = "Значение";

      input.addEventListener("input", (e) => {
        if (!field.conditional) {
          field.conditional = { enabled: true };
        }
        field.conditional.value = e.target.value;
        updateConfigFromEditor();
        renderForm();
      });

      container.innerHTML = "";
      container.appendChild(input);
      return;
    }

    // Создаем контейнер с чекбоксами для множественного выбора
    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "conditional-checkboxes";

    // Получаем текущие выбранные значения
    let currentValues = [];
    if (field.conditional && field.conditional.value) {
      try {
        currentValues = JSON.parse(field.conditional.value);
        if (!Array.isArray(currentValues)) {
          currentValues = [field.conditional.value];
        }
      } catch (e) {
        currentValues = [field.conditional.value];
      }
    }

    selectedField.options.forEach((opt) => {
      const label = document.createElement("label");
      label.className = "conditional-checkbox-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = opt;
      checkbox.checked = currentValues.includes(opt);

      checkbox.addEventListener("change", () => {
        const allCheckboxes = checkboxContainer.querySelectorAll(
          'input[type="checkbox"]'
        );
        const selectedValues = Array.from(allCheckboxes)
          .filter((cb) => cb.checked)
          .map((cb) => cb.value);

        if (!field.conditional) {
          field.conditional = { enabled: true };
        }
        field.conditional.value = JSON.stringify(selectedValues);
        updateConfigFromEditor();
        renderForm();
      });

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + opt));
      checkboxContainer.appendChild(label);
    });

    container.innerHTML = "";
    container.appendChild(checkboxContainer);
  }

  populateConditionalFieldSelect();

  if (field.conditional && field.conditional.field) {
    updateConditionalValueOptions(field.conditional.field);
  }

  fieldHeader.addEventListener("click", (e) => {
    // Игнорируем клики по кнопкам и чекбоксу
    if (
      e.target.closest(".field-actions") ||
      e.target.closest(".field-required-inline")
    ) {
      return;
    }
    const config = fieldItem.querySelector(".field-config");
    config.style.display = config.style.display === "none" ? "grid" : "none";
  });

  cloneBtn.addEventListener("click", () => {
    const currentIndex = currentConfig.fields.findIndex(
      (f) => f.id === field.id
    );

    // Создаем глубокую копию поля
    const clonedField = JSON.parse(JSON.stringify(field));
    clonedField.id = generateId();
    clonedField.label = field.label + " (копия)";

    // Вставляем клонированное поле после текущего
    currentConfig.fields.splice(currentIndex + 1, 0, clonedField);

    rebuildFieldsList();

    // Если клонировали селект/радио, обновляем селекты полей
    if (field.type === "select" || field.type === "radio") {
      rebuildConditionalFieldSelects();
    }

    updateConfigFromEditor();
    renderForm();
  });

  deleteBtn.addEventListener("click", () => {
    if (confirm("Удалить это поле?")) {
      const wasSelectOrRadio =
        field.type === "select" || field.type === "radio";

      currentConfig.fields = currentConfig.fields.filter(
        (f) => f.id !== field.id
      );
      fieldItem.remove();

      // Если удалили селект/радио, обновляем селекты полей
      if (wasSelectOrRadio) {
        rebuildConditionalFieldSelects();
      }

      updateConfigFromEditor();
      renderForm();
    }
  });

  moveUpBtn.addEventListener("click", () => {
    const currentIndex = currentConfig.fields.findIndex(
      (f) => f.id === field.id
    );
    if (currentIndex > 0) {
      [
        currentConfig.fields[currentIndex - 1],
        currentConfig.fields[currentIndex],
      ] = [
        currentConfig.fields[currentIndex],
        currentConfig.fields[currentIndex - 1],
      ];

      rebuildFieldsList();
      updateConfigFromEditor();
      renderForm();
    }
  });

  moveDownBtn.addEventListener("click", () => {
    const currentIndex = currentConfig.fields.findIndex(
      (f) => f.id === field.id
    );
    if (currentIndex < currentConfig.fields.length - 1) {
      [
        currentConfig.fields[currentIndex],
        currentConfig.fields[currentIndex + 1],
      ] = [
        currentConfig.fields[currentIndex + 1],
        currentConfig.fields[currentIndex],
      ];

      rebuildFieldsList();
      updateConfigFromEditor();
      renderForm();
    }
  });

  typeSelect.addEventListener("change", (e) => {
    const newType = e.target.value;
    const oldType = field.type;
    field.type = newType;
    optionsContainer.style.display =
      newType === "select" || newType === "radio" ? "block" : "none";
    if (formulaContainer) {
      formulaContainer.style.display =
        newType === "computed" ? "block" : "none";
    }
    if (customWebhookSplitLinesLabel) {
      customWebhookSplitLinesLabel.style.display =
        newType === "textarea" || newType === "computed" ? "flex" : "none";
    }

    // Если изменился тип на select/radio или с select/radio, обновляем селекты полей
    const wasSelectOrRadio = oldType === "select" || oldType === "radio";
    const isSelectOrRadio = newType === "select" || newType === "radio";
    if (wasSelectOrRadio !== isSelectOrRadio) {
      rebuildConditionalFieldSelects();
    }

    updateConfigFromEditor();
    renderForm();
  });

  labelInput.addEventListener("input", (e) => {
    field.label = e.target.value;
    fieldItem.querySelector(".field-title").textContent = `${
      iconMap[field.icon] || "❓"
    } ${field.label}`;

    // Если это селект или радио, обновляем селекты полей (чтобы новое название отобразилось)
    if (field.type === "select" || field.type === "radio") {
      rebuildConditionalFieldSelects();
    }

    updateConfigFromEditor();
    renderForm();
  });

  placeholderInput.addEventListener("input", (e) => {
    field.placeholder = e.target.value;
    updateConfigFromEditor();
    renderForm();
  });

  iconSelect.addEventListener("change", (e) => {
    field.icon = e.target.value;
    fieldItem.querySelector(".field-title").textContent = `${
      iconMap[field.icon] || "❓"
    } ${field.label}`;
    updateConfigFromEditor();
    renderForm();
  });

  requiredCheckbox.addEventListener("change", (e) => {
    field.required = e.target.checked;
    updateConfigFromEditor();
    renderForm();
  });

  optionsInput.addEventListener("input", (e) => {
    field.options = e.target.value
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt);

    updateConfigFromEditor();
    renderForm();
  });

  optionsInput.addEventListener("blur", () => {
    rebuildConditionalSelects(field.id);
  });

  if (formulaInput) {
    formulaInput.addEventListener("input", (e) => {
      field.formula = e.target.value;
      updateConfigFromEditor();
      renderForm();
    });
  }

  conditionalSectionHeader.addEventListener("click", () => {
    const isCurrentlyOpen = field.conditional && field.conditional.enabled;
    const newState = !isCurrentlyOpen;

    conditionalConfig.style.display = newState ? "block" : "none";
    conditionalToggleIcon.classList.toggle("open", newState);

    if (newState) {
      field.conditional = {
        enabled: true,
        field: conditionalFieldSelect.value || "",
        value: field.conditional ? field.conditional.value || "" : "",
      };
    } else {
      field.conditional = { enabled: false };
    }

    updateConfigFromEditor();
    renderForm();
  });

  conditionalFieldSelect.addEventListener("change", (e) => {
    if (!field.conditional) {
      field.conditional = { enabled: true };
    }
    field.conditional.field = e.target.value;
    field.conditional.value = "";

    if (e.target.value) {
      updateConditionalValueOptions(e.target.value);
    }

    updateConfigFromEditor();
    renderForm();
  });

  // Обработчик для conditionalValueContainer теперь внутри updateConditionalValueOptions

  customWebhookSectionHeader.addEventListener("click", () => {
    const isCurrentlyOpen = field.customWebhook && field.customWebhook.enabled;
    const newState = !isCurrentlyOpen;

    customWebhookConfig.style.display = newState ? "block" : "none";
    customWebhookToggleIcon.classList.toggle("open", newState);

    if (newState) {
      field.customWebhook = {
        enabled: true,
        url: customWebhookUrlInput.value || "",
      };
    } else {
      field.customWebhook = { enabled: false };
    }

    updateConfigFromEditor();
    renderForm();
  });

  customWebhookUrlInput.addEventListener("input", (e) => {
    if (!field.customWebhook) {
      field.customWebhook = { enabled: true };
    }
    field.customWebhook.url = e.target.value;
    updateConfigFromEditor();
    renderForm();
  });

  if (customWebhookSplitLinesCheckbox) {
    customWebhookSplitLinesCheckbox.addEventListener("change", (e) => {
      if (!field.customWebhook) {
        field.customWebhook = { enabled: true };
      }
      field.customWebhook.splitLines = e.target.checked;
      updateConfigFromEditor();
      renderForm();
    });
  }

  if (addVariableBtn) {
    addVariableBtn.addEventListener("click", () => {
      showFieldVariablePopup(field, formulaInput);
    });
  }
}

// Функция для показа попапа выбора переменной
function showFieldVariablePopup(field, formulaInput) {
  const availableFields = currentConfig.fields.filter(
    (f) => f.id !== field.id && f.type !== "computed"
  );

  if (availableFields.length === 0) {
    alert("Нет доступных полей для вставки. Создайте сначала другие поля.");
    return;
  }

  const fieldSelect = document.createElement("select");
  fieldSelect.className = "temp-field-select";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Выберите поле...";
  fieldSelect.appendChild(defaultOption);

  availableFields.forEach((f) => {
    const option = document.createElement("option");
    option.value = f.id;
    option.textContent = f.label;
    fieldSelect.appendChild(option);
  });

  const popup = document.createElement("div");
  popup.className = "field-variable-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <label>Выберите поле для вставки:</label>
      <div class="popup-select-container"></div>
      <div class="substring-options">
        <div class="substring-hint">Substring (необязательно):</div>
        <div class="substring-inputs">
          <div class="substring-input-group">
            <label>Начало (start):</label>
            <input type="number" class="start-index-input" placeholder="Не указано" min="0" />
          </div>
          <div class="substring-input-group">
            <label>Конец (end):</label>
            <input type="number" class="end-index-input" placeholder="Не указано (до конца)" min="0" />
          </div>
        </div>
      </div>
      <div class="popup-buttons">
        <button type="button" class="popup-btn insert-btn">Вставить</button>
        <button type="button" class="popup-btn cancel-btn">Отмена</button>
      </div>
    </div>
  `;

  popup.querySelector(".popup-select-container").appendChild(fieldSelect);
  document.body.appendChild(popup);

  const insertBtn = popup.querySelector(".insert-btn");
  const cancelBtn = popup.querySelector(".cancel-btn");
  const startIndexInput = popup.querySelector(".start-index-input");
  const endIndexInput = popup.querySelector(".end-index-input");

  insertBtn.addEventListener("click", () => {
    const selectedFieldId = fieldSelect.value;
    if (selectedFieldId) {
      const selectedField = availableFields.find(
        (f) => f.id === selectedFieldId
      );
      if (selectedField) {
        let placeholder = `{${selectedField.id}`;

        const start = startIndexInput.value;
        const end = endIndexInput.value;

        if (start !== "") {
          placeholder += `,${start}`;
          if (end !== "") {
            placeholder += `,${end}`;
          }
        }

        placeholder += "}";

        const cursorPos = formulaInput.selectionStart;
        const textBefore = formulaInput.value.substring(0, cursorPos);
        const textAfter = formulaInput.value.substring(cursorPos);

        formulaInput.value = textBefore + placeholder + textAfter;
        formulaInput.focus();
        formulaInput.selectionStart = formulaInput.selectionEnd =
          cursorPos + placeholder.length;

        field.formula = formulaInput.value;
        updateConfigFromEditor();
        renderForm();
      }
    }
    popup.remove();
  });

  cancelBtn.addEventListener("click", () => {
    popup.remove();
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });
}

// Функция для перестроения списка полей в редакторе
function rebuildFieldsList() {
  fieldsList.innerHTML = "";
  currentConfig.fields.forEach((field) => {
    addFieldToEditor(field);
  });
}

// Функция для обновления селектов полей в условиях (когда меняется название или тип поля)
function rebuildConditionalFieldSelects() {
  // Обновляем селекты полей в условной видимости каждого поля
  currentConfig.fields.forEach((field) => {
    if (field.conditional && field.conditional.enabled) {
      const fieldItem = fieldsList.querySelector(
        `[data-field-id="${field.id}"]`
      );
      if (fieldItem) {
        const conditionalFieldSelect = fieldItem.querySelector(
          ".conditional-field-select"
        );
        if (conditionalFieldSelect) {
          const currentValue = conditionalFieldSelect.value;

          conditionalFieldSelect.innerHTML =
            '<option value="">Выберите поле...</option>';

          currentConfig.fields.forEach((f) => {
            if (
              f.id !== field.id &&
              (f.type === "select" || f.type === "radio")
            ) {
              const option = document.createElement("option");
              option.value = f.id;
              option.textContent = f.label;
              if (currentValue === f.id) {
                option.selected = true;
              }
              conditionalFieldSelect.appendChild(option);
            }
          });
        }
      }
    }
  });

  // Обновляем селекты полей в условных сообщениях
  if (currentConfig.conditionalMessages) {
    currentConfig.conditionalMessages.forEach((condMsg) => {
      const condMsgItem = conditionalMessagesList.querySelector(
        `[data-cond-msg-id="${condMsg.id}"]`
      );
      if (condMsgItem) {
        const fieldSelect = condMsgItem.querySelector(".condmsg-field-select");
        if (fieldSelect) {
          const currentValue = fieldSelect.value;

          fieldSelect.innerHTML = '<option value="">Выберите поле...</option>';

          currentConfig.fields.forEach((f) => {
            if (f.type === "select" || f.type === "radio") {
              const option = document.createElement("option");
              option.value = f.id;
              option.textContent = f.label;
              if (currentValue === f.id) {
                option.selected = true;
              }
              fieldSelect.appendChild(option);
            }
          });
        }
      }
    });
  }
}

// Функция для обновления только условных селектов значений (когда меняются опции поля)
function rebuildConditionalSelects(changedFieldId) {
  currentConfig.fields.forEach((field) => {
    if (
      field.conditional &&
      field.conditional.enabled &&
      field.conditional.field === changedFieldId
    ) {
      const fieldItem = fieldsList.querySelector(
        `[data-field-id="${field.id}"]`
      );
      if (fieldItem) {
        const conditionalValueContainer = fieldItem.querySelector(
          ".conditional-value-container"
        );
        if (conditionalValueContainer) {
          const changedField = currentConfig.fields.find(
            (f) => f.id === changedFieldId
          );
          if (
            changedField &&
            changedField.options &&
            changedField.options.length > 0
          ) {
            // Создаем контейнер с чекбоксами
            const checkboxContainer = document.createElement("div");
            checkboxContainer.className = "conditional-checkboxes";

            // Получаем текущие выбранные значения
            let currentValues = [];
            if (field.conditional && field.conditional.value) {
              try {
                currentValues = JSON.parse(field.conditional.value);
                if (!Array.isArray(currentValues)) {
                  currentValues = [field.conditional.value];
                }
              } catch (e) {
                currentValues = [field.conditional.value];
              }
            }

            changedField.options.forEach((opt) => {
              const label = document.createElement("label");
              label.className = "conditional-checkbox-label";

              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.value = opt;
              checkbox.checked = currentValues.includes(opt);

              checkbox.addEventListener("change", () => {
                const allCheckboxes = checkboxContainer.querySelectorAll(
                  'input[type="checkbox"]'
                );
                const selectedValues = Array.from(allCheckboxes)
                  .filter((cb) => cb.checked)
                  .map((cb) => cb.value);

                field.conditional.value = JSON.stringify(selectedValues);
                updateConfigFromEditor();
                renderForm();
              });

              label.appendChild(checkbox);
              label.appendChild(document.createTextNode(" " + opt));
              checkboxContainer.appendChild(label);
            });

            conditionalValueContainer.innerHTML = "";
            conditionalValueContainer.appendChild(checkboxContainer);
          }
        }
      }
    }
  });

  currentConfig.conditionalMessages.forEach((condMsg) => {
    if (condMsg.field === changedFieldId) {
      const condMsgItem = conditionalMessagesList.querySelector(
        `[data-cond-msg-id="${condMsg.id}"]`
      );
      if (condMsgItem) {
        const valueContainer = condMsgItem.querySelector(
          ".condmsg-value-container"
        );
        if (valueContainer) {
          const changedField = currentConfig.fields.find(
            (f) => f.id === changedFieldId
          );
          if (
            changedField &&
            changedField.options &&
            changedField.options.length > 0
          ) {
            // Создаем контейнер с чекбоксами
            const checkboxContainer = document.createElement("div");
            checkboxContainer.className = "conditional-checkboxes";

            // Получаем текущие выбранные значения
            let currentValues = [];
            if (condMsg.value) {
              try {
                currentValues = JSON.parse(condMsg.value);
                if (!Array.isArray(currentValues)) {
                  currentValues = [condMsg.value];
                }
              } catch (e) {
                currentValues = [condMsg.value];
              }
            }

            changedField.options.forEach((opt) => {
              const label = document.createElement("label");
              label.className = "conditional-checkbox-label";

              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.value = opt;
              checkbox.checked = currentValues.includes(opt);

              checkbox.addEventListener("change", () => {
                const allCheckboxes = checkboxContainer.querySelectorAll(
                  'input[type="checkbox"]'
                );
                const selectedValues = Array.from(allCheckboxes)
                  .filter((cb) => cb.checked)
                  .map((cb) => cb.value);

                condMsg.value = JSON.stringify(selectedValues);
                updateConfigFromEditor();
              });

              label.appendChild(checkbox);
              label.appendChild(document.createTextNode(" " + opt));
              checkboxContainer.appendChild(label);
            });

            valueContainer.innerHTML = "";
            valueContainer.appendChild(checkboxContainer);
          }
        }
      }
    }
  });
}

// Функция для обновления видимости расширенных настроек
function updateAdvancedSettingsVisibility(showAdvanced) {
  const conditionalContainers = document.querySelectorAll(
    ".field-conditional-container"
  );
  const customWebhookContainers = document.querySelectorAll(
    ".field-custom-webhook-container"
  );

  const displayValue = showAdvanced ? "block" : "none";

  conditionalContainers.forEach((container) => {
    container.style.display = displayValue;
  });

  customWebhookContainers.forEach((container) => {
    container.style.display = displayValue;
  });
}
