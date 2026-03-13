require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { detectObjects } = require("./services/rekognitionService");
const { generateNovaGuidance } = require("./services/novaVisionService");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const FRAME_MEMORY = 5;
let memoryBuffer = [];

function getDirection(box) {
  const center = box.Left + box.Width / 2;

  if (center < 0.33) return "left";
  if (center > 0.66) return "right";
  return "center";
}

function normalizeObjects(labels) {
  return labels.map(label => ({
    label: label.Name,
    confidence: label.Confidence,
    position: getDirection(label.Geometry.BoundingBox),
    box: label.Geometry.BoundingBox
  }));
}

function mergeFrames(objects) {

  memoryBuffer.push(objects);

  if (memoryBuffer.length > FRAME_MEMORY) {
    memoryBuffer.shift();
  }

  const merged = {};

  memoryBuffer.forEach(frame => {
    frame.forEach(obj => {

      const key = `${obj.label}-${obj.position}`;

      if (!merged[key]) merged[key] = obj;

    });
  });

  return Object.values(merged);
}

function prioritize(objects) {

  const riskOrder = [
    "person",
    "car",
    "bicycle",
    "motorcycle",
    "chair",
    "table",
    "desk",
    "furniture",
    "stairs",
    "wall",
    "door"
  ];

  objects.sort((a, b) => {
    const ai = riskOrder.indexOf(a.label.toLowerCase());
    const bi = riskOrder.indexOf(b.label.toLowerCase());

    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;

    return ai - bi;
  });

  return objects;
}

function fallbackNavigation(objects) {

  if (!objects || objects.length === 0)
    return "Path looks clear. Walk forward carefully.";

  const obj = objects[0];

  if (obj.position === "left")
    return `${obj.label} on your left. Move slightly right`;

  if (obj.position === "right")
    return `${obj.label} on your right. Move slightly left`;

  return `${obj.label} ahead. Slow down and adjust direction`;

}

app.post("/api/analyze-image", async (req, res) => {

  try {

    const { image } = req.body;

    if (!image) {
      return res.json({
        message: "No image received"
      });
    }

    const labels = await detectObjects(image);

    const normalized = normalizeObjects(labels);

    const stableObjects = mergeFrames(normalized);

    const prioritized = prioritize(stableObjects);

    let novaResponse = null;

    try {

      novaResponse =
        await generateNovaGuidance(prioritized);

    } catch (err) {}

    const fallback = fallbackNavigation(prioritized);

    const guidance = novaResponse || fallback;

    res.json({
      message: guidance,
      objects: prioritized
    });

  } catch (error) {

    res.json({
      message: "Navigation temporarily unavailable. Move slowly."
    });

  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});