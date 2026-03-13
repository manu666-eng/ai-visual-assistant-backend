const {
  RekognitionClient,
  DetectLabelsCommand
} = require("@aws-sdk/client-rekognition");

const client = new RekognitionClient({
  region: process.env.AWS_REGION
});

async function detectObjects(base64Image) {

  const buffer = Buffer.from(base64Image, "base64");

  const command = new DetectLabelsCommand({
    Image: { Bytes: buffer },
    MaxLabels: 15,
    MinConfidence: 70
  });

  const response = await client.send(command);

  const labels = [];

  response.Labels.forEach(label => {

    if (label.Instances.length > 0) {

      label.Instances.forEach(instance => {

        labels.push({
          Name: label.Name,
          Confidence: instance.Confidence,
          Geometry: instance
        });

      });

    }

  });

  return labels;
}

module.exports = { detectObjects };