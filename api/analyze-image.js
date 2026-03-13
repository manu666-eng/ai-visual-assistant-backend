const { analyzeImage } = require("../services/rekognitionService");
const { generateNavigationGuidance } = require("../services/navigationEngine");
const { analyzeSceneWithNova } = require("../services/novaVisionService");

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {

    const { image } = req.body;

    if (!image) {
      return res.json({
        message: "No image received"
      });
    }

    console.log("Image received");

    const objects = await analyzeImage(image);

    console.log("Detected objects:", objects);

    const fallbackGuidance =
      generateNavigationGuidance(objects);

    const novaGuidance =
      await analyzeSceneWithNova(objects, fallbackGuidance);

    res.json({
      message: novaGuidance || fallbackGuidance
    });

  } catch (error) {

    console.error("Analyze error:", error);

    res.json({
      message: "Navigation unavailable. Move slowly."
    });

  }

};