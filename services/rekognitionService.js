import {
  RekognitionClient,
  DetectLabelsCommand
} from "@aws-sdk/client-rekognition";

const client =
  new RekognitionClient({

    region: process.env.AWS_REGION

  });

export async function detectObjects(base64Image) {

  const buffer =
    Buffer.from(base64Image, "base64");

  const command =
    new DetectLabelsCommand({

      Image: { Bytes: buffer },

      MaxLabels: 20,

      MinConfidence: 70

    });

  const response =
    await client.send(command);

  const objects = [];

  response.Labels.forEach(label => {

    if (label.Instances.length > 0) {

      label.Instances.forEach(instance => {

        objects.push({

          label:
            label.Name.toLowerCase(),

          confidence:
            instance.Confidence,

          box:
            instance.BoundingBox

        });

      });

    }

  });

  return objects;

}