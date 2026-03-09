require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { analyzeImage } = require("./services/rekognitionService");
const { generateNavigationGuidance } = require("./services/navigationEngine");
const { analyzeSceneWithNova } = require("./services/novaVisionService");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));


app.post("/analyze-image", async (req, res) => {

  try {

    const { image } = req.body;

    if (!image) {
      return res.json({
        message: "No image received"
      });
    }

    console.log("📸 Image received");



    // STEP 1 — Object detection (AWS Rekognition)
    const objects = await analyzeImage(image);

    console.log("🔎 Detected objects:", objects);



    // STEP 2 — Fallback navigation engine
    const fallbackGuidance =
      generateNavigationGuidance(objects);

    console.log("🧭 Fallback guidance:", fallbackGuidance);



    // STEP 3 — Try Nova (but NEVER block app)
    let novaGuidance = null;

    try {

      const novaPromise =
        analyzeSceneWithNova(objects, fallbackGuidance);

      const timeoutPromise =
        new Promise(resolve =>
          setTimeout(() => resolve(null), 2000)
        );

      novaGuidance =
        await Promise.race([novaPromise, timeoutPromise]);

    } catch (err) {

      console.log("⚠️ Nova failed, using fallback");

    }



    const finalGuidance =
      novaGuidance || fallbackGuidance;



    console.log("🧠 Final guidance:", finalGuidance);



    // STEP 4 — Send response to mobile app
    res.json({
      message: finalGuidance,
      objects: objects
    });



  } catch (error) {

    console.error("❌ Server error:", error);

    res.json({
      message: "Navigation unavailable. Move slowly."
    });

  }

});



const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});