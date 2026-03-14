const {
  RekognitionClient,
  DetectLabelsCommand
} = require("@aws-sdk/client-rekognition");

const client = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function analyzeImage(base64Image) {

  try {

    const buffer =
      Buffer.from(base64Image, "base64");

    const command =
      new DetectLabelsCommand({
        Image: { Bytes: buffer },
        MaxLabels: 15,
        MinConfidence: 70
      });

    const response =
      await client.send(command);

    const objects = [];

    if (!response.Labels) return [];

    response.Labels.forEach(label => {

      if (label.Instances && label.Instances.length > 0) {

        label.Instances.forEach(instance => {

          objects.push({
            name: label.Name,
            confidence: instance.Confidence,
            boundingBox: instance.BoundingBox
          });

        });

      }

    });

    return objects;

  } catch (error) {

    console.error("Rekognition Error:", error);

    return [];

  }

}

module.exports = { analyzeImage };