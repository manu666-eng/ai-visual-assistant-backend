const { analyzeImage } = require("../services/rekognitionService");
const { generateNavigationGuidance } = require("../services/navigationEngine");
const { analyzeSceneWithNova } = require("../services/novaVisionService");

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {

    const { image } = req.body || {};

    if (!image) {
      return res.status(400).json({
        message: "No image received"
      });
    }

    console.log("📸 Image received");

    // Step 1 — Detect objects with Rekognition
    const objects = await analyzeImage(image);

    console.log("🔎 Objects:", objects);

    // Step 2 — Rule-based fallback guidance
    const fallbackGuidance =
      generateNavigationGuidance(objects);

    // Step 3 — AI reasoning using Nova
    let novaGuidance = null;

    try {

      novaGuidance =
        await analyzeSceneWithNova(objects);

    } catch (novaError) {

      console.log("⚠️ Nova failed, using fallback");

    }

    const finalGuidance =
      novaGuidance || fallbackGuidance;

    console.log("🧭 Final guidance:", finalGuidance);

    return res.status(200).json({
      message: finalGuidance,
      objects
    });

  } catch (error) {

    console.error("❌ Analyze error:", error);

    return res.status(500).json({
      message: "Navigation temporarily unavailable. Move slowly."
    });

  }

};