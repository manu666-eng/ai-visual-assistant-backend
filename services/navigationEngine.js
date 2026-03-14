function getDirection(box) {

  if (!box) return "ahead";

  const center = box.Left + box.Width / 2;

  if (center < 0.33) return "left";
  if (center > 0.66) return "right";

  return "ahead";
}

function generateNavigationGuidance(objects) {

  if (!objects || objects.length === 0) {
    return "Path appears clear. Walk forward carefully.";
  }

  const primary = objects[0];

  const name =
    (primary.name || primary.Name || "").toLowerCase();

  const position =
    getDirection(primary.boundingBox || primary.box);

  if (name.includes("person")) {

    return `Person ${position}. Slow down and keep distance`;

  }

  if (
    name.includes("chair") ||
    name.includes("table") ||
    name.includes("furniture")
  ) {

    if (position === "left")
      return "Chair on your left. Move slightly right";

    if (position === "right")
      return "Chair on your right. Move slightly left";

    return "Chair ahead. Slow down and adjust direction";

  }

  if (name.includes("wall")) {

    return "Wall ahead. Stop and change direction";

  }

  if (
    name.includes("laptop") ||
    name.includes("screen") ||
    name.includes("monitor")
  ) {

    return `Object ${position}. Move carefully`;

  }

  return `Obstacle ${position}. Move carefully`;

}

module.exports = { generateNavigationGuidance };