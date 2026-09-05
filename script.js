const display = document.getElementById("display");
const previousOperation = document.getElementById("previousOperation");

const buttons = document.querySelectorAll(".button");

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

const themeToggle = document.getElementById("themeToggle");

let currentExpression = "";
let calculationHistory = [];

const operators = ["+", "-", "*", "/", "%"];

/*
  Display par expression show karta hai.
*/
function updateDisplay() {
  if (currentExpression === "") {
    display.value = "0";
    return;
  }

  display.value = formatExpression(currentExpression);
}

/*
  Multiplication aur division symbols ko
  user-friendly format me show karta hai.
*/
function formatExpression(expression) {
  return expression
    .replaceAll("*", "×")
    .replaceAll("/", "÷");
}

/*
  Check karta hai ki character operator hai ya nahi.
*/
function isOperator(character) {
  return operators.includes(character);
}

/*
  Number ya decimal display me add karta hai.
*/
function appendNumber(value) {
  if (display.value === "Error") {
    clearCalculator();
  }

  if (value === ".") {
    const currentNumber = getCurrentNumber();

    if (currentNumber.includes(".")) {
      return;
    }

    if (
      currentExpression === "" ||
      isOperator(currentExpression.slice(-1))
    ) {
      currentExpression += "0";
    }
  }

  currentExpression += value;

  updateDisplay();
}

/*
  Current expression ka last number return karta hai.
  Isse multiple decimals ko prevent kiya jata hai.
*/
function getCurrentNumber() {
  const numberParts = currentExpression.split(/[+\-*/%]/);

  return numberParts[numberParts.length - 1];
}

/*
  Expression me operator add karta hai.
*/
function appendOperator(operator) {
  if (display.value === "Error") {
    return;
  }

  if (currentExpression === "") {
    if (operator === "-") {
      currentExpression = "-";
      updateDisplay();
    }

    return;
  }

  const lastCharacter = currentExpression.slice(-1);

  if (isOperator(lastCharacter)) {
    currentExpression =
      currentExpression.slice(0, -1) + operator;
  } else {
    currentExpression += operator;
  }

  updateDisplay();
}

/*
  Calculator ko complete clear karta hai.
*/
function clearCalculator() {
  currentExpression = "";
  display.value = "0";
  previousOperation.textContent = "";
}

/*
  Last entered character delete karta hai.
*/
function deleteLastCharacter() {
  if (
    display.value === "Error" ||
    display.value === "Cannot divide by zero"
  ) {
    clearCalculator();
    return;
  }

  currentExpression = currentExpression.slice(0, -1);

  updateDisplay();
}

/*
  Percentage calculate karta hai.

  Example:
  50% = 0.5
*/
function convertPercentage(expression) {
  return expression.replace(
    /(\d+(\.\d+)?)%/g,
    "($1/100)"
  );
}

/*
  Expression ko securely validate karta hai.
*/
function isValidExpression(expression) {
  const allowedCharacters = /^[0-9+\-*/%.()\s]+$/;

  return allowedCharacters.test(expression);
}

/*
  Expression calculate karta hai.
*/
function calculateResult() {
  if (currentExpression === "") {
    return;
  }

  const lastCharacter = currentExpression.slice(-1);

  if (isOperator(lastCharacter)) {
    showError("Incomplete calculation");
    return;
  }

  try {
    let expressionToCalculate =
      convertPercentage(currentExpression);

    if (!isValidExpression(expressionToCalculate)) {
      throw new Error("Invalid expression");
    }

    const result = Function(
      `"use strict"; return (${expressionToCalculate})`
    )();

    if (!Number.isFinite(result)) {
      display.value = "Cannot divide by zero";
      previousOperation.textContent =
        formatExpression(currentExpression);

      currentExpression = "";
      return;
    }

    const roundedResult =
      Math.round((result + Number.EPSILON) * 100000000) /
      100000000;

    const originalExpression = currentExpression;

    previousOperation.textContent =
      `${formatExpression(originalExpression)} =`;

    display.value = roundedResult;

    addToHistory(originalExpression, roundedResult);

    currentExpression = roundedResult.toString();
  } catch (error) {
    showError("Error");
  }
}

/*
  Error message show karta hai.
*/
function showError(message) {
  display.value = message;
  previousOperation.textContent =
    formatExpression(currentExpression);

  currentExpression = "";
}

/*
  Calculation history me new result add karta hai.
*/
function addToHistory(expression, result) {
  const historyData = {
    expression: formatExpression(expression),
    result: result
  };

  calculationHistory.unshift(historyData);

  if (calculationHistory.length > 5) {
    calculationHistory.pop();
  }

  renderHistory();
}

/*
  History ko webpage par display karta hai.
*/
function renderHistory() {
  historyList.innerHTML = "";

  if (calculationHistory.length === 0) {
    historyList.innerHTML =
      '<li class="empty-history">No calculations yet</li>';

    return;
  }

  calculationHistory.forEach((item) => {
    const historyItem = document.createElement("li");

    historyItem.classList.add("history-item");

    historyItem.innerHTML = `
      <span>${item.expression}</span>
      <span class="history-result">= ${item.result}</span>
    `;

    historyList.appendChild(historyItem);
  });
}

/*
  History clear karta hai.
*/
function clearHistory() {
  calculationHistory = [];

  renderHistory();
}

/*
  Calculator buttons ke click handle karta hai.
*/
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
      if (isOperator(value)) {
        appendOperator(value);
      } else {
        appendNumber(value);
      }
    }

    if (action === "clear") {
      clearCalculator();
    }

    if (action === "delete") {
      deleteLastCharacter();
    }

    if (action === "calculate") {
      calculateResult();
    }
  });
});

/*
  Keyboard support.
*/
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (!Number.isNaN(Number(key)) || key === ".") {
    appendNumber(key);
  }

  if (operators.includes(key)) {
    appendOperator(key);
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
  }

  if (key === "Backspace") {
    deleteLastCharacter();
  }

  if (key === "Escape" || key === "Delete") {
    clearCalculator();
  }
});

/*
  Clear history button.
*/
clearHistoryButton.addEventListener("click", clearHistory);

/*
  Dark aur light theme change karta hai.
*/
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  const darkThemeEnabled =
    document.body.classList.contains("dark-theme");

  themeToggle.textContent =
    darkThemeEnabled ? "☀️" : "🌙";
});

updateDisplay();
renderHistory();