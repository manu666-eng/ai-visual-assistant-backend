export function generateNavigationGuidance(objects) {

  if (!objects || objects.length === 0) {

    return
      "Path appears clear. Walk forward carefully.";

  }

  const obj = objects[0];

  if (obj.position === "left") {

    return `${obj.label} ${obj.distance} on your left. Move right.`;

  }

  if (obj.position === "right") {

    return `${obj.label} ${obj.distance} on your right. Move left.`;

  }

  return `${obj.label} ${obj.distance} ahead. Slow down.`;

}