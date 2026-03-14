import { detectObjects } from "../services/rekognitionService.js";
import { processObjects } from "../services/aiEngine.js";
import { generateNavigationGuidance } from "../services/navigationEngine.js";
import { analyzeSceneWithNova } from "../services/novaVisionService.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {

    const { image } = req.body;

    if (!image) {
      return res.json({
        message: "No image received"
      });
    }

    const detected =
      await detectObjects(image);

    const processed =
      processObjects(detected);

    const fallback =
      generateNavigationGuidance(processed);

    let aiResult = null;

    try {

      aiResult =
        await analyzeSceneWithNova(processed);

    } catch {}

    const guidance =
      aiResult || fallback;

    return res.json({

      message: guidance,

      objects: processed

    });

  } catch (error) {

    console.error("API ERROR:", error);

    return res.json({

      message:
        "Navigation temporarily unavailable. Move slowly."

    });

  }

}