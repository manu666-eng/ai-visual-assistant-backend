const MEMORY = 5;

let frameBuffer = [];

function getDirection(box) {

  const center =
    box.Left + box.Width / 2;

  if (center < 0.33)
    return "left";

  if (center > 0.66)
    return "right";

  return "center";

}

function estimateDistance(box) {

  const size =
    box.Width * box.Height;

  if (size > 0.30)
    return "very close";

  if (size > 0.15)
    return "close";

  if (size > 0.05)
    return "medium";

  return "far";

}

function normalize(objects) {

  return objects.map(obj => ({

    label: obj.label,

    confidence:
      obj.confidence,

    position:
      getDirection(obj.box),

    distance:
      estimateDistance(obj.box)

  }));

}

function mergeFrames(objects) {

  frameBuffer.push(objects);

  if (frameBuffer.length > MEMORY)
    frameBuffer.shift();

  const merged = {};

  frameBuffer.forEach(frame => {

    frame.forEach(obj => {

      const key =
        `${obj.label}-${obj.position}`;

      if (!merged[key])
        merged[key] = obj;

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
    "stairs",
    "chair",
    "table",
    "wall",
    "door"

  ];

  objects.sort((a, b) => {

    const ai =
      riskOrder.indexOf(a.label);

    const bi =
      riskOrder.indexOf(b.label);

    if (ai === -1 && bi === -1)
      return 0;

    if (ai === -1)
      return 1;

    if (bi === -1)
      return -1;

    return ai - bi;

  });

  return objects;

}

export function processObjects(objects) {

  const normalized =
    normalize(objects);

  const stable =
    mergeFrames(normalized);

  const prioritized =
    prioritize(stable);

  return prioritized;

}