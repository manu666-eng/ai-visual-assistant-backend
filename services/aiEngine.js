const FRAME_MEMORY = 4;

let frameBuffer = [];

function getDirection(box) {

  const center = box.Left + box.Width / 2;

  if (center < 0.33) return "left";
  if (center > 0.66) return "right";

  return "center";

}

function estimateDistance(box) {

  const size = box.Width * box.Height;

  if (size > 0.30) return "very close";
  if (size > 0.15) return "close";
  if (size > 0.05) return "medium";

  return "far";

}

function normalize(objects) {

  return objects.map(obj => ({
    label: obj.label,
    confidence: obj.confidence,
    position: getDirection(obj.box),
    distance: estimateDistance(obj.box)
  }));

}

function mergeFrames(objects) {

  // add current frame
  frameBuffer.push(objects);

  // keep only last N frames
  if (frameBuffer.length > FRAME_MEMORY) {
    frameBuffer.shift();
  }

  const objectCounter = {};

  frameBuffer.forEach(frame => {

    frame.forEach(obj => {

      const key = `${obj.label}-${obj.position}`;

      if (!objectCounter[key]) {

        objectCounter[key] = {
          ...obj,
          count: 1
        };

      } else {

        objectCounter[key].count++;

      }

    });

  });

  const stableObjects = [];

  Object.values(objectCounter).forEach(obj => {

    // object must appear in at least 2 frames
    if (obj.count >= 2) {

      stableObjects.push({
        label: obj.label,
        position: obj.position,
        distance: obj.distance
      });

    }

  });

  return stableObjects;

}

function prioritize(objects) {

  const riskOrder = [
    "person",
    "car",
    "bicycle",
    "motorcycle",
    "stairs",
    "chair",
    "table",
    "wall",
    "door"
  ];

  objects.sort((a, b) => {

    const ai = riskOrder.indexOf(a.label);
    const bi = riskOrder.indexOf(b.label);

    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;

    return ai - bi;

  });

  return objects;

}

export function processObjects(objects) {

  const normalized = normalize(objects);

  const stabilized = mergeFrames(normalized);

  const prioritized = prioritize(stabilized);

  return prioritized;

}