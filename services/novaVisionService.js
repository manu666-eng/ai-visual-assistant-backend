const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION
});

async function generateNovaGuidance(objects) {

  if (!objects || objects.length === 0)
    return "Clear path. Move forward.";

  const description =
    objects.map(o =>
      `${o.label} (${o.position})`
    ).join(", ");

  const prompt = `
You are an AI assistant helping a blind person walk safely.

Detected objects:
${description}

Give one short navigation instruction under 15 words.

Mention left/right/center if useful.
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
            { type: "text", text: prompt }
          ]
        }
      ]
    })
  });

  const response = await client.send(command);

  const parsed =
    JSON.parse(new TextDecoder().decode(response.body));

  return parsed.output.message.content[0].text;
}

module.exports = { generateNovaGuidance };