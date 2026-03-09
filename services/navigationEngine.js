function generateNavigationGuidance(objects) {

  if (!objects || objects.length === 0) {
    return "Area unclear. Move slowly.";
  }

  const ignore = [
    "clothing","hat","cap","pants","jeans","shirt"
  ];

  const filtered = objects.filter(
    o => !ignore.includes(o.name.toLowerCase())
  );

  if (filtered.length === 0) {
    return "Area appears clear. Move carefully.";
  }

  let warnings = [];

  filtered.forEach(obj => {

    const name = obj.name.toLowerCase();
    const box = obj.box;

    let direction = "ahead";
    let distance = "ahead";

    if (box) {

      if (box.Left < 0.33) direction = "on your left";
      else if (box.Left < 0.66) direction = "ahead";
      else direction = "on your right";

      if (box.Height > 0.6) distance = "very close";
      else if (box.Height > 0.3) distance = "close";
      else distance = "a few steps away";

    }

    if (name.includes("person")) {
      warnings.push(`Stop. Person ${direction}, ${distance}`);
      return;
    }

    if (
      name.includes("chair") ||
      name.includes("table") ||
      name.includes("couch") ||
      name.includes("bed") ||
      name.includes("sofa")
    ) {
      warnings.push(`${obj.name} ${direction}, ${distance}`);
      return;
    }

    if (
      name.includes("wall") ||
      name.includes("door") ||
      name.includes("window")
    ) {
      warnings.push(`${obj.name} ${direction}, ${distance}`);
      return;
    }

  });

  if (warnings.length === 0) {
    return "Area appears clear. Move forward carefully.";
  }

  return warnings.join(". ");

}

module.exports = { generateNavigationGuidance };