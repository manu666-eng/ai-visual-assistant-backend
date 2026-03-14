const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

function getDirection(box) {

  if (!box) return "ahead";

  const center = box.Left + box.Width / 2;

  if (center < 0.33) return "left";
  if (center > 0.66) return "right";

  return "ahead";
}

async function analyzeSceneWithNova(objects) {

  try {

    if (!objects || objects.length === 0) {
      return "Clear path. Move forward carefully.";
    }

    const description = objects
      .map(o => {

        const name =
          (o.name || o.Name || "object").toLowerCase();

        const position =
          getDirection(o.boundingBox || o.box);

        return `${name} (${position})`;

      })
      .join(", ");

    const prompt = `
You are an AI assistant helping a blind person navigate safely.

Detected objects:
${description}

Give ONE short navigation instruction under 15 words.
Mention direction if useful.
Focus on safety.
`;

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
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

    const response = await client.send(command);

    const parsed =
      JSON.parse(
        new TextDecoder().decode(response.body)
      );

    return parsed.output.message.content[0].text;

  } catch (error) {

    console.error("Nova error:", error);

    return null; // fallback will handle this
  }

}

module.exports = { analyzeSceneWithNova };