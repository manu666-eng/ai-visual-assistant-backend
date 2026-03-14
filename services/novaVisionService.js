import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

const client =
  new BedrockRuntimeClient({

    region: process.env.AWS_REGION

  });

export async function analyzeSceneWithNova(objects) {

  try {

    if (!objects || objects.length === 0)
      return null;

    const description =
      objects.map(o =>
        `${o.label} ${o.distance} ${o.position}`
      ).join(", ");

    const prompt = `
You guide a blind person walking safely.

Detected objects:
${description}

Give ONE navigation instruction under 12 words.
Focus on safety and direction.
`;

    const command =
      new InvokeModelCommand({

        modelId:
          "amazon.nova-lite-v1:0",

        contentType:
          "application/json",

        accept:
          "application/json",

        body: JSON.stringify({

          messages: [

            {

              role: "user",

              content: [
                {
                  type: "text",
                  text: prompt
                }
              ]

            }

          ]

        })

      });

    const response =
      await client.send(command);

    const parsed =
      JSON.parse(
        new TextDecoder()
          .decode(response.body)
      );

    return parsed
      ?.output
      ?.message
      ?.content
      ?.[0]
      ?.text || null;

  } catch (error) {

    console.error(error);

    return null;

  }

}