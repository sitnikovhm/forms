// === ФУНКЦИИ РАБОТЫ С DISCORD ===

// Функция для создания Discord embed
function createDiscordEmbed(formData) {
  const priorityColors = {
    Низкий: 0x10b981,
    Средний: 0xf59e0b,
    Высокий: 0xef4444,
  };

  let embedColor = 0xF16663;
  if (formData.priority && priorityColors[formData.priority]) {
    embedColor = priorityColors[formData.priority];
  }

  const embed = {
    title: `📝 ${currentConfig.title}`,
    color: embedColor,
    fields: [],
    timestamp: new Date().toISOString(),
    footer: {
      text: `${currentConfig.webhookUsername || currentConfig.title}`,
      icon_url:
        currentConfig.webhookAvatarUrl || 'https://pngimg.com/uploads/discord/discord_PNG3.png',
    },
  };

  // Если задан URL изображения для embed — добавляем его (показывается внизу embed)
  if (currentConfig && currentConfig.embedImageUrl) {
    embed.image = { url: currentConfig.embedImageUrl };
  }

  let questionIndex = 1;
  currentConfig.fields.forEach((field) => {
    // Пропускаем поля с кастомной отправкой
    if (
      field.customWebhook &&
      field.customWebhook.enabled &&
      (field.customWebhook.splitLines || field.customWebhook.url)
    ) {
      return;
    }

    const value = formData[field.id];
    if (value !== undefined && value !== '') {
      let displayValue = value;
      let fieldName = `${field.label}:`;

      if (field.type === 'checkbox') {
        displayValue = value === 'on' ? '✅ Да' : '❌ Нет';
      }

      if (typeof displayValue === 'string' && displayValue.length > 1024) {
        displayValue = displayValue.substring(0, 1021) + '...';
      }

      questionIndex++;
      embed.fields.push({
        name: fieldName,
        value:"```yaml\n" + displayValue + "\n```",
        inline: false,
      });
    }
  });

  return embed;
}

// Функция для создания текстового сообщения
function createPlainTextMessage(formData) {
  let message = `**__📝 ${currentConfig.title}__**\n`;

  let questionIndex = 1;
  currentConfig.fields.forEach((field) => {
    // Пропускаем поля с кастомной отправкой
    if (
      field.customWebhook &&
      field.customWebhook.enabled &&
      (field.customWebhook.splitLines || field.customWebhook.url)
    ) {
      return;
    }

    const value = formData[field.id];
    if (value !== undefined && value !== '') {
      let displayValue = value;

      if (field.type === 'checkbox') {
        displayValue = value === 'on' ? '✅ Да' : '❌ Нет';
      }

      message += `**${questionIndex}) ${field.label}:**${
        ['textarea', 'computed'].includes(field.type) ? '\n' : ' '
      }${displayValue}\n`;
      questionIndex++;
    }
  });
  return message;
}
function getConditionalMessage(formData) {
  const matchedMessages = [];

  // Собираем все условные сообщения, которые подходят по условию
  if (currentConfig.conditionalMessages && currentConfig.conditionalMessages.length > 0) {
    for (const condMsg of currentConfig.conditionalMessages) {
      if (condMsg.field && condMsg.value && condMsg.message) {
        const fieldValue = formData[condMsg.field];

        // Поддержка массива значений для условия "включает"
        let requiredValues = [];
        try {
          requiredValues = JSON.parse(condMsg.value);
          if (!Array.isArray(requiredValues)) {
            requiredValues = [condMsg.value];
          }
        } catch (e) {
          requiredValues = [condMsg.value];
        }

        if (requiredValues.includes(fieldValue)) {
          matchedMessages.push(condMsg.message);
        }
      }
    }
  }

  // Если есть кастомное сообщение по умолчанию, добавляем его
  if (currentConfig.customMessage) {
    matchedMessages.push(currentConfig.customMessage);
  }

  // Если есть хотя бы одно сообщение, склеиваем их через двойной перенос строки
  return matchedMessages.length > 0 ? matchedMessages.join('\n') : null;
}

// helper: извлечь ID ролей из текста вида <@&123456789012345678>
function extractRoleIdsFromText(text) {
  const ids = [];
  if (!text) return ids;
  const re = /<@&(\d{17,20})>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    ids.push(m[1]);
  }
  return Array.from(new Set(ids));
}

// helper: извлечь ID пользователей из строки (может быть просто число или упоминание <@123...>)
function extractUserIdFromValue(val) {
  if (!val) return null;
  const s = String(val).trim();
  const mMention = s.match(/<@!?(\d{17,20})>/);
  if (mMention) return mMention[1];
  const mDigits = s.match(/(\d{17,20})/);
  if (mDigits) return mDigits[1];
  return null;
}

// Функция для отправки данных в Discord (обновлённая: поддержка упоминаний пользователей из полей типа "mention")
async function sendToDiscord(formData) {
  if (!currentConfig.webhookUrl) {
    return { success: false, message: 'Webhook URL не настроен' };
  }

  // Собираем user IDs из полей типа "mention"
  const userIds = [];
  (currentConfig.fields || []).forEach((f) => {
    if (f.type === 'mention') {
      const val = formData[f.id];
      const uid = extractUserIdFromValue(val);
      if (uid) userIds.push(uid);
    }
  });

  // Уникальные
  const uniqueUserIds = Array.from(new Set(userIds));

  // Роли — из customMessage (если там есть <@&ID>)
  const customMessage = getConditionalMessage(formData);
  const roleIds = extractRoleIdsFromText(customMessage || "");

  // Формируем content: сохраняем customMessage (может содержать role mentions), добавляем упоминания пользователей
  const userMentionsString = uniqueUserIds.length ? uniqueUserIds.map(id => `<@${id}>`).join(' ') : "";
  const contentText = `${customMessage || ""}${userMentionsString ? (customMessage ? " " + userMentionsString : userMentionsString) : ""}`.trim();

  // allowed_mentions
  const allowed_mentions = { parse: [] };
  if (roleIds.length) allowed_mentions.roles = roleIds;
  if (uniqueUserIds.length) allowed_mentions.users = uniqueUserIds;

  let payload;

  if (currentConfig.sendAsPlainText) {
    // Отправка как текстовое сообщение
    const plainTextContent = createPlainTextMessage(formData);
    const finalContent = contentText ? `${contentText}\n\n${plainTextContent}` : plainTextContent;
    payload = {
      content: finalContent,
      username: currentConfig.webhookUsername || currentConfig.title,
      avatar_url: currentConfig.webhookAvatarUrl || 'https://pngimg.com/uploads/discord/discord_PNG3.png',
      allowed_mentions,
    };
  } else {
    // Отправка как embed
    const embed = createDiscordEmbed(formData);
    payload = {
      content: contentText || "",
      embeds: [embed],
      username: currentConfig.webhookUsername || currentConfig.title,
      avatar_url: currentConfig.webhookAvatarUrl || 'https://pngimg.com/uploads/discord/discord_PNG3.png',
      allowed_mentions,
    };
  }

  try {
    // Отправка на основной webhook
    const response = await fetch(currentConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || 'Неизвестная ошибка'}`);
    }

    // Обработка полей с кастомными настройками отправки
    const customWebhookFields = currentConfig.fields.filter(
      (field) => field.customWebhook && field.customWebhook.enabled
    );

    if (customWebhookFields.length > 0) {
      const customWebhookPromises = [];

      customWebhookFields.forEach((field) => {
        // Определяем webhook: кастомный если указан, иначе основной
        const webhookUrl = field.customWebhook.url || currentConfig.webhookUrl;

        // Если включена опция splitLines для многострочных полей
        if (
          field.customWebhook.splitLines &&
          (field.type === 'textarea' || field.type === 'computed') &&
          formData[field.id]
        ) {
          const lines = formData[field.id].split('\n').filter((line) => line.trim() !== '');

          // Отправляем каждую строку отдельным сообщением
          lines.forEach((line, index) => {
            const linePayload = {
              content: line,
              username: currentConfig.webhookUsername || currentConfig.title,
              avatar_url:
                currentConfig.webhookAvatarUrl ||
                'https://pngimg.com/uploads/discord/discord_PNG3.png',
            };

            customWebhookPromises.push(
              fetch(webhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(linePayload),
              }).catch((error) => {
                console.error(`Ошибка отправки строки ${index + 1} поля ${field.label}:`, error);
              })
            );
          });
        } else if (field.customWebhook.url) {
          // Обычная отправка формы на кастомный webhook (только если URL указан)
          customWebhookPromises.push(
            fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            }).catch((error) => {
              console.error(`Ошибка отправки на кастомный webhook поля ${field.label}:`, error);
            })
          );
        }
      });

      await Promise.allSettled(customWebhookPromises);
    }

    return { success: true, message: 'Сообщение успешно отправлено! 🎉' };
  } catch (error) {
    console.error('Ошибка отправки в Discord:', error);
    return {
      success: false,
      message: `Ошибка при отправке: ${error.message}. Попробуйте еще раз.`,
    };
  }
}
