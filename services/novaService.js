const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION
});

async function analyzeSceneWithNova(objects) {

  try {

    if (!objects || objects.length === 0) {
      return "Path looks clear.";
    }

    const prompt = `
You are an AI navigation assistant helping a blind person walk safely.

Detected objects:
${objects.join(", ")}

Rules:
- Give one short navigation instruction.
- Focus on safety.
- Mention obstacles.
- Maximum 15 words.

Example responses:
"Chair ahead, move slightly left."
"Person in front, slow down."
"Clear path, move forward."
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

    const result = JSON.parse(new TextDecoder().decode(response.body));

    return result.output.message.content[0].text;

  } catch (error) {

    console.error("Nova Error:", error);

    return null; // fallback will handle this
  }

}

module.exports = { analyzeSceneWithNova };