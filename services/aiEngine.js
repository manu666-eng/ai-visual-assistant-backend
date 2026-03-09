const { handleNavigation } = require("./navigationEngine");
const { callNova } = require("./novaService");

const USE_NOVA = false; // 🔥 Change to true during hackathon

// Simple object list for rule detection
const simpleObjects = ["chair", "person", "table", "wall", "stairs", "bike"];

// Detect if sentence is complex
function isComplexQuery(prompt) {
  const wordCount = prompt.trim().split(" ").length;

  // If long sentence OR contains question words
  if (
    wordCount > 6 ||
    prompt.toLowerCase().includes("what") ||
    prompt.toLowerCase().includes("where") ||
    prompt.toLowerCase().includes("should") ||
    prompt.toLowerCase().includes("how")
  ) {
    return true;
  }

  return false;
}

async function handleAI(prompt) {
  // 1️⃣ Navigation engine first
  const navigationResponse = handleNavigation(prompt);
  if (navigationResponse) {
    return navigationResponse;
  }

  // 2️⃣ Simple rule-based detection
  const detectedObject = simpleObjects.find(obj =>
    prompt.toLowerCase().includes(obj)
  );

  if (detectedObject && !isComplexQuery(prompt)) {
    return `Detected ${detectedObject} nearby. Stay alert.`;
  }

  // 3️⃣ Use Nova for complex queries
  if (USE_NOVA && isComplexQuery(prompt)) {
    const novaResponse = await callNova(prompt);
    if (novaResponse) {
      return novaResponse;
    }
  }

  // 4️⃣ Safe fallback
  return "Environment unclear. Proceed slowly and remain cautious.";
}

module.exports = { handleAI };