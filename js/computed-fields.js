// === ФУНКЦИИ РАБОТЫ С ВЫЧИСЛЯЕМЫМИ ПОЛЯМИ ===

// Функция для вычисления значения по формуле
function calculateFormula(formula, formElement) {
  if (!formula) return "";

  let result = formula;
  const formData = new FormData(formElement);

  const matches = formula.match(/\{([^}]+)\}/g);
  if (matches) {
    matches.forEach((match) => {
      const content = match.slice(1, -1);
      const parts = content.split(",").map((p) => p.trim());

      const fieldId = parts[0];
      let value = "";

      const fieldElement = formElement.querySelector(`[name="${fieldId}"]`);
      if (fieldElement) {
        if (fieldElement.type === "checkbox") {
          value = fieldElement.checked ? "Да" : "Нет";
        } else if (fieldElement.type === "radio") {
          const checkedRadio = formElement.querySelector(
            `[name="${fieldId}"]:checked`
          );
          value = checkedRadio ? checkedRadio.value : "";
        } else {
          value = fieldElement.value || "";
        }

        if (parts.length > 1) {
          const operation = parts[1];

          if (operation === "count") {
            value = value
              .split("\n")
              .filter((line) => line.trim())
              .length.toString();
          } else if (operation === "line") {
            const lineIndex = parseInt(parts[2]);
            const lines = value.split("\n").filter((line) => line.trim());
            if (lineIndex < 0) {
              value = lines[lines.length + lineIndex] || "";
            } else {
              value = lines[lineIndex] || "";
            }
          } else if (operation === "lines") {
            const lines = value.split("\n").filter((line) => line.trim());
            const separator = parts.length > 2 ? parts[2] : ", ";
            value = lines.join(separator);
          } else if (operation === "map") {
            if (parts.length < 3) {
              value = "";
            } else {
              let mapExpression = parts.slice(2).join(",");

              if (
                mapExpression.match(/^["']/) &&
                mapExpression.match(/["']$/)
              ) {
                mapExpression = mapExpression.slice(1, -1);
              }

              if (
                mapExpression.startsWith("\\'") &&
                mapExpression.endsWith("\\'")
              ) {
                mapExpression = mapExpression.slice(2, -2);
              } else if (
                mapExpression.startsWith('\\"') &&
                mapExpression.endsWith('\\"')
              ) {
                mapExpression = mapExpression.slice(2, -2);
              }

              const lines = value.split("\n").filter((line) => line.trim());
              const mappedLines = lines.map((line) => {
                let lineExpression = mapExpression.replace(/\[line\]/g, line);

                const lineMatches = lineExpression.match(/\{([^}]+)\}/g);
                if (lineMatches) {
                  lineMatches.forEach((lineMatch) => {
                    const lineContent = lineMatch.slice(1, -1);
                    const lineParts = lineContent
                      .split(",")
                      .map((p) => p.trim());

                    if (lineParts.length === 1 && lineParts[0] !== "line") {
                      const otherFieldId = lineParts[0];
                      const otherFieldElement = formElement.querySelector(
                        `[name="${otherFieldId}"]`
                      );
                      if (otherFieldElement) {
                        let otherValue = "";
                        if (otherFieldElement.type === "checkbox") {
                          otherValue = otherFieldElement.checked ? "Да" : "Нет";
                        } else if (otherFieldElement.type === "radio") {
                          const checkedRadio = formElement.querySelector(
                            `[name="${otherFieldId}"]:checked`
                          );
                          otherValue = checkedRadio ? checkedRadio.value : "";
                        } else {
                          otherValue = otherFieldElement.value || "";
                        }
                        lineExpression = lineExpression.replace(
                          lineMatch,
                          otherValue
                        );
                      }
                    } else if (lineParts.length >= 2) {
                      const lineOp = lineParts[1];
                      let lineValue = line;

                      if (lineOp === "length") {
                        lineValue = line.length.toString();
                      } else if (lineOp === "upper") {
                        lineValue = line.toUpperCase();
                      } else if (lineOp === "lower") {
                        lineValue = line.toLowerCase();
                      } else if (lineOp === "trim") {
                        lineValue = line.trim();
                      } else if (!isNaN(parseInt(lineOp))) {
                        const startIndex = parseInt(lineOp);
                        const endIndex =
                          lineParts.length > 2 ? parseInt(lineParts[2]) : null;
                        if (endIndex !== null) {
                          lineValue = line.substring(startIndex, endIndex);
                        } else {
                          lineValue = line.substring(startIndex);
                        }
                      }

                      lineExpression = lineExpression.replace(
                        lineMatch,
                        lineValue
                      );
                    }
                  });
                }

                return lineExpression;
              });

              value = mappedLines.join("\n");
            }
          } else {
            const startIndex = parseInt(parts[1]);
            const endIndex = parts.length > 2 ? parseInt(parts[2]) : null;

            if (value && !isNaN(startIndex)) {
              if (endIndex !== null && !isNaN(endIndex)) {
                value = value.substring(startIndex, endIndex);
              } else {
                value = value.substring(startIndex);
              }
            }
          }
        }
      }

      result = result.replace(match, value);
    });
  }

  return result;
}

// Функция для инициализации автоматического обновления вычисляемых полей
function initComputedFields() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const computedFields = form.querySelectorAll(".computed-field");
  if (computedFields.length === 0) return;

  const updateComputedFields = () => {
    computedFields.forEach((field) => {
      const formula = field.dataset.formula;
      if (formula) {
        field.value = calculateFormula(formula, form);
      }
    });
  };

  const allInputs = form.querySelectorAll(
    "input:not(.computed-field), select, textarea"
  );
  allInputs.forEach((input) => {
    input.addEventListener("input", updateComputedFields);
    input.addEventListener("change", updateComputedFields);
  });

  updateComputedFields();
}
