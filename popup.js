import { generateQueries } from "./query-generator.js";

const queryInput = document.getElementById("query");
const modeSelect = document.getElementById("mode");
const generateBtn = document.getElementById("generate");
const resultsDiv = document.getElementById("results");

generateBtn.addEventListener("click", () => {
  const query = queryInput.value;
  const mode = modeSelect.value;

  const results = generateQueries(query, mode);

  resultsDiv.innerHTML = "";

  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "result";

    div.innerHTML = `
      <strong>${item.label}</strong><br/>
      <small>${item.explanation}</small><br/>
      <code>${item.query}</code><br/>
    `;

    const openBtn = document.createElement("button");
    openBtn.textContent = "Open";

    openBtn.onclick = () => {
      chrome.runtime.sendMessage({
        action: "openSearch",
        query: item.query
      });
    };

    div.appendChild(openBtn);
    resultsDiv.appendChild(div);
  });
});