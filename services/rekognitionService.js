const { RekognitionClient, DetectLabelsCommand } = require("@aws-sdk/client-rekognition");

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function analyzeImage(base64Image) {

  const buffer = Buffer.from(base64Image, "base64");

  const command = new DetectLabelsCommand({
    Image: {
      Bytes: buffer,
    },
    MaxLabels: 10,
    MinConfidence: 70,
  });

  const response = await rekognition.send(command);

  const objects = [];

  response.Labels.forEach(label => {

    if (label.Instances && label.Instances.length > 0) {

      label.Instances.forEach(instance => {

        objects.push({
          name: label.Name,
          confidence: label.Confidence,
          box: instance.BoundingBox
        });

      });

    } else {

      objects.push({
        name: label.Name,
        confidence: label.Confidence,
        box: null
      });

    }

  });

  return objects;
}

module.exports = { analyzeImage };