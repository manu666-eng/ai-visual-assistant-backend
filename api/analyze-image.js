import { analyzeImage } from "../services/rekognitionService.js";
import { generateNavigationGuidance } from "../services/navigationEngine.js";
import { analyzeSceneWithNova } from "../services/novaVisionService.js";

export default async function handler(req, res) {

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

    console.error(error);

    res.json({
      message: "Navigation unavailable. Move slowly."
    });

  }

}