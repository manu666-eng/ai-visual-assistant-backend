function generateNavigationGuidance(objects) {

  if (!objects || objects.length === 0) {
    return "Path appears clear.";
  }

  const lower = objects.map(o => o.toLowerCase());


  if (lower.includes("person") || lower.includes("people")) {
    return "Person detected ahead. Walk slowly.";
  }


  if (
    lower.includes("chair") ||
    lower.includes("table") ||
    lower.includes("furniture")
  ) {
    return "Obstacle detected. Move slightly to the side.";
  }


  if (lower.includes("wall")) {
    return "Wall ahead. Stop and change direction.";
  }


  if (
    lower.includes("laptop") ||
    lower.includes("screen") ||
    lower.includes("monitor")
  ) {
    return "Object ahead on surface. Proceed carefully.";
  }

  return "Objects detected nearby. Move carefully.";

}

module.exports = { generateNavigationGuidance };